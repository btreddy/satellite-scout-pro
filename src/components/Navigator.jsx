import React, { useState } from 'react';
import { Search, Map as MapIcon, Compass } from 'lucide-react';

export const Navigator = ({ setFlyLocation, goHome }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const executeSearch = async (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', India')}&limit=1`
        );
        const data = await response.json();

        if (data?.[0]) {
          const { lat, lon } = data[0];
          setFlyLocation({ 
            lat: parseFloat(lat), 
            lng: parseFloat(lon), 
            zoom: 14 
          });
        } else {
          alert("Location not found. Try adding a city or district name.");
        }
      } catch (error) {
        console.error("Navigation Error:", error);
      }
    }
  };

  return (
    <div className="fixed top-4 left-4 z-[1001] flex items-center gap-2">
      {/* 🏠 QUICK NAV */}
      <button 
        onClick={goHome} 
        className="p-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white shadow-2xl hover:bg-slate-800 transition-colors"
        title="Go Home"
      >
        <MapIcon size={20} />
      </button>

      {/* 🔍 SEARCH ENGINE */}
      <div className="relative group w-64 md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search location..." 
          className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-700 pl-10 pr-4 py-3 rounded-xl text-white shadow-2xl outline-none focus:border-cyan-500 transition-all text-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={executeSearch}
        />
      </div>
      
      {/* 🧭 CURRENT LOCATION */}
      <button 
        onClick={() => navigator.geolocation.getCurrentPosition((pos) => 
          setFlyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 16 })
        )} 
        className="p-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white shadow-2xl hover:bg-slate-800"
        title="My Location"
      >
        <Compass size={20} />
      </button>
    </div>
  );
};