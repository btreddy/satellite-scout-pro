import React from 'react';
import { Crosshair, Search, Lock, Unlock, Store, PenTool, List, ShieldCheck, Globe, PlusCircle, Radar, Zap, X, Home, Award, LayoutGrid, Activity } from 'lucide-react';

export const SmartNav = ({ 
    isAdmin, viewMode, setViewMode, 
    setShowPinModal, setShowPremiumRequest, setShowLinksModal, 
    setIsSearchOpen, isSearchOpen, searchQuery, setSearchQuery, 
    handleSearch, adMode, setAdMode, radarMode, setRadarMode, 
    setNewAdLocation, infraMode, setInfraMode  // <--- ADDED THESE TWO!
}) => {
    return (
        <>
            {/* ================================================================================== */}
            {/* --- 1. MOBILE TOP HEADER (Dark & Clean) --- */}
            {/* ================================================================================== */}
            <header className="bg-slate-900/95 backdrop-blur-md px-4 py-3 flex justify-between items-center z-[2000] shadow-2xl border-b border-slate-800 text-white md:hidden">
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-1.5 rounded-lg shadow-lg shadow-blue-900/50">
                        <Crosshair size={18} className="animate-spin-slow" />
                    </div>
                    <h1 className="text-sm font-black tracking-tighter">SAFE LAND</h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`${isSearchOpen ? 'text-blue-400' : 'text-slate-400'}`}><Search size={20}/></button>
                    <button onClick={() => setShowPinModal(true)}>{isAdmin ? <Unlock size={20} className="text-green-400"/> : <Lock size={20} className="text-slate-400"/>}</button>
                </div>
            </header>

            {/* --- MOBILE SEARCH BAR EXPANSION --- */}
            {isSearchOpen && (
                <div className="bg-slate-900 p-3 md:hidden z-[1999] border-b border-slate-800 animate-in slide-in-from-top-2">
                    <div className="flex gap-2">
                        <input autoFocus placeholder="Search Location..." className="w-full p-2 rounded-lg text-sm outline-none bg-slate-800 text-white placeholder-slate-500 border border-slate-700" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
                        <button onClick={() => setIsSearchOpen(false)} className="text-slate-400"><X size={20}/></button>
                    </div>
                </div>
            )}

            {/* ================================================================================== */}
            {/* --- 2. DESKTOP TOP HEADER (Professional Console) --- */}
            {/* ================================================================================== */}
            <header className="hidden md:flex bg-slate-900/95 backdrop-blur-md px-6 py-3 justify-between items-center z-[2000] border-b border-slate-800 text-white">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-1.5 rounded-lg shadow-lg shadow-blue-900/50"><Crosshair size={20} className="animate-spin-slow" /></div>
                    <div><h1 className="text-lg font-black tracking-tighter leading-none">SAFE LAND</h1><p className="text-[9px] text-blue-400 tracking-[0.2em] uppercase">Intelligence Console</p></div>
                </div>
                
                {/* Mode Switcher */}
                <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                    <button onClick={() => setViewMode('MARKETPLACE')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode==='MARKETPLACE' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}><Store size={14}/> Market</button>
                    <button onClick={() => setViewMode('VENTURE')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode==='VENTURE' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}><PenTool size={14}/> Planner</button>
                    {isAdmin && <button onClick={() => setViewMode('ADMIN')} className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode==='ADMIN' ? 'bg-purple-900/50 text-purple-200 border border-purple-500/30' : 'text-slate-400'}`}><List size={14}/> Admin</button>}
                </div>

                <div className="flex gap-3 items-center">
                    <div className="bg-slate-800 px-3 py-1.5 rounded-lg items-center gap-2 border border-slate-700 flex focus-within:border-blue-500/50 transition-colors">
                        <Search size={14} className="text-slate-500"/><input placeholder="Search City..." className="bg-transparent outline-none text-sm w-40 text-white placeholder-slate-600" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
                    </div>
                    <button 
    onClick={() => setShowPremiumRequest(true)} 
    className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)]"> <ShieldCheck size={14}/> Request Audit</button>
                    <button onClick={() => setShowPinModal(true)} className={`p-2 rounded-lg transition-all ${isAdmin ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'text-slate-500 hover:text-white'}`}>{isAdmin ? <Unlock size={16}/> : <Lock size={16}/>}</button>
                </div>
            </header>

            {/* ================================================================================== */}
            {/* --- 3. DESKTOP FLOATING COMMAND BAR (The New "Rich" Look) --- */}
            {/* ================================================================================== */}
            {viewMode === 'MARKETPLACE' && (
                <div className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-[1900] bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 p-2 rounded-2xl shadow-2xl items-center gap-2 animate-in slide-in-from-bottom-10 fade-in duration-500">
                    
                    {/* 1. POST AD (Ghost Style - No Thick Blue) */}
                    <button 
                        onClick={() => { if(!adMode) { setViewMode('MARKETPLACE'); setAdMode('SELL'); setRadarMode(false); alert("Tap map to post"); } else { setAdMode(null); setNewAdLocation(null); } }} 
                        className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs transition-all ${adMode ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:border-blue-400/50'}`}
                    >
                        {adMode ? <X size={16}/> : <PlusCircle size={16}/>} {adMode ? 'Cancel' : 'Post Free Ad'}
                    </button>

                    <div className="w-px h-6 bg-slate-700/50 mx-1"></div>

                    {/* 2. RADAR (Clean Toggle) */}
                    <button 
                        onClick={() => { setRadarMode(!radarMode); setAdMode(null); }} 
                        className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs transition-all ${radarMode ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        {radarMode ? <Zap size={16} className="animate-pulse fill-white"/> : <Radar size={16}/>} {radarMode ? 'Scanning...' : 'Growth Radar'}
                    </button>

                    {/* 3. REGISTRY (Clean Link) */}
                    <button 
    onClick={() => setInfraMode(!infraMode)} 
    className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 text-xs transition-all ${infraMode ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
>
    <Activity size={16}/> {infraMode ? 'Scanning Infra...' : 'Infra Scanner'}
</button>
                </div>
            )}

            {/* ================================================================================== */}
            {/* --- 4. MOBILE BOTTOM NAVIGATION (Dark Mode) --- */}
            {/* ================================================================================== */}
            <div className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around py-3 md:hidden z-[3000] text-[10px] font-bold text-slate-500 safe-area-pb">
                <button onClick={() => setViewMode('MARKETPLACE')} className={`flex flex-col items-center gap-1 ${viewMode==='MARKETPLACE' ? 'text-blue-400' : ''}`}><Home size={20}/> Market</button>
                
                <button onClick={() => { setRadarMode(!radarMode); setAdMode(null); setViewMode('MARKETPLACE'); }} className={`flex flex-col items-center gap-1 ${radarMode ? 'text-purple-400 animate-pulse' : ''}`}><Radar size={20}/> {radarMode ? 'Scanning' : 'Radar'}</button>
                
                <div className="relative -top-6">
                    <button 
                        onClick={() => { if(!adMode) { setViewMode('MARKETPLACE'); setAdMode('SELL'); setRadarMode(false); setIsSearchOpen(true); } else { setAdMode(null); setNewAdLocation(null); } }} 
                        className={`p-4 rounded-full shadow-lg border-4 border-slate-900 ${adMode ? 'bg-red-600 text-white' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}`}
                    >
                        {adMode ? <X size={24}/> : <PlusCircle size={24}/>}
                    </button>
                </div>

                <button onClick={() => setInfraMode(!infraMode)} className={`flex flex-col items-center gap-1 ${infraMode ? 'text-green-500 animate-pulse' : 'hover:text-blue-400'}`}>
    <Activity size={20}/> Infra
</button>
                {isAdmin ? (
                    <button onClick={() => setViewMode('ADMIN')} className={`flex flex-col items-center gap-1 ${viewMode==='ADMIN' ? 'text-purple-400' : ''}`}><List size={20}/> Admin</button>
                ) : (
                    <button onClick={() => setShowPremiumRequest(true)} className="flex flex-col items-center gap-1 text-yellow-500"><Award size={20}/> Audit</button>
                )}
            </div>
        </>
    );
};