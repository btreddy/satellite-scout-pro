import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle, Polygon, FeatureGroup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"; 
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "leaflet-draw/dist/leaflet.draw.css"; 
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

// ICONS
import { 
  X, Crosshair, Ruler, Upload, Download, Trash2, Globe, Copy, ExternalLink, 
  Search, Zap, Radar, FileText, Lock, Unlock, WifiOff, ArrowRight, Phone, 
  Map as MapIcon, Info, MessageCircle, Link, Building2, Store, Tag, HandCoins, 
  CheckCircle, AlertTriangle, BookOpen, MousePointerClick, ChevronDown,
  ShieldCheck, TrendingUp, Layers, PenTool, Save, Eye
} from 'lucide-react';

// --- CONFIGURATION ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

// Load Secrets from .env (with fallbacks)
const PIN_CODE = import.meta.env.VITE_ADMIN_PIN || "1234"; 
const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || "917013007595"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ICONS SETUP ---
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- GROWTH NODES (RADAR) ---
const GROWTH_NODES = [
  { name: "Pharma Cluster", lat: 16.9800, lng: 78.6000 },
  { name: "Amazon Data Center", lat: 17.0500, lng: 78.5500 },
  { name: "Bharat Future City", lat: 16.9500, lng: 78.5800 },
  { name: "TCS Adibatla", lat: 17.2100, lng: 78.5300 } 
];

