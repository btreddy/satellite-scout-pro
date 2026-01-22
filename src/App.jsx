import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, LayersControl, useMapEvents, useMap } from 'react-leaflet';
import { X, Crosshair, Save, Ruler, Upload, Download, RotateCcw, RotateCw, Edit3, Trash2, Globe, Copy, ExternalLink, Search, Zap, ChevronDown, ChevronUp, BookOpen, AlertTriangle, CheckCircle, LandPlot } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from './supabaseClient';

// --- LEAFLET ICONS ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const EditIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: white; border: 2px solid #ea580c; width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// --- AREA CALCULATION ---
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

// --- FORMATTER ---
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
  useEffect(() => { if (center) map.flyTo(center, 18, { duration: 1.5 }); }, [center, map]);
  return null;
};

const RealEstateSearchApp = () => {
  const [session, setSession] = useState(true); 
  const [leads, setLeads] = useState([]); 
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- EDITING STATE ---
  const [measurePoints, setMeasurePoints] = useState([]); 
  const [redoStack, setRedoStack] = useState([]); 
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [editingLead, setEditingLead] = useState(null); 
  
  // --- UI FLAGS ---
  const [showCoordsPanel, setShowCoordsPanel] = useState(false);
  const [showPointList, setShowPointList] = useState(false); 
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showResources, setShowResources] = useState(false); // NEW: Education Modal
  const [centerPos, setCenterPos] = useState({ lat: 17.1350, lng: 78.4300 }); 
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [tempArea, setTempArea] = useState(0);

  const dragStartPos = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchLeads(); }, []);

  useEffect(() => {
    if (!searchQuery) { setFilteredLeads(leads); } 
    else {
      const lowerQ = searchQuery.toLowerCase();
      const filtered = leads.filter(l => (l.survey_no && l.survey_no.toLowerCase().includes(lowerQ)) || (l.label && l.label.toLowerCase().includes(lowerQ)));
      setFilteredLeads(filtered);
    }
  }, [searchQuery, leads]);

  const fetchLeads = async () => {
    const { data, error } = await supabase.from('scout_leads').select('*').order('created_at', { ascending: false });
    if (error) console.error('Error fetching leads:', error);
    else { setLeads(data); setFilteredLeads(data); }
  };

  const handleSimplify = () => {
    if (measurePoints.length < 6) return alert("Shape is already simple enough.");
    const simplified = measurePoints.filter((_, i) => i === 0 || i % 4 === 0 || i === measurePoints.length - 1);
    setRedoStack([...redoStack, measurePoints]); 
    setMeasurePoints(simplified);
    setTempArea(calculateAcres(simplified));
  };

  const handleEditShape = (lead) => {
    setMeasurePoints(lead.points);
    setTempArea(lead.acres);
    setEditingLead(lead);
    setCenterPos(lead.center); 
    setIsMeasuring(true);
    setShowCoordsPanel(true);
    setShowPointList(false); 
    setRedoStack([]);
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(leads));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `SatelliteScout_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const importedLeads = [];
        if (json.type === 'FeatureCollection' && json.features) {
           const allPoints = json.features.every(f => f.geometry.type === 'Point');
           if (allPoints && json.features.length > 2) {
               const confirmConnect = window.confirm(`Found ${json.features.length} separate points. Connect them into one shape?`);
               if (confirmConnect) {
                   const combinedPoints = json.features.map(f => ({ lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }));
                   const acres = calculateAcres(combinedPoints);
                   const name = json.features[0].properties?.Name || "Connected Points";
                   const newLead = { id: Date.now(), label: name, note: `Created from ${json.features.length} points`, acres: acres, points: combinedPoints, center: combinedPoints[0] };
                   importedLeads.push(newLead);
                   supabase.from('scout_leads').insert([{ label: newLead.label, note: newLead.note, acres: newLead.acres, points: newLead.points, center: newLead.center }]).then();
               }
           } else {
               const confirmImport = window.confirm(`Found ${json.features.length} items. Import now?`);
               if(!confirmImport) return;
               for (const feature of json.features) {
                  let rawCoords = [];
                  const type = feature.geometry.type;
                  if (type === 'Polygon') rawCoords = feature.geometry.coordinates[0]; 
                  else if (type === 'LineString') rawCoords = feature.geometry.coordinates;
                  else if (type === 'MultiPolygon') rawCoords = feature.geometry.coordinates[0][0];
                  if (!rawCoords || rawCoords.length === 0) continue;
                  const points = rawCoords.map(c => ({ lat: c[1], lng: c[0] }));
                  if (points.length > 1) {
                     if (type === 'LineString') points.push(points[0]); 
                     const acres = calculateAcres(points);
                     const props = feature.properties || {};
                     const name = props.Name || props.name || `Imported Track`;
                     const newLead = { id: Date.now() + Math.random(), label: name, note: `Imported from SW Maps`, acres: acres, points: points, center: points[0] };
                     importedLeads.push(newLead);
                     supabase.from('scout_leads').insert([{ label: newLead.label, note: newLead.note, acres: newLead.acres, points: newLead.points, center: newLead.center }]).then();
                  }
               }
           }
        } 
        else if (Array.isArray(json)) {
            const confirmBackup = window.confirm(`Found backup with ${json.length} leads. Restore them?`);
            if (confirmBackup) importedLeads.push(...json);
        }
        if (importedLeads.length > 0) {
           setLeads(prev => [...importedLeads, ...prev]);
           setCenterPos(importedLeads[0].center);
           alert("Success! Data imported.");
        }
      } catch (err) { alert("Error reading file."); }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const updatePointPosition = (index, newLatLng) => {
    const updatedPoints = [...measurePoints];
    updatedPoints[index] = newLatLng;
    setMeasurePoints(updatedPoints);
    setTempArea(calculateAcres(updatedPoints));
  };

  const handleCoordInput = (index, field, value) => {
    const updatedPoints = [...measurePoints];
    updatedPoints[index] = { ...updatedPoints[index], [field]: parseFloat(value) };
    setMeasurePoints(updatedPoints);
    setTempArea(calculateAcres(updatedPoints));
  };

  const handleUndo = () => {
    if (measurePoints.length === 0) return;
    const lastPoint = measurePoints[measurePoints.length - 1];
    const newPoints = measurePoints.slice(0, -1);
    setMeasurePoints(newPoints);
    setRedoStack([lastPoint, ...redoStack]);
    setTempArea(calculateAcres(newPoints));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const pointToRestore = redoStack[0];
    const newRedoStack = redoStack.slice(1);
    const newPoints = [...measurePoints, pointToRestore];
    setMeasurePoints(newPoints);
    setRedoStack(newRedoStack);
    setTempArea(calculateAcres(newPoints));
  };

  const handleSaveShape = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const leadData = { label: formData.get('label'), survey_no: formData.get('survey_no'), note: formData.get('note'), acres: tempArea, points: measurePoints, center: measurePoints[0] };
    if (editingLead) {
      const { error } = await supabase.from('scout_leads').update(leadData).eq('id', editingLead.id);
      if (error) { alert('Update failed: ' + error.message); } 
      else { setLeads(leads.map(l => l.id === editingLead.id ? { ...l, ...leadData } : l)); finishSave(); }
    } else {
      const { data, error } = await supabase.from('scout_leads').insert([leadData]).select();
      if (error) { alert('Save failed: ' + error.message); } 
      else { setLeads([data[0], ...leads]); finishSave(); }
    }
  };

  const finishSave = () => {
    setMeasurePoints([]); setRedoStack([]); setIsMeasuring(false); setEditingLead(null); setShowSaveForm(false); setShowCoordsPanel(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    const { error } = await supabase.from('scout_leads').delete().eq('id', id);
    if (error) alert('Error: ' + error.message); else setLeads(leads.filter(l => l.id !== id));
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (isMeasuring) {
          const newPoints = [...measurePoints, e.latlng];
          setMeasurePoints(newPoints); setRedoStack([]); setTempArea(calculateAcres(newPoints)); setShowCoordsPanel(true); setShowPointList(false);
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
           const latShift = newCenter.lat - dragStartPos.current.lat;
           const lngShift = newCenter.lng - dragStartPos.current.lng;
           const shiftedPoints = measurePoints.map(p => ({ lat: p.lat + latShift, lng: p.lng + lngShift }));
           setMeasurePoints(shiftedPoints);
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

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-white shadow-md p-4 z-[5000] relative flex flex-col md:flex-row justify-between items-center h-auto md:h-16 gap-4 shrink-0">
        <div>
           <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
             <Crosshair className="text-red-600"/> Satellite Scout Pro
           </h1>
        </div>

        {/* SEARCH BAR */}
        <div className="flex-1 max-w-md mx-4 relative">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 border border-gray-200">
            <Search size={18} className="text-gray-500 mr-2"/>
            <input type="text" placeholder="Search Survey No / Owner Name..." className="bg-transparent border-none outline-none text-sm w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} className="text-gray-400"/></button>}
          </div>
          {searchQuery && filteredLeads.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white mt-1 shadow-xl rounded-lg border border-gray-100 z-50 max-h-60 overflow-y-auto">
              {filteredLeads.map(lead => (
                <div key={lead.id} onClick={() => { setCenterPos(lead.center); setSearchQuery(''); }} className="p-2 hover:bg-blue-50 cursor-pointer border-b last:border-0">
                  <div className="font-bold text-sm text-gray-800">{lead.survey_no || 'No Survey #'}</div>
                  <div className="text-xs text-gray-500">{lead.label} • {formatArea(lead.acres)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button onClick={() => { setIsMeasuring(!isMeasuring); if(!isMeasuring) { setMeasurePoints([]); setRedoStack([]); setEditingLead(null); } }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold border transition-colors ${isMeasuring ? 'bg-orange-500 text-white border-orange-600' : 'text-gray-600 hover:bg-gray-200'}`}>
              <Ruler size={16}/> {isMeasuring ? (editingLead ? 'Editing...' : 'Stop') : 'Measure'}
            </button>
            {isMeasuring && (
              <>
                <button onClick={handleUndo} disabled={measurePoints.length === 0} className="p-1.5 hover:bg-white hover:shadow rounded-md disabled:opacity-30 text-gray-600"><RotateCcw size={18}/></button>
                <button onClick={handleRedo} disabled={redoStack.length === 0} className="p-1.5 hover:bg-white hover:shadow rounded-md disabled:opacity-30 text-gray-600"><RotateCw size={18}/></button>
                <button onClick={() => setShowCoordsPanel(!showCoordsPanel)} className={`p-1.5 hover:shadow rounded-md ${showCoordsPanel ? 'bg-blue-100 text-blue-600' : 'hover:bg-white text-gray-600'}`}><Edit3 size={18}/></button>
              </>
            )}
          </div>
          
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          
          {/* RESOURCES BUTTON (NEW) */}
          <button onClick={() => setShowResources(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-100 bg-white" title="Investor Education">
             <BookOpen size={20}/>
          </button>

          <button onClick={() => fileInputRef.current.click()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Import File"><Upload size={20}/></button>
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json,.geojson,.kml" />
          <button onClick={handleExportBackup} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Download Backup"><Download size={20}/></button>

          {/* TOOLS MENU */}
          <div className="relative">
             <button onClick={() => setShowToolsMenu(!showToolsMenu)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${showToolsMenu ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                <Globe size={16}/> Tools
             </button>
             {showToolsMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-[5001] animate-in fade-in zoom-in duration-150">
                   <div className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">External Apps</div>
                   <button onClick={() => { window.open(`https://earth.google.com/web/@${centerPos.lat},${centerPos.lng},1000a,3000d,35y,0h,0t,0r`, '_blank'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2"><ExternalLink size={14}/> Open Google Earth</button>
                   <button onClick={() => { window.open("https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php", '_blank'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2"><Globe size={14}/> Open Bhuvan (2D)</button>
                   <button onClick={() => { window.open("https://bhubharati.telangana.gov.in/knowLandStatus", '_blank'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2"><div className="w-4 flex justify-center text-[10px] font-bold">B</div> Open Bhubharati Status</button>
                   <div className="h-px bg-gray-100 my-1"></div>
                   <button onClick={() => { navigator.clipboard.writeText(`${centerPos.lat}, ${centerPos.lng}`); alert('Copied!'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2"><Copy size={14}/> Copy Coords</button>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* RESOURCES MODAL (NEW) */}
      {showResources && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[6000] flex justify-center items-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
             {/* Modal Header */}
             <div className="p-6 bg-blue-600 text-white flex justify-between items-center sticky top-0 z-10">
                <div>
                   <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen/> Investor Knowledge Base</h2>
                   <p className="text-blue-100 text-sm">Official sources & checklist for Telangana.</p>
                </div>
                <button onClick={() => setShowResources(false)} className="bg-blue-700 p-2 rounded-full hover:bg-blue-800"><X size={20}/></button>
             </div>

             <div className="p-6 space-y-8">
                {/* 1. OFFICIAL LINKS */}
                <section>
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Globe size={18} className="text-blue-600"/> Official Government Portals</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <a href="https://registration.telangana.gov.in/" target="_blank" className="p-4 border rounded-xl hover:bg-blue-50 transition-colors group">
                         <div className="font-bold text-blue-700 group-hover:underline">IGRS Telangana</div>
                         <div className="text-xs text-gray-500">Check Encumbrance Certificate (EC), Registration Market Value.</div>
                      </a>
                      <a href="https://bhubharati.telangana.gov.in/" target="_blank" className="p-4 border rounded-xl hover:bg-blue-50 transition-colors group">
                         <div className="font-bold text-blue-700 group-hover:underline">Bhubharati / Dharani</div>
                         <div className="text-xs text-gray-500">Check Land Status, Prohibited List, Passbook Details.</div>
                      </a>
                      <a href="https://www.hmda.gov.in/" target="_blank" className="p-4 border rounded-xl hover:bg-blue-50 transition-colors group">
                         <div className="font-bold text-blue-700 group-hover:underline">HMDA Master Plan</div>
                         <div className="text-xs text-gray-500">Verify Land Use Zone (Residential vs Conservation).</div>
                      </a>
                      <a href="http://rera.telangana.gov.in/" target="_blank" className="p-4 border rounded-xl hover:bg-blue-50 transition-colors group">
                         <div className="font-bold text-blue-700 group-hover:underline">RERA Telangana</div>
                         <div className="text-xs text-gray-500">Verify Project Registration & Legal Approvals.</div>
                      </a>
                   </div>
                </section>

                {/* 2. CHECKLIST */}
                <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CheckCircle size={18} className="text-green-600"/> 10-Point Due Diligence Checklist</h3>
                   <ul className="space-y-3 text-sm text-gray-700">
                      {[
                        "Verify 'Link Documents' for the last 30 years (Flow of Title).",
                        "Check Encumbrance Certificate (EC) on IGRS Portal.",
                        "Check Prohibited Lands List (Section 22A) on Dharani.",
                        "Verify 'Land Use Zone' in HMDA/DTCP Master Plan.",
                        "Check for any court cases (Litigation) using Survey Number.",
                        "Measure physical land area vs. document area (Use Satellite Scout).",
                        "Check for Nala / Water Body encroachment (FTL Buffer).",
                        "Verify Access Road width (Minimum 30ft for layouts).",
                        "If Farm Land: Ensure you are eligible (Pattadar Passbook).",
                        "If Plot: Ask for LP Number (Layout Permission) or LRS."
                      ].map((item, i) => (
                        <li key={i} className="flex gap-2 items-start"><input type="checkbox" className="mt-1"/> <span>{item}</span></li>
                      ))}
                   </ul>
                </section>

                {/* 3. RED FLAGS */}
                <section>
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><AlertTriangle size={18} className="text-red-600"/> Why Banks Reject Loans (Red Flags)</h3>
                   <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                         <div className="bg-red-100 p-2 rounded text-red-600 font-bold text-xs shrink-0">FTL / 111</div>
                         <div>
                            <div className="font-bold text-sm">Full Tank Level / GO 111</div>
                            <p className="text-xs text-gray-500">Lands inside the buffer zone of lakes (Osman Sagar/Himayat Sagar) or Nalas are mostly prohibited for construction. Zero loan eligibility.</p>
                         </div>
                      </div>
                      <div className="flex gap-3 items-start">
                         <div className="bg-red-100 p-2 rounded text-red-600 font-bold text-xs shrink-0">Inam / Wakf</div>
                         <div>
                            <div className="font-bold text-sm">Inam or Wakf Board Lands</div>
                            <p className="text-xs text-gray-500">Religious or Service Inam lands often have complex ownership disputes. Banks avoid these without specific NOCs.</p>
                         </div>
                      </div>
                   </div>
                </section>
             </div>
             
             <div className="p-4 bg-gray-100 text-center text-xs text-gray-500">
                Content is for educational purposes. Always consult a legal expert.
             </div>
          </div>
        </div>
      )}

      {/* MAP WRAPPER */}
      <div className="flex flex-1 relative h-[85vh]">
        {showCoordsPanel && isMeasuring && (
           <div className="w-80 bg-white shadow-xl z-10 overflow-y-auto border-r border-gray-200 flex flex-col transition-all">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center sticky top-0">
                 <h3 className="font-bold text-gray-700 text-sm">{editingLead ? 'Editing Shape' : 'Vertex Editor'}</h3>
                 <button onClick={() => setShowCoordsPanel(false)}><X size={16}/></button>
              </div>
              <div className="p-4 space-y-4">
                 <button onClick={handleSimplify} className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg text-xs font-bold border border-blue-200 hover:bg-blue-100 flex items-center justify-center gap-2 mb-2"><Zap size={14}/> Simplify (Cleanup)</button>
                 <div className="border rounded-lg overflow-hidden">
                    <button onClick={() => setShowPointList(!showPointList)} className="w-full flex justify-between items-center p-2 bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200">
                       <span>{measurePoints.length} Coordinates</span>
                       {showPointList ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    </button>
                    {showPointList && (
                       <div className="max-h-60 overflow-y-auto p-2 bg-gray-50">
                         {measurePoints.map((pt, i) => (
                           <div key={i} className="mb-2 last:mb-0 bg-white p-2 rounded border border-gray-200 text-xs">
                             <div className="flex justify-between mb-1 font-bold text-gray-500">Pt {i + 1}</div>
                             <div className="grid grid-cols-2 gap-2">
                               <input type="number" step="0.00001" className="w-full border rounded p-1" value={pt.lat} onChange={(e) => handleCoordInput(i, 'lat', e.target.value)} />
                               <input type="number" step="0.00001" className="w-full border rounded p-1" value={pt.lng} onChange={(e) => handleCoordInput(i, 'lng', e.target.value)} />
                             </div>
                           </div>
                         ))}
                       </div>
                    )}
                 </div>
              </div>
              <div className="p-4 border-t mt-auto sticky bottom-0 bg-white">
                 <div className="flex justify-between items-center mb-2"><span className="text-gray-500 text-xs">Total Area</span><span className="font-bold text-orange-600 text-lg">{formatArea(tempArea)}</span></div>
                 <button onClick={() => setShowSaveForm(true)} disabled={measurePoints.length < 3} className="w-full bg-green-600 text-white py-2 rounded font-bold disabled:opacity-50 hover:bg-green-700">{editingLead ? 'Update Shape' : 'Save Shape'}</button>
              </div>
           </div>
        )}

        <div className="flex-1 relative bg-gray-200">
          <MapContainer center={centerPos} zoom={18} maxZoom={22} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            <MapController center={centerPos} />
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="Google Hybrid"><TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution='&copy; Google' maxNativeZoom={20} maxZoom={22} /></LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Satellite"><TileLayer url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" attribution='&copy; Google' maxNativeZoom={20} maxZoom={22} /></LayersControl.BaseLayer>
            </LayersControl>
            {measurePoints.length > 0 && <><Polygon positions={measurePoints} pathOptions={{ color: 'orange', weight: 2, fillColor: 'orange', fillOpacity: 0.2 }} />{measurePoints.map((pt, i) => <DraggableVertex key={i} position={pt} index={i} />)}</>}
            {filteredLeads.map((lead) => {
               if(editingLead && editingLead.id === lead.id) return null;
               return (
                <Polygon key={lead.id} positions={lead.points} pathOptions={{ color: '#10b981', weight: 2, fillColor: '#10b981', fillOpacity: 0.4 }}>
                  <Popup>
                    <div className="text-center">
                      <strong className="text-lg block">{lead.label}</strong>
                      {lead.survey_no && <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded inline-block mt-1 border border-yellow-200">Sy No: {lead.survey_no}</div>}
                      <div className="text-sm text-gray-600 mt-2">{formatArea(lead.acres)}</div>
                      <p className="text-xs text-gray-500 mt-2 italic border-t pt-1">{lead.note}</p>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleEditShape(lead)} className="flex-1 bg-blue-50 text-blue-600 text-xs flex items-center justify-center gap-1 hover:bg-blue-100 p-1.5 rounded border border-blue-200 font-bold"><Edit3 size={12}/> Modify</button>
                        <button onClick={() => handleDelete(lead.id)} className="flex-1 bg-red-50 text-red-500 text-xs flex items-center justify-center gap-1 hover:bg-red-100 p-1.5 rounded border border-red-200"><Trash2 size={12}/> Delete</button>
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}
            <DraggableMarker />
            <MapClickHandler />
          </MapContainer>
        </div>
      </div>

      {showSaveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[2000] flex justify-center items-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Save className="text-green-600"/> {editingLead ? 'Update Lead' : 'Save This Land'}</h2>
            <form onSubmit={handleSaveShape} className="space-y-4">
              <div className="bg-orange-50 p-3 rounded text-center border border-orange-100"><span className="text-xs text-gray-500 uppercase font-bold">Calculated Area</span><div className="text-2xl font-bold text-orange-600">{formatArea(tempArea)}</div></div>
              <div><label className="block text-sm font-medium mb-1">Label / Name</label><input name="label" defaultValue={editingLead?.label} required autoFocus className="w-full border p-2 rounded outline-none focus:ring-2 ring-blue-500" placeholder="e.g. Reddy Farm" /></div>
              <div><label className="block text-sm font-medium mb-1">Survey Number</label><input name="survey_no" defaultValue={editingLead?.survey_no} className="w-full border p-2 rounded outline-none focus:ring-2 ring-blue-500" placeholder="e.g. 142/A" /></div>
              <div><label className="block text-sm font-medium mb-1">Notes</label><textarea name="note" defaultValue={editingLead?.note} className="w-full border p-2 rounded outline-none focus:ring-2 ring-blue-500" rows="2" placeholder="Road width, link docs..." /></div>
              <div className="flex gap-2 pt-2"><button type="button" onClick={() => setShowSaveForm(false)} className="flex-1 py-2 bg-gray-100 rounded font-semibold">Cancel</button><button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">{editingLead ? 'Update Changes' : 'Save New'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateSearchApp;