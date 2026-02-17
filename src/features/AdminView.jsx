import React from 'react';
import { List, Trash2, RefreshCw, Globe, ShieldCheck, CheckCircle, Edit } from 'lucide-react';

const AdminView = ({ 
    marketAds = [], selectedAds = [], toggleAdSelection, setSelectedAds, 
    handleBulkDelete, fetchMarketplaceAds, exclusiveAgent, 
    setShowLinksModal, setShowRatingModal, handleApproveAd, 
    handleDeleteAd, setEditingAd 
}) => {
    // Safety check for ads data
    const ads = Array.isArray(marketAds) ? marketAds : [];

    return (
        <div className="h-full overflow-auto p-4 bg-gray-100">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
                    <h2 className="text-xl font-black flex items-center gap-2"><List/> Ad Database</h2>
                    {selectedAds.length > 0 && (
                        <button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded shadow-lg font-bold animate-pulse flex items-center gap-2"><Trash2 size={16}/> Delete ({selectedAds.length}) Selected</button>
                    )}
                    <div className="flex gap-2 flex-wrap justify-center">
                        <button onClick={() => fetchMarketplaceAds(exclusiveAgent)} className="p-2 bg-white border rounded hover:bg-gray-50"><RefreshCw size={16}/></button>
                        <button onClick={() => setShowLinksModal(true)} className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-bold flex items-center gap-1"><Globe size={14}/> Govt Links</button>
                        <button onClick={() => setShowRatingModal(true)} className="px-3 py-2 bg-purple-600 text-white rounded text-xs font-bold flex items-center gap-1"><ShieldCheck size={14}/> Audit Tool</button>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                            <tr>
                                <th className="p-4 w-10">
                                    <input type="checkbox" onChange={(e) => { if(e.target.checked) setSelectedAds(ads.map(ad => ad.id)); else setSelectedAds([]); }} checked={ads.length > 0 && selectedAds.length === ads.length} />
                                </th>
                                <th className="p-4">Type</th><th className="p-4">Price</th><th className="p-4">Contact</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ads.map(ad => (
                                <tr key={ad.id} className={`border-b hover:bg-gray-50 ${selectedAds.includes(ad.id) ? 'bg-red-50' : ''}`}>
                                    <td className="p-4 text-center"><input type="checkbox" checked={selectedAds.includes(ad.id)} onChange={() => toggleAdSelection(ad.id)} /></td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${ad.ad_type==='SELL'?'bg-green-100 text-green-800':'bg-blue-100'}`}>{ad.ad_type}</span></td>
                                    <td className="p-4 font-bold">{ad.price}</td>
                                    <td className="p-4 text-xs">{ad.contact_info}</td>
                                    <td className="p-4 text-xs">{ad.status === 'APPROVED' ? '✅ Live' : '🟠 Pending'}</td>
                                    <td className="p-4 text-right flex justify-end gap-1">
                                        {ad.status !== 'APPROVED' && <button onClick={()=>handleApproveAd(ad.id)} className="p-1 bg-green-100 text-green-700 rounded"><CheckCircle size={14}/></button>}
                                        <button onClick={()=>setEditingAd(ad)} className="p-1 bg-blue-100 text-blue-700 rounded"><Edit size={14}/></button>
                                        <button onClick={()=>handleDeleteAd(ad.id)} className="p-1 bg-red-100 text-red-700 rounded"><Trash2 size={14}/></button>
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