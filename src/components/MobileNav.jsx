import React from 'react';
import { Map, PlusCircle, ShieldCheck, PenTool } from 'lucide-react';

const MobileNav = ({ mode, setMode, setNewAdLocation, onVerifyGeneral }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 z-[5000] flex justify-around items-center safe-area-pb">
            <button onClick={() => setMode('market')} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${mode === 'market' ? 'text-blue-400' : 'text-slate-500'}`}><Map size={20} /><span className="text-[10px] font-bold">Market</span></button>
            
            <button onClick={() => setNewAdLocation({ lat: 17.3850, lng: 78.4867 })} className="flex flex-col items-center justify-center -mt-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg border-4 border-slate-900"><PlusCircle size={24} /></button>
            
            <button onClick={onVerifyGeneral} className="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-500 hover:text-green-400"><ShieldCheck size={20} /><span className="text-[10px] font-bold">Verify</span></button>
            
            <button onClick={() => setMode('planner')} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${mode === 'planner' ? 'text-purple-400' : 'text-slate-500'}`}><PenTool size={20} /><span className="text-[10px] font-bold">Planner</span></button>
        </div>
    );
};
export default MobileNav;