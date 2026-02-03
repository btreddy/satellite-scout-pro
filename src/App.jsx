import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polygon, FeatureGroup, LayersControl } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"; 
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "leaflet-draw/dist/leaflet.draw.css"; 
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

// ICONS
import { 
  X, Crosshair, Search, Zap, Radar, FileText, Lock, Unlock, 
  Map as MapIcon, MessageCircle, Store, PenTool, Save, Eye,
  CheckCircle, Trash2, ExternalLink, ShieldCheck, List, Filter, 
  RefreshCw, Globe, PlusCircle, Layers, Award, Download, Image as ImageIcon, Video, UploadCloud, Edit, Mic, Share2, MapPin
} from 'lucide-react';

// --- CONFIGURATION ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const PIN_CODE = import.meta.env.VITE_ADMIN_PIN || "1234"; 
const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || "9199999999"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- OFFICIAL LINKS ---
const GOVT_LINKS = [
    { name: "Bhubharathi (Land Status)", url: "https://bhubharati.telangana.gov.in/knowLandStatus" },
    { name: "CCLA (Integrated Registry)", url: "https://ccla.telangana.gov.in/integratedLandRegistry.do" },
    { name: "IGRS (EC Search)", url: "https://registration.telangana.gov.in/" },
    { name: "HMDA Master Plan 2031", url: "https://www.hmda.gov.in/master-planning-2031" },
    { name: "RERA Telangana", url: "https://rera.telangana.gov.in/" },
    { name: "Bhuvan (ISRO Maps)", url: "https://bhuvan.nrsc.gov.in/" }
];

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- GROWTH NODES ---
const GROWTH_NODES = [
  { name: "Pharma Cluster", lat: 16.9800, lng: 78.6000 },
  { name: "Amazon Data Center", lat: 17.0500, lng: 78.5500 },
  { name: "Bharat Future City", lat: 16.9500, lng: 78.5800 },
  { name: "TCS Adibatla", lat: 17.2100, lng: 78.5300 } 
];

