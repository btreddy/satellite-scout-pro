import React from 'react';
import { X, UploadCloud, Mic, Video, Navigation, Edit, ShieldCheck, FileText, CheckCircle, Wind, Maximize2, Minimize2, Phone, Share2, MessageCircle } from 'lucide-react';

// --- 1. POST AD MODAL (High Contrast + Black Text) ---
export const PostAdModal = ({ isOpen, onClose, newAdLocation, setNewAdLocation, setAdMode, newAdData, setNewAdData, handleFileUpload, handlePostAd, uploading }) => {
    if(!isOpen || !newAdLocation) return null;

    const updateCoords = (key, value) => {
        const val = parseFloat(value);
        const newLoc = { ...newAdLocation, [key]: isNaN(val) ? 0 : val };
        setNewAdLocation(newLoc);
    };

    return (
        <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-4 md:w-80 md:right-auto z-[5000] bg-white p-4 rounded-xl shadow-2xl border-2 border-blue-500 max-h-[80vh] overflow-y-auto text-slate-900">
            <div className="flex justify-between items-center mb-2 border-b pb-2">
                <h3 className="font-bold text-blue-600">📍 Asset Pinning</h3>
                <button onClick={onClose} className="bg-gray-100 p-1 rounded-full text-slate-900"><X size={16}/></button>
            </div>
            
            <div className="space-y-3">
                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <label className="text-[10px] font-bold text-blue-800 flex items-center gap-1 mb-1"><Navigation size={10}/> EXACT LOCATION</label>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" step="any" className="w-full border p-1 rounded text-xs font-mono bg-white text-slate-900 border-slate-300" placeholder="Lat" value={newAdLocation.lat || ''} onChange={(e) => updateCoords('lat', e.target.value)} />
                        <input type="number" step="any" className="w-full border p-1 rounded text-xs font-mono bg-white text-slate-900 border-slate-300" placeholder="Lng" value={newAdLocation.lng || ''} onChange={(e) => updateCoords('lng', e.target.value)} />
                    </div>
                </div>

                <select className="w-full border p-2 rounded text-sm font-bold bg-white text-slate-900 border-slate-300" value={newAdData.type} onChange={e => setNewAdData({...newAdData, type: e.target.value})}>
                    <option value="SELL">Sell Plot</option>
                    <option value="LOOKING">Looking For</option>
                </select>

                <div className="flex gap-2">
                    <input placeholder="Size (Yds)" type="number" className="w-full border p-2 rounded text-sm bg-white text-slate-900 border-slate-300" value={newAdData.size} onChange={e => setNewAdData({...newAdData, size: e.target.value})} />
                    <input placeholder="Price" className="w-full border p-2 rounded text-sm bg-white text-slate-900 border-slate-300" value={newAdData.price} onChange={e => setNewAdData({...newAdData, price: e.target.value})} />
                </div>

                <input placeholder="WhatsApp Number" className="w-full border p-2 rounded text-sm bg-white text-slate-900 font-bold border-slate-300" value={newAdData.contact} onChange={e => setNewAdData({...newAdData, contact: e.target.value})} />
                
                <textarea placeholder="Description (Road width, facing...)" className="w-full border p-2 rounded text-sm h-16 bg-white text-slate-900 border-slate-300" value={newAdData.desc} onChange={e => setNewAdData({...newAdData, desc: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-2">
                    <div className="border border-dashed p-2 rounded text-center border-gray-300">
                        <label className="text-xs cursor-pointer block text-slate-900">
                            <UploadCloud size={14} className="mx-auto text-gray-400"/>
                            <span>Photo</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                        </label>
                    </div>
                    <div className="border border-dashed p-2 rounded text-center border-gray-300">
                        <label className="text-xs cursor-pointer block text-slate-900">
                            <Mic size={14} className="mx-auto text-purple-400"/>
                            <span>Audio</span>
                            <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} />
                        </label>
                    </div>
                </div>
                
                <button onClick={handlePostAd} disabled={uploading} className="w-full py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-lg">
                    {uploading ? 'Uploading...' : 'Submit Asset Pin'}
                </button>
            </div>
        </div>
    );
};

// --- 2. EDIT AD MODAL ---
export const EditAdModal = ({ editingAd, setEditingAd, handleUpdateAd }) => {
    if(!editingAd) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm text-slate-900 shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b pb-2"><h3 className="font-bold">Edit Ad</h3><button onClick={()=>setEditingAd(null)}><X size={20}/></button></div>
                <button onClick={handleUpdateAd} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Save Changes</button>
            </div>
        </div>
    );
};

// --- 3. TRUTH ENGINE MODAL (RESTORED TO FIX CRASH) ---
export const TruthEngineModal = ({ showRatingModal, setShowRatingModal, ratingData, setRatingData, generatePDF }) => {
    if(!showRatingModal) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[7000] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl p-6 text-slate-900">
                <div className="flex justify-between items-center mb-4"><h2 className="font-bold flex items-center gap-2"><ShieldCheck className="text-blue-600"/> Truth Engine</h2><button onClick={() => setShowRatingModal(false)}><X/></button></div>
                <p className="text-sm text-slate-500 mb-4">Audit report generation under maintenance.</p>
                <button onClick={generatePDF} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold">Generate PDF Report</button>
            </div>
        </div>
    );
};

// --- 4. VIEW AD MODAL ---
export const ViewAdModal = ({ viewingAd, setViewingAd, agentPhone, handleShareAd }) => {
    if(!viewingAd) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex justify-center items-center p-4">
            <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden text-slate-900 shadow-2xl">
                <div className="p-5">
                    <div className="flex justify-between mb-2"><h2 className="text-2xl font-black">{viewingAd.price}</h2><button onClick={() => setViewingAd(null)}><X/></button></div>
                    <p className="text-sm mb-4 text-slate-500">{viewingAd.size} | {viewingAd.ad_type}</p>
                    <button onClick={() => window.open(`https://wa.me/${agentPhone || viewingAd.contact_info}`, '_blank')} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"><MessageCircle size={18}/> WhatsApp Owner</button>
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
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl text-slate-900">
                <div className="flex justify-between border-b pb-2 mb-4 font-bold"><h3>Verification Links</h3><button onClick={onClose}><X/></button></div>
                <div className="grid grid-cols-2 gap-2">{links.map(link => <a key={link.name} href={link.url} target="_blank" className="p-2 border rounded text-xs text-blue-700 bg-blue-50">{link.name}</a>)}</div>
            </div>
        </div>
    );
};

// --- 6. PIN MODAL ---
export const PinModal = ({ show, onClose, pinInput, setPinInput, checkPin }) => {
    if(!show) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center items-center">
            <div className="bg-white p-6 rounded-xl w-72 shadow-2xl text-slate-900">
                <h3 className="font-bold mb-4">Admin Login</h3>
                <input type="password" value={pinInput} onChange={(e)=>setPinInput(e.target.value)} className="w-full border p-2 mb-4 text-center bg-white text-slate-900" placeholder="PIN"/>
                <button onClick={checkPin} className="w-full bg-slate-900 text-white py-2 rounded font-bold">Unlock</button>
            </div>
        </div>
    );
};