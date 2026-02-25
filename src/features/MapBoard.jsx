import React, { useRef, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Zap, Target } from 'lucide-react';

const MapBoard = ({ 
    flyLocation, 
    adMode, 
    newAdLocation, 
    setNewAdLocation, 
    marketAds = [], 
    infraMode, 
    radarMode,
    showWater, // 👈 ADD THIS
    showForest, // 👈 ADD THIS
    mapStyle 
}) => {
    const mapRef = useRef(null);

    // --- 🚀 THE FLIGHT ENGINE ---
    // Smoothly navigates the map when a search or location trigger occurs
    useEffect(() => {
        if (flyLocation && mapRef.current) {
            mapRef.current.flyTo({
                center: [flyLocation.lng, flyLocation.lat],
                zoom: flyLocation.zoom || 14,
                pitch: 60,
                bearing: 20,
                duration: 4000
            });
        }
    }, [flyLocation]);

    const initialViewState = {
        longitude: 78.4867,
        latitude: 17.3850,
        zoom: 11.5,
        pitch: 45,
        bearing: -10
    };

    const handleMapClick = (e) => {
        if (adMode) {
            setNewAdLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        }
    };

    // --- 🛰️ THE SATELLITE ENGINE ---
    // Dynamically switches between Google Hybrid and OpenStreetMap
    const getMapStyle = () => {
        if (mapStyle === 'satellite') {
            return {
                version: 8,
                sources: {
                    'hybrid-tiles': {
                        type: 'raster',
                        tiles: ['https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'], 
                        tileSize: 256,
                        attribution: '&copy; Google'
                    }
                },
                layers: [{ id: 'hybrid-layer', type: 'raster', source: 'hybrid-tiles' }]
            };
        }
        return {
            version: 8,
            sources: {
                'osm-tiles': {
                    type: 'raster',
                    tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    attribution: '&copy; OpenStreetMap'
                }
            },
            layers: [{ id: 'osm-tiles-layer', type: 'raster', source: 'osm-tiles' }]
        };
    };

    return (
        <div className="w-full h-full absolute inset-0 bg-slate-900">
            <Map
                ref={mapRef}
                initialViewState={initialViewState}
                mapStyle={getMapStyle()} 
                onClick={handleMapClick}
                maxPitch={85}
            >
                {/* 📍 RENDER APPROVED ASSETS (From Supabase) */}
                {Array.isArray(marketAds) && marketAds.map((ad, idx) => (
                    <Marker key={ad.id || idx} longitude={ad.lng} latitude={ad.lat} anchor="bottom">
                        <div className="group relative cursor-pointer hover:scale-110 transition-all">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-50 animate-pulse"></div>
                            <MapPin size={32} className="text-blue-600 fill-white relative z-10" />
                            
                            {/* DYNAMIC TOOLTIP */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-2 rounded shadow-2xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                <div className="text-[10px] font-black uppercase tracking-tighter">
                                    {ad.price} | {ad.size} {ad.size_unit || 'Sq Yds'}
                                </div>
                                {ad.status === 'PENDING' && (
                                    <div className="text-[8px] text-yellow-500 font-bold">⏳ AWAITING AUDIT</div>
                                )}
                            </div>
                        </div>
                    </Marker>
                ))}
                {/* 🌊 WATER BODY OVERLAYS (Light Blue Glow) */}
                {showWater && (
                    <Marker longitude={78.41} latitude={17.35} anchor="center">
                        <div className="w-64 h-64 bg-blue-400/20 border-2 border-blue-400 rounded-full blur-xl animate-pulse flex items-center justify-center">
                            <span className="text-blue-200 text-[10px] font-black uppercase tracking-widest bg-slate-900/50 px-2 py-1 rounded">
                                OSMAN SAGAR BUFFER
                            </span>
                        </div>
                    </Marker>
                )}

                {/* 🌲 FOREST AREA (Green Zone Tint) */}
                {showForest && (
                    <Marker longitude={78.55} latitude={17.42} anchor="center">
                        <div className="w-80 h-40 bg-emerald-900/30 border-2 border-emerald-500 rounded-3xl backdrop-blur-[2px] flex flex-col items-center justify-start pt-4">
                            <div className="text-emerald-400 text-[8px] font-black uppercase bg-slate-900/80 px-3 py-1 rounded-full border border-emerald-500/50">
                                RESERVED FOREST ZONE
                            </div>
                        </div>
                    </Marker>
                )}

                {/* 📡 INFRA SCANNER: High Tension/Hazard Zones */}
{infraMode && (
    <Marker longitude={78.445} latitude={17.379} anchor="center">
        <div className="bg-red-600/20 w-32 h-32 rounded-full animate-ping absolute border-2 border-red-500" />
        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-xl">
           ⚡ HIGH TENSION ZONE
        </div>
    </Marker>
)}

{/* 🛰️ GROWTH RADAR: High Growth Node */}
{radarMode && (
    <Marker longitude={78.348} latitude={17.447} anchor="center">
        <div className="w-64 h-64 bg-orange-500/10 border-4 border-dashed border-orange-500/40 rounded-full animate-[spin_15s_linear_infinite] flex items-center justify-center">
             <span className="bg-slate-900/90 text-orange-400 text-[9px] font-black px-3 py-1 rounded-full border border-orange-500">
                GROWTH NODE: HITEC-II
             </span>
        </div>
    </Marker>
)}

                {/* 🟢 ASSET PLACEMENT: Visualizes the new pin before saving */}
                {newAdLocation && (
                    <Marker longitude={newAdLocation.lng} latitude={newAdLocation.lat} anchor="bottom">
                        <div className="text-emerald-500 animate-bounce drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                            <MapPin size={48} className="fill-emerald-100" />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded whitespace-nowrap">
                                NEW PIN READY
                            </div>
                        </div>
                    </Marker>
                )}
            </Map>
        </div>
    );
};

export default MapBoard;