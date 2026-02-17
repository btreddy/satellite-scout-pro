import React, { useEffect, useState } from 'react';
import { useMap, Polyline, CircleMarker, Popup } from 'react-leaflet';

const InfraScanner = ({ active }) => {
    const map = useMap();
    const [infraData, setInfraData] = useState({ powerLines: [], amenities: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!active) {
            setInfraData({ powerLines: [], amenities: [] });
            return;
        }

        const fetchInfra = async () => {
            setLoading(true);
            try {
                const bounds = map.getBounds();
                const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
                
                // Query OpenStreetMap for Power Lines & Amenities
                const query = `
                    [out:json][timeout:25];
                    (
                      way["power"="line"](${bbox});
                      node["amenity"~"school|hospital|college"](${bbox});
                    );
                    out body;
                    >;
                    out skel qt;
                `;

                const response = await fetch(`https://overpass-api.de/api/interpreter`, {
                    method: 'POST',
                    body: `data=${encodeURIComponent(query)}`
                });
                
                const data = await response.json();
                const nodes = {};
                const powerLines = [];
                const amenities = [];

                // Process Nodes
                if (data.elements) {
                    data.elements.forEach(el => {
                        if (el.type === 'node') {
                            nodes[el.id] = [el.lat, el.lon];
                            if (el.tags && el.tags.amenity) {
                                amenities.push({
                                    id: el.id,
                                    lat: el.lat,
                                    lng: el.lon,
                                    type: el.tags.amenity,
                                    name: el.tags.name || 'Unknown'
                                });
                            }
                        }
                    });

                    // Process Ways (Power Lines)
                    data.elements.forEach(el => {
                        if (el.type === 'way' && el.tags && el.tags.power === 'line') {
                            const linePoints = el.nodes.map(nodeId => nodes[nodeId]).filter(Boolean);
                            if (linePoints.length > 0) {
                                powerLines.push({ 
                                    id: el.id, 
                                    points: linePoints, 
                                    voltage: el.tags.voltage || 'High Tension' 
                                });
                            }
                        }
                    });
                }

                setInfraData({ powerLines, amenities });

            } catch (err) {
                console.error("Scanner Error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInfra();
        
    }, [active, map]);

    if (!active) return null;

    return (
        <>
            {loading && (
                <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '140px', marginLeft: '10px', pointerEvents: 'none', zIndex: 1000 }}>
                    <div className="bg-black/90 text-green-400 px-4 py-2 rounded-lg backdrop-blur animate-pulse font-bold text-xs border border-green-500 shadow-lg">
                        SCANNING LIVE INFRA...
                    </div>
                </div>
            )}

            {infraData.powerLines.map(line => (
                <Polyline key={line.id} positions={line.points} pathOptions={{ color: '#ef4444', weight: 4, dashArray: '10, 10' }}>
                    <Popup>
                        <strong className="text-red-600">⚡ HIGH TENSION LINE</strong><br/>
                        Voltage: {line.voltage}
                    </Popup>
                </Polyline>
            ))}

            {infraData.amenities.map(node => (
                <CircleMarker key={node.id} center={[node.lat, node.lng]} radius={6} pathOptions={{ color: 'white', fillColor: node.type === 'hospital' ? 'red' : 'green', fillOpacity: 1 }}>
                    <Popup>
                        <strong>{node.type.toUpperCase()}</strong><br/>{node.name}
                    </Popup>
                </CircleMarker>
            ))}
        </>
    );
};

export default InfraScanner;