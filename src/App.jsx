import React, { useState, useEffect, useRef } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMapEvents, 
  useMap, 
  Polygon, 
  FeatureGroup, 
  LayersControl 
} from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"; 
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "leaflet-draw/dist/leaflet.draw.css"; 
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

// --- ICONS ---
import { 
  X, 
  Crosshair, 
  Search, 
  Zap, 
  Radar, 
  FileText, 
  Lock, 
  Unlock, 
  Map as MapIcon, 
  MessageCircle, 
  Store, 
  PenTool, 
  Save, 
  Eye,
  CheckCircle, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  List, 
  Filter, 
  RefreshCw, 
  Globe, 
  PlusCircle, 
  Layers, 
  Award, 
  Download, 
  Image as ImageIcon, 
  Video, 
  UploadCloud, 
  Edit, 
  Mic, 
  Share2, 
  MapPin, 
  Star,
  Menu, 
  Home, 
  ChevronRight, 
  Check, 
  Phone, 
  Users, 
  DollarSign, 
  Wind,
  Maximize2
} from 'lucide-react';

// --- CONFIGURATION ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const PIN_CODE = import.meta.env.VITE_ADMIN_PIN || "1234"; 
const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || "917013007595"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- OFFICIAL LINKS ---
const GOVT_LINKS = [
    { name: "Bhubharathi (Land Status)", url: "https://bhubharati.telangana.gov.in/knowLandStatus" },
    { name: "CCLA (Integrated Registry)", url: "https://ccla.telangana.gov.in/integratedLandRegistry.do" },
    { name: "IGRS (EC Search)", url: "https://registration.telangana.gov.in/" },
    { name: "HMDA Master Plan 2031", url: "https://www.hmda.gov.in/master-planning-2031" },
    { name: "RERA Telangana", url: "https://rera.telangana.gov.in/" },
    { name: "Bhuvan (ISRO Maps)", url: "https://bhuvan.nrsc.gov.in/" }
];

// --- ICONS CONFIG ---
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const GoldIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

const GROWTH_NODES = [
  { name: "Pharma Cluster", lat: 16.9800, lng: 78.6000 },
  { name: "Amazon Data Center", lat: 17.0500, lng: 78.5500 },
  { name: "Bharat Future City", lat: 16.9500, lng: 78.5800 },
  { name: "TCS Adibatla", lat: 17.2100, lng: 78.5300 } 
];

// --- COMPONENT: LANDING PAGE ---
const LandingPage = ({ onEnter }) => {
    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700 overflow-y-auto">
            <div className="max-w-4xl w-full mt-10 md:mt-0">
                
                {/* HERO BRANDING */}
                <div className="mb-6">
                    <div className="inline-block p-3 rounded-full bg-slate-800 border border-slate-700 shadow-2xl mb-4">
                        <Crosshair size={48} className="text-yellow-500 animate-spin-slow"/>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">SAFE LAND</h1>
                    <p className="text-yellow-500 font-bold tracking-widest uppercase text-xs md:text-sm">Intelligence Console</p>
                </div>

                {/* HEADLINE */}
                <h2 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
                    Stop Buying Blind.<br/>
                    <span className="text-blue-400">Start Buying Truth.</span>
                </h2>

                {/* VALUE PROPOSITION (TICKER) */}
                <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs md:text-sm font-bold text-slate-400">
                    <span className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                        <Users size={12} className="text-green-400"/> Agents: Verified Leads
                    </span>
                    <span className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                        <DollarSign size={12} className="text-yellow-400"/> Developers: Save Costs
                    </span>
                    <span className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                        <CheckCircle size={12} className="text-blue-400"/> Buyers: 100% Transparency
                    </span>
                </div>

                {/* FEATURE GRID */}
                <div className="grid md:grid-cols-3 gap-4 mb-8 text-left max-w-2xl mx-auto">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors">
                        <div className="text-green-400 font-bold mb-1 flex items-center gap-2"><Check size={16}/> Satellite Verified</div>
                        <p className="text-slate-400 text-sm">See exact locations, boundaries, and FTL buffers.</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors">
                        <div className="text-purple-400 font-bold mb-1 flex items-center gap-2"><Mic size={16}/> Owner's Voice</div>
                        <p className="text-slate-400 text-sm">Listen to the owner directly. No distortions.</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors">
                        <div className="text-yellow-400 font-bold mb-1 flex items-center gap-2"><ShieldCheck size={16}/> Govt Data</div>
                        <p className="text-slate-400 text-sm">Linked with HMDA, RERA, and <b>Bhubharathi</b>.</p>
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button 
                        onClick={onEnter} 
                        className="w-full md:w-auto group bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold px-8 py-4 rounded-full shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        Launch Console <ChevronRight className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                    
                    <button 
                        onClick={() => window.open(`https://wa.me/${ADMIN_PHONE}?text=Hi, I want to know more about Safe Land.`, '_blank')} 
                        className="w-full md:w-auto bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold px-6 py-4 rounded-full flex items-center justify-center gap-2 border border-slate-600 transition-all"
                    >
                        <MessageCircle size={18} className="text-green-400"/> Talk to Founder
                    </button>
                </div>
                
                <p className="mt-8 text-slate-600 text-xs">Hyderabad • Telangana • India</p>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
const RealEstateSearchApp = () => {
  // --- STATE MANAGEMENT ---
  const [showLanding, setShowLanding] = useState(true);
  const [viewMode, setViewMode] = useState('MARKETPLACE'); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchMarker, setTempSearchMarker] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 

  // Modals
  const [showLinksModal, setShowLinksModal] = useState(false); 
  const [showPremiumRequest, setShowPremiumRequest] = useState(false); 
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  const [editingAd, setEditingAd] = useState(null);
  const [viewingAd, setViewingAd] = useState(null); 
  const [fullScreenImage, setFullScreenImage] = useState(null); // Full Screen Image State

  // Filter
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); 

  // Market & Map Tools
  const [adMode, setAdMode] = useState(null); 
  const [radarMode, setRadarMode] = useState(false); 
  const [newAdLocation, setNewAdLocation] = useState(null);
  const [marketAds, setMarketAds] = useState([]);
  const [radarResults, setRadarResults] = useState(null);
  
  // New Ad Form Data
  const [newAdData, setNewAdData] = useState({ 
      type: 'SELL', size: '', price: '', contact: '', desc: '', 
      size_unit: 'Sq Yds', image_url: '', video_url: '', audio_url: '' 
  });
  const [uploading, setUploading] = useState(false); 

  // Projects / Planner
  const [projects, setProjects] = useState([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [currentShape, setCurrentShape] = useState(null); 
  const featureGroupRef = useRef(); 

  // Audit / Rating Data
  const [ratingData, setRatingData] = useState({ 
      approvalType: 'Unapproved', 
      reraId: '', 
      isInFTL: false, 
      hasRoadAccess: true,
      roadWidth: '30',
      hasEc: false,
      pollution: 'None', 
      vaastu: 'Good', 
      price: '', 
      govtValue: ''
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    // Smart Routing: Skip Landing if deep link used
    const params = new URLSearchParams(window.location.search);
    if (params.get('ad_id')) {
        setShowLanding(false);
    }
    fetchMarketplaceAds();
    fetchProjects();
  }, [isAdmin]);

  // Deep Link Listener
  useEffect(() => {
      if (marketAds.length > 0) {
          const params = new URLSearchParams(window.location.search);
          const sharedAdId = params.get('ad_id');
          if (sharedAdId) {
              const foundAd = marketAds.find(ad => ad.id.toString() === sharedAdId);
              if (foundAd) {
                  setViewingAd(foundAd); 
                  setTempSearchMarker([foundAd.lat, foundAd.lng]); 
              }
          }
      }
  }, [marketAds]);

  // --- DATABASE FUNCTIONS ---
  const fetchMarketplaceAds = async () => {
    try {
        let query = supabase.from('marketplace_ads').select('*').order('created_at', { ascending: false });
        if (!isAdmin) query = query.eq('status', 'APPROVED');
        const { data, error } = await query;
        if (!error) setMarketAds(data || []);
    } catch(e) { console.error(e); }
  };

  const handleFileUpload = async (e, type, isEditMode = false) => {
    try {
        setUploading(true);
        const file = e.target.files[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${type}_${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from('ad-images').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('ad-images').getPublicUrl(filePath);
        
        if (isEditMode && editingAd) {
             if(type === 'image') setEditingAd({ ...editingAd, image_url: data.publicUrl });
             if(type === 'audio') setEditingAd({ ...editingAd, audio_url: data.publicUrl });
        } else {
             if(type === 'image') setNewAdData({ ...newAdData, image_url: data.publicUrl });
             if(type === 'audio') setNewAdData({ ...newAdData, audio_url: data.publicUrl });
        }
        // Success indicator logic is handled in the UI by checking image_url/audio_url presence
    } catch (error) {
        alert("Upload Failed: " + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handlePostAd = async () => {
    if(!newAdLocation) return alert("Set location first.");
    if(uploading) return alert("Wait for upload.");

    const sizeInSqMeters = parseInt(newAdData.size) * 0.836127; 
    const sideLength = Math.sqrt(sizeInSqMeters); 
    const offset = (sideLength / 2) / 111139; 
    const points = [
        [newAdLocation.lat + offset, newAdLocation.lng - offset],
        [newAdLocation.lat + offset, newAdLocation.lng + offset],
        [newAdLocation.lat - offset, newAdLocation.lng + offset],
        [newAdLocation.lat - offset, newAdLocation.lng - offset]
    ];
    
    const newAd = {
        lat: newAdLocation.lat, lng: newAdLocation.lng,
        ad_type: newAdData.type, size: newAdData.size + ' ' + newAdData.size_unit,
        price: newAdData.price, contact_info: newAdData.contact, description: newAdData.desc,
        image_url: newAdData.image_url, video_url: newAdData.video_url, audio_url: newAdData.audio_url,
        status: 'PENDING', points: points
    };
    
    const { error } = await supabase.from('marketplace_ads').insert([newAd]);
    if (!error) { 
        alert("✅ Ad Submitted!"); 
        setAdMode(null); setNewAdLocation(null); fetchMarketplaceAds(); 
        setNewAdData({ type: 'SELL', size: '', price: '', contact: '', desc: '', size_unit: 'Sq Yds', image_url: '', video_url: '', audio_url: '' });
    } else { alert(error.message); }
  };

  const handleUpdateAd = async () => {
      if(!editingAd) return;
      const { error } = await supabase.from('marketplace_ads').update({
          price: editingAd.price,
          size: editingAd.size,
          contact_info: editingAd.contact_info,
          description: editingAd.description,
          image_url: editingAd.image_url,
          video_url: editingAd.video_url,
          audio_url: editingAd.audio_url,
          status: editingAd.status
      }).eq('id', editingAd.id);

      if(!error) {
          alert("✅ Ad Updated Successfully!");
          setEditingAd(null);
          fetchMarketplaceAds();
      } else {
          alert("Update Failed: " + error.message);
      }
  };

  const handleApproveAd = async (id) => { 
      await supabase.from('marketplace_ads').update({ status: 'APPROVED' }).eq('id', id); 
      fetchMarketplaceAds(); 
  };
  
  const handleDeleteAd = async (id) => { 
      if(confirm("Permanently delete this ad?")) {
        const { error } = await supabase.from('marketplace_ads').delete().eq('id', id);
        if (!error) {
            setMarketAds(prev => prev.filter(ad => ad.id !== id));
            alert("✅ Ad Deleted.");
        }
      }
  };

  const handleShareAd = async (ad) => {
      const shareUrl = `https://maps.safelanddeal.com/?ad_id=${ad.id}`;
      const shareText = `🔥 *Safe Land Deal Alert* 🔥\n\n💎 *Price:* ${ad.price}\n📏 *Size:* ${ad.size}\n📍 *Verified Location:*`;
      if (navigator.share) {
          try { await navigator.share({ title: 'Safe Land Deal', text: shareText, url: shareUrl }); } 
          catch (error) { console.log('Error sharing', error); }
      } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
      }
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*');
    if (data) setProjects(data);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!currentShape) return alert("No shape drawn!");
    try {
        const layer = currentShape.layer;
        let rawLatLngs = layer.getLatLngs();
        if (Array.isArray(rawLatLngs[0]) && typeof rawLatLngs[0].lat !== 'number') rawLatLngs = rawLatLngs[0];
        const cleanPoints = rawLatLngs.map(p => ({ lat: p.lat, lng: p.lng }));
        const formData = new FormData(e.target);
        const newProject = {
            name: formData.get('label'), survey_number: formData.get('survey_no'),
            notes: formData.get('note'), points: cleanPoints, color: 'cyan'
        };
        const { error } = await supabase.from('projects').insert([newProject]);
        if (!error) {
            alert("✅ Project Saved!"); setShowSaveForm(false); fetchProjects(); 
            if(featureGroupRef.current) featureGroupRef.current.clearLayers();
            setCurrentShape(null);
        }
    } catch (err) { alert("Error saving shape."); }
  };

  // --- PDF GENERATOR (TRUTH REPORT) ---
  const generatePDF = (isSample = false) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    const data = isSample ? {
        approvalType: 'HMDA', reraId: 'P02400001234', isInFTL: false, hasRoadAccess: true, roadWidth: '40', hasEc: true, pollution: 'None', vaastu: 'Good', price: '45000', govtValue: '12000'
    } : ratingData;

    // Header
    doc.setFillColor(25, 25, 112); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text("SAFE LAND TRUTH REPORT", 15, 20);
    doc.setFontSize(10); doc.text(isSample ? "SAMPLE ANALYSIS" : "GENERATED BY SAFE LAND INTELLIGENCE", 15, 30);
    doc.text(`Date: ${date}`, 160, 30);

    // Disclaimer
    doc.setTextColor(100, 100, 100); doc.setFontSize(8);
    doc.text("NOTE: This report is based on provided data. It helps in risk assessment but does not guarantee legal clearance.", 15, 48);

    let yPos = 60;

    // 1. REGULATORY FACTS
    doc.setTextColor(0, 0, 0); doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("1. Regulatory & Safety Facts", 15, yPos);
    
    const rows = [
        ['Check', 'Fact Provided', 'Risk Level', 'Consequence / Warning']
    ];

    // Logic
    if (data.approvalType === 'HMDA' || data.approvalType === 'DTCP') {
        rows.push(['Authority', data.approvalType, 'LOW', '✅ Eligible for Bank Loan & Building Permission.']);
    } else {
        rows.push(['Authority', 'Unapproved/Gram Panchayat', 'HIGH', '❌ No Bank Loan. Demolition Risk. Resale is hard.']);
    }

    if (data.isInFTL) {
        rows.push(['Lake Buffer (FTL)', 'INSIDE FTL', 'CRITICAL', '⛔ GOVT PROPERTY. DO NOT BUY. 100% Loss Risk.']);
    } else {
        rows.push(['Lake Buffer (FTL)', 'Outside', 'LOW', '✅ Safe from Lake Buffer Regulations.']);
    }

    if (data.hasEc) {
        rows.push(['Encumbrance (EC)', 'Clear (Uploaded)', 'LOW', '✅ Ownership Chain appears verified.']);
    } else {
        rows.push(['Encumbrance (EC)', 'NOT PROVIDED', 'MEDIUM', '⚠️ Ownership dispute possible. Verify 30 years link.']);
    }

    if (parseInt(data.roadWidth) < 30) {
        rows.push(['Road Access', `${data.roadWidth} ft`, 'HIGH', '❌ Too Narrow. Permit may be denied. Fire truck access?']);
    } else {
        rows.push(['Road Access', `${data.roadWidth} ft`, 'LOW', '✅ Good width for permission & value.']);
    }

    autoTable(doc, {
      startY: yPos + 5,
      head: [rows[0]],
      body: rows.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] },
      styles: { overflow: 'linebreak', fontSize: 9 }, // Text Wrap Fix
      columnStyles: { 
          0: { cellWidth: 30 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25, fontStyle: 'bold', textColor: [255, 0, 0] },
          3: { cellWidth: 'auto' } // Takes remaining space
      }
    });

    yPos = doc.lastAutoTable.finalY + 20;

    // 2. VAASTU & ENVIRONMENT
    doc.text("2. Vaastu & Environmental Reality", 15, yPos);
    
    const envRows = [['Factor', 'Observation', 'Impact']];
    envRows.push(['Pollution Zone', data.pollution, data.pollution === 'None' ? 'Positive' : 'Negative Health Impact']);
    envRows.push(['Vaastu Compliance', data.vaastu, data.vaastu === 'Good' ? 'High Demand' : 'Lower Resale Demand']);

    autoTable(doc, {
        startY: yPos + 5,
        head: [envRows[0]],
        body: envRows.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [39, 174, 96] }
    });

    doc.save("Truth_Report.pdf");
  };

  const FlyToSearchResult = () => {
    const map = useMap();
    useEffect(() => { if (tempSearchMarker) map.flyTo(tempSearchMarker, 14, { duration: 1.5 }); }, [tempSearchMarker]);
    return null;
  };
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (viewMode === 'MARKETPLACE' && adMode) setNewAdLocation(e.latlng);
        else if (viewMode === 'MARKETPLACE' && radarMode) {
            const dists = GROWTH_NODES.map(node => {
                const d = L.latLng(e.latlng).distanceTo([node.lat, node.lng]) / 1000;
                return { name: node.name, dist: d.toFixed(1) };
            }).sort((a,b) => a.dist - b.dist);
            setRadarResults({ pos: e.latlng, nodes: dists });
        }
      }
    });
    return null;
  };

  // --- RENDER UI ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. LANDING PAGE OVERLAY */}
      {showLanding && <LandingPage onEnter={() => setShowLanding(false)} />}

      {/* --- NEW: FULL SCREEN IMAGE MODAL (LIGHTBOX) --- */}
      {fullScreenImage && (
          <div className="fixed inset-0 z-[11000] bg-black/95 flex justify-center items-center p-4 animate-in fade-in">
              <button 
                  onClick={() => setFullScreenImage(null)} 
                  className="absolute top-4 right-4 text-white bg-gray-800 p-2 rounded-full hover:bg-gray-700 z-[11001]"
              >
                  <X size={24}/>
              </button>
              
              <img 
                  src={fullScreenImage} 
                  className="max-w-full max-h-full object-contain cursor-zoom-out" 
                  onClick={() => setFullScreenImage(null)}
              />
              
              <a 
                  href={fullScreenImage} 
                  download 
                  target="_blank" 
                  rel="noreferrer"
                  className="absolute bottom-8 bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl hover:bg-gray-200 z-[11001]"
              >
                  <Download size={18}/> Download HD
              </a>
          </div>
      )}

      {/* 2. MAIN APP */}
      <div className={`flex flex-col h-full transition-opacity duration-1000 ${showLanding ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* --- MOBILE TOP HEADER --- */}
      <header className="bg-slate-900 px-4 py-3 flex justify-between items-center z-[2000] shadow-md text-white md:hidden">
          <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-1.5 rounded-lg shadow-lg">
                  <Crosshair size={18} className="animate-spin-slow" />
              </div>
              <h1 className="text-sm font-black tracking-tighter">SAFE LAND</h1>
          </div>
          <div className="flex gap-3">
              <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)} 
                  className={`${isSearchOpen ? 'text-yellow-400' : 'text-white'}`}
              >
                  <Search size={20}/>
              </button>
              <button onClick={() => setShowPinModal(true)}>
                  {isAdmin ? <Unlock size={20} className="text-green-400"/> : <Lock size={20}/>}
              </button>
          </div>
      </header>

      {/* --- MOBILE SEARCH BAR --- */}
      {isSearchOpen && (
          <div className="bg-slate-800 p-3 md:hidden z-[1999] border-b border-slate-700 animate-in slide-in-from-top-2">
              <div className="flex gap-2">
                  <input 
                      placeholder="Search Location (e.g. Shadnagar)..." 
                      className="w-full p-2 rounded-lg text-sm outline-none bg-slate-700 text-white placeholder-slate-400" 
                      autoFocus 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={async (e) => { 
                          if(e.key === 'Enter'){ 
                              const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`); 
                              const data = await res.json(); 
                              if(data && data[0]) { setTempSearchMarker([data[0].lat, data[0].lon]); setIsSearchOpen(false); } 
                          } 
                      }}
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="text-slate-400"><X size={20}/></button>
              </div>
          </div>
      )}

      {/* --- DESKTOP HEADER --- */}
      <header className="hidden md:flex bg-slate-900 px-4 py-3 justify-between items-center z-[2000] shadow-md text-white">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-1.5 rounded-lg shadow-lg">
                <Crosshair size={20} className="animate-spin-slow" />
            </div>
            <div>
                <h1 className="text-lg font-black tracking-tighter leading-none">SAFE LAND</h1>
                <p className="text-[9px] text-gray-400 tracking-widest uppercase">Intelligence Console</p>
            </div>
        </div>
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700 backdrop-blur-md">
            <button 
                onClick={() => setViewMode('MARKETPLACE')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode==='MARKETPLACE' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'text-slate-400'}`}
            >
                <Store size={14}/> Market
            </button>
            <button 
                onClick={() => setViewMode('VENTURE')} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode==='VENTURE' ? 'bg-orange-500 text-white shadow-lg scale-105' : 'text-slate-400'}`}
            >
                <PenTool size={14}/> Planner
            </button>
            {isAdmin && 
                <button 
                    onClick={() => setViewMode('ADMIN')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode==='ADMIN' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-slate-400'}`}
                >
                    <List size={14}/> Admin
                </button>
            }
        </div>
        <div className="flex gap-2 items-center">
            <div className="bg-slate-800 px-3 py-1.5 rounded-full items-center gap-2 border border-slate-700 flex">
                <Search size={14} className="text-gray-400"/>
                <input 
                    placeholder="Search..." 
                    className="bg-transparent outline-none text-sm w-32 text-white placeholder-gray-500" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    onKeyDown={async (e) => { if(e.key === 'Enter'){ const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`); const data = await res.json(); if(data && data[0]) setTempSearchMarker([data[0].lat, data[0].lon]); } }} 
                />
            </div>
            <button 
                onClick={() => setShowPremiumRequest(true)} 
                className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg"
            >
                <ShieldCheck size={14}/> Request Audit
            </button>
            <button 
                onClick={() => setShowPinModal(true)} 
                className={`p-2 rounded-lg transition-all ${isAdmin ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
                {isAdmin ? <Unlock size={16}/> : <Lock size={16}/>}
            </button>
        </div>
      </header>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 relative z-0 pb-16 md:pb-0"> 
        {viewMode === 'ADMIN' ? (
          <div className="h-full overflow-auto p-4 bg-gray-100">
              <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
                      <h2 className="text-xl font-black flex items-center gap-2"><List/> Ad Database</h2>
                      <div className="flex gap-2 flex-wrap justify-center">
                          <button onClick={() => fetchMarketplaceAds()} className="p-2 bg-white border rounded hover:bg-gray-50"><RefreshCw size={16}/></button>
                          <button onClick={() => setShowLinksModal(true)} className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-bold flex items-center gap-1"><Globe size={14}/> Govt Links</button>
                          <button onClick={() => setShowRatingModal(true)} className="px-3 py-2 bg-purple-600 text-white rounded text-xs font-bold flex items-center gap-1"><ShieldCheck size={14}/> Audit Tool</button>
                      </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                      <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                              <tr>
                                  <th className="p-4">Type</th>
                                  <th className="p-4">Price</th>
                                  <th className="p-4">Contact</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                              {marketAds.map(ad => (
                                  <tr key={ad.id} className="border-b hover:bg-gray-50">
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
        ) : (
        /* MAP VIEW */
        <MapContainer center={[17.2360, 78.4192]} zoom={13} maxZoom={22} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Satellite">
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" maxNativeZoom={18} maxZoom={22} />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Street">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" />
                </LayersControl.BaseLayer>
            </LayersControl>

            <FlyToSearchResult />

            {/* AD MODE BANNER (MOBILE FIX) */}
            {adMode && !newAdLocation && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[3000] bg-black text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold animate-pulse">
                    <MapPin size={14} className="text-yellow-400"/> Tap map to pin location
                    <button onClick={()=>setAdMode(null)} className="ml-2 bg-white/20 p-1 rounded-full"><X size={12}/></button>
                </div>
            )}
            
            {/* MARKERS */}
            {viewMode === 'MARKETPLACE' && marketAds.map((ad) => {
                const isAmbassador = ad.price === '0' || ad.price === '0 ' || ad.price === 'FREE';
                return (
                <React.Fragment key={ad.id}>
                    <Marker position={[ad.lat, ad.lng]} icon={isAmbassador ? GoldIcon : DefaultIcon}>
                      <Popup className={isAmbassador ? "ambassador-popup" : "premium-popup"}>
                          <div className={`min-w-[200px] ${isAmbassador ? 'bg-slate-900 text-white -m-4 rounded-xl border-2 border-yellow-500' : ''}`}>
                              {ad.image_url ? <img src={ad.image_url} className="w-full h-32 object-cover rounded-t-lg"/> : null}
                              <div className="p-3">
                                  <h3 className={`font-bold ${isAmbassador ? 'text-yellow-400' : 'text-green-700'}`}>{isAmbassador ? 'JOIN NOW' : ad.price}</h3>
                                  <p className="text-xs mb-2">{ad.size} | {ad.ad_type}</p>
                                  
                                  {/* Truncated Text in Popup */}
                                  {ad.description && <p className={`text-[10px] italic mb-2 p-1.5 rounded border ${isAmbassador ? 'bg-slate-800 border-slate-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>{ad.description.substring(0, 60)}...</p>}
                                  
                                  {ad.audio_url && <audio controls src={ad.audio_url} className="w-full h-6 mt-2" style={{filter: isAmbassador?'invert(1)':''}}/>}
                                  
                                  {/* POPUP ACTION BUTTONS (WITH SHARE) */}
                                  <div className="flex gap-2 mt-2">
                                      <button onClick={() => window.open(`https://wa.me/${ad.contact_info}`, '_blank')} className="flex-1 bg-green-600 text-white py-1 rounded text-xs font-bold">WhatsApp</button>
                                      <button onClick={() => setViewingAd(ad)} className="flex-1 bg-blue-600 text-white py-1 rounded text-xs font-bold">Details</button>
                                      <button onClick={() => handleShareAd(ad)} className="px-3 bg-slate-700 text-white py-1 rounded text-xs"><Share2 size={14}/></button>
                                  </div>
                              </div>
                          </div>
                      </Popup>
                    </Marker>
                    {ad.points && <Polygon positions={ad.points} pathOptions={{ color: isAmbassador ? 'gold' : 'yellow', fillColor: isAmbassador ? 'gold' : 'yellow', fillOpacity: 0.2 }} />}
                </React.Fragment>
            )})}
            
            {viewMode === 'VENTURE' && (
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl position="topright" onCreated={(e)=>{setCurrentShape(e); setShowSaveForm(true);}} draw={{ rectangle: false, polygon: { allowIntersection: false, showArea: false }, circle: false, circlemarker: false, marker: false, polyline: false }} />
                    {projects.map(p => (<Polygon key={p.id} positions={p.points} color={p.color || "cyan"}><Popup>{p.name}</Popup></Polygon>))}
                </FeatureGroup>
            )}
            
            {newAdLocation && <Marker position={newAdLocation} icon={DefaultIcon}><Popup>New Ad</Popup></Marker>}
            {tempSearchMarker && <Marker position={tempSearchMarker} icon={DefaultIcon}><Popup>Result</Popup></Marker>}
            
            {radarResults && <Popup position={radarResults.pos} onClose={()=>setRadarResults(null)}><div className="min-w-[180px]"><div className="bg-purple-600 text-white p-2 -m-3 mb-2 rounded-t font-bold text-xs">Growth Radar</div>{radarResults.nodes.map((n,i)=><div key={i} className="flex justify-between text-xs border-b py-1"><span>{n.name}</span><b>{n.dist} km</b></div>)}</div></Popup>}
            
            <MapClickHandler />
        </MapContainer>
      )}
      </div>

      {/* --- SUB-TOOLBAR (DESKTOP) --- */}
      {viewMode === 'MARKETPLACE' && (
        <div className="hidden md:flex bg-white border-b px-4 py-2 gap-3 items-center text-xs shadow-sm">
            <span className="font-bold text-blue-800 flex items-center gap-1"><Store size={12}/> MARKET TOOLS:</span>
            <button 
                onClick={() => { if(!adMode) { setViewMode('MARKETPLACE'); setAdMode('SELL'); setRadarMode(false); alert("Tap map to post"); } else { setAdMode(null); setNewAdLocation(null); } }} 
                className={`px-3 py-1 rounded border font-bold flex items-center gap-1 ${adMode ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-600 text-white'}`}
            >
                {adMode ? <X size={12}/> : <PlusCircle size={12}/>} {adMode ? 'Cancel' : 'Post Free Ad'}
            </button>
            <button 
                onClick={() => { setRadarMode(!radarMode); setAdMode(null); }} 
                className={`px-3 py-1 rounded border font-bold flex items-center gap-1 ${radarMode ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 border-purple-200'}`}
            >
                {radarMode ? <Zap size={12} className="animate-pulse"/> : <Radar size={12}/>} {radarMode ? 'Stop Radar' : 'Growth Radar'}
            </button>
            <button onClick={() => setShowLinksModal(true)} className="px-3 py-1 rounded border border-gray-200 bg-gray-50 text-gray-700 font-bold flex items-center gap-1 hover:bg-gray-100">
                <Globe size={12}/> Verify Land
            </button>
        </div>
      )}

      {/* --- BOTTOM NAVIGATION BAR (MOBILE) --- */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 md:hidden z-[3000] text-[10px] font-bold text-gray-500">
          <button onClick={() => setViewMode('MARKETPLACE')} className={`flex flex-col items-center ${viewMode==='MARKETPLACE' ? 'text-blue-600' : ''}`}>
              <Home size={20}/> Market
          </button>
          
          <button onClick={() => { setRadarMode(!radarMode); setAdMode(null); setViewMode('MARKETPLACE'); }} className={`flex flex-col items-center ${radarMode ? 'text-purple-600 animate-pulse' : ''}`}>
              <Radar size={20}/> Radar
          </button>
          
          <div className="relative -top-5">
              <button 
                  onClick={() => { if(!adMode) { setViewMode('MARKETPLACE'); setAdMode('SELL'); setRadarMode(false); setIsSearchOpen(true); } else { setAdMode(null); setNewAdLocation(null); } }} 
                  className={`p-3 rounded-full shadow-lg border-4 border-gray-50 ${adMode ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}
              >
                  {adMode ? <X size={24}/> : <PlusCircle size={24}/>}
              </button>
          </div>

          <button onClick={() => setShowLinksModal(true)} className="flex flex-col items-center">
              <Globe size={20}/> Verify
          </button>
          {isAdmin ? (
              <button onClick={() => setViewMode('ADMIN')} className={`flex flex-col items-center ${viewMode==='ADMIN' ? 'text-purple-600' : ''}`}><List size={20}/> Admin</button>
          ) : (
              <button onClick={() => setShowPremiumRequest(true)} className="flex flex-col items-center text-yellow-600"><Award size={20}/> Audit</button>
          )}
      </div>

      {/* --- POST AD MODAL (FULL) --- */}
      {newAdLocation && (
          <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-4 md:w-80 md:right-auto z-[5000] bg-white p-4 rounded-xl shadow-2xl border-2 border-blue-500 animate-in slide-in-from-bottom-10 max-h-[80vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-2 border-b pb-2">
                   <h3 className="font-bold text-blue-600">Post New Ad</h3>
                   <button onClick={() => { setNewAdLocation(null); setAdMode(null); }} className="bg-gray-100 p-1 rounded-full"><X size={16}/></button>
               </div>
               <div className="space-y-2">
                   <select className="w-full border p-2 rounded text-sm font-bold" onChange={e => setNewAdData({...newAdData, type: e.target.value})}>
                       <option value="SELL">Sell Plot</option>
                       <option value="LOOKING">Looking For</option>
                   </select>
                   
                   <div className="flex gap-2">
                       <input placeholder="Size" type="number" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, size: e.target.value})} />
                       <input placeholder="Price" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, price: e.target.value})} />
                   </div>
                   
                   <input placeholder="WhatsApp" className="w-full border p-2 rounded text-sm" onChange={e => setNewAdData({...newAdData, contact: e.target.value})} />
                   <textarea placeholder="Description (e.g. 'Corner plot, clear title')" className="w-full border p-2 rounded text-sm h-16" onChange={e => setNewAdData({...newAdData, desc: e.target.value})} />
                   
                   {/* MEDIA UPLOADS (Expanded for clarity) */}
                   <div className="grid grid-cols-2 gap-2">
                       <div className={`border border-dashed p-2 rounded text-center ${newAdData.image_url ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                           <label className="text-xs cursor-pointer block">
                               <UploadCloud size={14} className={`mx-auto ${newAdData.image_url ? 'text-green-600' : 'text-gray-400'}`}/>
                               <span className={newAdData.image_url ? 'text-green-700 font-bold' : ''}>{newAdData.image_url ? '✅ Ready' : 'Photo'}</span>
                               <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                           </label>
                       </div>
                       <div className={`border border-dashed p-2 rounded text-center ${newAdData.audio_url ? 'border-green-500 bg-green-50' : 'border-purple-300'}`}>
                           <label className="text-xs cursor-pointer block">
                               <Mic size={14} className={`mx-auto ${newAdData.audio_url ? 'text-green-600' : 'text-purple-400'}`}/>
                               <span className={newAdData.audio_url ? 'text-green-700 font-bold' : ''}>{newAdData.audio_url ? '✅ Ready' : 'Audio'}</span>
                               <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} />
                           </label>
                       </div>
                   </div>
                   
                   <input placeholder="Video Link (YouTube)" className="w-full border p-2 rounded text-sm bg-gray-50" onChange={e => setNewAdData({...newAdData, video_url: e.target.value})} />
                   
                   <button onClick={handlePostAd} disabled={uploading || !newAdData.contact || !newAdData.price} className={`w-full py-2 rounded font-bold ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                       {uploading ? 'Uploading...' : 'Submit Ad'}
                   </button>
               </div>
          </div>
      )}

      {/* --- VIEW AD MODAL (WELCOME CARD) --- */}
      {viewingAd && (
          <div className="fixed inset-0 bg-black/70 z-[9999] flex justify-center items-center p-4 animate-in fade-in">
              <div className={`rounded-xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl ${viewingAd.price === '0' ? 'bg-slate-900 text-white border-2 border-yellow-500' : 'bg-white'}`}>
                  <div className="h-48 relative bg-gray-100 group">
                      {viewingAd.image_url ? 
                          <img 
                              src={viewingAd.image_url} 
                              className="w-full h-full object-cover cursor-zoom-in" 
                              onClick={() => setFullScreenImage(viewingAd.image_url)}
                          /> 
                      : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">NO IMAGE</div>}
                      
                      {/* Zoom Hint Overlay */}
                      {viewingAd.image_url && (
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100">
                              <Maximize2 className="text-white"/>
                          </div>
                      )}

                      <button onClick={()=>setViewingAd(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black"><X size={20}/></button>
                      {viewingAd.price === '0' && <div className="absolute bottom-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><ShieldCheck size={12}/> OFFICIAL PLATFORM</div>}
                  </div>
                  
                  <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <h2 className={`text-2xl font-black ${viewingAd.price === '0' ? 'text-yellow-400' : 'text-slate-800'}`}>{viewingAd.price === '0' ? 'JOIN NOW (FREE)' : viewingAd.price}</h2>
                              <p className={`text-sm font-bold ${viewingAd.price === '0' ? 'text-gray-400' : 'text-slate-500'}`}>{viewingAd.size} | {viewingAd.ad_type}</p>
                          </div>
                      </div>
                      
                      {/* FIXED: Scrollable Description Box */}
                      {viewingAd.description && (
                          <div className={`text-sm mb-4 p-3 rounded-lg border max-h-32 overflow-y-auto custom-scrollbar ${viewingAd.price === '0' ? 'bg-slate-800 border-slate-700 text-gray-300' : 'bg-slate-50 text-gray-700 border-slate-200'}`}>
                              {viewingAd.description}
                          </div>
                      )}
                      
                      {viewingAd.audio_url && (
                          <div className={`mb-4 p-2 rounded border ${viewingAd.price === '0' ? 'bg-slate-800 border-slate-700' : 'bg-purple-50 border-purple-100'}`}>
                              <p className={`text-xs font-bold flex items-center gap-1 mb-1 ${viewingAd.price === '0' ? 'text-yellow-500' : 'text-purple-700'}`}><Mic size={12}/> Voice Note</p>
                              <audio controls src={viewingAd.audio_url} className="w-full h-8" style={{ filter: viewingAd.price === '0' ? 'invert(1)' : 'none' }} />
                          </div>
                      )}

                      <div className="space-y-2">
                          <button onClick={() => window.open(`https://wa.me/${viewingAd.contact_info}`, '_blank')} className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${viewingAd.price === '0' ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                              <MessageCircle size={18}/> WhatsApp Owner
                          </button>
                          
                          <div className="flex gap-2">
                              {viewingAd.video_url && (
                                  <button onClick={() => window.open(viewingAd.video_url, '_blank')} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-red-700">
                                      <Video size={14}/> Watch Video
                                  </button>
                              )}
                              <button onClick={() => handleShareAd(viewingAd)} className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${viewingAd.price === '0' ? 'bg-slate-700 text-white' : 'bg-blue-100 text-blue-700'}`}>
                                  <Share2 size={14}/> Share
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- LINKS MODAL --- */}
      {showLinksModal && (
          <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center p-4">
              <div className="bg-white p-6 rounded-xl w-full max-w-md">
                  <div className="flex justify-between border-b pb-2 mb-2">
                      <h3 className="font-bold">Official Verification</h3>
                      <button onClick={()=>setShowLinksModal(false)}><X/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                      {GOVT_LINKS.map(link => (
                          <a key={link.name} href={link.url} target="_blank" className="bg-blue-50 p-2 rounded text-xs text-blue-700 block border hover:bg-blue-100">{link.name}</a>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* --- PIN MODAL --- */}
      {showPinModal && (
          <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center items-center backdrop-blur-sm">
              <div className="bg-white p-6 rounded-xl w-72 shadow-2xl">
                  <h3 className="font-bold mb-4">Admin Login</h3>
                  <input type="password" value={pinInput} onChange={(e)=>setPinInput(e.target.value)} className="w-full border p-2 rounded mb-4 text-center tracking-widest" placeholder="PIN"/>
                  <button onClick={()=>{ if(pinInput===PIN_CODE){ setIsAdmin(true); setShowPinModal(false); } else alert("Wrong PIN"); }} className="w-full bg-black text-white py-2 rounded font-bold">Unlock</button>
              </div>
          </div>
      )}
      
      {/* --- TRUTH ENGINE MODAL (FULL) --- */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/80 z-[7000] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-4 text-white flex justify-between items-center shrink-0">
                    <div><h2 className="font-bold flex items-center gap-2 text-lg"><ShieldCheck className="text-yellow-400"/> Truth & Risk Engine</h2></div>
                    <button onClick={() => setShowRatingModal(false)} className="hover:bg-white/20 p-1 rounded"><X size={20}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* SECTION 1: EVIDENCE */}
                    <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="text-xs font-black text-blue-800 uppercase mb-3 flex items-center gap-1"><FileText size={12}/> 1. Evidence Locker (Upload Proofs)</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-gray-500 text-center">
                            <div className="border border-dashed border-gray-300 p-2 rounded bg-white">
                                <label className="cursor-pointer block"><UploadCloud size={14} className="mx-auto mb-1"/> Approval Doc<input type="file" className="hidden"/></label>
                            </div>
                            <div className="border border-dashed border-gray-300 p-2 rounded bg-white">
                                <label className="cursor-pointer block"><UploadCloud size={14} className="mx-auto mb-1"/> EC / Link Doc<input type="file" className="hidden"/></label>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: FACTS FEED */}
                    <div className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="text-xs font-black text-slate-500 uppercase mb-3 flex items-center gap-1"><CheckCircle size={12}/> 2. The Human Feed (Facts)</h3>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500">Authority Status</label>
                                <select className="w-full border p-2 rounded text-sm mt-1 font-bold" onChange={(e) => setRatingData({...ratingData, approval: e.target.value})}>
                                    <option value="Unapproved">Unapproved / GP</option>
                                    <option value="HMDA">HMDA Approved</option>
                                    <option value="DTCP">DTCP Approved</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500">Full Tank Level (FTL)?</label>
                                <select className="w-full border p-2 rounded text-sm mt-1 font-bold text-red-600" onChange={(e) => setRatingData({...ratingData, isInFTL: e.target.value === 'YES'})}>
                                    <option value="NO">Outside FTL (Safe)</option>
                                    <option value="YES">INSIDE FTL (DANGER)</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                 <label className="text-[10px] font-bold text-gray-500">Road Width (ft)</label>
                                 <input type="number" className="w-full border p-2 rounded text-sm font-bold" placeholder="e.g. 30" onChange={(e) => setRatingData({...ratingData, roadWidth: e.target.value})}/>
                             </div>
                             <div className="flex items-center gap-2 mt-4">
                                 <input type="checkbox" className="w-4 h-4" onChange={(e) => setRatingData({...ratingData, hasEc: e.target.checked})}/>
                                 <label className="text-xs font-bold">EC Available?</label>
                             </div>
                        </div>
                    </div>

                    {/* SECTION 3: ENVIRONMENT */}
                    <div className="mb-4 bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="text-xs font-black text-green-800 uppercase mb-3 flex items-center gap-1"><Wind size={12}/> 3. Vaastu & Environment</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-500">Pollution / Noise?</label>
                                <select className="w-full border p-2 rounded text-sm mt-1 font-bold" onChange={(e) => setRatingData({...ratingData, pollution: e.target.value})}>
                                    <option value="None">None (Peaceful)</option>
                                    <option value="Industrial">Industrial Zone</option>
                                    <option value="Highway">High Noise</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-500">Vaastu Compliance</label>
                                <select className="w-full border p-2 rounded text-sm mt-1 font-bold" onChange={(e) => setRatingData({...ratingData, vaastu: e.target.value})}>
                                    <option value="Good">Good (100%)</option>
                                    <option value="Average">Average (50%)</option>
                                    <option value="Bad">Bad (0%)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t bg-white shrink-0">
                     <button 
                         onClick={() => generatePDF(false)} 
                         className="w-full bg-indigo-900 text-white py-3 rounded-lg font-bold hover:bg-black flex items-center justify-center gap-2 shadow-lg"
                     >
                         <FileText size={18}/> Generate Truth Report (PDF)
                     </button>
                </div>
            </div>
        </div>
      )}

      {/* --- EDIT AD MODAL (FULL) --- */}
      {editingAd && (
          <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-center backdrop-blur-sm p-4">
              <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl overflow-y-auto max-h-[90vh]">
                   <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Edit size={16}/> Edit Ad</h3>
                      <button onClick={()=>setEditingAd(null)} className="hover:bg-gray-100 p-1 rounded"><X size={20}/></button>
                   </div>
                   <div className="space-y-3">
                       <div>
                           <label className="text-xs font-bold text-gray-500">Price</label>
                           <input className="w-full border p-2 rounded text-sm font-bold" value={editingAd.price} onChange={e => setEditingAd({...editingAd, price: e.target.value})} />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-500">Size</label>
                           <input className="w-full border p-2 rounded text-sm" value={editingAd.size} onChange={e => setEditingAd({...editingAd, size: e.target.value})} />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-500">Contact</label>
                           <input className="w-full border p-2 rounded text-sm" value={editingAd.contact_info} onChange={e => setEditingAd({...editingAd, contact_info: e.target.value})} />
                       </div>
                       <div>
                           <label className="text-xs font-bold text-gray-500">Description</label>
                           <textarea className="w-full border p-2 rounded text-sm h-16" value={editingAd.description || ''} onChange={e => setEditingAd({...editingAd, description: e.target.value})} />
                       </div>

                       <div className="border border-dashed border-gray-300 p-2 rounded bg-gray-50 text-center">
                           <label className="text-xs font-bold text-gray-500 flex items-center justify-center gap-1 cursor-pointer">
                               <UploadCloud size={14}/> Change Photo
                               <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image', true)} />
                           </label>
                           {editingAd.image_url && <img src={editingAd.image_url} alt="Preview" className="h-10 w-full object-contain mt-2"/>}
                       </div>
                       <div className="border border-dashed border-purple-300 p-2 rounded bg-purple-50 text-center">
                           <label className="text-xs font-bold text-purple-600 flex items-center justify-center gap-1 cursor-pointer">
                               <Mic size={14}/> Change Voice Note
                               <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio', true)} />
                           </label>
                           {editingAd.audio_url && <audio controls src={editingAd.audio_url} className="w-full h-6 mt-2"/>}
                       </div>
                       <div className="flex gap-2 pt-2">
                           <button onClick={()=>setEditingAd(null)} className="flex-1 bg-gray-200 py-2 rounded font-bold text-xs">Cancel</button>
                           <button onClick={handleUpdateAd} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold text-xs hover:bg-blue-700">Save Changes</button>
                       </div>
                   </div>
              </div>
          </div>
      )}

      </div>
    </div>
  );
};

export default RealEstateSearchApp;