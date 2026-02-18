import React from 'react';
import { List, Trash2, RefreshCw, Globe, ShieldCheck, CheckCircle, Edit, Lock, LogOut } from 'lucide-react';

const AdminView = ({ 
    isAdmin, setIsAdmin, // <--- Security Keys
    marketAds = [], selectedAds = [], toggleAdSelection, setSelectedAds, 
    handleBulkDelete, fetchMarketplaceAds, exclusiveAgent, 
    setShowLinksModal, setShowRatingModal, handleApproveAd, 
    handleDeleteAd, setEditingAd 
}) => {
    
    // --- 1. SECURITY GATE (Locked Door) ---
    if (!isAdmin) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-gray-100 text-slate-400">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-200">
                    <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
                        <Lock size={48} className="text-red-500"/>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Restricted Access</h2>
                    <p className="text-sm font-bold text-slate-500 mb-6">This vault is for Administrators only.</p>
                    <p className="text-xs bg-slate-100 p-2 rounded text-slate-500">
                        Click the <Lock size={12} className="inline"/> Lock Icon in the top-right menu to login.
                    </p>
                </div>
            </div>
        );
    }

    // --- 2. DATA PREPARATION ---
    const ads = Array.isArray(marketAds) ? marketAds : [];

    // --- 3. THE ADMIN DASHBOARD (Unlocked) ---
    return (
        <div className="h-full overflow-auto p-4 pt-28 bg-gray-100">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-black flex items-center gap-2 text-slate-800">
                        <List className="text-blue-600"/> Ad Database 
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-500">{ads.length} Records</span>
                    </h2>
                    
                    <div className="flex gap-2 flex-wrap justify-center">
                        {/* Bulk Delete Button */}
                        {selectedAds.length > 0 && (
                            <button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg font-bold animate-pulse flex items-center gap-2 text-xs hover:bg-red-700">
                                <Trash2 size={16}/> Delete ({selectedAds.length})
                            </button>
                        )}
                        
                        {/* Standard Tools */}
                        <button onClick={() => fetchMarketplaceAds(exclusiveAgent)} className="p-2 bg-slate-100 border rounded-lg hover:bg-slate-200 text-slate-600"><RefreshCw size={18}/></button>
                        <button onClick={() => setShowLinksModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200"><Globe size={16}/> Govt Links</button>
                        <button onClick={() => setShowRatingModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-purple-700 shadow-lg shadow-purple-200"><ShieldCheck size={16}/> Audit Tool</button>
                        
                        {/* LOGOUT BUTTON (New) */}
                        <button onClick={() => setIsAdmin(false)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-black shadow-lg ml-2">
                            <LogOut size={16}/> Logout
                        </button>
                    </div>
                </div>
                
                {/* Data Table */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="p-4 w-10 text-center">
                                        <input type="checkbox" className="rounded border-slate-300" onChange={(e) => { if(e.target.checked) setSelectedAds(ads.map(ad => ad.id)); else setSelectedAds([]); }} checked={ads.length > 0 && selectedAds.length === ads.length} />
                                    </th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Price / Details</th>
                                    <th className="p-4">Contact Info</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {ads.map(ad => (
                                    <tr key={ad.id} className={`hover:bg-slate-50 transition-colors ${selectedAds.includes(ad.id) ? 'bg-blue-50/50' : ''}`}>
                                        <td className="p-4 text-center">
                                            <input type="checkbox" className="rounded border-slate-300" checked={selectedAds.includes(ad.id)} onChange={() => toggleAdSelection(ad.id)} />
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${ad.ad_type==='SELL'?'bg-emerald-100 text-emerald-700':'bg-blue-100 text-blue-700'}`}>
                                                {ad.ad_type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{ad.price}</div>
                                            <div className="text-xs text-slate-500">{ad.size}</div>
                                        </td>
                                        <td className="p-4 font-mono text-xs text-slate-600">{ad.contact_info}</td>
                                        <td className="p-4">
                                            {ad.status === 'APPROVED' 
                                                ? <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle size={12}/> Live</span> 
                                                : <span className="flex items-center gap-1 text-orange-500 font-bold text-xs animate-pulse">🟠 Review</span>
                                            }
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            {ad.status !== 'APPROVED' && (
                                                <button onClick={()=>handleApproveAd(ad.id)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors" title="Approve">
                                                    <CheckCircle size={14}/>
                                                </button>
                                            )}
                                            <button onClick={()=>setEditingAd(ad)} className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors" title="Edit">
                                                <Edit size={14}/>
                                            </button>
                                            <button onClick={()=>handleDeleteAd(ad.id)} className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors" title="Delete">
                                                <Trash2 size={14}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AdminView;