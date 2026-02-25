import React from 'react';
import { ChevronRight, Map, Users, ShieldCheck, Sparkles, ScanEye, MapPin } from 'lucide-react';

const MainShowcase = ({ onEnter, setIsSparkOpen }) => {
    return (
        <div className="fixed inset-0 z-[5000] bg-slate-950 text-white overflow-hidden flex flex-col md:flex-row">
            
            {/* BACKGROUND ANIMATION */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[100px] animate-pulse"/>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 rounded-full blur-[100px] animate-pulse delay-1000"/>
            </div>

            {/* --- LEFT SIDE: HERO (40%) --- */}
            <div className="relative z-10 w-full md:w-[40%] flex flex-col justify-center px-8 md:px-12 py-10 bg-slate-900/50 backdrop-blur-sm border-r border-slate-800/50">
                
                {/* LOGO SECTION */}
                <div className="absolute top-8 left-8 md:left-12 flex items-center gap-3">
                    <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-900/50">
                        <ScanEye size={24} className="text-white"/>
                    </div>
                    <div>
                        <h1 className="font-black text-xl tracking-tighter leading-none text-white">SAFE LAND</h1>
                        <p className="text-[9px] text-emerald-400 font-bold tracking-[0.2em] uppercase">Intelligence Console</p>
                    </div>
                </div>

                <div className="mt-12 md:mt-0">
                    <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-lg">
                        <Sparkles size={10} className="text-yellow-400"/> V20.0 Golden Master
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-100 to-slate-500 mb-6 drop-shadow-2xl">
                        SAFE LAND
                    </h1>
                    <p className="text-slate-300 text-lg font-light leading-relaxed mb-8 max-w-md">
                        The world's first <span className="text-emerald-400 font-bold">Map-Based Advertising</span> & <span className="text-yellow-400 font-bold">Risk Audit</span> engine.
                        <br/><span className="text-sm opacity-60 mt-2 block">Stop guessing. Start scanning.</span>
                    </p>

                    <button 
                        onClick={onEnter} 
                        className="group w-fit bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all transform hover:translate-x-2 flex items-center gap-3"
                    >
                        ENTER CONSOLE <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                </div>

                {/* FOOTER: POLICY & COPYRIGHT */}
                <div className="absolute bottom-6 left-8 md:left-12 flex flex-col gap-1">
                    <div className="text-[10px] text-slate-500 font-medium">
                        &copy; 2026 Safe Land Intelligence. All rights reserved.
                    </div>
                    <div className="flex gap-4 text-[10px] text-slate-600 font-bold tracking-wide">
                        <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
                        <span>•</span>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
                        <span>•</span>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Agent Login</a>
                    </div>
                </div>
            </div>

            {/* --- RIGHT SIDE: FEATURE GRID (60%) --- */}
            <div className="relative z-10 w-full md:w-[60%] p-6 md:p-12 flex items-center justify-center bg-slate-950/50">
                
                {/* --- TOP RIGHT LOCATION BADGE (New) --- */}
                <div className="absolute top-8 right-8 md:right-12 flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                    <div className="bg-slate-800 p-1.5 rounded-full">
                        <MapPin size={14} className="text-emerald-400"/>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Telangana, India</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase leading-none mt-0.5">Real Estate Intelligence</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mt-10 md:mt-0">
                    
                    {/* CARD 1: OWNERS */}
                    <div className="bg-slate-900/60 border border-slate-700 p-6 rounded-2xl hover:border-emerald-500/50 transition-all hover:-translate-y-1 group cursor-default shadow-2xl">
                        <Map className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" size={28}/>
                        <h3 className="text-xl font-bold text-white mb-2">Plot Owners</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">Pin your Reality. Create "Land Ads" on the map, not just text lists.</p>
                    </div>

                    {/* CARD 2: DEVELOPERS */}
                    <div className="bg-slate-900/60 border border-slate-700 p-6 rounded-2xl hover:border-yellow-500/50 transition-all hover:-translate-y-1 group cursor-default shadow-2xl">
                        <Users className="text-yellow-400 mb-3 group-hover:scale-110 transition-transform" size={28}/>
                        <h3 className="text-xl font-bold text-white mb-2">Developers</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">One Venture, 100 Agents. Track leads individually with "Agent Mode".</p>
                    </div>

                    {/* CARD 3: INVESTORS */}
                    <div className="bg-slate-900/60 border border-slate-700 p-6 rounded-2xl hover:border-blue-500/50 transition-all hover:-translate-y-1 group cursor-default md:col-span-2 shadow-2xl">
                        <ShieldCheck className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={28}/>
                        <h3 className="text-xl font-bold text-white mb-2">Investors (Audit)</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">Don't buy blind. Check FTL zones, Road Widths, and Legal Risks instantly.</p>
                    </div>

                </div>
            </div>

            {/* --- FLOATING SPARK AVATAR (Correct Link) --- */}
            <div className="fixed bottom-6 right-6 z-50 animate-bounce-slow">
                 <button 
  onClick={() => setIsSparkOpen(true)}
  className="relative bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
>
  {/* The Glowing Neon Badge */}
  <span className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] uppercase font-extrabold px-2 py-1 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)] border border-green-400 z-10">
    100% Free
  </span>
  
  Ask Spark AI ✨
</button>
            </div>
            
        </div>
    );
};

export default MainShowcase;