const RealEstateSearchApp = () => {

  // DEBUG LINE - DELETE THIS LATER
  console.log("🔐 THE REQUIRED PIN IS:", `"${PIN_CODE}"`); // Quotes help us see hidden spaces
  
  // ... rest of your code ...    // --- GLOBAL STATE ---
  const [viewMode, setViewMode] = useState('MARKETPLACE'); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchMarker, setTempSearchMarker] = useState(null);

  // --- MARKETPLACE STATE ---
  const [adMode, setAdMode] = useState(null); 
  const [newAdLocation, setNewAdLocation] = useState(null);
  const [marketAds, setMarketAds] = useState([]);
  const [newAdData, setNewAdData] = useState({ type: 'SELL', size: '', price: '', contact: '', desc: '', size_unit: 'Sq Yds' });
  const [radarResults, setRadarResults] = useState(null);

  // --- VENTURE PLANNER STATE ---
  const [projects, setProjects] = useState([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [currentShape, setCurrentShape] = useState(null); 
  const featureGroupRef = useRef(); 

  // --- INVESTMENT AUDIT STATE ---
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({ 
      price: '', govtValue: '', rera: '', approval: 'HMDA', orrDist: '', orrStatus: 'Out', 
      bankLoan: false, devPace: 'Moderate', legal: 'Clear', zone: 'Residential', 
      encumbrance: false, possession: false, linkDocs: false     
  });

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    fetchMarketplaceAds();
    fetchProjects();
  }, [isAdmin]);

  // ==========================================
  // 1. DATABASE FUNCTIONS
  // ==========================================
  
  const fetchMarketplaceAds = async () => {
    try {
        let query = supabase.from('marketplace_ads').select('*');
        if (!isAdmin) query = query.eq('status', 'APPROVED');
        const { data, error } = await query;
        if (!error) setMarketAds(data || []);
    } catch(e) { console.error(e); }
  };

  const handlePostAd = async () => {
    if(!newAdLocation) return alert("Set location first.");
    
    const sizeInSqMeters = parseInt(newAdData.size) * 0.836127; 
    const sideLength = Math.sqrt(sizeInSqMeters); 
    const offset = (sideLength / 2) / 111139; 

    const points = [
        [newAdLocation.lat + offset, newAdLocation.lng - offset],
        [newAdLocation.lat + offset, newAdLocation.lng + offset],
        [newAdLocation.lat - offset, newAdLocation.lng + offset],
        [newAdLocation.lat - offset, newAdLocation.lng - offset]
    ];

    const newAd = {
        lat: newAdLocation.lat, lng: newAdLocation.lng,
        ad_type: newAdData.type, size: newAdData.size + ' ' + newAdData.size_unit,
        price: newAdData.price, contact_info: newAdData.contact, description: newAdData.desc,
        status: 'PENDING', points: points
    };

    const { error } = await supabase.from('marketplace_ads').insert([newAd]);
    if (!error) { 
        alert("✅ Ad Submitted (Pending Approval)"); 
        setAdMode(null); setNewAdLocation(null); fetchMarketplaceAds(); 
    }
  };

  const handleApproveAd = async (id) => { await supabase.from('marketplace_ads').update({ status: 'APPROVED' }).eq('id', id); fetchMarketplaceAds(); };
  const handleDeleteAd = async (id) => { await supabase.from('marketplace_ads').delete().eq('id', id); fetchMarketplaceAds(); };

  const fetchProjects = async () => {
    try {
      const { data } = await supabase.from('projects').select('*');
      if (data) setProjects(data);
    } catch (e) { console.error(e); }
  };

  // --- ROBUST SAVE PROJECT FUNCTION ---
  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!currentShape) return alert("No shape drawn!");

    try {
        const layer = currentShape.layer;
        let rawLatLngs = layer.getLatLngs();
        if (Array.isArray(rawLatLngs[0]) && typeof rawLatLngs[0].lat !== 'number') {
            rawLatLngs = rawLatLngs[0];
        }
        const cleanPoints = rawLatLngs.map(p => ({ lat: p.lat, lng: p.lng }));

        const formData = new FormData(e.target);
        const newProject = {
            name: formData.get('label'),
            survey_number: formData.get('survey_no'),
            notes: formData.get('note'),
            points: cleanPoints,
            color: 'cyan'
        };
        
        const { error } = await supabase.from('projects').insert([newProject]);

        if (error) {
            console.error("Supabase Error:", error);
            alert(`Save Failed: ${error.message}`);
        } else {
            alert("✅ Project Saved Successfully!"); 
            setShowSaveForm(false); 
            fetchProjects(); 
            if(featureGroupRef.current) featureGroupRef.current.clearLayers();
            setCurrentShape(null);
        }
    } catch (err) {
        console.error("Unexpected Error:", err);
        alert("Something went wrong processing the shape.");
    }
  };

  // ==========================================
  // 2. MAP LOGIC
  // ==========================================
  
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (viewMode === 'MARKETPLACE' && adMode) {
            setNewAdLocation(e.latlng);
        }
        else if (isAdmin && viewMode === 'MARKETPLACE') {
             const dists = GROWTH_NODES.map(node => {
                const d = L.latLng(e.latlng).distanceTo([node.lat, node.lng]) / 1000;
                return { name: node.name, dist: d.toFixed(1) };
            }).sort((a,b) => a.dist - b.dist);
            setRadarResults({ pos: e.latlng, nodes: dists });
        }
      }
    });
    return null;
  };

  // --- SEARCH PILOT: FLIES MAP TO RESULT ---
  const FlyToSearchResult = () => {
    const map = useMap();
    useEffect(() => {
      if (tempSearchMarker) {
        map.flyTo(tempSearchMarker, 14, { duration: 1.5 });
      }
    }, [tempSearchMarker]);
    return null;
  };

  const onCreated = (e) => { setCurrentShape(e); setShowSaveForm(true); };
  const onEdited = (e) => { console.log("Shape Edited", e); };
  const onDeleted = (e) => { setCurrentShape(null); };

  // ==========================================
  // 3. PDF GENERATOR
  // ==========================================
  const generatePDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    doc.setFillColor(25, 25, 112); 
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text("SAFE LAND DEAL", 15, 20);
    doc.setFontSize(10); doc.text("TELANGANA INVESTMENT AUDIT REPORT", 15, 30);
    doc.text(`Generated: ${date}`, 160, 30);

    doc.setTextColor(0, 0, 0); doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("1. Regulatory & Zoning Analysis", 15, 60);

    autoTable(doc, {
      startY: 65,
      head: [['Check', 'Status', 'Impact']],
      body: [
        ['Authority', ratingData.approval, ratingData.approval === 'HMDA' ? 'High Security' : 'Standard'],
        ['RERA Status', ratingData.rera ? `Registered (${ratingData.rera})` : 'Not Available', ratingData.rera ? 'High Trust' : 'Verify'],
        ['Bank Loan', ratingData.bankLoan ? 'Available' : 'Not Confirmed', ratingData.bankLoan ? 'Positive' : 'Neutral'],
        ['Zone Type', ratingData.zone, 'Verified']
      ],
      theme: 'grid', headStyles: { fillColor: [46, 204, 113] }
    });

    const locY = doc.lastAutoTable.finalY + 15;
    doc.text("2. Location & Connectivity", 15, locY);
    autoTable(doc, {
      startY: locY + 5,
      body: [
        ['ORR Connectivity', ratingData.orrStatus === 'Out' ? 'Outside Ring Road' : 'Growth Corridor'],
        ['Distance to ORR', `${ratingData.orrDist} KM`],
        ['Development Pace', ratingData.devPace, ratingData.devPace === 'Rapid' ? 'Fast Appreciation' : 'Long Term Hold']
      ], theme: 'striped'
    });

    const finY = doc.lastAutoTable.finalY + 15;
    doc.text("3. Financial Valuation", 15, finY);
    autoTable(doc, {
      startY: finY + 5, head: [['Metric', 'Value']],
      body: [
        ['Asking Price', `Rs ${ratingData.price} / SqYd`],
        ['Govt Value', `Rs ${ratingData.govtValue} / SqYd`],
        ['Est. Market Delta', `${Math.round((ratingData.price - ratingData.govtValue)/ratingData.govtValue * 100)}% above SRO`]
      ], theme: 'plain'
    });

    let score = 40; 
    if(ratingData.approval === 'HMDA') score += 20;
    if(ratingData.approval === 'DTCP') score += 15;
    if(ratingData.rera) score += 10;
    if(ratingData.bankLoan) score += 10;
    if(ratingData.devPace === 'Rapid') score += 10;
    if(ratingData.approval === 'Unapproved') score -= 30;
    const finalScore = Math.min(99, Math.max(10, score));

    const scoreY = doc.lastAutoTable.finalY + 20;
    doc.setFillColor(240, 240, 240); doc.roundedRect(15, scoreY, 180, 30, 3, 3, 'FD');
    doc.setFontSize(20); doc.setTextColor(finalScore > 70 ? 0 : 200, finalScore > 70 ? 100 : 0, 0);
    doc.text(`${finalScore}/100`, 160, scoreY + 22);
    doc.setFontSize(12); doc.setTextColor(50,50,50);
    doc.text("SAFE LAND SCORE™", 25, scoreY + 18);

    doc.save(`Audit_Report_${date}.pdf`);
  };

  // ==========================================
  // 4. MAIN RENDER
  // ==========================================
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- TOP BAR --- */}
      <header className="bg-slate-900 px-4 py-3 flex justify-between items-center z-[2000] shadow-md text-white">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-1.5 rounded-lg shadow-lg">
                <Crosshair size={20} className="animate-spin-slow" />
            </div>
            <div>
                <h1 className="text-lg font-black tracking-tighter leading-none">SAFE LAND</h1>
                <p className="text-[9px] text-gray-400 tracking-widest uppercase">Intelligence Console</p>
            </div>
        </div>
        
        {/* CENTER: MODE SWITCHER */}
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700 backdrop-blur-md">
            <button onClick={() => setViewMode('MARKETPLACE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${viewMode==='MARKETPLACE' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105' : 'text-slate-400 hover:text-white'}`}>
                <Store size={14}/> Marketplace
            </button>
            <button onClick={() => setViewMode('VENTURE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${viewMode==='VENTURE' ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.5)] scale-105' : 'text-slate-400 hover:text-white'}`}>
                <PenTool size={14}/> Venture Planner
            </button>
        </div>

        <div className="flex gap-2 items-center">
            {/* SEARCH */}
            <div className="hidden md:flex bg-slate-800 px-3 py-1.5 rounded-full items-center gap-2 border border-slate-700 focus-within:border-blue-500">
                <Search size={14} className="text-gray-400"/>
                <input 
                    placeholder="Find location..." 
                    className="bg-transparent outline-none text-sm w-32 text-white placeholder-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={async (e) => {
                        if(e.key === 'Enter'){
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
                            const data = await res.json();
                            if(data && data[0]) setTempSearchMarker([data[0].lat, data[0].lon]);
                        }
                    }}
                />
            </div>
            {/* SUPPORT BUTTON */}
            <button 
                onClick={() => window.open(`https://wa.me/${ADMIN_PHONE}?text=Hello Admin, I need help.`, '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg font-bold text-xs flex items-center gap-1 transition-all"
            >
                <MessageCircle size={14}/> Support
            </button>

            <button onClick={() => setShowPinModal(true)} className={`p-2 rounded-lg transition-all ${isAdmin ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                {isAdmin ? <Unlock size={16}/> : <Lock size={16}/>}
            </button>
        </div>
      </header>

      {/* --- SUB-TOOLBAR --- */}
      <div className="bg-white border-b px-4 py-2 flex gap-3 items-center text-xs overflow-x-auto">
          {viewMode === 'MARKETPLACE' && (
              <>
                <span className="font-bold text-blue-800 flex items-center gap-1"><Store size={12}/> MARKET TOOLS:</span>
                <button onClick={() => { if(!adMode) { setAdMode('SELL'); alert("Click map to place ad"); } else { setAdMode(null); setNewAdLocation(null); } }} 
                    className={`px-3 py-1 rounded border font-bold ${adMode ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                    {adMode ? 'Cancel Posting' : '+ Post Ad'}
                </button>
                {isAdmin && <button onClick={() => setShowRatingModal(true)} className="px-3 py-1 rounded border border-purple-200 bg-purple-50 text-purple-700 font-bold flex items-center gap-1"><Zap size={12}/> Investment Audit</button>}
              </>
          )}

          {viewMode === 'VENTURE' && (
              <>
                <span className="font-bold text-orange-800 flex items-center gap-1"><PenTool size={12}/> PRO TOOLS:</span>
                <span className="text-gray-500">Use toolbar on map to Draw.</span>
                <button onClick={() => fetchProjects()} className="ml-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"><Eye size={12}/> Refresh Projects</button>
              </>
          )}
      </div>

      {/* --- MAP AREA --- */}
      <div className="flex-1 relative z-0">
        <MapContainer 
    center={[17.0500, 78.5500]} 
    zoom={13} 
    maxZoom={22} // <--- ALLOW ZOOM UP TO 22
    style={{ height: "100%", width: "100%" }}
>
  <TileLayer 
    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
    attribution="Esri" 
    maxNativeZoom={18} // <--- "Real" images stop at 18
    maxZoom={22}       // <--- Allow "Digital" zoom up to 22
  />
          
          <FlyToSearchResult />

          {/* 1. MARKETPLACE LAYER */}
          {viewMode === 'MARKETPLACE' && marketAds.map((ad) => (
              <React.Fragment key={ad.id}>
                  <Marker position={[ad.lat, ad.lng]} icon={DefaultIcon}>
                    <Popup className="premium-popup">
                        <div className="min-w-[200px]">
                            <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" className="w-full h-24 object-cover rounded-t-lg"/>
                            <div className="p-3">
                                <h3 className="font-bold text-lg text-green-700">{ad.price}</h3>
                                <p className="text-xs text-gray-500 mb-2">{ad.size}</p>
                                <button onClick={() => window.open(`https://wa.me/${ad.contact_info}`, '_blank')} className="w-full bg-green-600 text-white py-1 rounded text-xs font-bold mb-1">WhatsApp Owner</button>
                                <button onClick={() => window.open(`https://earthengine.google.com/timelapse#v=${ad.lat},${ad.lng},11,latLng&t=1.50`, '_blank')} className="w-full bg-indigo-50 text-indigo-700 py-1 rounded text-xs font-bold border border-indigo-200">View History</button>
                                {isAdmin && <button onClick={() => handleDeleteAd(ad.id)} className="w-full mt-2 text-red-500 text-[10px] underline">Delete Ad</button>}
                            </div>
                        </div>
                    </Popup>
                  </Marker>
                  {ad.points && <Polygon positions={ad.points} pathOptions={{ color: 'yellow', fillColor: 'yellow', fillOpacity: 0.2 }} />}
              </React.Fragment>
          ))}

          {/* 2. VENTURE PLANNER LAYER */}
          {viewMode === 'VENTURE' && (
              <FeatureGroup ref={featureGroupRef}>
                  <EditControl 
                    position="topright" 
                    onCreated={onCreated} 
                    onEdited={onEdited} 
                    onDeleted={onDeleted}
                    draw={{
                        rectangle: false,
                        polygon: { allowIntersection: false, showArea: false, metric: false },
                        circle: false, circlemarker: false, marker: false, polyline: false
                    }}
                  />
                  {projects.map(p => (
                      <Polygon key={p.id} positions={p.points} color={p.color || "cyan"} fillColor={p.color || "cyan"} fillOpacity={0.2}>
                          <Popup>
                              <strong>{p.name}</strong><br/>
                              Survey: {p.survey_number}<br/>
                              {p.notes}
                          </Popup>
                      </Polygon>
                  ))}
              </FeatureGroup>
          )}

          {newAdLocation && <Marker position={newAdLocation} icon={DefaultIcon}><Popup>New Ad Location</Popup></Marker>}
          {tempSearchMarker && <Marker position={tempSearchMarker} icon={DefaultIcon}><Popup>Search Result</Popup></Marker>}
          <MapClickHandler />
          
          {radarResults && (
              <Popup position={radarResults.pos} onClose={() => setRadarResults(null)}>
                  <div className="min-w-[180px]">
                      <div className="bg-purple-600 text-white p-2 -m-3 mb-2 rounded-t font-bold text-xs"><Radar size={12} className="inline"/> Growth Radar</div>
                      {radarResults.nodes.map((n,i)=><div key={i} className="flex justify-between text-xs border-b py-1"><span>{n.name}</span><b>{n.dist} km</b></div>)}
                  </div>
              </Popup>
          )}
        </MapContainer>
      </div>

      {/* --- MODALS --- */}
      
      {showPinModal && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center items-center backdrop-blur-sm">
              <div className="bg-white p-6 rounded-xl w-72">
                  <h3 className="font-bold mb-4">Admin Login</h3>
                  <input type="password" value={pinInput} onChange={(e)=>setPinInput(e.target.value)} className="w-full border p-2 rounded mb-4 text-center tracking-widest" placeholder="PIN"/>
                  <button onClick={()=>{ if(pinInput===PIN_CODE){ setIsAdmin(true); setShowPinModal(false); } else alert("Wrong PIN"); }} className="w-full bg-black text-white py-2 rounded font-bold">Unlock</button>
              </div>
          </div>
      )}

      {newAdLocation && (
          <div className="fixed bottom-4 left-4 z-[5000] bg-white p-4 rounded-xl shadow-2xl w-80 border-2 border-blue-500 animate-in slide-in-from-bottom-10">
               <h3 className="font-bold text-blue-600 mb-2">Post New Ad</h3>
               <div className="space-y-2">
                   <select className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, type: e.target.value})}><option value="SELL">Sell Plot</option><option value="LOOKING">Looking For</option></select>
                   <input placeholder="Size (e.g. 200)" type="number" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, size: e.target.value})} />
                   <input placeholder="Price (e.g. 1.5 Cr)" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, price: e.target.value})} />
                   <input placeholder="WhatsApp (e.g. 9198...)" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, contact: e.target.value})} />
                   <button onClick={handlePostAd} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Submit</button>
               </div>
          </div>
      )}

      {showSaveForm && (
         <div className="fixed inset-0 bg-black/60 z-[6000] flex justify-center items-center">
             <div className="bg-white p-6 rounded-lg w-80 shadow-2xl animate-in fade-in">
                 <h3 className="font-bold mb-4 flex items-center gap-2"><Save size={18}/> Save Master Plan</h3>
                 <form onSubmit={handleSaveProject} className="space-y-3">
                     <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 mb-2">
                        Shape Captured! Enter details to save to database.
                     </div>
                     <input name="label" required placeholder="Project Name" className="w-full border p-2 rounded"/>
                     <input name="survey_no" placeholder="Survey No." className="w-full border p-2 rounded"/>
                     <textarea name="note" placeholder="Notes" className="w-full border p-2 rounded h-20"/>
                     <div className="flex gap-2">
                         <button type="button" onClick={()=>{setShowSaveForm(false); setCurrentShape(null); featureGroupRef.current.clearLayers();}} className="flex-1 bg-gray-200 py-2 rounded">Discard</button>
                         <button type="submit" className="flex-1 bg-orange-600 text-white py-2 rounded font-bold">Save</button>
                     </div>
                 </form>
             </div>
         </div>
      )}

      {showRatingModal && (
        <div className="fixed inset-0 bg-black/80 z-[7000] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-4 text-white flex justify-between items-center shrink-0">
                    <div><h2 className="font-bold flex items-center gap-2 text-lg"><ShieldCheck className="text-yellow-400"/> Investment Audit</h2></div>
                    <button onClick={() => setShowRatingModal(false)} className="hover:bg-white/20 p-1 rounded"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="text-xs font-black text-indigo-800 uppercase mb-3">1. Regulatory</h3>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div><label className="text-[10px] font-bold text-gray-500">Authority</label><select className="w-full border p-2 rounded text-sm mt-1 font-bold" onChange={(e) => setRatingData({...ratingData, approval: e.target.value})}><option value="HMDA">HMDA</option><option value="DTCP">DTCP</option><option value="YTDA">YTDA</option><option value="GP">Gram Panchayat</option><option value="Unapproved">Unapproved</option></select></div>
                            <div><label className="text-[10px] font-bold text-gray-500">RERA No.</label><input className="w-full border p-2 rounded text-sm mt-1" onChange={(e) => setRatingData({...ratingData, rera: e.target.value})}/></div>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-bold text-green-800"><input type="checkbox" className="w-5 h-5 accent-green-600" onChange={(e) => setRatingData({...ratingData, bankLoan: e.target.checked})}/> Bank Loan Available?</label>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase mb-3">2. Location</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-[10px] font-bold text-gray-500">ORR Status</label><select className="w-full border p-2 rounded text-sm mt-1" onChange={(e) => setRatingData({...ratingData, orrStatus: e.target.value})}><option value="Out">Outside ORR</option><option value="In">Inside ORR</option><option value="Growth">Growth Corridor</option></select></div>
                             <div><label className="text-[10px] font-bold text-gray-500">Distance (km)</label><input type="number" className="w-full border p-2 rounded text-sm mt-1" onChange={(e) => setRatingData({...ratingData, orrDist: e.target.value})}/></div>
                        </div>
                    </div>

                    <div className="mb-4 pt-4 border-t border-dashed">
                        <h3 className="text-xs font-black text-slate-400 uppercase mb-3">3. Price</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-[10px] font-bold text-gray-500">Asking Price</label><input type="number" className="w-full border-b border-slate-300 py-1 text-sm font-bold" onChange={(e) => setRatingData({...ratingData, price: e.target.value})}/></div>
                             <div><label className="text-[10px] font-bold text-gray-500">Govt Value</label><input type="number" className="w-full border-b border-slate-300 py-1 text-sm font-bold" onChange={(e) => setRatingData({...ratingData, govtValue: e.target.value})}/></div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-white shrink-0">
                     <button onClick={generatePDF} className="w-full bg-indigo-900 text-white py-3 rounded-lg font-bold hover:bg-black flex items-center justify-center gap-2"><FileText size={18}/> Generate PDF Report</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateSearchApp;