import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, LayersControl, useMapEvents, useMap } from 'react-leaflet';
import { 
  X, Crosshair, Ruler, Upload, Download, Trash2, Globe, Copy, ExternalLink, 
  Search, Zap, Radar, FileText, Lock, Unlock, WifiOff, ArrowRight, Phone, 
  Map as MapIcon, Info, MessageCircle, Link, Building2, Store, Tag, HandCoins, 
  CheckCircle, AlertTriangle, BookOpen, MousePointerClick
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from './supabaseClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- CONFIGURATION (SECURE) ---
const APP_PIN = import.meta.env.VITE_APP_PIN || "1234"; 
const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || "917013007595"; 
const PRO_DOMAIN = import.meta.env.VITE_PRO_DOMAIN || "https://maps.safelanddeal.com";

// --- ICONS ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const EditIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: white; border: 2px solid #ea580c; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const SellIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #EAB308; border: 2px solid white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 14px;">💲</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

const LookIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #3B82F6; border: 2px solid white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); font-size: 14px;">👀</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

let DefaultIcon = L.icon({ 
  iconUrl: icon, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- GROWTH NODES ---
const GROWTH_NODES = [
  { name: "Bharat Future City", lat: 16.9850, lng: 78.6500 },
  { name: "Amazon Data Center", lat: 17.0600, lng: 78.6300 },
  { name: "RRR (Shadnagar)", lat: 17.0350, lng: 78.2100 },
  { name: "RGIA Airport", lat: 17.2403, lng: 78.4294 },
  { name: "Pharma Cluster", lat: 16.9500, lng: 78.6100 },
  { name: "TCS Adibatla", lat: 17.2100, lng: 78.5300 }
];

// --- UTILS ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
};

const getDistanceMeters = (p1, p2) => {
  const R = 6371e3; 
  const φ1 = p1.lat * Math.PI/180;
  const φ2 = p2.lat * Math.PI/180;
  const Δφ = (p2.lat-p1.lat) * Math.PI/180;
  const Δλ = (p2.lng-p1.lng) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const calculateAcres = (latLngs) => {
  if (latLngs.length < 3) return 0;
  const earthRadius = 6378137; 
  let area = 0;
  for (let i = 0; i < latLngs.length; i++) {
    const j = (i + 1) % latLngs.length;
    const p1 = latLngs[i];
    const p2 = latLngs[j];
    const lat1 = (p1.lat * Math.PI) / 180;
    const lat2 = (p2.lat * Math.PI) / 180;
    const lng1 = (p1.lng * Math.PI) / 180;
    const lng2 = (p2.lng * Math.PI) / 180;
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  area = (Math.abs(area) * earthRadius * earthRadius) / 2;
  return area / 4046.86; 
};

const formatArea = (acresVal) => {
  const ac = parseFloat(acresVal);
  if (ac < 1.0) {
    const sqYds = Math.round(ac * 4840);
    return `${sqYds.toLocaleString()} Sq Yds`;
  }
  return `${ac.toFixed(2)} Ac`;
};

const generateSquare = (center, sqYds) => {
    const areaM2 = sqYds * 0.836127;
    const sideM = Math.sqrt(areaM2);
    const halfSide = sideM / 2;
    const dLat = halfSide / 111132;
    const dLng = halfSide / (111132 * Math.cos(center.lat * Math.PI / 180));
    return [
        { lat: center.lat + dLat, lng: center.lng - dLng }, // TL
        { lat: center.lat + dLat, lng: center.lng + dLng }, // TR
        { lat: center.lat - dLat, lng: center.lng + dLng }, // BR
        { lat: center.lat - dLat, lng: center.lng - dLng }  // BL
    ];
};

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => { 
    if (center) map.flyTo(center, 18, { duration: 1.5 }); 
  }, [center, map]);
  return null;
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
const RealEstateSearchApp = () => {
  // --- STATE ---
  const [leads, setLeads] = useState([]); 
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Marketplace State
  const [viewMode, setViewMode] = useState('VENTURES'); 
  const [marketAds, setMarketAds] = useState([]);
  const [adMode, setAdMode] = useState(null); 
  const [newAdLocation, setNewAdLocation] = useState(null);

  // Measure/Edit State
  const [measurePoints, setMeasurePoints] = useState([]); 
  const [redoStack, setRedoStack] = useState([]); 
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [editingLead, setEditingLead] = useState(null); 
  const [tempArea, setTempArea] = useState(0);

  // UI State
  const [isRadarMode, setIsRadarMode] = useState(false);
  const [radarResults, setRadarResults] = useState(null);
  const [projectBrochure, setProjectBrochure] = useState(null); 
  const [activeContactNumber, setActiveContactNumber] = useState(ADMIN_PHONE);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [showLogin, setShowLogin] = useState(false);
  
  const [showCoordsPanel, setShowCoordsPanel] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showResources, setShowResources] = useState(false); 
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [centerPos, setCenterPos] = useState({ lat: 17.1350, lng: 78.4300 }); 
  const [tempSearchMarker, setTempSearchMarker] = useState(null); 

  const dragStartPos = useRef(null);
  const fileInputRef = useRef(null);
  const mapRef = useRef(null); 

  useEffect(() => { fetchLeads(); fetchMarketplaceAds(); }, []);
  useEffect(() => { fetchMarketplaceAds(); }, [isAdmin]);

  // --- MARKETPLACE LOGIC ---
  const fetchMarketplaceAds = async () => {
    try {
        let query = supabase.from('marketplace_ads').select('*');
        if (!isAdmin) query = query.eq('status', 'APPROVED');
        const { data } = await query;
        console.log("📢 FETCHED ADS:", data);
        if (data) setMarketAds(data);
    } catch(e) { console.error(e); }
  };

  const startPostAd = () => {
      setAdMode('PICKING_LOC');
      alert("📍 STEP 1: MARK LOCATION\n\n1. Move the map to the EXACT plot location.\n2. Tap the map to drop the marker.\n3. Click 'Confirm Location'.");
  };

  const confirmLocation = () => {
      if(!newAdLocation) return alert("Please click on the map to mark the location first!");
      setAdMode('FILLING_FORM');
  };

  const handlePostAd = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const type = formData.get('ad_type');
    let points = null;
    if(type === 'SELL') {
        const sqYds = parseFloat(formData.get('size')) || 200;
        points = generateSquare(newAdLocation, sqYds);
    }
    const newAd = {
        ad_type: type,
        price: formData.get('price'),
        size: formData.get('size'),
        contact_info: formData.get('contact_info'),
        description: formData.get('description'),
        lat: newAdLocation.lat,
        lng: newAdLocation.lng,
        status: 'PENDING',
        points: points,
        radius: formData.get('radius')
    };
    try {
        const { error } = await supabase.from('marketplace_ads').insert([newAd]);
        if (error) throw error;
        fetchMarketplaceAds();
        alert("✅ Ad Submitted Successfully!\n\nYour ad is now PENDING approval.\nAdmin will verify the location and publish it.");
        setAdMode(null); setNewAdLocation(null);
    } catch(err) { alert("Error submitting ad."); }
  };

  const handleApproveAd = async (adId) => {
    if(!isAdmin) return;
    if(!window.confirm("Approve this ad for public view?")) return;
    await supabase.from('marketplace_ads').update({ status: 'APPROVED' }).eq('id', adId);
    fetchMarketplaceAds();
  };

  const handleDeleteAd = async (adId) => {
    if(!isAdmin) return;
    if(!window.confirm("Delete this ad permanently?")) return;
    await supabase.from('marketplace_ads').delete().eq('id', adId);
    fetchMarketplaceAds();
  };

  // --- VENTURES / LEAD LOGIC ---
  const handleSimplify = () => {
    const simplified = measurePoints.filter((_, i) => i === 0 || i % 4 === 0 || i === measurePoints.length - 1);
    setRedoStack([...redoStack, measurePoints]); setMeasurePoints(simplified); setTempArea(calculateAcres(simplified));
  };

  const handleEditShape = (lead) => {
    if(!isAdmin) return;
    setMeasurePoints(lead.points); setTempArea(lead.acres); setEditingLead(lead); setCenterPos(lead.center); setIsMeasuring(true); setShowCoordsPanel(true); setRedoStack([]);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const importedLeads = [];
        if (json.type === 'FeatureCollection' && json.features) {
           const allPoints = json.features.every(f => f.geometry.type === 'Point');
           if (allPoints && json.features.length > 2) {
               if(window.confirm(`Connect ${json.features.length} points?`)) {
                   const pts = json.features.map(f => ({ lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }));
                   const newLead = { id: Date.now(), label: "Imported", note: "Connected", acres: calculateAcres(pts), points: pts, center: pts[0] };
                   importedLeads.push(newLead); saveToLocal(newLead);
               }
           } else {
               if(!window.confirm(`Import ${json.features.length} items?`)) return;
               for (const feature of json.features) {
                  let raw = null;
                  if (feature.geometry.type === 'Polygon') raw = feature.geometry.coordinates[0];
                  else if (feature.geometry.type === 'LineString') raw = feature.geometry.coordinates;
                  if (!raw) continue;
                  const pts = raw.map(c => ({ lat: c[1], lng: c[0] }));
                  if (pts.length > 1) {
                     const newLead = { id: Date.now() + Math.random(), label: feature.properties?.Name || 'Track', note: 'Import', acres: calculateAcres(pts), points: pts, center: pts[0] };
                     importedLeads.push(newLead); saveToLocal(newLead);
                  }
               }
           }
        }
        if (importedLeads.length > 0) { setLeads(prev => [...importedLeads, ...prev]); alert("Imported successfully (Saved Locally)."); }
      } catch (err) { alert("Error reading file."); }
    };
    reader.readAsText(file); e.target.value = null; 
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads));
    const a = document.createElement('a'); a.href = dataStr; a.download = `SatelliteScout_Backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
  };

  const saveToLocal = (leadItem) => {
    try {
        const current = JSON.parse(localStorage.getItem('scout_leads_backup') || '[]');
        const filtered = current.filter(l => l.id !== leadItem.id); filtered.push(leadItem);
        localStorage.setItem('scout_leads_backup', JSON.stringify(filtered)); return true;
    } catch(e) { return false; }
  };

  const handleSaveShape = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const leadData = { label: formData.get('label'), survey_no: formData.get('survey_no'), note: formData.get('note'), acres: tempArea, points: measurePoints, center: measurePoints[0] };
    const finalId = editingLead ? editingLead.id : Date.now();
    const finalLead = { ...leadData, id: finalId };
    let savedToCloud = false;
    try {
        if (editingLead) {
          const { error } = await supabase.from('scout_leads').update(leadData).eq('id', finalId);
          if (!error) savedToCloud = true;
        } else {
          const { error } = await supabase.from('scout_leads').insert([finalLead]);
          if (!error) savedToCloud = true;
        }
    } catch (err) { console.warn("Cloud save failed, switching to local."); }
    saveToLocal(finalLead);
    if(editingLead) { setLeads(leads.map(l => l.id === finalId ? finalLead : l)); } else { setLeads([finalLead, ...leads]); }
    finishSave();
    if(savedToCloud) alert("Project Saved to Cloud!"); else alert("Project Saved Locally.");
  };

  const finishSave = () => { setMeasurePoints([]); setRedoStack([]); setIsMeasuring(false); setEditingLead(null); setShowSaveForm(false); setShowCoordsPanel(false); };
  
  const handleGeneratePDF = async () => {
    const hasActiveDrawing = measurePoints.length > 2;
    if(!radarResults && !editingLead && !hasActiveDrawing) return alert("Please Measure a land or run Growth Radar first.");
    const mapElement = document.getElementById('map-print-container');
    const canvas = await html2canvas(mapElement, { useCORS: true, allowTaint: true });
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF();
    doc.setFillColor(79, 70, 229); 
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Safe Land Deal - Investment Insight", 10, 13);
    doc.addImage(imgData, 'PNG', 10, 25, 190, 100);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Property Analysis", 10, 135);
    doc.setFontSize(10);
    let y = 145;
    const target = editingLead || { label: "Draft", survey_no: "N/A", acres: tempArea, note: "Unsaved Draft" };
    doc.text(`Label: ${target.label}`, 10, y); y+=6;
    doc.text(`Survey No: ${target.survey_no || 'N/A'}`, 10, y); y+=6;
    doc.text(`Area: ${formatArea(target.acres)}`, 10, y); y+=10;
    if(target.note) {
        doc.setFontSize(12); doc.setTextColor(0, 0, 150); doc.text("Notes:", 10, y); y+=6;
        doc.setFontSize(10); doc.setTextColor(0,0,0);
        const splitNotes = doc.splitTextToSize(target.note, 190);
        doc.text(splitNotes, 10, y); y += (splitNotes.length * 5) + 10;
    }
    if(radarResults) {
        doc.setFontSize(12); doc.setTextColor(220, 38, 38); doc.text("Growth Radar Data:", 10, y); y+=8;
        doc.setTextColor(0,0,0); doc.setFontSize(10);
        radarResults.nodes.forEach(node => { doc.text(`${node.name}: ${node.dist} km`, 10, y); y+=6; });
    }
    doc.save("Report.pdf");
  };

  const handleExternalSearch = async () => {
    const coordRegex = /(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/;
    const match = searchQuery.match(coordRegex);
    if (match) {
        const lat = parseFloat(match[1]); const lng = parseFloat(match[2]);
        setCenterPos({ lat, lng }); setTempSearchMarker({ lat, lng }); setSearchQuery(''); return;
    } 
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if(data && data.length > 0) {
            const lat = parseFloat(data[0].lat); const lng = parseFloat(data[0].lon);
            setCenterPos({ lat, lng }); setTempSearchMarker({ lat, lng }); setSearchQuery('');
        } else { alert("Address not found."); }
    } catch(err) { alert("Search failed."); }
  };

  const fetchLeads = async () => {
    try {
        const { data } = await supabase.from('scout_leads').select('*').order('created_at', { ascending: false });
        if (data) setLeads(data);
        setFilteredLeads(data || []);
    } catch (err) { console.log("Offline or Error"); }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if(e.target.pin.value === APP_PIN) { setIsAdmin(true); setShowLogin(false); } 
    else { alert("Incorrect PIN"); }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${activeContactNumber}?text=Hello, I want a ground report.`, '_blank');
  };

  const handleCopyLink = (id) => {
      const url = `${PRO_DOMAIN}/?id=${id}`;
      navigator.clipboard.writeText(url);
      alert("Link Copied!");
  };

  const handlePasteCoords = (e) => {
      const input = e.target.value;
      const coordRegex = /(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/;
      const match = input.match(coordRegex);
      if(match) {
          const lat = parseFloat(match[1]); const lng = parseFloat(match[2]);
          const loc = { lat, lng }; setNewAdLocation(loc); setCenterPos(loc);
      }
  };

  // --- MAP CLICK HANDLER ---
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if(adMode === 'PICKING_LOC') {
            setNewAdLocation(e.latlng);
        } else if (isMeasuring && isAdmin) {
            const newPoints = [...measurePoints, e.latlng]; setMeasurePoints(newPoints); setTempArea(calculateAcres(newPoints)); setShowCoordsPanel(true);
        } else if (isRadarMode && isAdmin) {
            const { lat, lng } = e.latlng;
            const distances = GROWTH_NODES.map(node => ({ ...node, dist: calculateDistance(lat, lng, node.lat, node.lng) })).sort((a,b) => parseFloat(a.dist) - parseFloat(b.dist));
            setRadarResults({ pos: e.latlng, nodes: distances.slice(0, 4) }); 
        } else {
            setShowToolsMenu(false);
        }
      },
    });
    return null;
  };

  const DraggableMarker = () => {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(() => ({ dragend(e) { setCenterPos(e.target.getLatLng()); }, }), []); 
    return <Marker draggable={true} eventHandlers={eventHandlers} position={centerPos} ref={markerRef}><Popup>Search Center</Popup></Marker>;
  };
  const DraggableVertex = ({ position, index }) => {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(() => ({ drag(e) { const u=[...measurePoints]; u[index]=e.latlng; setMeasurePoints(u); setTempArea(calculateAcres(u)); }, }), [index]);
    return <Marker draggable={true} eventHandlers={eventHandlers} position={position} icon={EditIcon} ref={markerRef}><Popup>Pt {index + 1}</Popup></Marker>;
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-white shadow-md p-4 z-[5000] relative flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div><h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Crosshair className="text-red-600"/> Safe Land Deal</h1></div>

        {/* MODE TOGGLE */}
        {!adMode && (
        <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button onClick={() => setViewMode('VENTURES')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${viewMode === 'VENTURES' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Building2 size={14}/> Ventures</button>
            <button onClick={() => setViewMode('MARKETPLACE')} className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${viewMode === 'MARKETPLACE' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}><Store size={14}/> Marketplace</button>
        </div>
        )}

        {/* ACTIONS */}
        {!adMode && (
        <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-2 border">
                <Search size={14} className="text-gray-500"/>
                <input className="bg-transparent border-none outline-none text-sm p-1 w-32" placeholder="Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                <button onClick={handleExternalSearch} className="text-blue-600 font-bold px-2">GO</button>
            </div>
            
            {viewMode === 'MARKETPLACE' && (
              <button onClick={startPostAd} className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 animate-pulse shadow-lg shadow-orange-200"><Tag size={14}/> Post Ad</button>
            )}
            
            <button onClick={handleWhatsApp} className="p-2 bg-green-100 text-green-700 rounded-lg border border-green-200 font-bold flex items-center gap-2"><MessageCircle size={20}/> <span className="hidden md:inline text-sm">Contact</span></button>
            
            {isAdmin ? (
               <>
               {viewMode === 'VENTURES' && (
               <>
                <button onClick={() => { setIsRadarMode(!isRadarMode); setIsMeasuring(false); }} className={`p-2 rounded border ${isRadarMode ? 'bg-purple-100 text-purple-700' : 'bg-white'}`}><Radar size={16}/></button>
                <button onClick={handleGeneratePDF} className="p-2 text-red-600 border rounded bg-white"><FileText size={16}/></button>
                <button onClick={() => { setIsMeasuring(!isMeasuring); if(!isMeasuring) { setMeasurePoints([]); setRedoStack([]); } }} className={`p-2 rounded border ${isMeasuring ? 'bg-orange-500 text-white' : 'bg-white'}`}><Ruler size={16}/></button>
                <button onClick={() => fileInputRef.current.click()} className="p-2 text-gray-600 border rounded"><Upload size={16}/></button> <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" />
                <button onClick={handleExportBackup} className="p-2 text-gray-600 border rounded"><Download size={16}/></button>
               </>
               )}
               <button onClick={() => setIsAdmin(false)} className="p-2 text-red-400 border rounded"><Unlock size={16}/></button>
               </>
            ) : ( <button onClick={() => setShowLogin(true)} className="p-2 bg-gray-800 text-white rounded"><Lock size={16}/></button> )}
            
            <button onClick={() => setShowResources(true)} className="p-2 text-blue-600 border rounded bg-white"><BookOpen size={16}/></button>
            <div className="relative">
                <button onClick={() => setShowToolsMenu(!showToolsMenu)} className="p-2 border rounded bg-white"><Globe size={16}/></button>
                {showToolsMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded shadow-xl border p-2 z-[5001]">
                   <button onClick={() => { window.open(`https://earth.google.com/web/@${centerPos.lat},${centerPos.lng},1000a,3000d,35y,0h,0t,0r`, '_blank'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">Google Earth</button>
                   <button onClick={() => { window.open(`https://bhuvan.nrsc.gov.in/ngmaps#17/${centerPos.lat}/${centerPos.lng}`, '_blank'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">Bhuvan</button>
                   <button onClick={() => { navigator.clipboard.writeText(`${centerPos.lat}, ${centerPos.lng}`); alert('Copied!'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">Copy Coords</button>
                </div>
                )}
            </div>
        </div>
        )}
      </div>

      {showLogin && ( <div className="fixed inset-0 bg-black bg-opacity-70 z-[6000] flex justify-center items-center p-4 backdrop-blur-sm"><div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-xs"><h2 className="text-xl font-bold mb-4 text-center">Enter Access PIN</h2><form onSubmit={handleLogin} className="space-y-3"><input type="password" name="pin" className="w-full border p-2 rounded text-center text-2xl tracking-widest" autoFocus placeholder="****" /><div className="flex gap-2"><button type="button" onClick={() => setShowLogin(false)} className="flex-1 py-2 bg-gray-100 rounded">Cancel</button><button type="submit" className="flex-1 bg-black text-white py-2 rounded font-bold">Unlock</button></div></form></div></div> )}
      
      {showResources && ( <div className="fixed inset-0 bg-black bg-opacity-60 z-[6000] flex justify-center items-center p-4 backdrop-blur-sm"><div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold flex items-center gap-2"><BookOpen/> Investor Knowledge Base</h2><button onClick={() => setShowResources(false)}><X/></button></div><div className="space-y-6"><div><h3 className="font-bold mb-2">Government Portals</h3><div className="grid grid-cols-2 gap-2 text-sm"><a href="https://registration.telangana.gov.in/" target="_blank" className="p-2 border rounded hover:bg-blue-50 text-blue-700 font-bold">IGRS (EC Check)</a><a href="https://bhubharati.telangana.gov.in/" target="_blank" className="p-2 border rounded hover:bg-blue-50 text-blue-700 font-bold">Bhubharati (Land Status)</a></div></div></div></div></div> )}

      {/* --- BROCHURE MODAL --- */}
      {projectBrochure && (
        <div className="fixed inset-0 bg-white z-[6000] flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-1/3 bg-slate-50 border-r border-gray-200 overflow-y-auto relative flex flex-col">
                <div className="bg-slate-900 p-6 text-white relative">
                   <button onClick={() => setProjectBrochure(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 text-white"><X size={20}/></button>
                   <h1 className="text-2xl font-bold leading-tight">{projectBrochure.label}</h1>
                   <div className="flex items-center gap-2 mt-2 text-slate-300 text-sm"><MapIcon size={14}/> <span>{projectBrochure.survey_no || "Location Not Specified"}</span></div>
                </div>
                <div className="p-6 flex-1">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h3 className="font-bold text-gray-400 text-xs uppercase mb-3"><Zap size={12}/> Highlights</h3>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{projectBrochure.note || "No details."}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border text-center"><div className="text-xs text-gray-400 font-bold uppercase mb-1">Total Area</div><div className="text-xl font-bold text-slate-800">{formatArea(projectBrochure.acres)}</div></div>
                        <button onClick={() => window.open(`https://wa.me/${activeContactNumber}?text=I am interested in ${projectBrochure.label}`, '_blank')} className="bg-green-600 text-white rounded-xl flex flex-col items-center justify-center p-2 font-bold hover:bg-green-700 shadow-lg shadow-green-200"><MessageCircle size={24} className="mb-1"/><span>Enquire Now</span></button>
                    </div>
                </div>
            </div>
            <div className="flex-1 relative bg-gray-100">
                <button onClick={() => setProjectBrochure(null)} className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow z-[7000] md:hidden font-bold text-xs">Close</button>
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">(Map View Hidden)</div>
            </div>
        </div>
      )}

      {/* --- STEP 1: PICK LOCATION OVERLAY --- */}
      {adMode === 'PICKING_LOC' && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[4000] bg-white px-4 py-2 rounded-full shadow-xl border-2 border-orange-500 flex items-center gap-4 animate-bounce">
              <div className="text-sm font-bold text-orange-700 flex items-center gap-2"><MousePointerClick size={16}/> Tap Map to Set Location</div>
              <button onClick={confirmLocation} className="bg-orange-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow hover:bg-orange-700">Confirm Location</button>
              <button onClick={() => { setAdMode(null); setNewAdLocation(null); }} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
          </div>
      )}

      {/* --- STEP 2: POST AD FORM --- */}
      {adMode === 'FILLING_FORM' && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[6000] flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-orange-600 p-4 text-white flex justify-between items-center"><h2 className="font-bold flex items-center gap-2"><Store size={20}/> Post Ad</h2><button onClick={() => setAdMode(null)} className="hover:bg-white/20 p-1 rounded"><X size={20}/></button></div>
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-4 text-xs text-green-700"><p className="font-bold">✅ Location Locked:</p>{newAdLocation.lat.toFixed(6)}, {newAdLocation.lng.toFixed(6)}</div>
                    <form onSubmit={handlePostAd} className="space-y-3">
                        <div className="mb-2"><label className="text-xs font-bold text-gray-500">Paste Coordinates (Optional)</label><div className="flex gap-2"><input onChange={handlePasteCoords} placeholder="e.g. 17.123, 78.123" className="w-full border p-2 rounded text-xs bg-gray-50"/><button type="button" className="text-xs bg-gray-200 px-2 rounded font-bold" onClick={() => alert("Copied coordinates will move the pin position.")}>Help</button></div></div>
                        <div><label className="block text-xs font-bold text-gray-500 mb-1">Type</label><div className="flex gap-2"><label className="flex-1 border rounded-lg p-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 has-[:checked]:bg-yellow-50 has-[:checked]:border-yellow-500 has-[:checked]:text-yellow-700"><input type="radio" name="ad_type" value="SELL" defaultChecked className="hidden"/><Tag size={16}/> SELL Plot</label><label className="flex-1 border rounded-lg p-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 has-[:checked]:text-blue-700"><input type="radio" name="ad_type" value="LOOKING" className="hidden"/><HandCoins size={16}/> Looking For</label></div></div>
                        <div><label className="text-xs font-bold text-gray-500">Size (Sq Yds)</label><input name="size" required placeholder="e.g. 200" className="w-full border p-2 rounded text-sm"/></div>
                        <div><label className="text-xs font-bold text-gray-500">Price / Budget</label><input name="price" required className="w-full border p-2 rounded text-sm"/></div>
                        <div><label className="text-xs font-bold text-gray-500">WhatsApp</label><input name="contact_info" required className="w-full border p-2 rounded text-sm"/></div>
                        <div><label className="text-xs font-bold text-gray-500">Description</label><textarea name="description" rows="2" className="w-full border p-2 rounded text-sm"></textarea></div>
                        <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800">Submit Ad</button>
                    </form>
                </div>
            </div>
        </div>
      )}

      {/* --- MAP AREA --- */}
      <div className="flex flex-1 relative h-[85vh]">
        {showCoordsPanel && isMeasuring && ( 
            <div className="w-80 bg-white shadow-xl z-10 overflow-y-auto border-r border-gray-200 flex flex-col">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center"><h3 className="font-bold text-sm">Measure Mode</h3><button onClick={() => setShowCoordsPanel(false)}><X size={16}/></button></div>
                <div className="p-4">
                    <button onClick={handleSimplify} className="w-full bg-blue-50 text-blue-700 py-2 rounded text-xs font-bold mb-2">Simplify</button>
                    <button onClick={() => { setMeasurePoints([]); setTempArea(0); }} className="w-full bg-red-50 text-red-700 py-2 rounded text-xs font-bold mb-2"><Trash2 size={14}/> Wipe</button>
                    <div className="text-center font-bold text-orange-600 text-lg">{formatArea(tempArea)}</div>
                </div>
                <div className="p-4 border-t mt-auto"><button onClick={() => setShowSaveForm(true)} disabled={measurePoints.length < 3} className="w-full bg-green-600 text-white py-2 rounded font-bold">Save Project</button></div>
            </div> 
        )}

        <div id="map-print-container" className="flex-1 relative bg-gray-200">
          <MapContainer center={centerPos} zoom={13} maxZoom={22} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }} ref={mapRef} preferCanvas={true}>
            <MapController center={centerPos} />
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Google Hybrid"><TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution='© Google' maxNativeZoom={20} maxZoom={22} /></LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Google Streets"><TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" attribution='© Google' maxNativeZoom={20} maxZoom={22} /></LayersControl.BaseLayer>
            </LayersControl>
            
            {/* VENTURES MODE */}
            {viewMode === 'VENTURES' && filteredLeads.map((lead) => (
                 <Polygon key={lead.id} positions={lead.points} pathOptions={{ color: '#10b981', weight: 2, fillColor: '#10b981', fillOpacity: 0.4 }} eventHandlers={{ click: () => { if(isAdmin) handleEditShape(lead); } }}>
                    <Popup>
                        <div className="font-bold">{lead.label}</div>
                        <div>{formatArea(lead.acres)}</div>
                        <div className="flex gap-2 mt-2">
                             <button onClick={() => setProjectBrochure(lead)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Brochure</button>
                             <button onClick={() => handleCopyLink(lead.id)} className="bg-gray-600 text-white px-2 py-1 rounded text-xs">Share</button>
                        </div>
                    </Popup>
                 </Polygon>
            ))}

            {/* MEASURING DRAWING + DISTANCE LABELS */}
            {measurePoints.length > 0 && <><Polygon positions={measurePoints} pathOptions={{ color: 'orange', weight: 2, fillColor: 'orange', fillOpacity: 0.2 }} />{measurePoints.map((pt, i) => <DraggableVertex key={i} position={pt} index={i} />)}</>}
            {measurePoints.map((pt, i) => {
               if (measurePoints.length < 2) return null;
               const nextPt = measurePoints[(i + 1) % measurePoints.length];
               if (i === measurePoints.length - 1 && measurePoints.length < 3) return null;
               const midLat = (pt.lat + nextPt.lat) / 2;
               const midLng = (pt.lng + nextPt.lng) / 2;
               const distFeet = Math.round(getDistanceMeters(pt, nextPt) * 3.28084);
               return <Marker key={`dist-${i}`} position={[midLat, midLng]} icon={L.divIcon({ className: 'text-label', html: `<div style="background:none; color: white; text-shadow: 1px 1px 2px black; font-size: 10px; font-weight: bold;">${distFeet} ft</div>`, iconSize: [40, 10], iconAnchor: [20, 5] })} />;
            })}
            
            {/* MARKETPLACE MODE */}
            {viewMode === 'MARKETPLACE' && marketAds.map((ad) => (
                <React.Fragment key={ad.id}>
                    <Marker position={[ad.lat, ad.lng]} icon={ad.ad_type === 'SELL' ? SellIcon : LookIcon}>
                        <Popup className="premium-popup">
    <div className="p-0 min-w-[220px] max-w-[240px]">
        
        {/* --- TEMPLATE HEADER: BROCHURE IMAGE --- */}
        <div className="relative h-28 bg-gray-200 rounded-t-lg overflow-hidden">
            {/* Creates a placeholder image for DEMO purposes */}
            <img 
                src="https://arisingdevelopers.com/wp-content/uploads/2025/01/WhatsApp-Image-2025-01-27-at-14.37.00-1-1024x770.jpeg" 
                alt="Plot View" 
                className="w-full h-full object-cover"
            />
            <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded shadow-sm ${ad.ad_type === 'SELL' ? 'bg-yellow-400 text-yellow-900' : 'bg-blue-500 text-white'}`}>
                {ad.ad_type === 'SELL' ? 'FOR SALE' : 'WANTED'}
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-2">
                <div className="text-white font-bold text-lg leading-none">{ad.size} <span className="text-xs font-normal">Sq Yds</span></div>
            </div>
        </div>

        {/* --- BODY CONTENT --- */}
        <div className="p-3 bg-white">
            <div className="flex justify-between items-center mb-2">
                <span className="text-green-700 font-bold text-lg">{ad.price}</span>
            </div>
            
            <p className="text-gray-500 text-xs line-clamp-2 mb-3 border-l-2 border-gray-300 pl-2 italic">
                {ad.description || "No description provided."}
            </p>

            {/* --- ACTION BUTTONS --- */}
            <button onClick={() => window.open(`https://wa.me/${ad.contact_info}?text=Hi, regarding your ad for ${ad.size} Sq Yds...`, '_blank')} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mb-2 shadow-md transition-all">
                <MessageCircle size={16}/> Contact Owner
            </button>
            
            {/* DEMO: VIDEO BUTTON (Show them this capability!) */}
            <button onClick={() => alert("This would open the In-App Video Player! (Coming Soon)")} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Watch Video Tour
            </button>

            {/* ADMIN CONTROLS */}
            {isAdmin && (
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t">
                    {ad.status === 'PENDING' && <button onClick={() => handleApproveAd(ad.id)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-[10px] py-1 rounded font-bold">Approve</button>}
                    <button onClick={() => handleDeleteAd(ad.id)} className="bg-red-50 text-red-600 hover:bg-red-100 text-[10px] py-1 rounded font-bold col-span-2">Delete Ad</button>
                </div>
            )}
        </div>
    </div>
</Popup>
                    </Marker>
                    {ad.ad_type === 'SELL' && ad.points && <Polygon positions={ad.points} pathOptions={{ color: 'yellow', weight: 2, dashArray: '5, 5', fillColor: 'yellow', fillOpacity: 0.2 }} />}
                    {ad.ad_type === 'LOOKING' && <Circle center={[ad.lat, ad.lng]} radius={1000} pathOptions={{ color: 'blue', weight: 1, dashArray: '5, 5', fillColor: 'blue', fillOpacity: 0.1 }} />}
                </React.Fragment>
            ))}
            
            {newAdLocation && <Marker position={newAdLocation} icon={DefaultIcon}><Popup>New Ad Location</Popup></Marker>}
            {tempSearchMarker && <Marker position={tempSearchMarker} icon={DefaultIcon}><Popup>Search Location</Popup></Marker>}
            
            {radarResults && <Popup position={radarResults.pos} onClose={() => setRadarResults(null)}><div className="min-w-[200px]"><div className="bg-purple-600 text-white p-2 -m-3 mb-2 rounded-t font-bold">Growth Radar</div><div className="pt-2">{radarResults.nodes.map((n,i)=><div key={i} className="flex justify-between text-xs border-b py-1"><span>{n.name}</span><span className="font-bold">{n.dist} km</span></div>)}</div></div></Popup>}

            <DraggableMarker />
            <MapClickHandler />
          </MapContainer>
        </div>
      </div>

      {showSaveForm && ( <div className="fixed inset-0 bg-black bg-opacity-60 z-[2000] flex justify-center items-center p-4"><div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl"><h2 className="text-lg font-bold mb-4">Save Project</h2><form onSubmit={handleSaveShape} className="space-y-4"><input name="label" required className="w-full border p-2 rounded" placeholder="Project Name" /><input name="survey_no" className="w-full border p-2 rounded" placeholder="Survey No / Location" /><textarea name="note" className="w-full border p-2 rounded h-32" placeholder="Notes..." /><div className="flex gap-2"><button type="button" onClick={() => setShowSaveForm(false)} className="flex-1 bg-gray-100 py-2 rounded">Cancel</button><button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded font-bold">Save</button></div></form></div></div> )}
    </div>
  );
};

export default RealEstateSearchApp;