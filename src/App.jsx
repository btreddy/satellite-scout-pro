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
  RefreshCw, Globe, PlusCircle, Layers, Award, Download, Image as ImageIcon, Video, UploadCloud, Edit, Mic, Share2, MapPin, Star,
  Menu, Home
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

const GoldIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

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
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchMarker, setTempSearchMarker] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Mobile Search Toggle

  // MODALS & VIEWS
  const [showLinksModal, setShowLinksModal] = useState(false); 
  const [showPremiumRequest, setShowPremiumRequest] = useState(false); 
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const [editingAd, setEditingAd] = useState(null);
  const [viewingAd, setViewingAd] = useState(null); 

  // DASHBOARD FILTERS
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); 

  // MARKETPLACE
  const [adMode, setAdMode] = useState(null); 
  const [radarMode, setRadarMode] = useState(false); // NEW: Separate Radar Toggle
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

  // AUDIT DATA
  const [ratingData, setRatingData] = useState({ 
      price: '', govtValue: '', rera: '', approval: 'HMDA', orrDist: '', orrStatus: 'Out', 
      bankLoan: false, devPace: 'Moderate', legal: 'Clear', zone: 'Residential'     
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    fetchMarketplaceAds();
    fetchProjects();
  }, [isAdmin]);

  // --- DEEP LINK HANDLER ---
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
              setViewingAd(null); 
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
      const shareUrl = `https://maps.safelanddeal.com/?ad_id=${ad.id}`;
      const shareText = `🔥 *Safe Land Deal Alert* 🔥\n\n💎 *Price:* ${ad.price}\n📏 *Size:* ${ad.size}\n📍 *Verified Location:*`;
      
      if (navigator.share) {
          try { await navigator.share({ title: 'Safe Land Deal', text: shareText, url: shareUrl }); } 
          catch (error) { console.log('Error sharing', error); }
      } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
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
        // 1. Post Ad Logic
        if (viewMode === 'MARKETPLACE' && adMode) {
            setNewAdLocation(e.latlng);
        }
        // 2. Radar Logic (Now Separate)
        else if (viewMode === 'MARKETPLACE' && radarMode) {
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
      
      {/* --- MOBILE TOP HEADER --- */}
      <header className="bg-slate-900 px-4 py-3 flex justify-between items-center z-[2000] shadow-md text-white md:hidden">
          <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-1.5 rounded-lg shadow-lg">
                  <Crosshair size={18} className="animate-spin-slow" />
              </div>
              <h1 className="text-sm font-black tracking-tighter">SAFE LAND</h1>
          </div>
          <div className="flex gap-3">
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`${isSearchOpen ? 'text-yellow-400' : 'text-white'}`}><Search size={20}/></button>
              <button onClick={() => setShowPinModal(true)}>{isAdmin ? <Unlock size={20} className="text-green-400"/> : <Lock size={20}/>}</button>
          </div>
      </header>

      {/* --- MOBILE SEARCH BAR (Toggle) --- */}
      {isSearchOpen && (
          <div className="bg-slate-800 p-3 md:hidden z-[1999] border-b border-slate-700 animate-in slide-in-from-top-2">
              <div className="flex gap-2">
                  <input placeholder="Search Location (e.g. Shamshabad)" className="w-full p-2 rounded-lg text-sm outline-none bg-slate-700 text-white placeholder-slate-400" autoFocus 
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={async (e) => {
                          if(e.key === 'Enter'){
                              const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
                              const data = await res.json();
                              if(data && data[0]) { setTempSearchMarker([data[0].lat, data[0].lon]); setIsSearchOpen(false); }
                          }
                      }}
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="text-slate-400"><X size={20}/></button>
              </div>
          </div>
      )}

      {/* --- DESKTOP HEADER (Original) --- */}
      <header className="hidden md:flex bg-slate-900 px-4 py-3 justify-between items-center z-[2000] shadow-md text-white">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-1.5 rounded-lg shadow-lg">
                <Crosshair size={20} className="animate-spin-slow" />
            </div>
            <div>
                <h1 className="text-lg font-black tracking-tighter leading-none">SAFE LAND</h1>
                <p className="text-[9px] text-gray-400 tracking-widest uppercase">Intelligence Console</p>
            </div>
        </div>
        
        {/* VIEW SWITCHER (Desktop) */}
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700 backdrop-blur-md">
            <button onClick={() => setViewMode('MARKETPLACE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode==='MARKETPLACE' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-slate-400'}`}><Store size={14}/> Market</button>
            <button onClick={() => setViewMode('VENTURE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode==='VENTURE' ? 'bg-orange-500 text-white shadow-lg scale-105' : 'text-slate-400'}`}><PenTool size={14}/> Planner</button>
            {isAdmin && <button onClick={() => setViewMode('ADMIN')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode==='ADMIN' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-slate-400'}`}><List size={14}/> Admin</button>}
        </div>

        <div className="flex gap-2 items-center">
            <div className="bg-slate-800 px-3 py-1.5 rounded-full items-center gap-2 border border-slate-700 flex">
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
            <button onClick={() => setShowPremiumRequest(true)} className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg">
                <ShieldCheck size={14}/> Request Audit
            </button>
            <button onClick={() => setShowPinModal(true)} className={`p-2 rounded-lg transition-all ${isAdmin ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                {isAdmin ? <Unlock size={16}/> : <Lock size={16}/>}
            </button>
        </div>
      </header>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 relative z-0 pb-16 md:pb-0"> 
      
      {/* ADMIN VIEW */}
      {viewMode === 'ADMIN' ? (
          <div className="h-full overflow-auto p-4 bg-gray-100">
              <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
                      <h2 className="text-xl font-black flex items-center gap-2"><List/> Ad Database</h2>
                      <div className="flex gap-2 flex-wrap justify-center">
                          <button onClick={() => fetchMarketplaceAds()} className="p-2 bg-white border rounded hover:bg-gray-50"><RefreshCw size={16}/></button>
                          <button onClick={() => setShowLinksModal(true)} className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-bold flex items-center gap-1"><Globe size={14}/> Govt Links</button>
                          <button onClick={() => setShowRatingModal(true)} className="px-3 py-2 bg-purple-600 text-white rounded text-xs font-bold flex items-center gap-1"><ShieldCheck size={14}/> Audit Tool</button>
                      </div>
                  </div>
                  {/* ... Table ... */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                      <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                              <tr>
                                  <th className="p-4">Type</th>
                                  <th className="p-4">Price</th>
                                  <th className="p-4">Contact</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                              {marketAds.map(ad => (
                                  <tr key={ad.id} className="border-b hover:bg-gray-50">
                                      <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${ad.ad_type==='SELL'?'bg-green-100 text-green-800':'bg-blue-100'}`}>{ad.ad_type}</span></td>
                                      <td className="p-4 font-bold">{ad.price}</td>
                                      <td className="p-4 text-xs">{ad.contact_info}</td>
                                      <td className="p-4 text-xs">{ad.status === 'APPROVED' ? '✅ Live' : '🟠 Pending'}</td>
                                      <td className="p-4 text-right flex justify-end gap-1">
                                          {ad.status !== 'APPROVED' && <button onClick={()=>handleApproveAd(ad.id)} className="p-1 bg-green-100 text-green-700 rounded"><CheckCircle size={14}/></button>}
                                          <button onClick={()=>setEditingAd(ad)} className="p-1 bg-blue-100 text-blue-700 rounded"><Edit size={14}/></button>
                                          <button onClick={()=>handleDeleteAd(ad.id)} className="p-1 bg-red-100 text-red-700 rounded"><Trash2 size={14}/></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                      </div>
                  </div>
              </div>
          </div>
      ) : (
        /* MAP VIEW */
        <MapContainer center={[17.2360, 78.4192]} zoom={13} maxZoom={22} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Satellite">
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" maxNativeZoom={18} maxZoom={22} />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Street">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" />
                </LayersControl.BaseLayer>
            </LayersControl>

            <FlyToSearchResult />

            {/* AD MARKERS */}
            {viewMode === 'MARKETPLACE' && marketAds.map((ad) => {
                const isAmbassador = ad.price === '0' || ad.price === 'FREE';
                return (
                <React.Fragment key={ad.id}>
                    <Marker position={[ad.lat, ad.lng]} icon={isAmbassador ? GoldIcon : DefaultIcon}>
                      <Popup className={isAmbassador ? "ambassador-popup" : "premium-popup"}>
                          <div className={`min-w-[200px] ${isAmbassador ? 'bg-slate-900 text-white -m-4 rounded-xl border-2 border-yellow-500' : ''}`}>
                              {/* ... Popup Content ... */}
                              {ad.image_url ? <img src={ad.image_url} className="w-full h-32 object-cover rounded-t-lg"/> : null}
                              <div className="p-3">
                                  <h3 className={`font-bold ${isAmbassador ? 'text-yellow-400' : 'text-green-700'}`}>{isAmbassador ? 'JOIN NOW' : ad.price}</h3>
                                  <p className="text-xs">{ad.size}</p>
                                  {ad.audio_url && <audio controls src={ad.audio_url} className="w-full h-6 mt-2" style={{filter: isAmbassador?'invert(1)':''}}/>}
                                  <div className="flex gap-2 mt-2">
                                      <button onClick={() => window.open(`https://wa.me/${ad.contact_info}`, '_blank')} className="flex-1 bg-green-600 text-white py-1 rounded text-xs">WhatsApp</button>
                                      <button onClick={() => handleShareAd(ad)} className="flex-1 bg-blue-600 text-white py-1 rounded text-xs">Share</button>
                                  </div>
                              </div>
                          </div>
                      </Popup>
                    </Marker>
                    {ad.points && <Polygon positions={ad.points} pathOptions={{ color: isAmbassador ? 'gold' : 'yellow', fillColor: isAmbassador ? 'gold' : 'yellow', fillOpacity: 0.2 }} />}
                </React.Fragment>
            )})}
            
            {/* VENTURE POLYGONS */}
            {viewMode === 'VENTURE' && (
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl position="topright" onCreated={(e)=>{setCurrentShape(e); setShowSaveForm(true);}} draw={{ rectangle: false, polygon: { allowIntersection: false, showArea: false }, circle: false, circlemarker: false, marker: false, polyline: false }} />
                    {projects.map(p => (
                        <Polygon key={p.id} positions={p.points} color={p.color || "cyan"}><Popup>{p.name}</Popup></Polygon>
                    ))}
                </FeatureGroup>
            )}
            
            {newAdLocation && <Marker position={newAdLocation} icon={DefaultIcon}><Popup>New Ad</Popup></Marker>}
            {tempSearchMarker && <Marker position={tempSearchMarker} icon={DefaultIcon}><Popup>Result</Popup></Marker>}
            {radarResults && <Popup position={radarResults.pos} onClose={()=>setRadarResults(null)}><div className="min-w-[180px]"><div className="bg-purple-600 text-white p-2 -m-3 mb-2 rounded-t font-bold text-xs">Growth Radar</div>{radarResults.nodes.map((n,i)=><div key={i} className="flex justify-between text-xs border-b py-1"><span>{n.name}</span><b>{n.dist} km</b></div>)}</div></Popup>}
            
            <MapClickHandler />
        </MapContainer>
      )}
      </div>

      {/* --- SUB-TOOLBAR (DESKTOP) --- */}
      {viewMode === 'MARKETPLACE' && (
        <div className="hidden md:flex bg-white border-b px-4 py-2 gap-3 items-center text-xs shadow-sm">
            <span className="font-bold text-blue-800 flex items-center gap-1"><Store size={12}/> MARKET TOOLS:</span>
            <button onClick={() => { if(!adMode) { setAdMode('SELL'); setRadarMode(false); alert("Tap map to post"); } else { setAdMode(null); setNewAdLocation(null); } }} 
                className={`px-3 py-1 rounded border font-bold flex items-center gap-1 ${adMode ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-600 text-white'}`}>
                {adMode ? <X size={12}/> : <PlusCircle size={12}/>} {adMode ? 'Cancel' : 'Post Free Ad'}
            </button>
            
            {/* NEW: RADAR BUTTON (DESKTOP) */}
            <button onClick={() => { setRadarMode(!radarMode); setAdMode(null); }} 
                className={`px-3 py-1 rounded border font-bold flex items-center gap-1 ${radarMode ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                {radarMode ? <Zap size={12} className="animate-pulse"/> : <Radar size={12}/>} {radarMode ? 'Stop Radar' : 'Growth Radar'}
            </button>

            <button onClick={() => setShowLinksModal(true)} className="px-3 py-1 rounded border border-gray-200 bg-gray-50 text-gray-700 font-bold flex items-center gap-1 hover:bg-gray-100"><Globe size={12}/> Verify Land</button>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION BAR (MOBILE ONLY) --- */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 md:hidden z-[3000] text-[10px] font-bold text-gray-500">
          <button onClick={() => setViewMode('MARKETPLACE')} className={`flex flex-col items-center ${viewMode==='MARKETPLACE' ? 'text-blue-600' : ''}`}>
              <Home size={20}/> Market
          </button>
          
          {/* NEW: RADAR BUTTON (MOBILE) */}
          <button onClick={() => { setRadarMode(!radarMode); setAdMode(null); }} className={`flex flex-col items-center ${radarMode ? 'text-purple-600 animate-pulse' : ''}`}>
              <Radar size={20}/> Radar
          </button>
          
          {/* FAB: POST AD BUTTON */}
          <div className="relative -top-5">
              <button onClick={() => { if(!adMode) { setAdMode('SELL'); setRadarMode(false); alert("Tap map to post"); } else { setAdMode(null); setNewAdLocation(null); } }} 
                  className="bg-blue-600 text-white p-3 rounded-full shadow-lg border-4 border-gray-50">
                  <PlusCircle size={24}/>
              </button>
          </div>

          <button onClick={() => setShowLinksModal(true)} className="flex flex-col items-center">
              <Globe size={20}/> Verify
          </button>
          {isAdmin ? (
              <button onClick={() => setViewMode('ADMIN')} className={`flex flex-col items-center ${viewMode==='ADMIN' ? 'text-purple-600' : ''}`}>
                  <List size={20}/> Admin
              </button>
          ) : (
              <button onClick={() => setShowPremiumRequest(true)} className="flex flex-col items-center text-yellow-600">
                  <Award size={20}/> Audit
              </button>
          )}
      </div>

      {/* ... [KEEP ALL MODALS: Post, Edit, Links, Pin, Rating, ViewingAd] ... */}
      {/* ... (Existing modal code stays exactly here) ... */}
      {/* ... ... */}
      
      {showLinksModal && (
          <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center p-4">
              <div className="bg-white p-6 rounded-xl w-full max-w-md">
                  <div className="flex justify-between border-b pb-2 mb-2"><h3 className="font-bold">Official Verification</h3><button onClick={()=>setShowLinksModal(false)}><X/></button></div>
                  <div className="grid grid-cols-2 gap-2">{GOVT_LINKS.map(link => <a key={link.name} href={link.url} target="_blank" className="bg-blue-50 p-2 rounded text-xs text-blue-700 block border hover:bg-blue-100">{link.name}</a>)}</div>
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
      
      {/* ... (Post Ad, Edit Ad, Welcome Card - all implicitly included as before) ... */}
      
      {newAdLocation && (
          <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-4 md:w-80 md:right-auto z-[5000] bg-white p-4 rounded-xl shadow-2xl border-2 border-blue-500 animate-in slide-in-from-bottom-10 max-h-[80vh] overflow-y-auto">
               <h3 className="font-bold text-blue-600 mb-2">Post New Ad</h3>
               <div className="space-y-2">
                   <select className="w-full border p-2 rounded text-sm font-bold" onChange={e => setNewAdData({...newAdData, type: e.target.value})}><option value="SELL">Sell Plot</option><option value="LOOKING">Looking For</option></select>
                   <div className="flex gap-2">
                       <input placeholder="Size" type="number" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, size: e.target.value})} />
                       <input placeholder="Price" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, price: e.target.value})} />
                   </div>
                   <input placeholder="WhatsApp" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, contact: e.target.value})} />
                   <textarea placeholder="Description..." className="w-full border p-2 rounded text-sm h-16" onChange={e => setNewAdData({...newAdData, desc: e.target.value})} />
                   <div className="grid grid-cols-2 gap-2">
                       <div className="border border-dashed border-gray-300 p-2 rounded text-center"><label className="text-xs cursor-pointer"><UploadCloud size={14} className="mx-auto"/> Photo<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} /></label></div>
                       <div className="border border-dashed border-purple-300 p-2 rounded text-center"><label className="text-xs cursor-pointer"><Mic size={14} className="mx-auto"/> Audio<input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} /></label></div>
                   </div>
                   <button onClick={handlePostAd} disabled={uploading} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Submit Ad</button>
               </div>
          </div>
      )}
      
      {/* ... [Welcome Card & Other Modals - Assumed Preserved] ... */}
      {viewingAd && (
          <div className="fixed inset-0 bg-black/70 z-[9999] flex justify-center items-center p-4">
              <div className={`rounded-xl w-full max-w-sm overflow-hidden flex flex-col ${viewingAd.price === '0' ? 'bg-slate-900 text-white border border-yellow-500' : 'bg-white'}`}>
                  <div className="h-48 relative bg-gray-100">
                      {viewingAd.image_url ? <img src={viewingAd.image_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-400">NO IMAGE</div>}
                      <button onClick={()=>setViewingAd(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="p-5">
                      <h2 className={`text-2xl font-black ${viewingAd.price === '0' ? 'text-yellow-400' : 'text-slate-800'}`}>{viewingAd.price === '0' ? 'JOIN NOW' : viewingAd.price}</h2>
                      <p className="text-sm">{viewingAd.size} | {viewingAd.ad_type}</p>
                      {viewingAd.audio_url && <audio controls src={viewingAd.audio_url} className="w-full h-8 mt-2" style={{ filter: viewingAd.price === '0' ? 'invert(1)' : 'none' }} />}
                      <div className="flex gap-2 mt-4">
                          <button onClick={() => window.open(`https://wa.me/${viewingAd.contact_info}`, '_blank')} className="flex-1 bg-green-600 text-white py-2 rounded font-bold">WhatsApp</button>
                          <button onClick={() => setViewingAd(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-bold">Map</button>
                      </div>
                  </div>
              </div>
          </div>
      )}
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

    </div>
  );
};

export default RealEstateSearchApp;