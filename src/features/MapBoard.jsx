import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, Polygon, FeatureGroup, useMap, useMapEvents, Circle } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import L from 'leaflet';
import { MapPin, X, Share2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import "leaflet-draw/dist/leaflet.draw.css";

// IMPORT SCANNER (Ensure this file exists in the same folder!)
import InfraScanner from './InfraScanner';

// ICONS
const DefaultIcon = L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
const GoldIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34] });
L.Marker.prototype.options.icon = DefaultIcon;

// COMPONENTS
const FlyToSearchResult = ({ target }) => {
    const map = useMap();
    useEffect(() => { if (target) map.flyTo(target, 14, { duration: 1.5 }); }, [target]);
    return null;
};

const MapClickHandler = ({ viewMode, adMode, radarMode, growthNodes, setNewAdLocation, setRadarResults, setTempSearchMarker }) => { // <--- Added setTempSearchMarker here
    useMapEvents({
        click: (e) => {
            if (viewMode === 'MARKETPLACE' && adMode) {
                setNewAdLocation(e.latlng);
                setTempSearchMarker(null); // <--- THIS LINE CLEARS THE OLD SEARCH PIN
            }
            else if (viewMode === 'MARKETPLACE' && radarMode && growthNodes) {
                const dists = growthNodes.map(node => ({ name: node.name, dist: (L.latLng(e.latlng).distanceTo([node.lat, node.lng]) / 1000).toFixed(1) })).sort((a,b) => a.dist - b.dist);
                setRadarResults({ pos: e.latlng, nodes: dists });
            }
        }
    });
    return null;
};

// MAIN COMPONENT
const MapBoard = ({ 
    viewMode, marketAds = [], projects = [], newAdLocation, tempSearchMarker, radarResults, 
    adMode, radarMode, infraMode, growthNodes = [], featureGroupRef, 
    setNewAdLocation, setRadarResults, setAdMode, setViewingAd, handleShareAd,
    setCurrentShape, setShowSaveForm, agentPhone 
}) => {
    
    // Default to Hyderabad Center if no location
    const mapCenter = [17.2360, 78.4192];

    return (
        <MapContainer center={mapCenter} zoom={13} maxZoom={22} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <LayersControl position="topright">
                <LayersControl.BaseLayer name="Satellite"><TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" maxNativeZoom={18} maxZoom={22} /></LayersControl.BaseLayer>
                <LayersControl.BaseLayer checked name="Street"><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" /></LayersControl.BaseLayer>
            </LayersControl>

            <FlyToSearchResult target={tempSearchMarker} />
            <MapClickHandler viewMode={viewMode} adMode={adMode} radarMode={radarMode} growthNodes={growthNodes} setNewAdLocation={setNewAdLocation} setRadarResults={setRadarResults} />

            {/* NEW: INFRA SCANNER (Only runs if infraMode is strictly true) */}
            <InfraScanner active={!!infraMode} />

            {/* RADAR VISUALS (Safe Check: growthNodes &&) */}
            {radarMode && growthNodes && growthNodes.map((node, i) => (
                <Circle key={i} center={[node.lat, node.lng]} radius={2000} pathOptions={{ color: 'purple', fillColor: 'purple', fillOpacity: 0.1, dashArray: '10, 10' }} />
            ))}

            {/* ADS & MARKERS (Safe Check: marketAds &&) */}
            {viewMode === 'MARKETPLACE' && marketAds && marketAds.map(ad => (
                <Marker key={ad.id} position={[ad.lat, ad.lng]} icon={ad.price === '0' ? GoldIcon : DefaultIcon}>
                    <Popup>
                        <div className="p-2">
                            <h3 className="font-bold">{ad.price}</h3>
                            <button onClick={() => setViewingAd(ad)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs mt-1">Details</button>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* PLANNER (Safe Check: projects &&) */}
            {viewMode === 'VENTURE' && (
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl position="topright" onCreated={(e)=>{setCurrentShape(e); setShowSaveForm(true);}} draw={{ rectangle: false, circle: false, circlemarker: false, marker: false, polyline: false }} />
                    {projects && projects.map(p => <Polygon key={p.id} positions={p.points} color={p.color || "cyan"}><Popup>{p.name}</Popup></Polygon>)}
                </FeatureGroup>
            )}

            {newAdLocation && <Marker position={newAdLocation} icon={DefaultIcon}><Popup>New Ad Location</Popup></Marker>}
            {tempSearchMarker && <Marker position={tempSearchMarker} icon={DefaultIcon}><Popup>Search Result</Popup></Marker>}
        </MapContainer>
    );
};

export default MapBoard;