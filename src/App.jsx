import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, LayersControl, useMapEvents, useMap } from 'react-leaflet';
import { 
  X, Crosshair, Save, Ruler, Upload, Download, RotateCcw, RotateCw, 
  Edit3, Trash2, Globe, Copy, ExternalLink, Search, Zap, ChevronDown, 
  ChevronUp, BookOpen, AlertTriangle, CheckCircle, Radar, FileText, 
  Lock, Unlock, WifiOff, ArrowRight, Phone, Map, Info, MessageCircle, Share2, Link, Building2
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from './supabaseClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- CONFIGURATION ---
const APP_PIN = "4838"; 
const ADMIN_PHONE = "917013007595"; // <--- CHANGE THIS TO YOUR WHATSAPP NO

// --- LEAFLET ICONS ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const EditIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: white; border: 2px solid #ea580c; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

let DefaultIcon = L.icon({ 
  iconUrl: icon, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- DATABASE: MAJOR GROWTH NODES ---
const GROWTH_NODES = [
  { name: "Bharat Future City (Fourth City)", lat: 16.9850, lng: 78.6500, type: "Mega Project" },
  { name: "Amazon Data Center (Meerkhanpet)", lat: 17.0600, lng: 78.6300, type: "IT Hub" },
  { name: "RRR (Shadnagar Crossing)", lat: 17.0350, lng: 78.2100, type: "Transport" },
  { name: "RGIA Airport", lat: 17.2403, lng: 78.4294, type: "Transport" },
  { name: "Mucherla Pharma Cluster", lat: 16.9500, lng: 78.6100, type: "Industrial" },
  { name: "TCS Adibatla", lat: 17.2100, lng: 78.5300, type: "IT Hub" }
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

const getBearing = (p1, p2) => {
  const y = Math.sin(p2.lng*Math.PI/180 - p1.lng*Math.PI/180) * Math.cos(p2.lat*Math.PI/180);
  const x = Math.cos(p1.lat*Math.PI/180)*Math.sin(p2.lat*Math.PI/180) - Math.sin(p1.lat*Math.PI/180)*Math.cos(p2.lat*Math.PI/180)*Math.cos(p2.lng*Math.PI/180 - p1.lng*Math.PI/180);
  const θ = Math.atan2(y, x);
  return (θ*180/Math.PI + 360) % 360; 
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
  const [leads, setLeads] = useState([]); 
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [measurePoints, setMeasurePoints] = useState([]); 
  const [redoStack, setRedoStack] = useState([]); 
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [editingLead, setEditingLead] = useState(null); 
  const [tempArea, setTempArea] = useState(0);

  const [isRadarMode, setIsRadarMode] = useState(false);
  const [radarResults, setRadarResults] = useState(null);
  const [projectBrochure, setProjectBrochure] = useState(null); 
  const [shareMode, setShareMode] = useState(false); 
  
  const [isAdmin, setIsAdmin] = useState(false); 
  const [showLogin, setShowLogin] = useState(false);
  const [usingOfflineMode, setUsingOfflineMode] = useState(false);
  
  const [showCoordsPanel, setShowCoordsPanel] = useState(false);
  const [showPointList, setShowPointList] = useState(false); 
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showResources, setShowResources] = useState(false); 
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [centerPos, setCenterPos] = useState({ lat: 17.1350, lng: 78.4300 }); 
  const [tempSearchMarker, setTempSearchMarker] = useState(null); 

  const dragStartPos = useRef(null);
  const fileInputRef = useRef(null);
  const mapRef = useRef(null); 

  useEffect(() => { fetchLeads(); }, []);

  // --- UNIVERSAL SEARCH LOGIC ---
  useEffect(() => {
    if (!searchQuery) { 
      if (!shareMode) setFilteredLeads(leads); 
    } else {
      const lowerQ = searchQuery.toLowerCase();
      const filtered = leads.filter(l => 
        (l.survey_no && l.survey_no.toLowerCase().includes(lowerQ)) || 
        (l.label && l.label.toLowerCase().includes(lowerQ))
      );
      setFilteredLeads(filtered);
    }
  }, [searchQuery, leads, shareMode]);

  const handleExternalSearch = async () => {
    const coordRegex = /(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/;
    const match = searchQuery.match(coordRegex);

    if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        setCenterPos({ lat, lng });
        setTempSearchMarker({ lat, lng });
        setSearchQuery(''); 
        return;
    } 
    
    if (searchQuery.includes("goo.gl") || searchQuery.includes("maps.app") || searchQuery.includes("googleusercontent")) {
        alert("⚠️ Redirect Link Detected!\n\nThis link is encrypted/shortened.\n\n1. Click the link to open it in a new tab.\n2. Copy the LONG URL (or Coordinates) from the address bar.\n3. Paste that here.");
        return;
    }

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if(data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            setCenterPos({ lat, lng });
            setTempSearchMarker({ lat, lng });
            setSearchQuery('');
        } else {
             alert("Address not found. Try entering 'Village, City' or Coordinates.");
        }
    } catch(err) {
        alert("Search failed. Please check internet.");
    }
  };

  const fetchLeads = async () => {
    let allLeads = [];
    try {
        const local = JSON.parse(localStorage.getItem('scout_leads_backup') || '[]');
        allLeads = [...local];
    } catch(e) { console.error("Local load error", e); }

    try {
        const { data, error } = await supabase.from('scout_leads').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            const localIds = new Set(allLeads.map(l => l.id));
            const newServerLeads = data.filter(l => !localIds.has(l.id));
            allLeads = [...newServerLeads, ...allLeads];
        } else { setUsingOfflineMode(true); }
    } catch (err) { setUsingOfflineMode(true); }

    allLeads.sort((a,b) => (b.id || 0) - (a.id || 0));
    setLeads(allLeads);

    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('id');

    if (sharedId) {
        const sharedProject = allLeads.find(l => l.id.toString() === sharedId);
        if (sharedProject) {
            setFilteredLeads([sharedProject]); 
            setCenterPos(sharedProject.center);
            setProjectBrochure(sharedProject); 
            setShareMode(true); 
        } else {
            alert("Project not found or invalid link.");
            setFilteredLeads(allLeads);
        }
    } else {
        setFilteredLeads(allLeads);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const pin = e.target.pin.value;
    if(pin === APP_PIN) { setIsAdmin(true); setShowLogin(false); } 
    else { alert("Incorrect PIN"); }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${ADMIN_PHONE}?text=Hello, I want a ground report for a land.`, '_blank');
  };

  const handleShowBrochure = (lead) => {
    setProjectBrochure(lead);
    setCenterPos(lead.center);
  };

  const handleCopyLink = (id) => {
      const url = `${window.location.origin}/?id=${id}`;
      navigator.clipboard.writeText(url);
      alert("Link Copied! Send this to the developer/client.\n\nThey will see ONLY this project.");
  };

  // --- PDF REPORT ---
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
    doc.text("Satellite Scout - Investment Insight", 10, 13);
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
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 150);
        doc.text("Project Highlights / Notes:", 10, y); y+=6;
        doc.setFontSize(10);
        doc.setTextColor(0,0,0);
        const splitNotes = doc.splitTextToSize(target.note, 190);
        doc.text(splitNotes, 10, y);
        y += (splitNotes.length * 5) + 10;
    }

    if(radarResults) {
        doc.setFontSize(12);
        doc.setTextColor(220, 38, 38); 
        doc.text("Growth Radar Data:", 10, y); y+=8;
        doc.setTextColor(0,0,0);
        doc.setFontSize(10);
        radarResults.nodes.forEach(node => { doc.text(`${node.name}: ${node.dist} km`, 10, y); y+=6; });
        y+=4;
        doc.setFontSize(11);
        doc.setTextColor(0, 100, 0);
        doc.text(`Price & Ground Report: Contact Admin`, 10, y);
    }
    
    doc.setFontSize(8);
    doc.setTextColor(100,100,100);
    doc.text("Disclaimer: Report generated by Satellite Scout Pro. Verify all data physically.", 10, 280);
    doc.save("Scout_Investment_Report.pdf");
  };

  const handleSimplify = () => {
    const simplified = measurePoints.filter((_, i) => i === 0 || i % 4 === 0 || i === measurePoints.length - 1);
    setRedoStack([...redoStack, measurePoints]); setMeasurePoints(simplified); setTempArea(calculateAcres(simplified));
  };

  const handleEditShape = (lead) => {
    if(!isAdmin) return;
    setMeasurePoints(lead.points); setTempArea(lead.acres); setEditingLead(lead); setCenterPos(lead.center); setIsMeasuring(true); setShowCoordsPanel(true); setShowPointList(false); setRedoStack([]);
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
        } else if (Array.isArray(json)) {
            if(window.confirm("Restore backup?")) { json.forEach(l => saveToLocal(l)); importedLeads.push(...json); }
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
  const handleDelete = async (id) => { 
    if (window.confirm("Delete this lead?")) { 
        try { await supabase.from('scout_leads').delete().eq('id', id); } catch(e){}
        const current = JSON.parse(localStorage.getItem('scout_leads_backup') || '[]');
        const filtered = current.filter(l => l.id !== id);
        localStorage.setItem('scout_leads_backup', JSON.stringify(filtered));
        setLeads(leads.filter(l => l.id !== id)); 
    } 
  };

  const updatePointPosition = (index, newLatLng) => { const u = [...measurePoints]; u[index] = newLatLng; setMeasurePoints(u); setTempArea(calculateAcres(u)); };
  
  // --- MAP CLICK ---
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (isMeasuring && isAdmin) {
          const newPoints = [...measurePoints, e.latlng]; setMeasurePoints(newPoints); setRedoStack([]); setTempArea(calculateAcres(newPoints)); setShowCoordsPanel(true); setShowPointList(false);
        } else if (isRadarMode && isAdmin) {
          const { lat, lng } = e.latlng;
          const distances = GROWTH_NODES.map(node => ({ ...node, dist: calculateDistance(lat, lng, node.lat, node.lng) })).sort((a,b) => parseFloat(a.dist) - parseFloat(b.dist));
          setRadarResults({ pos: e.latlng, nodes: distances.slice(0, 4) }); 
        } else { setShowToolsMenu(false); }
      },
    });
    return null;
  };

  const DraggableMarker = () => {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(() => ({
      dragstart(e) { dragStartPos.current = e.target.getLatLng(); },
      dragend(e) {
        const newCenter = e.target.getLatLng();
        if (isMeasuring && measurePoints.length > 0 && dragStartPos.current) {
           const latShift = newCenter.lat - dragStartPos.current.lat; const lngShift = newCenter.lng - dragStartPos.current.lng;
           const shiftedPoints = measurePoints.map(p => ({ lat: p.lat + latShift, lng: p.lng + lngShift })); setMeasurePoints(shiftedPoints);
        }
        setCenterPos(newCenter);
      },
    }), [isMeasuring, measurePoints]); 
    return <Marker draggable={true} eventHandlers={eventHandlers} position={centerPos} ref={markerRef}><Popup>{isMeasuring ? "Drag to move shape" : "Search Center"}</Popup></Marker>;
  };
  const DraggableVertex = ({ position, index }) => {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(() => ({ drag(e) { updatePointPosition(index, e.latlng); }, dragend(e) { updatePointPosition(index, e.target.getLatLng()); }, }), [index]);
    return <Marker draggable={true} eventHandlers={eventHandlers} position={position} icon={EditIcon} ref={markerRef}><Popup>Pt {index + 1}</Popup></Marker>;
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-white shadow-md p-4 z-[5000] relative flex flex-col md:flex-row justify-between items-center h-auto md:h-16 gap-4 shrink-0">
        <div><h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Crosshair className="text-red-600"/> Satellite Scout Pro {usingOfflineMode && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1"><WifiOff size={10}/> Offline</span>}</h1></div>

        {/* UNIVERSAL SEARCH BAR (Hidden in Share Mode if you want privacy, but kept visible here for now) */}
        {!shareMode && (
        <div className="flex-1 max-w-md mx-4 relative">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 border border-gray-200">
            <Search size={18} className="text-gray-500 mr-2"/>
            <input type="text" placeholder="Search Address, Saved Leads, or Coords..." className="bg-transparent border-none outline-none text-sm w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            
            {/* Show GO button if there is text */}
            {searchQuery && filteredLeads.length === 0 && (
                <button onClick={handleExternalSearch} className="bg-blue-600 text-white p-1 rounded-md ml-2 hover:bg-blue-700 flex items-center gap-1 text-xs px-2 font-bold animate-pulse">GO <ArrowRight size={12}/></button>
            )}

            {(searchQuery.includes('http') || searchQuery.includes(',') || searchQuery.match(/\d/)) && (
                <button onClick={handleExternalSearch} className="bg-blue-600 text-white p-1 rounded-md ml-2 hover:bg-blue-700 flex items-center gap-1 text-xs px-2 font-bold animate-pulse">GO <ArrowRight size={12}/></button>
            )}
            
            {searchQuery && !searchQuery.includes('http') && <button onClick={() => setSearchQuery('')}><X size={14} className="text-gray-400"/></button>}
          </div>
          {searchQuery && filteredLeads.length > 0 && !searchQuery.includes('http') && !searchQuery.match(/\d{2}\./) && (
            <div className="absolute top-full left-0 right-0 bg-white mt-1 shadow-xl rounded-lg border border-gray-100 z-50 max-h-60 overflow-y-auto">
              {filteredLeads.map(lead => (
                <div key={lead.id} onClick={() => { setCenterPos(lead.center); setSearchQuery(''); }} className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-0">
                  <div className="font-bold text-sm text-gray-800">{lead.survey_no}</div>
                  <div className="text-xs text-gray-500">{lead.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
        
        <div className="flex items-center gap-2">
            
          {/* WHATSAPP CONTACT BUTTON */}
          <button onClick={handleWhatsApp} className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg border border-green-200 font-bold flex items-center gap-2" title="Contact Admin">
            <MessageCircle size={20}/> <span className="hidden md:inline text-sm">Contact</span>
          </button>

          {isAdmin ? (
             <>
                <button onClick={() => { setIsRadarMode(!isRadarMode); setIsMeasuring(false); setRadarResults(null); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${isRadarMode ? 'bg-purple-100 text-purple-700 border-purple-200 animate-pulse' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}><Radar size={16}/> Radar</button>
                <button onClick={handleGeneratePDF} className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-100 bg-white" title="Download PDF"><FileText size={20}/></button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <button onClick={() => { setIsMeasuring(!isMeasuring); if(!isMeasuring) { setMeasurePoints([]); setRedoStack([]); setEditingLead(null); setIsRadarMode(false); } }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold border transition-colors ${isMeasuring ? 'bg-orange-500 text-white border-orange-600' : 'text-gray-600 hover:bg-gray-200'}`}><Ruler size={16}/> {isMeasuring ? 'Stop' : 'Measure'}</button>
                <button onClick={() => fileInputRef.current.click()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Upload size={20}/></button> <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json,.geojson,.kml" />
                <button onClick={handleExportBackup} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Export Backup"><Download size={20}/></button>
                <button onClick={() => setIsAdmin(false)} className="p-2 text-gray-400 hover:text-red-500"><Unlock size={20}/></button>
             </>
          ) : ( <button onClick={() => setShowLogin(true)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-gray-900"><Lock size={14}/> Admin Login</button> )}
          <button onClick={() => setShowResources(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-100 bg-white"><BookOpen size={20}/></button>
          <div className="relative">
             <button onClick={() => setShowToolsMenu(!showToolsMenu)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border bg-white text-gray-700 border-gray-300 hover:bg-gray-50"><Globe size={16}/> Tools</button>
             {showToolsMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-[5001]">
                   <div className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">External Apps</div>
                   <button onClick={() => { window.open(`https://earth.google.com/web/@${centerPos.lat},${centerPos.lng},1000a,3000d,35y,0h,0t,0r`, '_blank'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2"><ExternalLink size={14}/> Open Google Earth</button>
                   <button onClick={() => { window.open(`https://bhuvan.nrsc.gov.in/ngmaps#17/${centerPos.lat}/${centerPos.lng}`, '_blank'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2"><Globe size={14}/> Open Bhuvan NG (New)</button>
                   <button onClick={() => { window.open("https://bhubharati.telangana.gov.in/knowLandStatus", '_blank'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2"><div className="w-4 flex justify-center text-[10px] font-bold">B</div> Open Bhubharati</button>
                   <div className="h-px bg-gray-100 my-1"></div>
                   <button onClick={() => { navigator.clipboard.writeText(`${centerPos.lat}, ${centerPos.lng}`); alert('Copied!'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg flex items-center gap-2"><Copy size={14}/> Copy Coords</button>
                </div>
             )}
          </div>
        </div>
      </div>

      {showLogin && ( <div className="fixed inset-0 bg-black bg-opacity-70 z-[6000] flex justify-center items-center p-4 backdrop-blur-sm"><div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-xs"><h2 className="text-xl font-bold mb-4 text-center">Enter Access PIN</h2><form onSubmit={handleLogin} className="space-y-3"><input type="password" name="pin" className="w-full border p-2 rounded text-center text-2xl tracking-widest" autoFocus placeholder="****" /><div className="flex gap-2"><button type="button" onClick={() => setShowLogin(false)} className="flex-1 py-2 bg-gray-100 rounded">Cancel</button><button type="submit" className="flex-1 bg-black text-white py-2 rounded font-bold">Unlock</button></div></form></div></div> )}
      {showResources && ( <div className="fixed inset-0 bg-black bg-opacity-60 z-[6000] flex justify-center items-center p-4 backdrop-blur-sm"><div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold flex items-center gap-2"><BookOpen/> Investor Knowledge Base</h2><button onClick={() => setShowResources(false)}><X/></button></div><div className="space-y-6"><div><h3 className="font-bold mb-2">Government Portals</h3><div className="grid grid-cols-2 gap-2 text-sm"><a href="https://registration.telangana.gov.in/" target="_blank" className="p-2 border rounded hover:bg-blue-50 text-blue-700 font-bold">IGRS (EC Check)</a><a href="https://bhubharati.telangana.gov.in/" target="_blank" className="p-2 border rounded hover:bg-blue-50 text-blue-700 font-bold">Bhubharati (Land Status)</a></div></div><div><h3 className="font-bold mb-2">Checklist</h3><ul className="list-disc pl-5 text-sm space-y-1"><li>Check Link Docs (30 Yrs)</li><li>Check Encumbrance Certificate (Online & Manual)</li><li>Check Prohibited List (Sec 22A)</li><li>Verify FTL / Nala Buffer Zones</li></ul></div></div></div></div> )}

      {/* --- BROCHURE VIEW (Auto Opens for Share Links) --- */}
      {projectBrochure && (
        <div className="fixed inset-0 bg-white z-[6000] flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-1/3 bg-slate-50 border-r border-gray-200 overflow-y-auto relative flex flex-col">
                {/* --- HEADER (BRANDING) --- */}
                <div className="bg-slate-900 p-6 text-white relative">
                   <button onClick={() => setProjectBrochure(null)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 text-white"><X size={20}/></button>
                   <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-600 p-2 rounded-lg"><Building2 size={24} className="text-white"/></div>
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Premium Project</span>
                   </div>
                   <h1 className="text-2xl font-bold leading-tight">{projectBrochure.label}</h1>
                   <div className="flex items-center gap-2 mt-2 text-slate-300 text-sm">
                      <Map size={14}/> <span>{projectBrochure.survey_no || "Location Not Specified"}</span>
                   </div>
                </div>

                <div className="p-6 flex-1">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h3 className="font-bold text-gray-400 text-xs uppercase mb-3 flex items-center gap-2"><Zap size={12}/> Project Highlights</h3>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {projectBrochure.note || "No details added yet."}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                            <div className="text-xs text-gray-400 font-bold uppercase mb-1">Total Area</div>
                            <div className="text-xl font-bold text-slate-800">{formatArea(projectBrochure.acres)}</div>
                        </div>
                         {/* BIG ENQUIRE BUTTON */}
                        <button onClick={() => window.open(`https://wa.me/${ADMIN_PHONE}?text=I am interested in ${projectBrochure.label}`, '_blank')} className="bg-green-600 text-white rounded-xl flex flex-col items-center justify-center p-2 font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                            <MessageCircle size={24} className="mb-1"/>
                            <span>Enquire Now</span>
                        </button>
                    </div>
                </div>
                
                {/* Footer Quote */}
                <div className="p-4 text-center text-[10px] text-gray-400 border-t">
                   Powered by Satellite Scout Pro
                </div>
            </div>

            <div className="flex-1 relative bg-gray-100">
                <button onClick={() => setProjectBrochure(null)} className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow z-[7000] md:hidden font-bold text-xs">Close Brochure</button>
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    (Map View hidden in Brochure Mode - Click Close to explore Map)
                </div>
            </div>
        </div>
      )}

      {/* --- FLOATING ACTION BAR (Only in Share Mode when Brochure is Closed) --- */}
      {shareMode && !projectBrochure && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[5000] flex gap-4 bg-white p-2 rounded-full shadow-2xl border border-gray-200">
          <button
            onClick={() => setProjectBrochure(filteredLeads[0])} 
            className="bg-slate-800 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-slate-900 transition-transform hover:scale-105"
          >
            <Info size={20}/> Project Info
          </button>
          <button
            onClick={() => window.open(`https://wa.me/${ADMIN_PHONE}?text=I am interested in ${filteredLeads[0].label}`, '_blank')}
            className="bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-green-700 animate-pulse"
          >
            <MessageCircle size={20}/> Enquire
          </button>
        </div>
      )}

      <div className="flex flex-1 relative h-[85vh]">
        {showCoordsPanel && isMeasuring && ( 
            <div className="w-80 bg-white shadow-xl z-10 overflow-y-auto border-r border-gray-200 flex flex-col">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center"><h3 className="font-bold text-sm">Measure Mode</h3><button onClick={() => setShowCoordsPanel(false)}><X size={16}/></button></div>
                <div className="p-4">
                    <button onClick={handleSimplify} className="w-full bg-blue-50 text-blue-700 py-2 rounded text-xs font-bold mb-2">Simplify Shape</button>
                    <button onClick={() => { setMeasurePoints([]); setTempArea(0); }} className="w-full bg-red-50 text-red-700 py-2 rounded text-xs font-bold mb-2 flex items-center justify-center gap-2"><Trash2 size={14}/> Wipe Shape</button>
                    <div className="text-center font-bold text-orange-600 text-lg">{formatArea(tempArea)}</div>
                </div>

                <div className="mt-4 px-4 border-t pt-2">
                    <h4 className="font-bold text-xs text-gray-500 mb-2">Coordinates (Lat, Lng)</h4>
                    <div className="space-y-1 max-h-40 overflow-y-auto text-xs pb-4">
                        {measurePoints.map((pt, i) => (
                        <div key={i} className="flex justify-between bg-gray-100 p-1.5 rounded">
                            <span className="font-bold text-gray-600">Pt {i+1}</span>
                            <span className="font-mono select-all">{pt.lat.toFixed(6)}, {pt.lng.toFixed(6)}</span>
                        </div>
                        ))}
                    </div>
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
            
            {/* --- LABELS FOR DIMENSIONS (LENGTH) AND ANGLES --- */}
            {measurePoints.map((pt, i) => {
               const nextPt = measurePoints[(i + 1) % measurePoints.length];
               const midLat = (pt.lat + nextPt.lat) / 2;
               const midLng = (pt.lng + nextPt.lng) / 2;
               const distMeters = getDistanceMeters(pt, nextPt);
               const distFeet = Math.round(distMeters * 3.28084);
               const prevPt = measurePoints[(i - 1 + measurePoints.length) % measurePoints.length];
               const bearingIn = getBearing(prevPt, pt);
               const bearingOut = getBearing(pt, nextPt);
               let angle = (bearingOut - bearingIn + 360) % 360;
               if (angle > 180) angle = 360 - angle; 
               if (measurePoints.length < 2) return null;

               return (
                 <React.Fragment key={i}>
                    {i < measurePoints.length - 1 || measurePoints.length > 2 ? (
                        <Marker position={[midLat, midLng]} icon={L.divIcon({ className: 'text-label', html: `<div style="background:none; color: white; text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black; font-size: 10px; font-weight: bold; white-space: nowrap;">${distFeet} ft</div>`, iconSize: [40, 10], iconAnchor: [20, 5] })} />
                    ) : null}
                    {measurePoints.length > 2 && (
                       <Marker position={pt} icon={L.divIcon({ className: 'angle-label', html: `<div style="background:none; color: yellow; text-shadow: 1px 1px 2px black; font-size: 9px; font-weight: bold;">${Math.round(angle)}°</div>`, iconSize: [20, 10], iconAnchor: [10, -10] })} />
                    )}
                 </React.Fragment>
               );
            })}
            
            {filteredLeads.map((lead) => {
               if(editingLead && editingLead.id === lead.id) return null;
               return (
                 <Polygon key={lead.id} positions={lead.points} pathOptions={{ color: '#10b981', weight: 2, fillColor: '#10b981', fillOpacity: 0.4 }} eventHandlers={{ click: () => { if(isAdmin) handleEditShape(lead); } }}>
                    <Popup>
                        <div className="text-center">
                            <div className="font-bold text-sm mb-1">{lead.label}</div>
                            <div className="text-xs text-gray-500 mb-2">{formatArea(lead.acres)}</div>
                            <div className="flex gap-2 justify-center">
                                <button onClick={() => handleShowBrochure(lead)} className="bg-blue-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1"><Info size={12}/> Brochure</button>
                                <button onClick={() => handleCopyLink(lead.id)} className="bg-gray-600 text-white text-xs px-3 py-1 rounded flex items-center gap-1"><Link size={12}/> Share</button>
                            </div>
                        </div>
                    </Popup>
                 </Polygon>
               );
            })}
            
            {measurePoints.length > 0 && <><Polygon positions={measurePoints} pathOptions={{ color: 'orange', weight: 2, fillColor: 'orange', fillOpacity: 0.2 }} />{measurePoints.map((pt, i) => <DraggableVertex key={i} position={pt} index={i} />)}</>}
            {tempSearchMarker && <Marker position={tempSearchMarker} icon={DefaultIcon}><Popup>Search Location<br/>{tempSearchMarker.lat.toFixed(4)}, {tempSearchMarker.lng.toFixed(4)}</Popup></Marker>}

            {radarResults && ( 
               <Popup position={radarResults.pos} onClose={() => setRadarResults(null)}>
                  <div className="min-w-[220px]">
                     <div className="bg-purple-600 text-white p-2 -m-3 mb-2 rounded-t font-bold text-center flex items-center justify-center gap-2"><Radar size={14}/> Growth Radar</div>
                     <div className="space-y-2 pt-2">
                        {radarResults.nodes.map((node, i) => (<div key={i} className="flex justify-between text-xs border-b pb-1"><span className="font-bold text-gray-700">{node.name}</span><span className="bg-purple-100 text-purple-700 px-1 rounded font-bold">{node.dist} km</span></div>))}
                     </div>
                     <div className="mt-2 text-center">
                        <button onClick={() => window.open(`https://earth.google.com/web/@${radarResults.pos.lat},${radarResults.pos.lng},1000a,3000d,35y,0h,0t,0r`, '_blank')} className="text-[10px] text-blue-600 underline flex items-center justify-center gap-1"><ExternalLink size={10}/> Open in Earth (History)</button>
                     </div>
                     <div className="mt-3 pt-2 bg-blue-50 p-2 rounded border border-blue-200 text-center cursor-pointer hover:bg-blue-100" onClick={handleWhatsApp}>
                        <div className="text-xs font-bold text-blue-800 flex items-center justify-center gap-1"><Phone size={12}/> Price & Ground Report</div>
                        <div className="font-bold text-gray-800 text-sm">Contact Admin</div>
                     </div>
                  </div>
               </Popup> 
            )}
            
            <DraggableMarker />
            <MapClickHandler />
          </MapContainer>
        </div>
      </div>

      {showSaveForm && ( <div className="fixed inset-0 bg-black bg-opacity-60 z-[2000] flex justify-center items-center p-4"><div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl"><h2 className="text-lg font-bold mb-4">Save Project / Lead</h2><form onSubmit={handleSaveShape} className="space-y-4"><input name="label" required className="w-full border p-2 rounded" placeholder="Project Name" /><input name="survey_no" className="w-full border p-2 rounded" placeholder="Survey No / Location" /><textarea name="note" className="w-full border p-2 rounded h-32" placeholder="Paste Locational Advantages & Highlights here..." /><div className="flex gap-2"><button type="button" onClick={() => setShowSaveForm(false)} className="flex-1 bg-gray-100 py-2 rounded">Cancel</button><button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded font-bold">Save</button></div></form></div></div> )}
    </div>
  );
};

export default RealEstateSearchApp;