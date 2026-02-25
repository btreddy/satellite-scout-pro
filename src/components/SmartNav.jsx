import React from 'react';
import { Search, Map, PenTool, Lock, Unlock, X, Plus, Activity, ShieldCheck, ScanEye, Globe, Link } from 'lucide-react';

export const SmartNav = ({ 
    setShowLanding, 
    isAdmin, setIsAdmin, 
    viewMode, setViewMode, 
    setShowPinModal, setShowPremiumRequest, setShowLinksModal, 
    setIsSearchOpen, isSearchOpen, searchQuery, setSearchQuery, 
    handleSearch, adMode, setAdMode, radarMode, setRadarMode, 
    setNewAdLocation, infraMode, setInfraMode,
    isSparkOpen, setIsSparkOpen
}) => {

    const handleLockAction = () => {
        if (isAdmin) {
            if(confirm("Lock Admin Console?")) {
                setIsAdmin(false);
                setViewMode('MARKETPLACE');
            }
        } else {
            setShowPinModal(true);
        }
    };

    return (
        <>
            {/* ========================================================= */}
            {/* --- 1. MOBILE TOP HEADER --- */}
            {/* ========================================================= */}
            <header className="bg-slate-900/95 backdrop-blur-md px-4 py-3 flex justify-between items-center z-[2000] shadow-2xl border-b border-slate-800 md:hidden">
                <div onClick={() => setShowLanding(true)} className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-1.5 rounded-lg text-white shadow-lg border border-emerald-500/30"><ScanEye size={20} /></div>
                    <div><h1 className="font-black text-lg leading-none tracking-tighter text-white">SAFE LAND</h1><p className="text-[8px] font-bold text-emerald-400 tracking-widest uppercase">INTELLIGENCE</p></div>
                </div>
                <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 bg-slate-800 rounded-full text-slate-300 hover:text-white border border-slate-700">{isSearchOpen ? <X size={20}/> : <Search size={20}/>}</button>
            </header>

            {isSearchOpen && (
                <div className="md:hidden bg-slate-900 px-4 py-3 border-b border-slate-800 z-[1900] animate-in slide-in-from-top-2">
                    <div className="relative"><input type="text" placeholder="Search Village..." className="w-full bg-slate-950 text-white pl-10 pr-4 py-3 rounded-xl border border-slate-700 focus:border-emerald-500 outline-none font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} /><Search className="absolute left-3 top-3.5 text-slate-500" size={18}/></div>
                </div>
            )}


            {/* ========================================================= */}
            {/* --- 2. DESKTOP TOP HEADER (Clean Navigation) --- */}
            {/* ========================================================= */}
            <div className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700/50 items-center gap-6 z-[2000] min-w-[700px] justify-between">
                
                {/* LEFT: LOGO */}
                <div onClick={() => setShowLanding(true)} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-2 rounded-xl shadow-lg"><ScanEye size={20} className="text-white"/></div>
                    <div><h1 className="font-black text-lg tracking-tighter leading-none">SAFE LAND</h1><p className="text-[8px] text-emerald-400 font-bold tracking-[0.2em] uppercase">Intelligence</p></div>
                </div>

                {/* CENTER: SEARCH & VIEW MODES */}
                <div className="flex items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative group">
                        <input className="bg-slate-950 border border-slate-700 text-white pl-9 pr-4 py-2 rounded-lg text-xs font-bold w-48 focus:w-64 transition-all outline-none focus:border-emerald-500" placeholder="Search City or Village..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
                        <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-emerald-400" size={14}/>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                        <button onClick={() => setViewMode('MARKETPLACE')} className={`px-5 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-2 ${viewMode === 'MARKETPLACE' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}><Map size={14}/> Ad Land</button>
                        <button onClick={() => setViewMode('VENTURE')} className={`px-5 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-2 ${viewMode === 'VENTURE' ? 'bg-emerald-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}><PenTool size={14}/> Planner</button>
                    </div>
                </div>

                {/* RIGHT: SECURE ADMIN */}
                <div className="flex items-center pl-4 border-l border-slate-700">
                    <button 
                        onClick={() => { if(isAdmin) setViewMode('ADMIN'); else setShowPinModal(true); }} 
                        className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 mr-2 ${viewMode === 'ADMIN' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        {isAdmin ? 'Vault Open' : 'Admin'}
                    </button>
                    <button onClick={handleLockAction} className={`p-2 rounded-lg transition-colors border ${isAdmin ? 'border-red-500 text-red-400 hover:bg-red-900/30' : 'border-slate-700 text-slate-500 hover:text-white hover:bg-slate-800'}`} title={isAdmin ? "Logout" : "Admin Login"}>
                        {isAdmin ? <Unlock size={14}/> : <Lock size={14}/>}
                    </button>
                </div>
            </div>


            {/* ========================================================= */}
            {/* --- 3. DESKTOP RIGHT TOOLBAR (The Smart Map Tools) --- */}
            {/* ========================================================= */}
            {viewMode === 'MARKETPLACE' && (
                <div className="hidden md:flex fixed top-24 right-6 flex-col gap-3 z-[2000]">
                    
                    {/* Post Ad Button */}
                    <button 
                        onClick={() => { if(!adMode){ setAdMode(true); setNewAdLocation(null); alert("Tap the map to place your Ad."); } else setAdMode(false); }}
                        className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 shadow-xl ${adMode ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-slate-900/90 border-slate-700 text-blue-400 hover:bg-slate-800 hover:border-blue-500'}`}
                    >
                        {adMode ? <X size={24}/> : <Plus size={24}/>}
                        <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                            {adMode ? 'Cancel Ad' : 'Post Free Ad'}
                        </span>
                    </button>

                    {/* Infra Scanner Button */}
                    <button 
                        onClick={() => setInfraMode(!infraMode)}
                        className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 shadow-xl ${infraMode ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-900/90 border-slate-700 text-emerald-400 hover:bg-slate-800 hover:border-emerald-500'}`}
                    >
                        <Activity size={22}/>
                        <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                            Infra Scanner
                        </span>
                    </button>

                    {/* Growth Radar Button */}
                    <button 
                        onClick={() => setRadarMode(!radarMode)}
                        className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 shadow-xl ${radarMode ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'bg-slate-900/90 border-slate-700 text-purple-400 hover:bg-slate-800 hover:border-purple-500'}`}
                    >
                        <Globe size={22}/>
                        <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                            Growth Radar
                        </span>
                    </button>

                    {/* Audit Request Button */}
                    <button 
                        onClick={() => setShowPremiumRequest(true)}
                        className="group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 border-yellow-500/50 bg-slate-900/90 text-yellow-400 hover:bg-yellow-500 hover:text-slate-900 shadow-xl"
                    >
                        <ShieldCheck size={22}/>
                        <span className="absolute right-16 bg-slate-900 text-yellow-400 text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-yellow-500">
                            Request Audit
                        </span>
                    </button>
                    
                    {/* Govt Links Button */}
                    <button 
                        onClick={() => setShowLinksModal(true)}
                        className="group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 border-slate-700 bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-500 shadow-xl mt-4"
                    >
                        <Link size={20}/>
                        <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700">
                            Govt Verifications
                        </span>
                    </button>

                    {/* --- NEW: SPARK AI BUTTON --- */}
                    <button 
                        onClick={() => setIsSparkOpen(!isSparkOpen)}
                        className="group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 border-indigo-500/50 bg-gradient-to-br from-indigo-600 to-purple-700 text-white hover:scale-110 shadow-[0_0_20px_rgba(79,70,229,0.5)] mt-4 animate-bounce-slow"
                    >
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Spark&backgroundColor=transparent" alt="Spark" className="w-8 h-8" />
                        <span className="absolute right-16 bg-indigo-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-indigo-500">
                            Ask Spark AI
                        </span>
                    </button>

                </div>
            )}


            {/* ========================================================= */}
            {/* --- 4. MOBILE BOTTOM NAVIGATION (Intact) --- */}
            {/* ========================================================= */}
            <div className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around py-3 md:hidden z-[3000] safe-area-bottom">
                <button onClick={() => setViewMode('MARKETPLACE')} className={`flex flex-col items-center gap-1 ${viewMode === 'MARKETPLACE' ? 'text-emerald-400' : 'text-slate-500'}`}><Map size={20}/> <span className="text-[10px] font-bold">Map</span></button>
                <button onClick={() => { if (!adMode) { setAdMode(true); setNewAdLocation(null); alert("Tap map to post ad."); } else { setAdMode(null); }}} className="relative -top-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] border-4 border-slate-900 transform active:scale-95 transition-transform">{adMode ? <X size={24}/> : <Plus size={24}/>}</button>
                <button onClick={() => setInfraMode(!infraMode)} className={`flex flex-col items-center gap-1 transition-all ${infraMode ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}><Activity size={20}/> <span className="text-[10px] font-bold">Scanner</span></button>
                <button onClick={() => setRadarMode(!radarMode)} className={`flex flex-col items-center gap-1 ${radarMode ? 'text-purple-400' : 'text-slate-500'}`}><Globe size={20}/> <span className="text-[10px] font-bold">Radar</span></button>
            </div>
        </>
    );
};