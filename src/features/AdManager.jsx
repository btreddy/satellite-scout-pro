import React from 'react';
import { X, UploadCloud, Mic, Video, Navigation, Edit, ShieldCheck, FileText, CheckCircle, Wind, Maximize2, Minimize2, Phone, Share2, MessageCircle } from 'lucide-react';

// --- 1. POST AD MODAL ---
// --- 1. POST AD MODAL (Updated with Coordinates) ---
export const PostAdModal = ({ newAdLocation, setNewAdLocation, setAdMode, newAdData, setNewAdData, handleFileUpload, handlePostAd, uploading }) => {
    if(!newAdLocation) return null;

    // Helper to update coords if user types them manually
    const updateCoords = (key, value) => {
        const newLoc = { ...newAdLocation, [key]: parseFloat(value) };
        setNewAdLocation(newLoc);
    };

    return (
        <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-4 md:w-80 md:right-auto z-[5000] bg-white p-4 rounded-xl shadow-2xl border-2 border-blue-500 animate-in slide-in-from-bottom-10 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
                <h3 className="font-bold text-blue-600">Post New Ad</h3>
                <button onClick={() => { setNewAdLocation(null); setAdMode(null); }} className="bg-gray-100 p-1 rounded-full"><X size={16}/></button>
            </div>
            
            <div className="space-y-3">
                {/* --- NEW: COORDINATE EDITOR --- */}
                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-blue-800 flex items-center gap-1"><Navigation size={10}/> EXACT LOCATION</label>
                        <span className="text-[9px] text-blue-500 cursor-pointer hover:underline" onClick={() => navigator.clipboard.readText().then(t => { try{ const [lat,lng]=t.split(','); if(lat&&lng) setNewAdLocation({lat:parseFloat(lat), lng:parseFloat(lng)}) }catch(e){} })}>Paste from Maps</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" step="any" className="w-full border p-1 rounded text-xs font-mono" placeholder="Lat" value={newAdLocation.lat || ''} onChange={(e) => updateCoords('lat', e.target.value)} />
                        <input type="number" step="any" className="w-full border p-1 rounded text-xs font-mono" placeholder="Lng" value={newAdLocation.lng || ''} onChange={(e) => updateCoords('lng', e.target.value)} />
                    </div>
                </div>

                <select className="w-full border p-2 rounded text-sm font-bold" onChange={e => setNewAdData({...newAdData, type: e.target.value})}><option value="SELL">Sell Plot</option><option value="LOOKING">Looking For</option></select>
                <div className="flex gap-2"><input placeholder="Size (Yds)" type="number" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, size: e.target.value})} /><input placeholder="Price" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, price: e.target.value})} /></div>
                <input placeholder="WhatsApp Number" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, contact: e.target.value})} />
                <textarea placeholder="Description (Road width, facing...)" className="w-full border p-2 rounded text-sm h-16" onChange={e => setNewAdData({...newAdData, desc: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-2">
                    <div className={`border border-dashed p-2 rounded text-center ${newAdData.image_url ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}><label className="text-xs cursor-pointer block"><UploadCloud size={14} className={`mx-auto ${newAdData.image_url ? 'text-green-600' : 'text-gray-400'}`}/><span className={newAdData.image_url ? 'text-green-700 font-bold' : ''}>{newAdData.image_url ? '✅ Ready' : 'Photo'}</span><input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} /></label></div>
                    <div className={`border border-dashed p-2 rounded text-center ${newAdData.audio_url ? 'border-green-500 bg-green-50' : 'border-purple-300'}`}><label className="text-xs cursor-pointer block"><Mic size={14} className={`mx-auto ${newAdData.audio_url ? 'text-green-600' : 'text-purple-400'}`}/><span className={newAdData.audio_url ? 'text-green-700 font-bold' : ''}>{newAdData.audio_url ? '✅ Ready' : 'Audio'}</span><input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} /></label></div>
                </div>
                
                <input placeholder="Video Link (YouTube)" className="w-full border p-2 rounded text-sm bg-gray-50" onChange={e => setNewAdData({...newAdData, video_url: e.target.value})} />
                <button onClick={handlePostAd} disabled={uploading || !newAdData.contact || !newAdData.price} className={`w-full py-2 rounded font-bold ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{uploading ? 'Uploading...' : 'Submit Ad'}</button>
            </div>
        </div>
    );
};

// --- 2. EDIT AD MODAL ---
export const EditAdModal = ({ editingAd, setEditingAd, handleFileUpload, handleUpdateAd }) => {
    if(!editingAd) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4 border-b pb-2"><h3 className="font-bold text-lg flex items-center gap-2"><Edit size={16}/> Edit Ad</h3><button onClick={()=>setEditingAd(null)} className="hover:bg-gray-100 p-1 rounded"><X size={20}/></button></div>
                <div className="space-y-3">
                    <div className="bg-blue-50 p-2 rounded border border-blue-100">
                        <div className="flex justify-between"><label className="text-xs font-bold text-blue-800 flex items-center gap-1"><Navigation size={12}/> Satellite Coordinates</label><span className="text-[10px] text-blue-600 cursor-pointer" onClick={() => navigator.clipboard.readText().then(text => { try { const [lat, lng] = text.split(','); if(lat && lng) setEditingAd({...editingAd, lat: lat.trim(), lng: lng.trim()}); } catch(e){} })}>Paste from Maps</span></div>
                        <div className="grid grid-cols-2 gap-2 mt-1"><input type="number" step="any" className="w-full border p-1 rounded text-xs" placeholder="Latitude" value={editingAd.lat || ''} onChange={e => setEditingAd({...editingAd, lat: e.target.value})} /><input type="number" step="any" className="w-full border p-1 rounded text-xs" placeholder="Longitude" value={editingAd.lng || ''} onChange={e => setEditingAd({...editingAd, lng: e.target.value})} /></div>
                    </div>
                    <div><label className="text-xs font-bold text-gray-500">Price</label><input className="w-full border p-2 rounded text-sm font-bold" value={editingAd.price} onChange={e => setEditingAd({...editingAd, price: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500">Size</label><input className="w-full border p-2 rounded text-sm" value={editingAd.size} onChange={e => setEditingAd({...editingAd, size: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500">Contact</label><input className="w-full border p-2 rounded text-sm" value={editingAd.contact_info} onChange={e => setEditingAd({...editingAd, contact_info: e.target.value})} /></div>
                    <div><label className="text-xs font-bold text-gray-500">Description</label><textarea className="w-full border p-2 rounded text-sm h-16" value={editingAd.description || ''} onChange={e => setEditingAd({...editingAd, description: e.target.value})} /></div>
                    <div className="border border-dashed border-gray-300 p-2 rounded bg-gray-50 text-center"><label className="text-xs font-bold text-gray-500 flex items-center justify-center gap-1 cursor-pointer"><UploadCloud size={14}/> Change Photo<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image', true)} /></label>{editingAd.image_url && <img src={editingAd.image_url} alt="Preview" className="h-10 w-full object-contain mt-2"/>}</div>
                    <div className="border border-dashed border-purple-300 p-2 rounded bg-purple-50 text-center"><label className="text-xs font-bold text-purple-600 flex items-center justify-center gap-1 cursor-pointer"><Mic size={14}/> Change Voice Note<input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio', true)} /></label>{editingAd.audio_url && <audio controls src={editingAd.audio_url} className="w-full h-6 mt-2"/>}</div>
                    <div><label className="text-xs font-bold text-gray-500">Video Link</label><input className="w-full border p-2 rounded text-sm" value={editingAd.video_url || ''} onChange={e => setEditingAd({...editingAd, video_url: e.target.value})} /></div>
                    <div className="flex gap-2 pt-2"><button onClick={()=>setEditingAd(null)} className="flex-1 bg-gray-200 py-2 rounded font-bold text-xs">Cancel</button><button onClick={handleUpdateAd} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold text-xs hover:bg-blue-700">Save Changes</button></div>
                </div>
            </div>
        </div>
    );
};

// --- 3. TRUTH ENGINE (AUDIT) MODAL ---
export const TruthEngineModal = ({ showRatingModal, setShowRatingModal, ratingData, setRatingData, generatePDF }) => {
    if(!showRatingModal) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[7000] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-4 text-white flex justify-between items-center shrink-0"><div><h2 className="font-bold flex items-center gap-2 text-lg"><ShieldCheck className="text-yellow-400"/> Truth & Risk Engine</h2></div><button onClick={() => setShowRatingModal(false)} className="hover:bg-white/20 p-1 rounded"><X size={20}/></button></div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200"><h3 className="text-xs font-black text-blue-800 uppercase mb-3 flex items-center gap-1"><FileText size={12}/> 1. Evidence Locker (Upload Proofs)</h3><div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-500 text-center"><div className="border border-dashed border-gray-300 p-2 rounded bg-white"><label className="cursor-pointer block"><UploadCloud size={14} className="mx-auto mb-1"/> Approval Doc<input type="file" className="hidden"/></label></div><div className="border border-dashed border-gray-300 p-2 rounded bg-white"><label className="cursor-pointer block"><UploadCloud size={14} className="mx-auto mb-1"/> EC / Link Doc<input type="file" className="hidden"/></label></div></div></div>
                    <div className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200"><h3 className="text-xs font-black text-slate-500 uppercase mb-3 flex items-center gap-1"><CheckCircle size={12}/> 2. The Human Feed (Facts)</h3><div className="grid grid-cols-2 gap-4 mb-3"><div><label className="text-[10px] font-bold text-gray-500">Authority Status</label><select className="w-full border p-2 rounded text-sm mt-1 font-bold" onChange={(e) => setRatingData({...ratingData, approval: e.target.value})}><option value="Unapproved">Unapproved / GP</option><option value="HMDA">HMDA Approved</option><option value="DTCP">DTCP Approved</option></select></div><div><label className="text-[10px] font-bold text-gray-500">Full Tank Level (FTL)?</label><select className="w-full border p-2 rounded text-sm mt-1 font-bold text-red-600" onChange={(e) => setRatingData({...ratingData, isInFTL: e.target.value === 'YES'})}><option value="NO">Outside FTL (Safe)</option><option value="YES">INSIDE FTL (DANGER)</option></select></div></div><div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-bold text-gray-500">Road Width (ft)</label><input type="number" className="w-full border p-2 rounded text-sm font-bold" placeholder="e.g. 30" onChange={(e) => setRatingData({...ratingData, roadWidth: e.target.value})}/></div><div className="flex items-center gap-2 mt-4"><input type="checkbox" className="w-4 h-4" onChange={(e) => setRatingData({...ratingData, hasEc: e.target.checked})}/><label className="text-xs font-bold">EC Available?</label></div></div></div>
                    <div className="mb-4 bg-green-50 p-4 rounded-lg border border-green-200"><h3 className="text-xs font-black text-green-800 uppercase mb-3 flex items-center gap-1"><Wind size={12}/> 3. Vaastu & Environment</h3><div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-bold text-gray-500">Pollution / Noise?</label><select className="w-full border p-2 rounded text-sm mt-1 font-bold" onChange={(e) => setRatingData({...ratingData, pollution: e.target.value})}><option value="None">None (Peaceful)</option><option value="Industrial">Industrial Zone</option><option value="Highway">High Noise</option></select></div><div><label className="text-[10px] font-bold text-gray-500">Vaastu Compliance</label><select className="w-full border p-2 rounded text-sm mt-1 font-bold" onChange={(e) => setRatingData({...ratingData, vaastu: e.target.value})}><option value="Good">Good (100%)</option><option value="Average">Average (50%)</option><option value="Bad">Bad (0%)</option></select></div></div></div>
                </div>
                <div className="p-4 border-t bg-white shrink-0"><button onClick={() => generatePDF(false)} className="w-full bg-indigo-900 text-white py-3 rounded-lg font-bold hover:bg-black flex items-center justify-center gap-2 shadow-lg"><FileText size={18}/> Generate Truth Report (PDF)</button></div>
            </div>
        </div>
    );
};

// --- 4. VIEW AD (VISITOR) MODAL ---
export const ViewAdModal = ({ viewingAd, setViewingAd, setFullScreenImage, setMinimizedAd, agentPhone, handleShareAd }) => {
    if(!viewingAd) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex justify-center items-center p-4 animate-in fade-in">
            <div className={`rounded-xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl ${viewingAd.price === '0' ? 'bg-slate-900 text-white border-2 border-yellow-500' : 'bg-white'}`}>
                <div className="h-48 relative bg-gray-100 group">
                    {viewingAd.image_url ? <img src={viewingAd.image_url} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setFullScreenImage(viewingAd.image_url)}/> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">NO IMAGE</div>}
                    {viewingAd.image_url && <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100"><Maximize2 className="text-white"/></div>}
                    <button onClick={() => { setMinimizedAd(viewingAd); setViewingAd(null); }} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black"><Minimize2 size={20}/></button>
                    {viewingAd.price === '0' && <div className="absolute bottom-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><ShieldCheck size={12}/> OFFICIAL PLATFORM</div>}
                </div>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-2"><div><h2 className={`text-2xl font-black ${viewingAd.price === '0' ? 'text-yellow-400' : 'text-slate-800'}`}>{viewingAd.price === '0' ? 'JOIN NOW (FREE)' : viewingAd.price}</h2><p className={`text-sm font-bold ${viewingAd.price === '0' ? 'text-gray-400' : 'text-slate-500'}`}>{viewingAd.size} | {viewingAd.ad_type}</p></div></div>
                    {viewingAd.description && <div className={`text-sm mb-4 p-3 rounded-lg border max-h-60 overflow-y-auto custom-scrollbar whitespace-pre-wrap ${viewingAd.price === '0' ? 'bg-slate-800 border-slate-700 text-gray-300' : 'bg-slate-50 text-gray-700 border-slate-200'}`}>{viewingAd.description}</div>}
                    {viewingAd.audio_url && <div className={`mb-4 p-2 rounded border ${viewingAd.price === '0' ? 'bg-slate-800 border-slate-700' : 'bg-purple-50 border-purple-100'}`}><p className={`text-xs font-bold flex items-center gap-1 mb-1 ${viewingAd.price === '0' ? 'text-yellow-500' : 'text-purple-700'}`}><Mic size={12}/> Voice Note</p><audio controls src={viewingAd.audio_url} className="w-full h-8" style={{ filter: viewingAd.price === '0' ? 'invert(1)' : 'none' }} /></div>}
                    <div className="space-y-2">
                        <button onClick={() => window.open(`https://wa.me/${agentPhone ? agentPhone : viewingAd.contact_info}`, '_blank')} className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${viewingAd.price === '0' ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-green-600 text-white hover:bg-green-700'}`}><MessageCircle size={18}/> {agentPhone ? 'WhatsApp Agent' : 'WhatsApp Owner'}</button>
                        <div className="flex gap-2">
                            {viewingAd.video_url && <button onClick={() => window.open(viewingAd.video_url, '_blank')} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-red-700 shadow-md"><Video size={14}/> Watch Video</button>}
                            <button onClick={() => handleShareAd(viewingAd)} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${viewingAd.price === '0' ? 'bg-slate-700 text-white' : 'bg-blue-100 text-blue-700'}`}><Share2 size={14}/> Share</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 5. LINKS MODAL ---
export const LinksModal = ({ show, onClose, links }) => {
    if(!show) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-md">
                <div className="flex justify-between border-b pb-2 mb-2"><h3 className="font-bold">Official Verification</h3><button onClick={onClose}><X/></button></div>
                <div className="grid grid-cols-2 gap-2">{links.map(link => <a key={link.name} href={link.url} target="_blank" className="bg-blue-50 p-2 rounded text-xs text-blue-700 block border hover:bg-blue-100">{link.name}</a>)}</div>
            </div>
        </div>
    );
};

// --- 6. PIN MODAL ---
export const PinModal = ({ show, onClose, pinInput, setPinInput, checkPin }) => {
    if(!show) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center items-center backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-72 shadow-2xl">
                <h3 className="font-bold mb-4">Admin Login</h3>
                <input type="password" value={pinInput} onChange={(e)=>setPinInput(e.target.value)} className="w-full border p-2 rounded mb-4 text-center tracking-widest" placeholder="PIN"/>
                <button onClick={checkPin} className="w-full bg-black text-white py-2 rounded font-bold">Unlock</button>
            </div>
        </div>
    );
};