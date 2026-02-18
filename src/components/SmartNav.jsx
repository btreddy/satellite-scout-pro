import React from 'react';
import { Search, Map, PenTool, Lock, Unlock, X, Plus, Activity, ShieldCheck, ScanEye, PlusCircle } from 'lucide-react';

export const SmartNav = ({ 
    setShowLanding, 
    isAdmin, setIsAdmin, // <--- ACCEPT THE KEY
    viewMode, setViewMode, 
    setShowPinModal, setShowPremiumRequest, setShowLinksModal, 
    setIsSearchOpen, isSearchOpen, searchQuery, setSearchQuery, 
    handleSearch, adMode, setAdMode, radarMode, setRadarMode, 
    setNewAdLocation, infraMode, setInfraMode
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
            {/* --- 1. MOBILE TOP HEADER --- */}
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

            {/* --- 2. DESKTOP FLOATING HEADER (With Post Ad Button) --- */}
            <div className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl text-white px-4 py-2 rounded-2xl shadow-2xl border border-slate-700/50 items-center gap-4 z-[2000] min-w-[800px] justify-between">
                <div onClick={() => setShowLanding(true)} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity pr-4 border-r border-slate-700">
                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-2 rounded-xl shadow-lg"><ScanEye size={20} className="text-white"/></div>
                    <div><h1 className="font-black text-lg tracking-tighter leading-none">SAFE LAND</h1><p className="text-[8px] text-emerald-400 font-bold tracking-[0.2em]">INTELLIGENCE</p></div>
                </div>

                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button onClick={() => setViewMode('MARKETPLACE')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-2 ${viewMode === 'MARKETPLACE' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}><Map size={12}/> Ad Land</button>
                    <button onClick={() => setViewMode('VENTURE')} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-2 ${viewMode === 'VENTURE' ? 'bg-emerald-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}><PenTool size={12}/> Planner</button>
                    <button onClick={() => { if(isAdmin) setViewMode('ADMIN'); else setShowPinModal(true); }} className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-2 ${viewMode === 'ADMIN' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}><Lock size={12}/> Admin</button>
                </div>

                <div className="flex items-center gap-2 pl-4 border-l border-slate-700">
                    {/* --- NEW: POST AD BUTTON (DESKTOP) --- */}
                    <button 
                        onClick={() => { setAdMode(true); setNewAdLocation(null); alert("Tap the map to place your Ad."); }} 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg"
                    >
                        <PlusCircle size={14}/> Post Ad
                    </button>

                    <div className="relative group"><input className="bg-slate-950 border border-slate-700 text-white pl-8 pr-3 py-1.5 rounded-lg text-xs font-bold w-28 focus:w-40 transition-all outline-none focus:border-emerald-500" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} /><Search className="absolute left-2.5 top-2 text-slate-500 group-focus-within:text-emerald-400" size={12}/></div>
                    <button onClick={() => setInfraMode(!infraMode)} className={`p-2 rounded-lg transition-all border ${infraMode ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}><Activity size={16}/></button>
                    <button onClick={() => setShowPremiumRequest(true)} className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all"><ShieldCheck size={14}/> Audit</button>
                    
                    {/* --- LOGOUT / LOCK BUTTON --- */}
                    <button onClick={handleLockAction} className={`p-2 rounded-lg transition-colors ml-1 ${isAdmin ? 'text-red-400 hover:bg-red-900/30' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`} title={isAdmin ? "Logout" : "Admin Login"}>
                        {isAdmin ? <Unlock size={16}/> : <Lock size={16}/>}
                    </button>
                </div>
            </div>

            {/* --- 3. MOBILE BOTTOM NAVIGATION --- */}
            <div className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around py-3 md:hidden z-[3000] safe-area-bottom">
                <button onClick={() => setViewMode('MARKETPLACE')} className={`flex flex-col items-center gap-1 ${viewMode === 'MARKETPLACE' ? 'text-emerald-400' : 'text-slate-500'}`}><Map size={20}/> <span className="text-[10px] font-bold">Map</span></button>
                <button onClick={() => { if (!adMode) { setAdMode(true); setNewAdLocation(null); alert("Tap map to post ad."); } else { setAdMode(null); }}} className="relative -top-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)] border-4 border-slate-900 transform active:scale-95 transition-transform">{adMode ? <X size={24}/> : <Plus size={24}/>}</button>
                <button onClick={() => setInfraMode(!infraMode)} className={`flex flex-col items-center gap-1 transition-all ${infraMode ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`}><Activity size={20}/> <span className="text-[10px] font-bold">Scanner</span></button>
                <button onClick={() => setRadarMode(!radarMode)} className={`flex flex-col items-center gap-1 ${radarMode ? 'text-purple-400' : 'text-slate-500'}`}><ShieldCheck size={20}/> <span className="text-[10px] font-bold">Audit</span></button>
            </div>
        </>
    );
};