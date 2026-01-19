import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, LayersControl, useMapEvents, useMap } from 'react-leaflet';
import { X, Crosshair, Save, Ruler, Upload, RotateCcw, RotateCw, Edit3, Trash2, Globe, Copy, ExternalLink, Search } from 'lucide-react';
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
  return (area / 4046.86).toFixed(2);
};

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 18, { duration: 1.5 }); }, [center, map]);
  return null;
};

const RealEstateSearchApp = () => {
  // --- AUTH STATE (Bypassed) ---
  const [session, setSession] = useState(true); 
  
  // --- APP STATE ---
  const [leads, setLeads] = useState([]); 
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [measurePoints, setMeasurePoints] = useState([]); 
  const [redoStack, setRedoStack] = useState([]); 
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [showCoordsPanel, setShowCoordsPanel] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [centerPos, setCenterPos] = useState({ lat: 17.1350, lng: 78.4300 }); 
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [tempArea, setTempArea] = useState(0);

  const fileInputRef = useRef(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchLeads();
  }, []);

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

  // --- FIXED IMPORT LOGIC ---
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const importedLeads = [];

        // Handle GeoJSON (SW Maps)
        if (json.type === 'FeatureCollection' && json.features) {
           const confirmImport = window.confirm(`Found ${json.features.length} tracks/shapes. Import now?`);
           if(!confirmImport) return;

           for (const feature of json.features) {
              let rawCoords = [];
              const type = feature.geometry.type;
              
              // Handle Lines vs Polygons
              if (type === 'Polygon') {
                 rawCoords = feature.geometry.coordinates[0]; 
              } else if (type === 'LineString') {
                 rawCoords = feature.geometry.coordinates; // [[lng, lat, alt], ...]
              } else if (type === 'MultiPolygon') {
                 rawCoords = feature.geometry.coordinates[0][0];
              }

              // Extract Lat/Lng (ignore Altitude)
              const points = rawCoords.map(c => ({ lat: c[1], lng: c[0] }));

              if (points.length > 1) {
                 // Force Close Loop if it's a Line/Track
                 if (type === 'LineString') {
                    points.push(points[0]);
                 }

                 const acres = calculateAcres(points);
                 const props = feature.properties || {};
                 const name = props.Name || props.name || `Imported Track`;
                 
                 const newLead = {
                    id: Date.now() + Math.random(), // Temporary ID for local view
                    label: name,
                    note: `Imported from SW Maps (${type})`,
                    acres: acres,
                    points: points,
                    center: points[0]
                 };
                 
                 importedLeads.push(newLead);

                 // Background Sync to Cloud
                 supabase.from('scout_leads').insert([{
                    label: newLead.label,
                    note: newLead.note,
                    acres: newLead.acres,
                    points: newLead.points,
                    center: newLead.center
                 }]).then(({ error }) => {
                    if (error) console.error("Cloud Save Failed:", error);
                 });
              }
           }
        } 
        
        if (importedLeads.length > 0) {
           // Update Map IMMEDIATELY (Local First)
           setLeads(prev => [...importedLeads, ...prev]);
           setCenterPos(importedLeads[0].center); // Zoom to first imported item
           alert(`Success! Loaded ${importedLeads.length} shapes onto the map.`);
        } else {
           alert("No valid coordinates found in this file.");
        }

      } catch (err) {
        console.error(err);
        alert("Error reading file. Ensure it is valid GeoJSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  // --- STANDARD FUNCTIONS ---
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
    const newLead = {
      label: formData.get('label'),
      survey_no: formData.get('survey_no'),
      note: formData.get('note'),
      acres: tempArea,
      points: measurePoints,
      center: measurePoints[0]
    };

    const { data, error } = await supabase.from('scout_leads').insert([newLead]).select();
    if (error) { alert('Error saving: ' + error.message); } 
    else {
      setLeads([data[0], ...leads]);
      setMeasurePoints([]);
      setRedoStack([]);
      setIsMeasuring(false);
      setShowSaveForm(false);
      setShowCoordsPanel(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    const { error } = await supabase.from('scout_leads').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else setLeads(leads.filter(l => l.id !== id));
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (isMeasuring) {
          const newPoints = [...measurePoints, e.latlng];
          setMeasurePoints(newPoints);
          setRedoStack([]); 
          setTempArea(calculateAcres(newPoints));
          setShowCoordsPanel(true); 
        } else { setShowToolsMenu(false); }
      },
    });
    return null;
  };

  const DraggableMarker = () => {
    const markerRef = useRef(null);
    const eventHandlers = useMemo(() => ({ dragend() { const marker = markerRef.current; if (marker != null) setCenterPos(marker.getLatLng()); }, }), []);
    return <Marker draggable={true} eventHandlers={eventHandlers} position={centerPos} ref={markerRef}><Popup>Search Center</Popup></Marker>;
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
                  <div className="text-xs text-gray-500">{lead.label} • {lead.acres} Ac</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button onClick={() => { setIsMeasuring(!isMeasuring); if(!isMeasuring) { setMeasurePoints([]); setRedoStack([]); } }} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold border transition-colors ${isMeasuring ? 'bg-orange-500 text-white border-orange-600' : 'text-gray-600 hover:bg-gray-200'}`}>
              <Ruler size={16}/> {isMeasuring ? 'Stop' : 'Measure'}
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

          {/* IMPORT BUTTON */}
          <button onClick={() => fileInputRef.current.click()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Import SW Maps / Backup">
            <Upload size={20}/>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json,.geojson,.kml" />

          {/* TOOLS MENU */}
          <div className="relative">
             <button onClick={() => setShowToolsMenu(!showToolsMenu)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${showToolsMenu ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}><Globe size={16}/> Tools</button>
             {showToolsMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 z-[5001] animate-in fade-in zoom-in duration-150">
                   <div className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">External Apps</div>
                   <button onClick={() => { window.open(`https://earth.google.com/web/@${centerPos.lat},${centerPos.lng},1000a,3000d,35y,0h,0t,0r`, '_blank'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2"><ExternalLink size={14}/> Open Google Earth</button>
                   <button onClick={() => { navigator.clipboard.writeText(`${centerPos.lat}, ${centerPos.lng}`); alert('Copied!'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2"><Copy size={14}/> Copy Coords</button>
                   <button onClick={() => { window.open("https://bhuvan-app1.nrsc.gov.in/bhuvan2d/bhuvan/bhuvan2d.php", '_blank'); setShowToolsMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2"><div className="w-4"/> <span className="flex-1">Open Bhuvan</span></button>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* MAP WRAPPER */}
      <div className="flex flex-1 relative h-[85vh]">
        {showCoordsPanel && isMeasuring && (
           <div className="w-80 bg-white shadow-xl z-10 overflow-y-auto border-r border-gray-200 flex flex-col transition-all">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center sticky top-0"><h3 className="font-bold text-gray-700 text-sm">Vertex Editor</h3><button onClick={() => setShowCoordsPanel(false)}><X size={16}/></button></div>
              <div className="p-4 space-y-4">{measurePoints.map((pt, i) => (<div key={i} className="bg-gray-50 p-2 rounded border border-gray-200 text-xs"><div className="flex justify-between mb-1 font-bold text-gray-500">Point {i + 1}</div><div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] text-gray-400">Lat</label><input type="number" step="0.00001" className="w-full border rounded p-1" value={pt.lat} onChange={(e) => handleCoordInput(i, 'lat', e.target.value)} /></div><div><label className="text-[10px] text-gray-400">Lng</label><input type="number" step="0.00001" className="w-full border rounded p-1" value={pt.lng} onChange={(e) => handleCoordInput(i, 'lng', e.target.value)} /></div></div></div>))}</div>
              <div className="p-4 border-t mt-auto sticky bottom-0 bg-white"><div className="flex justify-between items-center mb-2"><span className="text-gray-500 text-xs">Total Area</span><span className="font-bold text-orange-600 text-lg">{tempArea} Ac</span></div><button onClick={() => setShowSaveForm(true)} disabled={measurePoints.length < 3} className="w-full bg-green-600 text-white py-2 rounded font-bold disabled:opacity-50 hover:bg-green-700">Save Shape</button></div>
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
            
            {/* RENDER LEADS */}
            {filteredLeads.map((lead) => (
              <Polygon key={lead.id} positions={lead.points} pathOptions={{ color: '#10b981', weight: 2, fillColor: '#10b981', fillOpacity: 0.4 }}>
                <Popup>
                  <div className="text-center"><strong className="text-lg block">{lead.label}</strong>{lead.survey_no && <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded inline-block mt-1 border border-yellow-200">Sy No: {lead.survey_no}</div>}<div className="text-sm text-gray-600 mt-2">{lead.acres} Acres</div><p className="text-xs text-gray-500 mt-2 italic border-t pt-1">{lead.note}</p><button onClick={() => handleDelete(lead.id)} className="mt-2 text-red-500 text-xs flex items-center justify-center gap-1 w-full hover:bg-red-50 p-1 rounded"><Trash2 size={10}/> Delete</button></div>
                </Popup>
              </Polygon>
            ))}

            <DraggableMarker />
            <MapClickHandler />
          </MapContainer>
        </div>
      </div>

      {showSaveForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[2000] flex justify-center items-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Save className="text-green-600"/> Save This Land</h2>
            <form onSubmit={handleSaveShape} className="space-y-4">
              <div className="bg-orange-50 p-3 rounded text-center border border-orange-100"><span className="text-xs text-gray-500 uppercase font-bold">Calculated Area</span><div className="text-2xl font-bold text-orange-600">{tempArea} Acres</div></div>
              <div><label className="block text-sm font-medium mb-1">Label / Name</label><input name="label" required autoFocus className="w-full border p-2 rounded outline-none focus:ring-2 ring-blue-500" placeholder="e.g. Reddy Farm" /></div>
              <div><label className="block text-sm font-medium mb-1">Survey Number</label><input name="survey_no" className="w-full border p-2 rounded outline-none focus:ring-2 ring-blue-500" placeholder="e.g. 142/A" /></div>
              <div><label className="block text-sm font-medium mb-1">Notes</label><textarea name="note" className="w-full border p-2 rounded outline-none focus:ring-2 ring-blue-500" rows="2" placeholder="Road width, link docs..." /></div>
              <div className="flex gap-2 pt-2"><button type="button" onClick={() => setShowSaveForm(false)} className="flex-1 py-2 bg-gray-100 rounded font-semibold">Cancel</button><button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateSearchApp;