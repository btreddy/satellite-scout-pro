import React from 'react';
import { ChevronRight, MessageCircle, Zap, ShieldCheck, Map, Layers } from 'lucide-react';

const LandingPage = ({ onEnter, adminPhone }) => {
    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md text-white flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
            
            {/* 1. BRANDING SECTION */}
            <div className="text-center mb-8 max-w-2xl mt-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-lg animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"/> Live Satellite Feed • Hyderabad
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2 drop-shadow-2xl">
                    SAFE LAND
                </h1>
                <p className="text-slate-300 text-lg md:text-xl font-light tracking-wide mb-8 drop-shadow-md">
                    The <span className="text-white font-bold border-b-2 border-blue-500">Intelligence Console</span> for Land Buyers.
                </p>

                {/* 2. VALUE CARDS (Glass Effect) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left w-full">
                    <div className="bg-black/40 border border-white/10 p-5 rounded-2xl backdrop-blur-md hover:bg-black/50 transition-colors">
                        <ShieldCheck className="text-green-400 mb-3" size={28}/>
                        <h3 className="font-bold text-sm text-white">FTL & Buffer Checks</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">Instant analysis of water body proximity and buffer zones.</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 p-5 rounded-2xl backdrop-blur-md hover:bg-black/50 transition-colors">
                        <Layers className="text-yellow-400 mb-3" size={28}/>
                        <h3 className="font-bold text-sm text-white">Zone Overlay</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">Distinguish between Residential, Commercial, and Bio-zones.</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 p-5 rounded-2xl backdrop-blur-md hover:bg-black/50 transition-colors">
                        <Map className="text-blue-400 mb-3" size={28}/>
                        <h3 className="font-bold text-sm text-white">Ground Reality</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">High-res satellite views to measure actual road widths.</p>
                    </div>
                </div>
            </div>

            {/* 3. MAIN ACTION (Centered - No Ghost Blocks) */}
            <div className="mt-8 mb-8 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <button 
                    onClick={onEnter} 
                    className="relative bg-blue-600 hover:bg-blue-500 text-white text-lg font-black px-12 py-5 rounded-full shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105"
                >
                    ENTER CONSOLE <ChevronRight size={24} className="animate-bounce-right"/>
                </button>
            </div>

            {/* 4. FOOTER BUTTONS (Pro Styling) */}
            <div className="flex flex-wrap justify-center gap-4 mt-auto md:mt-4 mb-8">
                <button 
                    onClick={() => window.open('https://safelanddeal.com/meet/', '_blank')} 
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 backdrop-blur-md transition-all group"
                >
                    <div className="p-1.5 bg-purple-500/20 rounded-full group-hover:bg-purple-500/40">
                        <Zap size={16} className="text-purple-300"/>
                    </div>
                    <span className="text-sm font-bold text-purple-100">Ask Spark AI</span>
                </button>

                <button 
                    onClick={() => window.open(`https://wa.me/${adminPhone}`, '_blank')} 
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800/40 hover:bg-slate-800/60 border border-slate-600/30 backdrop-blur-md transition-all group"
                >
                    <div className="p-1.5 bg-green-500/20 rounded-full group-hover:bg-green-500/40">
                        <MessageCircle size={16} className="text-green-400"/>
                    </div>
                    <span className="text-sm font-bold text-slate-200">Founder Line</span>
                </button>
            </div>
        </div>
    );
};
export default LandingPage;