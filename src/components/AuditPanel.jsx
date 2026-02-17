import React from 'react';
import { ShieldCheck, Layers, MapPin, Zap, ChevronRight, X } from 'lucide-react';

const AuditPanel = ({ property, onClose, requestExpertAudit }) => {
    if (!property) return null;

    return (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center md:justify-end md:items-start md:pt-20 md:pr-4 pointer-events-none">
            <div className="bg-slate-900 border border-slate-700 w-full md:w-96 h-auto md:max-h-[80vh] shadow-2xl rounded-t-2xl md:rounded-xl pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-right fade-in duration-300">
                
                {/* Header */}
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-white font-bold text-base">Due Diligence Audit</h3>
                        <p className="text-blue-400 text-[10px] uppercase tracking-wider">Property ID: {property.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                    {/* STEP 1: RERA */}
                    <div className="mb-6 relative pl-4 border-l-2 border-slate-700">
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-slate-900"/>
                        <h4 className="text-slate-200 font-bold text-sm mb-1 flex items-center gap-2"><ShieldCheck size={16} className="text-green-500"/> 1. Verify RERA Status</h4>
                        <p className="text-xs text-slate-400 mb-3">Ensure this venture is legally approved by TSRERA.</p>
                        <button onClick={() => window.open('https://rera.telangana.gov.in/', '_blank')} className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 py-2 px-3 rounded flex items-center justify-between transition-colors">Open TG RERA Portal <ChevronRight size={14}/></button>
                    </div>

                    {/* STEP 2: Dharani */}
                    <div className="mb-6 relative pl-4 border-l-2 border-slate-700">
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-slate-900"/>
                        <h4 className="text-slate-200 font-bold text-sm mb-1 flex items-center gap-2"><Layers size={16} className="text-yellow-500"/> 2. Title & Prohibitions</h4>
                        <p className="text-xs text-slate-400 mb-3">Check Dharani records for "Prohibited List" status.</p>
                        <button onClick={() => window.open('https://dharani.telangana.gov.in/', '_blank')} className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 py-2 px-3 rounded flex items-center justify-between transition-colors">Open Dharani Records <ChevronRight size={14}/></button>
                    </div>

                    {/* STEP 3: HMDA */}
                    <div className="mb-6 relative pl-4 border-l-2 border-slate-700">
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-slate-900"/>
                        <h4 className="text-slate-200 font-bold text-sm mb-1 flex items-center gap-2"><MapPin size={16} className="text-purple-500"/> 3. Zoning & FTL</h4>
                        <p className="text-xs text-slate-400 mb-3">Verify HMDA Master Plan (Residential vs FTL/Buffer).</p>
                        <button onClick={() => window.open('https://www.hmda.gov.in/', '_blank')} className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 py-2 px-3 rounded flex items-center justify-between transition-colors">Check Master Plan <ChevronRight size={14}/></button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                    <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3">
                        <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2"><Zap size={14} className="text-yellow-400 fill-yellow-400"/> Confusion? We can help.</h4>
                        <button onClick={requestExpertAudit} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg mt-2">Request Expert Audit (₹499)</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AuditPanel;