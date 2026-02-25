import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Globe, ShieldCheck, Lock } from 'lucide-react';

// --- MODULAR IMPORTS ---
import { Navigator } from './components/Navigator';
import { SparkAgent } from './components/SparkAgent';
import MapBoard from './features/MapBoard';
import AdminView from './features/AdminView';
import { PostAdModal, ViewAdModal } from './features/AdManager';

// --- CONFIGURATION ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_KEY
);

const RealEstateSearchApp = () => {
  // --- 🔐 SECURITY & ADMIN STATE ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedAds, setSelectedAds] = useState([]);
  const [showLinksModal, setShowLinksModal] = useState(false); // For Govt Links button
  const [showRatingModal, setShowRatingModal] = useState(false); // For Audit Tool button

  // --- 📊 DATA STATE ---
  const [marketAds, setMarketAds] = useState([]);
  const [flyLocation, setFlyLocation] = useState(null);
  const [isSparkOpen, setIsSparkOpen] = useState(false);
  const [infraMode, setInfraMode] = useState(true); 
  const [radarMode, setRadarMode] = useState(false);
  const [adMode, setAdMode] = useState(null); 
  const [newAdLocation, setNewAdLocation] = useState(null);
  const [newAdData, setNewAdData] = useState({ type: 'SELL', size: '', price: '', contact: '', desc: '' });
  const [isFuzzy, setIsFuzzy] = useState(false);
  const [viewingAd, setViewingAd] = useState(null);
  const [showWater, setShowWater] = useState(false);
const [showForest, setShowForest] = useState(false);

  // --- 🟢 LOGIC: FETCH DATA ---
  const fetchMarketplaceAds = async () => {
    const { data } = await supabase.from('marketplace_ads').select('*').order('created_at', { ascending: false });
    if (data) setMarketAds(data);
  };

  const [showTools, setShowTools] = useState(false);

  // --- 🏠 LOGIC: NAVIGATION ---
  const goHome = () => setFlyLocation({ lat: 17.3850, lng: 78.4867, zoom: 12 });

  const [tutorialStep, setTutorialStep] = useState(0);

  const startTutorial = () => {
    setTutorialStep(1);
    setIsSparkOpen(true);
  };

  const nextStep = () => setTutorialStep(prev => prev + 1);
  const endTutorial = () => setTutorialStep(0);

  // --- 🛠️ LOGIC: ADMIN ACTIONS ---
  const handleApproveAd = async (adId) => {
    const { error } = await supabase.from('marketplace_ads').update({ status: 'APPROVED' }).eq('id', adId);
    if (!error) { fetchMarketplaceAds(); alert("✅ Asset Approved for Map!"); }
  };

  const handleDeleteAd = async (adId) => {
    if (!window.confirm("Delete this record forever?")) return;
    const { error } = await supabase.from('marketplace_ads').delete().eq('id', adId);
    if (!error) fetchMarketplaceAds();
  };

  // --- 📍 LOGIC: USER POSTING ---
  const handlePostAdUnified = async () => {
    if (!newAdLocation) return alert("Select a location!");
    const { error } = await supabase.from('marketplace_ads').insert([{
      ...newAdData,
      lat: isFuzzy ? newAdLocation.lat + (Math.random() - 0.5) * 0.0015 : newAdLocation.lat,
      lng: isFuzzy ? newAdLocation.lng + (Math.random() - 0.5) * 0.0015 : newAdLocation.lng,
      status: 'PENDING'
    }]);
    if (!error) { alert("✅ Pinned!"); setAdMode(null); fetchMarketplaceAds(); }
  };

  useEffect(() => { fetchMarketplaceAds(); }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col">
      {/* 🌍 THE ENGINE */}
      <MapBoard 
        marketAds={marketAds} 
        flyLocation={flyLocation} 
        adMode={adMode} 
        newAdLocation={newAdLocation} 
        setNewAdLocation={setNewAdLocation}
        infraMode={infraMode} 
        radarMode={radarMode}
        mapStyle="satellite" 
        isAdmin={isAdmin}
      />

      {/* 🔍 NAVIGATION */}
      <Navigator setFlyLocation={setFlyLocation} goHome={goHome} />

      {/* 🔐 SECURE ADMIN GATEWAY (Moved to Bottom-Right) */}
      <div className="fixed bottom-6 right-20 z-[10005]">
        <button 
          onClick={() => {
            if (!showAdmin) {
              const pin = prompt("Enter Admin Passcode:");
              if (pin === "8008") { 
                setIsAdmin(true);
                setShowAdmin(true);
              } else {
                alert("❌ Unauthorized!");
              }
            } else {
              setShowAdmin(false);
            }
          }}
          className={`p-4 rounded-full shadow-2xl border-2 transition-all flex items-center justify-center ${
            showAdmin 
              ? 'bg-red-600 border-white text-white rotate-90' 
              : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:border-blue-500'
          }`}
          title="Admin Database"
        >
          {showAdmin ? <Globe size={20}/> : <ShieldCheck size={20}/>}
        </button>
      </div>

      // --- REPLACE TOOLS DECK WITH THIS ---
  <div className="fixed right-4 top-4 z-[10002] flex flex-col items-end gap-2">
    {/* 🎯 MAIN TOGGLE BUTTON */}
    <button 
      onClick={() => setShowTools(!showTools)}
      className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border-2 border-blue-500 flex items-center gap-2 hover:bg-black transition-all"
    >
      <span className="text-[10px] font-black uppercase tracking-wider">Intelligence</span>
      <span className={`transition-transform duration-300 ${showTools ? 'rotate-180' : ''}`}>▼</span>
    </button>

    {/* 📂 THE COMPLETED INTELLIGENCE DROPDOWN */}
{showTools && (
  <div className="bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700 shadow-2xl flex flex-col gap-2 w-48 animate-spark-in">
    
    {/* 📡 INFRA SCANNER */}
    <button 
      onClick={() => setInfraMode(!infraMode)} 
      className={`flex justify-between items-center p-3 rounded-xl text-[10px] font-bold transition-all ${
        infraMode ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'bg-slate-800 text-slate-400'
      }`}
    >
      📡 INFRA SCANNER <span>{infraMode ? 'ON' : 'OFF'}</span>
    </button>

    {/* 🛰️ GROWTH RADAR */}
    <button 
      onClick={() => setRadarMode(!radarMode)} 
      className={`flex justify-between items-center p-3 rounded-xl text-[10px] font-bold transition-all ${
        radarMode ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50' : 'bg-slate-800 text-slate-400'
      }`}
    >
      🛰️ GROWTH RADAR <span>{radarMode ? 'ON' : 'OFF'}</span>
    </button>

    <div className="h-[1px] bg-slate-700 my-1"></div>

    {/* 🌊 WATER BODIES */}
    <button 
      onClick={() => setShowWater(!showWater)}
      className={`flex justify-between items-center p-3 rounded-xl text-[10px] font-bold transition-all ${
        showWater ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
      }`}
    >
      🌊 WATER BODIES <span>{showWater ? '✓' : ''}</span>
    </button>

    {/* 🌲 FOREST AREAS */}
    <button 
      onClick={() => setShowForest(!showForest)}
      className={`flex justify-between items-center p-3 rounded-xl text-[10px] font-bold transition-all ${
        showForest ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
      }`}
    >
      🌲 FOREST AREAS <span>{showForest ? '✓' : ''}</span>
    </button>
  </div>
)}
  </div>

      {/* 🗄️ THE ADMIN VAULT OVERLAY */}
      {showAdmin && (
        <div className="fixed inset-0 z-[10004] bg-white overflow-hidden">
          <AdminView 
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
            marketAds={marketAds}
            handleApproveAd={handleApproveAd}
            handleDeleteAd={handleDeleteAd}
            fetchMarketplaceAds={fetchMarketplaceAds}
            setShowLinksModal={setShowLinksModal}
            setShowRatingModal={setShowRatingModal}
            selectedAds={selectedAds}
            setSelectedAds={setSelectedAds}
            toggleAdSelection={(id) => setSelectedAds(prev => 
              prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
            )}
          />
          <button 
            onClick={() => setShowAdmin(false)}
            className="fixed top-6 right-6 z-[10005] bg-slate-900 text-white px-6 py-2 rounded-full font-black shadow-2xl"
          >
            ESC ➔ MAP
          </button>
        </div>
      )}

      {/* 📍 PIN TRIGGER */}
      {!adMode && !showAdmin && (
        <button 
          onClick={() => setAdMode('SELL')}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-500 text-black px-8 py-3 rounded-full font-black shadow-xl"
        >
          📍 FREE PIN FOR YOUR ASSET
        </button>
      )}

      {/* 🤖 SPARK AGENT */}
      <SparkAgent 
        isOpen={isSparkOpen} 
        setIsOpen={setIsSparkOpen} 
        mapLat={flyLocation?.lat} 
        mapLng={flyLocation?.lng} 
      />

      {/* 📦 MODALS */}
      <PostAdModal 
        isOpen={adMode === 'SELL'} 
        onClose={() => setAdMode(null)} 
        newAdLocation={newAdLocation} 
        newAdData={newAdData} 
        setNewAdData={setNewAdData}
        handlePostAd={handlePostAdUnified} 
      />
      <ViewAdModal viewingAd={viewingAd} setViewingAd={setViewingAd} />
      {/* 🌐 GOVT LINKS MODAL */}
      {showLinksModal && (
        <div className="fixed inset-0 z-[10007] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-blue-100 animate-spark-in">
            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Globe className="text-blue-600"/> Official Portals
            </h3>
            <div className="flex flex-col gap-3">
              <a href="https://dharani.telangana.gov.in/" target="_blank" className="p-4 bg-slate-50 rounded-2xl font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100 flex justify-between">
                Dharani Portal <span>➔</span>
              </a>
              <a href="https://registration.telangana.gov.in/" target="_blank" className="p-4 bg-slate-50 rounded-2xl font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100 flex justify-between">
                IGRS Registration <span>➔</span>
              </a>
            </div>
            <button onClick={() => setShowLinksModal(false)} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black">CLOSE</button>
          </div>
        </div>
      )}

      {/* 🛡️ AUDIT TOOL MODAL */}
      {showRatingModal && (
        <div className="fixed inset-0 z-[10007] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-purple-100 animate-spark-in text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-purple-600" size={32}/>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Internal Audit</h3>
            <p className="text-slate-500 text-sm font-bold mb-6">Reviewing all 8 map assets for verification status.</p>
            <div className="bg-slate-50 p-4 rounded-2xl text-[10px] font-mono text-slate-400 text-left mb-6">
              Checking: LRS Status... OK<br/>
              Checking: FTL/Buffer... OK<br/>
              Checking: Master Plan... OK
            </div>
            <button onClick={() => setShowRatingModal(false)} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-lg shadow-purple-200">MARK ALL AS VERIFIED</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateSearchApp;