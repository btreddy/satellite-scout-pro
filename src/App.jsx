import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Phone, X, Download } from 'lucide-react';

// --- IMPORTS ---
import LandingPage from './components/LandingPage';
import { SmartNav } from './components/SmartNav';
import MapBoard from './features/MapBoard';
import AdminView from './features/AdminView';
import { PostAdModal, EditAdModal, TruthEngineModal, ViewAdModal, LinksModal, PinModal } from './features/AdManager';

// --- CONFIGURATION ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const PIN_CODE = import.meta.env.VITE_ADMIN_PIN || "1234"; 
const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || "917013007595"; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- STATIC DATA ---
const GOVT_LINKS = [
    { name: "Bhubharathi", url: "https://bhubharati.telangana.gov.in/knowLandStatus" }, 
    { name: "CCLA", url: "https://ccla.telangana.gov.in/integratedLandRegistry.do" }, 
    { name: "IGRS", url: "https://registration.telangana.gov.in/" }, 
    { name: "HMDA Master Plan", url: "https://www.hmda.gov.in/master-planning-2031" }, 
    { name: "RERA", url: "https://rera.telangana.gov.in/" }, 
    { name: "Bhuvan", url: "https://bhuvan.nrsc.gov.in/" }
];

const GROWTH_NODES = [
    { name: "Pharma Cluster", lat: 16.9800, lng: 78.6000 }, 
    { name: "Amazon Data Center", lat: 17.0500, lng: 78.5500 }, 
    { name: "Bharat Future City", lat: 16.9500, lng: 78.5800 }, 
    { name: "TCS Adibatla", lat: 17.2100, lng: 78.5300 }
];

const RealEstateSearchApp = () => {
  // --- STATE MANAGEMENT ---
  const [showLanding, setShowLanding] = useState(true);
  const [viewMode, setViewMode] = useState('MARKETPLACE'); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  
  // Search & Map State
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchMarker, setTempSearchMarker] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  
  // Modes
  const [adMode, setAdMode] = useState(null); 
  const [radarMode, setRadarMode] = useState(false);
  const [infraMode, setInfraMode] = useState(false); // <--- NEW INFRA STATE
  
  // Data State
  const [newAdLocation, setNewAdLocation] = useState(null);
  const [marketAds, setMarketAds] = useState([]); 
  const [radarResults, setRadarResults] = useState(null);
  const [projects, setProjects] = useState([]);
  
  // Modals
  const [showLinksModal, setShowLinksModal] = useState(false); 
  const [showRatingModal, setShowRatingModal] = useState(false); // <--- USED FOR AUDIT
  const [editingAd, setEditingAd] = useState(null);
  const [viewingAd, setViewingAd] = useState(null); 
  const [minimizedAd, setMinimizedAd] = useState(null); 
  const [fullScreenImage, setFullScreenImage] = useState(null); 
  
  // Forms & Admin
  const [agentPhone, setAgentPhone] = useState(null);
  const [exclusiveAgent, setExclusiveAgent] = useState(null); 
  const [newAdData, setNewAdData] = useState({ type: 'SELL', size: '', price: '', contact: '', desc: '', size_unit: 'Sq Yds', image_url: '', video_url: '', audio_url: '' });
  const [uploading, setUploading] = useState(false); 
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [currentShape, setCurrentShape] = useState(null); 
  const featureGroupRef = useRef(); 
  const [ratingData, setRatingData] = useState({ approvalType: 'Unapproved', reraId: '', isInFTL: false, hasRoadAccess: true, roadWidth: '30', hasEc: false, pollution: 'None', vaastu: 'Good', price: '', govtValue: '' });
  const [selectedAds, setSelectedAds] = useState([]);

  // --- LOGIC & EFFECTS ---
  const toggleAdSelection = (id) => selectedAds.includes(id) ? setSelectedAds(selectedAds.filter(adId => adId !== id)) : setSelectedAds([...selectedAds, id]);
  
  const handleBulkDelete = async () => {
      if (selectedAds.length === 0) return;
      if (confirm(`Are you sure you want to delete ${selectedAds.length} ads?`)) {
          const { error } = await supabase.from('marketplace_ads').delete().in('id', selectedAds);
          if (!error) { setMarketAds(prev => prev.filter(ad => !selectedAds.includes(ad.id))); setSelectedAds([]); alert("✅ Bulk Delete Successful!"); } else { alert("Error: " + error.message); }
      }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('agent')) setAgentPhone(params.get('agent'));
    if (params.get('exclusive_agent')) { setExclusiveAgent(params.get('exclusive_agent')); setShowLanding(false); }
    if (params.get('ad_id')) setShowLanding(false);
    fetchMarketplaceAds(params.get('exclusive_agent'));
    fetchProjects();
  }, [isAdmin]);

  useEffect(() => {
      if (marketAds.length > 0) {
          const params = new URLSearchParams(window.location.search);
          const sharedAdId = params.get('ad_id');
          if (sharedAdId) {
              const foundAd = marketAds.find(ad => ad.id.toString() === sharedAdId);
              if (foundAd) { setViewingAd(foundAd); setTempSearchMarker([foundAd.lat, foundAd.lng]); }
          }
      }
  }, [marketAds]);

  const fetchMarketplaceAds = async (exclusiveId = null) => {
    try {
        let query = supabase.from('marketplace_ads').select('*').order('created_at', { ascending: false });
        if (exclusiveId) query = query.eq('contact_info', exclusiveId); 
        else if (!isAdmin) query = query.eq('status', 'APPROVED');
        const { data, error } = await query;
        if (!error) setMarketAds(data || []);
    } catch(e) { console.error(e); }
  };

  const handleFileUpload = async (e, type, isEditMode = false) => {
    try {
        setUploading(true);
        const file = e.target.files[0]; if (!file) return;
        const filePath = `${type}_${Math.random()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('ad-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('ad-images').getPublicUrl(filePath);
        if (isEditMode && editingAd) { type === 'image' ? setEditingAd({ ...editingAd, image_url: data.publicUrl }) : setEditingAd({ ...editingAd, audio_url: data.publicUrl }); } 
        else { type === 'image' ? setNewAdData({ ...newAdData, image_url: data.publicUrl }) : setNewAdData({ ...newAdData, audio_url: data.publicUrl }); }
    } catch (error) { alert("Upload Failed"); } finally { setUploading(false); }
  };

  const handlePostAd = async () => {
    if(!newAdLocation) return alert("Set location first.");
    if(uploading) return alert("Wait for upload.");
    const offset = (Math.sqrt(parseInt(newAdData.size) * 0.836127) / 2) / 111139; 
    const points = [[newAdLocation.lat + offset, newAdLocation.lng - offset], [newAdLocation.lat + offset, newAdLocation.lng + offset], [newAdLocation.lat - offset, newAdLocation.lng + offset], [newAdLocation.lat - offset, newAdLocation.lng - offset]];
    const newAd = { lat: newAdLocation.lat, lng: newAdLocation.lng, ad_type: newAdData.type, size: newAdData.size + ' ' + newAdData.size_unit, price: newAdData.price, contact_info: newAdData.contact, description: newAdData.desc, image_url: newAdData.image_url, video_url: newAdData.video_url, audio_url: newAdData.audio_url, status: 'PENDING', points: points };
    const { error } = await supabase.from('marketplace_ads').insert([newAd]);
    if (!error) { alert("✅ Ad Submitted!"); setAdMode(null); setNewAdLocation(null); fetchMarketplaceAds(exclusiveAgent); setNewAdData({ type: 'SELL', size: '', price: '', contact: '', desc: '', size_unit: 'Sq Yds', image_url: '', video_url: '', audio_url: '' }); } else { alert(error.message); }
  };

  const handleUpdateAd = async () => {
      if(!editingAd) return;
      const { error } = await supabase.from('marketplace_ads').update({ price: editingAd.price, size: editingAd.size, contact_info: editingAd.contact_info, description: editingAd.description, image_url: editingAd.image_url, video_url: editingAd.video_url, audio_url: editingAd.audio_url, status: editingAd.status, lat: parseFloat(editingAd.lat), lng: parseFloat(editingAd.lng) }).eq('id', editingAd.id);
      if(!error) { alert("✅ Updated!"); setEditingAd(null); fetchMarketplaceAds(exclusiveAgent); } else { alert("Update Failed"); }
  };

  const handleApproveAd = async (id) => { await supabase.from('marketplace_ads').update({ status: 'APPROVED' }).eq('id', id); fetchMarketplaceAds(exclusiveAgent); };
  const handleDeleteAd = async (id) => { if(confirm("Delete ad?")) { const { error } = await supabase.from('marketplace_ads').delete().eq('id', id); if (!error) { setMarketAds(prev => prev.filter(ad => ad.id !== id)); alert("✅ Deleted."); } } };
  
  const handleShareAd = async (ad) => {
      const agentInput = prompt("👩‍💼 AGENT MODE:\nEnter mobile number for lead routing:\n(Empty = Original Owner)");
      let shareUrl = `https://maps.safelanddeal.com/?ad_id=${ad.id}`;
      if (agentInput && agentInput.trim() !== "") shareUrl += `&agent=${agentInput.trim()}`;
      if (exclusiveAgent) shareUrl += `&exclusive_agent=${exclusiveAgent}`;
      const shareText = `🔥 *${ad.price} | ${ad.size}* \n📍 *Safe Land Verified* \n👇 *View Details:*`;
      if (navigator.share) try { await navigator.share({ title: 'Safe Land', text: shareText, url: shareUrl }); } catch (error) {} else window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
  };

  const fetchProjects = async () => { const { data } = await supabase.from('projects').select('*'); if (data) setProjects(data); };
  const handleSaveProject = async (e) => { e.preventDefault(); if (!currentShape) return alert("No shape drawn!"); setShowSaveForm(false); setCurrentShape(null); }; 
  
  const generatePDF = () => { const doc = new jsPDF(); doc.text("SAFE LAND TRUTH REPORT", 10, 10); autoTable(doc, { head: [['Factor', 'Value']], body: Object.entries(ratingData) }); doc.save("Truth_Report.pdf"); };
  const handleSearch = async (e) => { if(e.key === 'Enter'){ const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`); const data = await res.json(); if(data && data[0]) { setTempSearchMarker([data[0].lat, data[0].lon]); setIsSearchOpen(false); } } };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      {showLanding && <LandingPage onEnter={() => setShowLanding(false)} adminPhone={ADMIN_PHONE} />}
      
      {fullScreenImage && (
          <div className="fixed inset-0 z-[11000] bg-black/95 flex justify-center items-center p-4 animate-in fade-in">
              <button onClick={() => setFullScreenImage(null)} className="absolute top-4 right-4 text-white bg-gray-800 p-2 rounded-full hover:bg-gray-700 z-[11001]"><X size={24}/></button>
              <img src={fullScreenImage} className="max-w-full max-h-full object-contain cursor-zoom-out" onClick={() => setFullScreenImage(null)} />
              <a href={fullScreenImage} download target="_blank" rel="noreferrer" className="absolute bottom-8 bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl hover:bg-gray-200 z-[11002]"><Download size={18}/> Download HD</a>
          </div>
      )}

      {/* --- MAIN APP CONTAINER --- */}
      <div className={`flex flex-col h-full transition-all duration-1000 ${showLanding ? 'blur-sm scale-105' : 'blur-0 scale-100'}`}>
        
        {/* --- SMART NAVIGATION (HEADER + BOTTOM BARS) --- */}
        <SmartNav 
            isAdmin={isAdmin} viewMode={viewMode} setViewMode={setViewMode} 
            setShowPinModal={setShowPinModal} 
            setShowPremiumRequest={setShowRatingModal} // <--- WIRED TO AUDIT MODAL
            setShowLinksModal={setShowLinksModal}
            setIsSearchOpen={setIsSearchOpen} isSearchOpen={isSearchOpen} searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSearch={handleSearch}
            adMode={adMode} setAdMode={setAdMode} 
            radarMode={radarMode} setRadarMode={setRadarMode} 
            infraMode={infraMode} setInfraMode={setInfraMode} // <--- WIRED NEW INFRA SCANNER
            setNewAdLocation={setNewAdLocation}
        />

        <div className="flex-1 relative z-0 pb-16 md:pb-0"> 
          {viewMode === 'ADMIN' ? (
              <AdminView 
                  marketAds={marketAds} selectedAds={selectedAds} toggleAdSelection={toggleAdSelection} setSelectedAds={setSelectedAds}
                  handleBulkDelete={handleBulkDelete} fetchMarketplaceAds={fetchMarketplaceAds} exclusiveAgent={exclusiveAgent}
                  setShowLinksModal={setShowLinksModal} setShowRatingModal={setShowRatingModal} handleApproveAd={handleApproveAd} handleDeleteAd={handleDeleteAd} setEditingAd={setEditingAd}
              />
          ) : (
              <MapBoard 
                  viewMode={viewMode} marketAds={marketAds} projects={projects} newAdLocation={newAdLocation} tempSearchMarker={tempSearchMarker} radarResults={radarResults}
                  adMode={adMode} 
                  radarMode={radarMode} 
                  infraMode={infraMode} // <--- PASSED TO MAP
                  growthNodes={GROWTH_NODES} // <--- PASSED TO MAP
                  featureGroupRef={featureGroupRef}
                  setNewAdLocation={setNewAdLocation} setRadarResults={setRadarResults} setAdMode={setAdMode} setViewingAd={setViewingAd} handleShareAd={handleShareAd}
                  setCurrentShape={setCurrentShape} setShowSaveForm={setShowSaveForm} agentPhone={agentPhone}
                  setTempSearchMarker={setTempSearchMarker}
              />
          )}
        </div>
      </div>

      {/* STICKY CONTACT BAR */}
      {minimizedAd && !viewingAd && (
          <div className="fixed bottom-20 left-4 right-4 md:bottom-24 md:left-auto md:right-4 md:w-80 bg-slate-900 text-white p-3 rounded-xl shadow-2xl z-[4000] flex items-center justify-between animate-in slide-in-from-bottom-5 border border-slate-700">
              <div className="flex-1 cursor-pointer" onClick={() => { setViewingAd(minimizedAd); setMinimizedAd(null); }}><p className="font-bold text-sm text-yellow-400">Last Viewed:</p><p className="font-black">{minimizedAd.price} | {minimizedAd.size}</p></div>
              <div className="flex gap-2"><button onClick={() => window.open(`https://wa.me/${agentPhone ? agentPhone : minimizedAd.contact_info}`, '_blank')} className="bg-green-600 p-2 rounded-full hover:bg-green-500"><Phone size={18}/></button><button onClick={() => setMinimizedAd(null)} className="bg-slate-700 p-2 rounded-full hover:bg-slate-600"><X size={18}/></button></div>
          </div>
      )}

      {/* MODALS */}
      <PostAdModal newAdLocation={newAdLocation} setNewAdLocation={setNewAdLocation} setAdMode={setAdMode} newAdData={newAdData} setNewAdData={setNewAdData} handleFileUpload={handleFileUpload} handlePostAd={handlePostAd} uploading={uploading} />
      <EditAdModal editingAd={editingAd} setEditingAd={setEditingAd} handleFileUpload={handleFileUpload} handleUpdateAd={handleUpdateAd} />
      <TruthEngineModal showRatingModal={showRatingModal} setShowRatingModal={setShowRatingModal} ratingData={ratingData} setRatingData={setRatingData} generatePDF={generatePDF} />
      <ViewAdModal viewingAd={viewingAd} setViewingAd={setViewingAd} setFullScreenImage={setFullScreenImage} setMinimizedAd={setMinimizedAd} agentPhone={agentPhone} handleShareAd={handleShareAd} />
      <LinksModal show={showLinksModal} onClose={() => setShowLinksModal(false)} links={GOVT_LINKS} />
      <PinModal show={showPinModal} onClose={() => setShowPinModal(false)} pinInput={pinInput} setPinInput={setPinInput} checkPin={()=>{ if(pinInput===PIN_CODE){ setIsAdmin(true); setShowPinModal(false); } else alert("Wrong PIN"); }} />
    </div>
  );
};

export default RealEstateSearchApp;