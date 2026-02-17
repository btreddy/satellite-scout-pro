import React from 'react';
import { LayoutGrid, PlusCircle, Activity, ShieldCheck } from 'lucide-react';

const IntelligenceDeck = ({ setNewAdLocation, showGrowthRadar, setShowGrowthRadar, onVerifyGeneral }) => {
    return (
        <div className="hidden md:flex fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-700 p-3 justify-between items-center z-[4000] px-8 shadow-2xl">
            {/* LEFT: TOOLS */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] tracking-[0.2em] uppercase border-r border-slate-700 pr-4 mr-2">
                    <LayoutGrid size={16} /> Console Tools
                </div>
                <button onClick={() => setNewAdLocation({ lat: 17.3850, lng: 78.4867 })} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg transition-all"><PlusCircle size={16} /> Post Free Ad</button>
                <button onClick={() => setShowGrowthRadar(!showGrowthRadar)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs border transition-all ${showGrowthRadar ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                    <Activity size={16} className={showGrowthRadar ? "animate-pulse" : ""} /> {showGrowthRadar ? "Radar Active" : "Growth Radar"}
                </button>
            </div>

            {/* CENTER: TICKER */}
            <div className="text-slate-600 text-[10px] tracking-widest font-mono hidden lg:block">Running • Vertex AI • v18.3</div>

            {/* RIGHT: AUDIT */}
            <div className="flex items-center gap-4">
                <button onClick={onVerifyGeneral} className="flex items-center gap-2 bg-green-900/30 hover:bg-green-600/20 text-green-400 border border-green-600/30 px-5 py-2 rounded-lg font-bold text-xs transition-all"><ShieldCheck size={16} /> Verify Land (General)</button>
            </div>
        </div>
    );
};
export default IntelligenceDeck;