const RealEstateSearchApp = () => {
  // --- STATE ---
  const [viewMode, setViewMode] = useState('MARKETPLACE'); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchMarker, setTempSearchMarker] = useState(null);

  // MODALS & VIEWS
  const [showLinksModal, setShowLinksModal] = useState(false); 
  const [showPremiumRequest, setShowPremiumRequest] = useState(false); 
  const [editingAd, setEditingAd] = useState(null);
  const [viewingAd, setViewingAd] = useState(null); 

  // DASHBOARD FILTERS
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); 

  // MARKETPLACE
  const [adMode, setAdMode] = useState(null); 
  const [newAdLocation, setNewAdLocation] = useState(null);
  const [marketAds, setMarketAds] = useState([]);
  
  // NEW AD DATA
  const [newAdData, setNewAdData] = useState({ 
      type: 'SELL', size: '', price: '', contact: '', desc: '', 
      size_unit: 'Sq Yds', image_url: '', video_url: '', audio_url: '' 
  });
  const [uploading, setUploading] = useState(false); 
  const [radarResults, setRadarResults] = useState(null);

  // VENTURE
  const [projects, setProjects] = useState([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [currentShape, setCurrentShape] = useState(null); 
  const featureGroupRef = useRef(); 

  // AUDIT
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({ 
      price: '', govtValue: '', rera: '', approval: 'HMDA', orrDist: '', orrStatus: 'Out', 
      bankLoan: false, devPace: 'Moderate', legal: 'Clear', zone: 'Residential'     
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    fetchMarketplaceAds();
    fetchProjects();
  }, [isAdmin]);

  // --- DEEP LINK HANDLER (FIXED) ---
  useEffect(() => {
      if (marketAds.length > 0) {
          const params = new URLSearchParams(window.location.search);
          const sharedAdId = params.get('ad_id');
          if (sharedAdId) {
              const foundAd = marketAds.find(ad => ad.id.toString() === sharedAdId);
              if (foundAd) {
                  setViewingAd(foundAd); 
                  setTempSearchMarker([foundAd.lat, foundAd.lng]); 
              }
          } else {
              setViewingAd(null); // RESET VIEW if no ID (Fixes "Previous Ad" bug)
          }
      }
  }, [marketAds]);

  // --- DB FUNCTIONS ---
  const fetchMarketplaceAds = async () => {
    try {
        let query = supabase.from('marketplace_ads').select('*').order('created_at', { ascending: false });
        if (!isAdmin) query = query.eq('status', 'APPROVED');
        const { data, error } = await query;
        if (!error) setMarketAds(data || []);
    } catch(e) { console.error(e); }
  };

  const handleFileUpload = async (e, type, isEditMode = false) => {
    try {
        setUploading(true);
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${type}_${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('ad-images').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('ad-images').getPublicUrl(filePath);
        
        if (isEditMode && editingAd) {
             if(type === 'image') setEditingAd({ ...editingAd, image_url: data.publicUrl });
             if(type === 'audio') setEditingAd({ ...editingAd, audio_url: data.publicUrl });
        } else {
             if(type === 'image') setNewAdData({ ...newAdData, image_url: data.publicUrl });
             if(type === 'audio') setNewAdData({ ...newAdData, audio_url: data.publicUrl });
        }
        alert(`✅ ${type === 'image' ? 'Image' : 'Audio'} Uploaded!`);
    } catch (error) {
        alert("Upload Failed: " + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handlePostAd = async () => {
    if(!newAdLocation) return alert("Set location first.");
    if(uploading) return alert("Wait for upload.");

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
        image_url: newAdData.image_url, video_url: newAdData.video_url, audio_url: newAdData.audio_url,
        status: 'PENDING', points: points
    };
    
    const { error } = await supabase.from('marketplace_ads').insert([newAd]);
    if (!error) { 
        alert("✅ Ad Submitted!"); 
        setAdMode(null); setNewAdLocation(null); fetchMarketplaceAds(); 
    } else { alert(error.message); }
  };

  const handleUpdateAd = async () => {
      if(!editingAd) return;
      const { error } = await supabase.from('marketplace_ads').update({
          price: editingAd.price,
          size: editingAd.size,
          contact_info: editingAd.contact_info,
          image_url: editingAd.image_url,
          video_url: editingAd.video_url,
          audio_url: editingAd.audio_url,
          status: editingAd.status
      }).eq('id', editingAd.id);

      if(!error) {
          alert("✅ Ad Updated Successfully!");
          setEditingAd(null);
          fetchMarketplaceAds();
      } else {
          alert("Update Failed: " + error.message);
      }
  };

  const handleApproveAd = async (id) => { 
      await supabase.from('marketplace_ads').update({ status: 'APPROVED' }).eq('id', id); 
      fetchMarketplaceAds(); 
  };
  
  const handleDeleteAd = async (id) => { 
      if(confirm("Permanently delete this ad?")) {
        const { error } = await supabase.from('marketplace_ads').delete().eq('id', id);
        if (!error) {
            setMarketAds(prev => prev.filter(ad => ad.id !== id));
            alert("✅ Ad Deleted.");
        }
      }
  };

  const handleShareAd = async (ad) => {
      // 1. Force the professional domain
      const shareUrl = `https://maps.safelanddeal.com/?ad_id=${ad.id}`;
      
      // 2. Create clean text WITHOUT the URL (the phone attaches the URL automatically)
      const shareTitle = '🔥 Safe Land Deal Alert';
      const shareText = `💎 Price: ${ad.price}\n📏 Size: ${ad.size}\n📍 Verified Location:`;
      
      if (navigator.share) {
          try {
              await navigator.share({
                  title: shareTitle,
                  text: shareText, // Text ONLY (no URL here)
                  url: shareUrl    // URL attached here
              });
          } catch (error) { console.log('Error sharing', error); }
      } else {
          // Fallback for Desktop (needs URL in text)
          const whatsappText = `${shareTitle}\n${shareText}\n${shareUrl}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
      }
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*');
    if (data) setProjects(data);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!currentShape) return alert("No shape drawn!");
    try {
        const layer = currentShape.layer;
        let rawLatLngs = layer.getLatLngs();
        if (Array.isArray(rawLatLngs[0]) && typeof rawLatLngs[0].lat !== 'number') rawLatLngs = rawLatLngs[0];
        const cleanPoints = rawLatLngs.map(p => ({ lat: p.lat, lng: p.lng }));
        const formData = new FormData(e.target);
        const newProject = {
            name: formData.get('label'), survey_number: formData.get('survey_no'),
            notes: formData.get('note'), points: cleanPoints, color: 'cyan'
        };
        const { error } = await supabase.from('projects').insert([newProject]);
        if (!error) {
            alert("✅ Project Saved!"); setShowSaveForm(false); fetchProjects(); 
            if(featureGroupRef.current) featureGroupRef.current.clearLayers();
            setCurrentShape(null);
        }
    } catch (err) { alert("Error saving shape."); }
  };

  // --- PDF GENERATOR ---
  const generatePDF = (isSample = false) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    const data = isSample ? {
        approval: 'HMDA', rera: 'P02400001234', bankLoan: true, zone: 'Residential Zone 1',
        orrStatus: 'Growth Corridor', orrDist: '2.5', devPace: 'Rapid',
        price: '45000', govtValue: '12000'
    } : ratingData;

    doc.setFillColor(25, 25, 112); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text("SAFE LAND DEAL", 15, 20);
    doc.setFontSize(10); doc.text(isSample ? "SAMPLE INVESTMENT AUDIT REPORT" : "TELANGANA INVESTMENT AUDIT REPORT", 15, 30);
    doc.text(`Generated: ${date}`, 160, 30);
    
    doc.setTextColor(100, 100, 100); doc.setFontSize(9);
    doc.text("Verified government records (CCLA, HMDA, RERA).", 15, 48);
    
    doc.setTextColor(0, 0, 0); doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("1. Regulatory & Zoning Analysis", 15, 60);
    autoTable(doc, {
      startY: 65, head: [['Check', 'Status', 'Impact']],
      body: [
        ['Authority', data.approval, data.approval === 'HMDA' ? 'High Security' : 'Standard'],
        ['RERA Status', data.rera ? `Registered (${data.rera})` : 'Not Available', data.rera ? 'High Trust' : 'Verify'],
        ['Bank Loan', data.bankLoan ? 'Available' : 'Not Confirmed', data.bankLoan ? 'Positive' : 'Neutral'],
        ['Zone Type', data.zone, 'Verified']
      ], theme: 'grid', headStyles: { fillColor: [46, 204, 113] }
    });
    // ... rest of PDF logic ...
    doc.save(isSample ? "Sample_Audit_Report.pdf" : `Audit_Report_${date}.pdf`);
  };

  const FlyToSearchResult = () => {
    const map = useMap();
    useEffect(() => { if (tempSearchMarker) map.flyTo(tempSearchMarker, 14, { duration: 1.5 }); }, [tempSearchMarker]);
    return null;
  };
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (viewMode === 'MARKETPLACE' && adMode) setNewAdLocation(e.latlng);
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

  // --- RENDER ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* HEADER */}
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
        
        {/* VIEW SWITCHER */}
        <div className="hidden md:flex bg-slate-800/50 p-1 rounded-xl border border-slate-700 backdrop-blur-md">
            <button onClick={() => setViewMode('MARKETPLACE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode==='MARKETPLACE' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-slate-400'}`}><Store size={14}/> Market</button>
            <button onClick={() => setViewMode('VENTURE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode==='VENTURE' ? 'bg-orange-500 text-white shadow-lg scale-105' : 'text-slate-400'}`}><PenTool size={14}/> Planner</button>
            {isAdmin && <button onClick={() => setViewMode('ADMIN')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode==='ADMIN' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-slate-400'}`}><List size={14}/> Admin</button>}
        </div>

        <div className="flex gap-2 items-center">
            {/* SEARCH BAR */}
            <div className="hidden md:flex bg-slate-800 px-3 py-1.5 rounded-full items-center gap-2 border border-slate-700">
                <Search size={14} className="text-gray-400"/>
                <input placeholder="Search..." className="bg-transparent outline-none text-sm w-32 text-white placeholder-gray-500"
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={async (e) => {
                        if(e.key === 'Enter'){
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
                            const data = await res.json();
                            if(data && data[0]) setTempSearchMarker([data[0].lat, data[0].lon]);
                        }
                    }}
                />
            </div>
            <button onClick={() => setShowPremiumRequest(true)} className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 text-white p-2 md:px-4 md:py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg">
                <ShieldCheck size={14}/> <span className="hidden md:inline">Request Audit</span>
            </button>
            <button onClick={() => setShowPinModal(true)} className={`p-2 rounded-lg transition-all ${isAdmin ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                {isAdmin ? <Unlock size={16}/> : <Lock size={16}/>}
            </button>
        </div>
      </header>

      {/* --- ADMIN DASHBOARD --- */}
      {viewMode === 'ADMIN' ? (
          <div className="flex-1 overflow-auto p-6 bg-gray-100">
              <div className="max-w-6xl mx-auto">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-2xl font-black flex items-center gap-2"><List/> Ad Management Database</h2>
                      <div className="flex gap-2">
                          <div className="bg-white border rounded-lg px-2 py-1 flex items-center gap-2">
                              <Filter size={14} className="text-gray-400"/>
                              <select className="text-sm font-bold outline-none bg-transparent" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                  <option value="ALL">All Status</option>
                                  <option value="PENDING">Pending Only</option>
                                  <option value="APPROVED">Live Only</option>
                              </select>
                          </div>
                          <button onClick={() => fetchMarketplaceAds()} className="p-2 bg-white border rounded hover:bg-gray-50"><RefreshCw size={16}/></button>
                          <button onClick={() => setShowRatingModal(true)} className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-xs font-bold flex items-center gap-2 shadow-sm"><ShieldCheck size={14}/> Audit & Links</button>
                      </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                              <tr>
                                  <th className="p-4">Date</th>
                                  <th className="p-4">Type</th>
                                  <th className="p-4">Details</th>
                                  <th className="p-4">Contact</th>
                                  <th className="p-4">Assets</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                              {marketAds
                                .filter(ad => {
                                    if(filterStatus !== 'ALL' && ad.status !== filterStatus) return false;
                                    if(filterText && !JSON.stringify(ad).toLowerCase().includes(filterText.toLowerCase())) return false;
                                    return true;
                                })
                                .map(ad => (
                                  <tr key={ad.id} className="border-b hover:bg-gray-50">
                                      <td className="p-4 text-gray-400 text-xs">{new Date(ad.created_at).toLocaleDateString()}</td>
                                      <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${ad.ad_type==='SELL'?'bg-green-100 text-green-800':'bg-blue-100 text-blue-800'}`}>{ad.ad_type}</span></td>
                                      <td className="p-4">
                                          <div className="font-bold">{ad.price}</div>
                                          <div className="text-gray-500 text-xs">{ad.size}</div>
                                      </td>
                                      <td className="p-4">{ad.contact_info}</td>
                                      <td className="p-4 text-xs">
                                          {ad.image_url ? <a href={ad.image_url} target="_blank" className="text-blue-600 flex items-center gap-1"><ImageIcon size={12}/> Img</a> : <span className="text-gray-300">-</span>}
                                          {ad.video_url ? <a href={ad.video_url} target="_blank" className="text-red-600 flex items-center gap-1 mt-1"><Video size={12}/> Vid</a> : null}
                                          {ad.audio_url ? <a href={ad.audio_url} target="_blank" className="text-purple-600 flex items-center gap-1 mt-1"><Mic size={12}/> Aud</a> : null}
                                      </td>
                                      <td className="p-4">
                                          {ad.status === 'APPROVED' ? <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle size={12}/> Live</span> : <span className="text-orange-500 font-bold text-xs">Pending</span>}
                                      </td>
                                      <td className="p-4 text-right flex justify-end gap-2">
                                          {ad.status !== 'APPROVED' && <button onClick={()=>handleApproveAd(ad.id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-bold">Approve</button>}
                                          <button onClick={()=>setEditingAd(ad)} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 text-xs font-bold flex items-center gap-1"><Edit size={12}/> Edit</button>
                                          <button onClick={()=>handleDeleteAd(ad.id)} className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 text-xs font-bold flex items-center gap-1"><Trash2 size={12}/> Delete</button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                      {marketAds.length === 0 && <div className="p-8 text-center text-gray-400">No ads found.</div>}
                  </div>
              </div>
          </div>
      ) : (
        /* --- MAP VIEW --- */
        <div className="flex-1 relative z-0">
          <MapContainer center={[17.0500, 78.5500]} zoom={13} maxZoom={22} style={{ height: "100%", width: "100%" }}>
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Satellite (Clean)">
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" maxNativeZoom={18} maxZoom={22} />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Hybrid (With Names)">
                    <TileLayer url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}" attribution="Google" maxNativeZoom={20} maxZoom={22}/>
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Street Map">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" />
                </LayersControl.BaseLayer>
            </LayersControl>

            <FlyToSearchResult />

            {viewMode === 'MARKETPLACE' && marketAds.map((ad) => (
                <React.Fragment key={ad.id}>
                    <Marker position={[ad.lat, ad.lng]} icon={DefaultIcon}>
                      <Popup className="premium-popup">
                          <div className="min-w-[200px]">
                              {/* DYNAMIC IMAGE DISPLAY */}
                              {ad.image_url ? (
                                  <img src={ad.image_url} alt="Plot" className="w-full h-32 object-cover rounded-t-lg bg-gray-100"/>
                              ) : (
                                  <div className="bg-slate-100 h-24 rounded-t-lg flex items-center justify-center text-slate-400 font-bold text-xs">NO IMAGE</div>
                              )}
                              
                              <div className="p-3">
                                  <h3 className="font-bold text-lg text-green-700">{ad.price}</h3>
                                  <p className="text-xs text-gray-500 mb-2">{ad.size} | {ad.ad_type}</p>
                                  
                                  {ad.description && <p className="text-[10px] text-gray-600 italic mb-2 p-2 bg-gray-50 rounded border">{ad.description}</p>}

                                  {/* AUDIO PLAYER */}
                                  {ad.audio_url && (
                                      <div className="mb-2">
                                          <p className="text-[10px] font-bold text-purple-600 flex items-center gap-1"><Mic size={10}/> Owner's Voice Note:</p>
                                          <audio controls src={ad.audio_url} className="w-full h-6 mt-1" />
                                      </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-2 mb-2">
                                      <button onClick={() => window.open(`https://wa.me/${ad.contact_info}`, '_blank')} className="bg-green-600 text-white py-1.5 rounded text-xs font-bold">WhatsApp Owner</button>
                                      <button onClick={() => window.open(`https://wa.me/${ad.contact_info}?text=Hi, I saw your ad for ${ad.price}. Can I see the Legal/Audit Report?`, '_blank')} className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 shadow-md"><Award size={10}/> Request Report</button>
                                  </div>
                                  
                                  {/* VIDEO + SHARE BUTTONS */}
                                  <div className="grid grid-cols-2 gap-2">
                                      {ad.video_url ? (
                                          <button onClick={() => window.open(ad.video_url, '_blank')} className="bg-red-600 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1"><Video size={12}/> Watch Video</button>
                                      ) : <div/>}
                                      <button onClick={() => handleShareAd(ad)} className="bg-blue-600 text-white py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 shadow-sm"><Share2 size={12}/> Share Ad</button>
                                  </div>
                              </div>
                          </div>
                      </Popup>
                    </Marker>
                    {ad.points && <Polygon positions={ad.points} pathOptions={{ color: 'yellow', fillColor: 'yellow', fillOpacity: 0.2 }} />}
                </React.Fragment>
            ))}
            
            {viewMode === 'VENTURE' && (
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl position="topright" onCreated={(e)=>{setCurrentShape(e); setShowSaveForm(true);}} draw={{ rectangle: false, polygon: { allowIntersection: false, showArea: false }, circle: false, circlemarker: false, marker: false, polyline: false }} />
                    {projects.map(p => (
                        <Polygon key={p.id} positions={p.points} color={p.color || "cyan"} fillColor={p.color || "cyan"} fillOpacity={0.2}><Popup><strong>{p.name}</strong><br/>Survey: {p.survey_number}</Popup></Polygon>
                    ))}
                </FeatureGroup>
            )}
            {newAdLocation && <Marker position={newAdLocation} icon={DefaultIcon}><Popup>New Ad Location</Popup></Marker>}
            {tempSearchMarker && <Marker position={tempSearchMarker} icon={DefaultIcon}><Popup>Search Result</Popup></Marker>}
            <MapClickHandler />
            {radarResults && <Popup position={radarResults.pos} onClose={()=>setRadarResults(null)}><div className="min-w-[180px]"><div className="bg-purple-600 text-white p-2 -m-3 mb-2 rounded-t font-bold text-xs">Growth Radar</div>{radarResults.nodes.map((n,i)=><div key={i} className="flex justify-between text-xs border-b py-1"><span>{n.name}</span><b>{n.dist} km</b></div>)}</div></Popup>}
          </MapContainer>
        </div>
      )}

      {/* --- NEW: "LANDING PAGE" WELCOME CARD --- */}
      {viewingAd && (
          <div className="fixed inset-0 bg-black/70 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white p-0 rounded-xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
                  {/* HERO IMAGE */}
                  <div className="h-48 relative bg-gray-100">
                      {viewingAd.image_url ? (
                          <img src={viewingAd.image_url} alt="Land" className="w-full h-full object-cover"/>
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-slate-100">NO IMAGE</div>
                      )}
                      <button onClick={()=>setViewingAd(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black"><X size={20}/></button>
                      <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 text-xs font-bold rounded flex items-center gap-1"><ShieldCheck size={12}/> VERIFIED LISTING</div>
                  </div>
                  
                  {/* DETAILS */}
                  <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <h2 className="text-2xl font-black text-slate-800">{viewingAd.price}</h2>
                              <p className="text-sm font-bold text-slate-500">{viewingAd.size} | {viewingAd.ad_type}</p>
                          </div>
                          
                          {/* UPDATED: VIEW MAP BUTTON (NOW FUNCTIONAL) */}
                          <button onClick={() => setViewingAd(null)} className="bg-blue-50 text-blue-700 p-2 rounded-lg text-xs font-bold text-center hover:bg-blue-100 transition-colors">
                              <MapPin size={16} className="mx-auto mb-1"/>
                              View Map
                          </button>
                      </div>

                      {viewingAd.description && <p className="text-xs text-gray-600 mb-4 bg-slate-50 p-2 rounded border">{viewingAd.description}</p>}

                      {/* --- NEW: AUDIO IN WELCOME CARD --- */}
                      {viewingAd.audio_url && (
                          <div className="mb-4 bg-purple-50 p-2 rounded border border-purple-100">
                              <p className="text-xs font-bold text-purple-700 flex items-center gap-1 mb-1"><Mic size={12}/> Owner's Voice Note</p>
                              <audio controls src={viewingAd.audio_url} className="w-full h-8" />
                          </div>
                      )}

                      {/* ACTIONS */}
                      <div className="space-y-2">
                          <button onClick={() => window.open(`https://wa.me/${viewingAd.contact_info}`, '_blank')} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700"><MessageCircle size={18}/> Contact Owner</button>
                          
                          <div className="flex gap-2">
                              {viewingAd.video_url && <button onClick={() => window.open(viewingAd.video_url, '_blank')} className="flex-1 bg-red-50 text-red-600 border border-red-100 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-red-100"><Video size={14}/> Watch Video</button>}
                              <button onClick={() => setViewingAd(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-bold text-xs hover:bg-slate-200">Explore Map</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- SUB-TOOLBAR --- */}
      {viewMode !== 'ADMIN' && (
        <div className="bg-white border-b px-4 py-2 flex gap-3 items-center text-xs overflow-x-auto shadow-sm">
            {viewMode === 'MARKETPLACE' && (
                <>
                  <span className="font-bold text-blue-800 flex items-center gap-1"><Store size={12}/> MARKET TOOLS:</span>
                  <button onClick={() => { if(!adMode) { setAdMode('SELL'); alert("Click map to place ad"); } else { setAdMode(null); setNewAdLocation(null); } }} 
                      className={`px-3 py-1 rounded border font-bold flex items-center gap-1 ${adMode ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700'}`}>
                      {adMode ? <X size={12}/> : <PlusCircle size={12}/>}
                      {adMode ? 'Cancel Posting' : 'Post Free Ad'}
                  </button>
                  <button onClick={() => setShowLinksModal(true)} className="px-3 py-1 rounded border border-gray-200 bg-gray-50 text-gray-700 font-bold flex items-center gap-1 hover:bg-gray-100"><Globe size={12}/> Verify Land</button>
                </>
            )}
            {viewMode === 'VENTURE' && (
                <>
                  <span className="font-bold text-orange-800 flex items-center gap-1"><PenTool size={12}/> PRO TOOLS:</span>
                  <button onClick={() => fetchProjects()} className="ml-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"><Eye size={12}/> Refresh Projects</button>
                </>
            )}
        </div>
      )}

      {/* --- NEW: EDIT AD MODAL (UPDATED WITH AUDIO) --- */}
      {editingAd && (
          <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center backdrop-blur-sm p-4">
              <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl overflow-y-auto max-h-[90vh]">
                   <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Edit size={16}/> Edit Ad</h3>
                      <button onClick={()=>setEditingAd(null)} className="hover:bg-gray-100 p-1 rounded"><X size={20}/></button>
                   </div>
                   <div className="space-y-3">
                       <div><label className="text-xs font-bold text-gray-500">Price</label><input className="w-full border p-2 rounded text-sm font-bold" value={editingAd.price} onChange={e => setEditingAd({...editingAd, price: e.target.value})} /></div>
                       <div><label className="text-xs font-bold text-gray-500">Size</label><input className="w-full border p-2 rounded text-sm" value={editingAd.size} onChange={e => setEditingAd({...editingAd, size: e.target.value})} /></div>
                       <div><label className="text-xs font-bold text-gray-500">Contact</label><input className="w-full border p-2 rounded text-sm" value={editingAd.contact_info} onChange={e => setEditingAd({...editingAd, contact_info: e.target.value})} /></div>
                       
                       <div className="border border-dashed border-gray-300 p-2 rounded bg-gray-50 text-center">
                           <label className="text-xs font-bold text-gray-500 flex items-center justify-center gap-1 cursor-pointer"><UploadCloud size={14}/> Change Photo<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image', true)} /></label>
                           {editingAd.image_url && <img src={editingAd.image_url} alt="Preview" className="h-10 w-full object-contain mt-2"/>}
                       </div>

                       <div className="border border-dashed border-purple-300 p-2 rounded bg-purple-50 text-center">
                           <label className="text-xs font-bold text-purple-600 flex items-center justify-center gap-1 cursor-pointer"><Mic size={14}/> Change Voice Note<input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio', true)} /></label>
                           {editingAd.audio_url && <audio controls src={editingAd.audio_url} className="w-full h-6 mt-2"/>}
                       </div>

                       <div className="flex gap-2 pt-2">
                           <button onClick={()=>setEditingAd(null)} className="flex-1 bg-gray-200 py-2 rounded font-bold text-xs">Cancel</button>
                           <button onClick={handleUpdateAd} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold text-xs hover:bg-blue-700">Save Changes</button>
                       </div>
                   </div>
              </div>
          </div>
      )}

      {/* --- POST AD MODAL (NEW: TEXTAREA + AUDIO) --- */}
      {newAdLocation && (
          <div className="fixed bottom-4 left-4 z-[5000] bg-white p-4 rounded-xl shadow-2xl w-80 border-2 border-blue-500 animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto">
               <h3 className="font-bold text-blue-600 mb-2">Post New Ad</h3>
               <div className="space-y-2">
                   <select className="w-full border p-2 rounded text-sm font-bold" onChange={e => setNewAdData({...newAdData, type: e.target.value})}><option value="SELL">Sell Plot</option><option value="LOOKING">Looking For</option></select>
                   <div className="flex gap-2">
                       <input placeholder="Size (e.g. 200)" type="number" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, size: e.target.value})} />
                       <input placeholder="Price (e.g. 1.5 Cr)" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, price: e.target.value})} />
                   </div>
                   <input placeholder="WhatsApp (e.g. 9198...)" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, contact: e.target.value})} />
                   
                   <textarea placeholder="Description: e.g. 'Corner bit, clear title, near Highway...'" className="w-full border p-2 rounded text-sm h-16" onChange={e => setNewAdData({...newAdData, desc: e.target.value})} />

                   {/* MEDIA UPLOADS */}
                   <div className="grid grid-cols-2 gap-2">
                       <div className="border border-dashed border-gray-300 p-2 rounded bg-gray-50 text-center">
                           <label className="text-xs font-bold text-gray-500 flex flex-col items-center justify-center gap-1 cursor-pointer">
                               <UploadCloud size={14}/> {newAdData.image_url ? "Re-Upload" : "Photo"}
                               <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                           </label>
                           {newAdData.image_url && <span className="text-[9px] text-green-600">✅ Ready</span>}
                       </div>
                       <div className="border border-dashed border-purple-300 p-2 rounded bg-purple-50 text-center">
                           <label className="text-xs font-bold text-purple-600 flex flex-col items-center justify-center gap-1 cursor-pointer">
                               <Mic size={14}/> {newAdData.audio_url ? "Re-Record" : "Voice Note"}
                               <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} />
                           </label>
                           {newAdData.audio_url && <span className="text-[9px] text-green-600">✅ Ready</span>}
                       </div>
                   </div>

                   <input placeholder="Video Link (YouTube...)" className="w-full border p-2 rounded text-sm bg-gray-50" onChange={e => setNewAdData({...newAdData, video_url: e.target.value})} />
                   
                   <button onClick={handlePostAd} disabled={uploading} className={`w-full text-white py-2 rounded font-bold ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>Submit Ad</button>
               </div>
          </div>
      )}

      {/* --- EXISTING MODALS (Premium Request, Links, Pin) --- */}
      {showPremiumRequest && (
          <div className="fixed inset-0 bg-black/70 z-[8000] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 p-6 text-white text-center">
                      <Award size={40} className="mx-auto mb-2 text-yellow-100"/>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Premium Land Audit</h2>
                      <p className="text-yellow-100 text-sm mt-1">Get Professional Verification Before You Buy</p>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-xs text-yellow-800 space-y-1">
                          <p className="font-bold flex items-center gap-2">✅ Legal Verification (EC, Prohibited List)</p>
                          <p className="font-bold flex items-center gap-2">✅ Market Valuation (Govt vs Market Price)</p>
                          <p className="font-bold flex items-center gap-2">✅ Zoning Check (RERA, HMDA, FTL)</p>
                      </div>
                      <button onClick={() => generatePDF(true)} className="w-full border-2 border-dashed border-gray-300 py-3 rounded-lg text-gray-500 font-bold hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2">
                          <Download size={16}/> Download Model Report (PDF)
                      </button>
                      <button onClick={() => window.open(`https://wa.me/${ADMIN_PHONE}?text=I am interested in a Premium Land Audit.`, '_blank')} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-green-700 flex items-center justify-center gap-2">
                         <MessageCircle size={20}/> Request Audit on WhatsApp
                      </button>
                  </div>
                  <button onClick={()=>setShowPremiumRequest(false)} className="w-full bg-gray-100 py-3 text-xs font-bold text-gray-500 hover:bg-gray-200">Close</button>
              </div>
          </div>
      )}
      
      {showLinksModal && (
          <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center backdrop-blur-sm p-4">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Globe className="text-blue-600"/> Official Verification</h3>
                      <button onClick={()=>setShowLinksModal(false)} className="hover:bg-gray-100 p-1 rounded"><X size={20}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      {GOVT_LINKS.map(link => (
                          <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
                              <ExternalLink size={14}/> {link.name}
                          </a>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {showPinModal && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center items-center backdrop-blur-sm">
              <div className="bg-white p-6 rounded-xl w-72 shadow-2xl">
                  <h3 className="font-bold mb-4">Admin Login</h3>
                  <input type="password" value={pinInput} onChange={(e)=>setPinInput(e.target.value)} className="w-full border p-2 rounded mb-4 text-center tracking-widest" placeholder="PIN"/>
                  <button onClick={()=>{ if(pinInput===PIN_CODE){ setIsAdmin(true); setShowPinModal(false); } else alert("Wrong PIN"); }} className="w-full bg-black text-white py-2 rounded font-bold">Unlock</button>
              </div>
          </div>
      )}

      {/* --- RATING MODAL --- */}
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
                    {/* ... other audit inputs kept simple for brevity ... */}
                    <div className="mb-4 pt-4 border-t border-dashed">
                        <h3 className="text-xs font-black text-slate-400 uppercase mb-3">2. Financials</h3>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-[10px] font-bold text-gray-500">Asking Price</label><input type="number" className="w-full border-b border-slate-300 py-1 text-sm font-bold" onChange={(e) => setRatingData({...ratingData, price: e.target.value})}/></div>
                             <div><label className="text-[10px] font-bold text-gray-500">Govt Value</label><input type="number" className="w-full border-b border-slate-300 py-1 text-sm font-bold" onChange={(e) => setRatingData({...ratingData, govtValue: e.target.value})}/></div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t bg-white shrink-0">
                     <button onClick={() => generatePDF(false)} className="w-full bg-indigo-900 text-white py-3 rounded-lg font-bold hover:bg-black flex items-center justify-center gap-2"><FileText size={18}/> Generate PDF Report</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateSearchApp;