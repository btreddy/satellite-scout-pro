// ============================================================================
// SAFE LAND INTELLIGENCE CONSOLE - SYSTEM V16.3 (THE AUDITOR EDITION)
// ============================================================================
//
// FEATURING:
// 1. MOBILE-FIRST UI (Instagram-style Navigation)
// 2. THE TRUTH ENGINE (Audit & Risk Analysis)
// 3. AGENT ROUTING (Dynamic WhatsApp Links)
// 4. HD ZOOM (Lightbox Image Viewer)
// 5. VIDEO DEMO INTEGRATION (YouTube Support)
// 6. STICKY CONTACT BAR (Follows user on map)
// 7. EXCLUSIVE AGENT MODE (White-label view)
// 8. COORDINATE EDITOR (Manual Pin Adjustment)
//
// ============================================================================

import React, { 
  useState, 
  useEffect, 
  useRef 
} from 'react';

// --- LEAFLET MAP IMPORTS ---
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

// --- STYLES ---
import 'leaflet/dist/leaflet.css';
import "leaflet-draw/dist/leaflet.draw.css"; 

// --- DATABASE & TOOLS ---
import { createClient } from '@supabase/supabase-js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

// --- ICONS (LUCIDE REACT) ---
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
  Maximize2,
  Link as LinkIcon,
  PlayCircle,
  Minimize2,
  Navigation
} from 'lucide-react';

// ============================================================================
// --- CONFIGURATION & ENVIRONMENT VARIABLES ---
// ============================================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const PIN_CODE = import.meta.env.VITE_ADMIN_PIN || "1234"; 
const ADMIN_PHONE = import.meta.env.VITE_ADMIN_PHONE || "917013007595"; 

// Initialize Database Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// --- DATA CONSTANTS ---
// ============================================================================

// Official Government Portal Links
const GOVT_LINKS = [
    { 
      name: "Bhubharathi (Land Status)", 
      url: "https://bhubharati.telangana.gov.in/knowLandStatus" 
    },
    { 
      name: "CCLA (Integrated Registry)", 
      url: "https://ccla.telangana.gov.in/integratedLandRegistry.do" 
    },
    { 
      name: "IGRS (EC Search)", 
      url: "https://registration.telangana.gov.in/" 
    },
    { 
      name: "HMDA Master Plan 2031", 
      url: "https://www.hmda.gov.in/master-planning-2031" 
    },
    { 
      name: "RERA Telangana", 
      url: "https://rera.telangana.gov.in/" 
    },
    { 
      name: "Bhuvan (ISRO Maps)", 
      url: "https://bhuvan.nrsc.gov.in/" 
    }
];

// Growth Nodes for Radar Scan
const GROWTH_NODES = [
  { name: "Pharma Cluster", lat: 16.9800, lng: 78.6000 },
  { name: "Amazon Data Center", lat: 17.0500, lng: 78.5500 },
  { name: "Bharat Future City", lat: 16.9500, lng: 78.5800 },
  { name: "TCS Adibatla", lat: 17.2100, lng: 78.5300 } 
];

// ============================================================================
// --- LEAFLET ICON CONFIGURATION ---
// ============================================================================

// Standard Blue Pin
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Gold Ambassador Pin
const GoldIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;


// ============================================================================
// --- COMPONENT: LANDING PAGE (v18.3 - SPARK EDITION) ---
// ============================================================================
const LandingPage = ({ onEnter }) => {
    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900 text-white overflow-y-auto animate-in fade-in duration-700">
            <div className="min-h-full flex flex-col items-center justify-center p-4 py-8">
                
                {/* 1. HERO SECTION: The Paradigm Shift */}
                <div className="mb-8 text-center">
                    <div className="inline-block p-4 rounded-full bg-slate-800 border border-slate-700 shadow-2xl mb-4 relative">
                        <Crosshair size={56} className="text-blue-500 animate-spin-slow"/>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"/>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                        SAFE LAND
                    </h1>
                    <p className="text-blue-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-4">
                        SATELLITE INTELLIGENCE CONSOLE
                    </p>
                    <h2 className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
                        "Don't just <span className="text-slate-500 line-through">view</span> properties. <br className="md:hidden"/>
                        <span className="text-white font-bold border-b-2 border-blue-500">Audit</span> the Ground Reality."
                    </h2>
                </div>

                {/* 2. THE INTELLIGENCE MATRIX */}
                <div className="grid md:grid-cols-2 gap-5 text-left max-w-5xl mx-auto mb-8 w-full">
                    
                    {/* CARD 1: BUYER EMPOWERMENT (The Auditor) */}
                    <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-green-500/50 transition-all group hover:bg-slate-800/60">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-900/30 rounded-lg text-green-400"><ShieldCheck size={24}/></div>
                            <div>
                                <h3 className="font-bold text-lg text-white">For Buyers: The Truth Engine</h3>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Investigator Mode</p>
                            </div>
                        </div>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li className="flex gap-3 items-start">
                                <Search size={16} className="text-blue-400 shrink-0 mt-1"/> 
                                <span><b>Stop Buying Blind:</b> Use satellite data to spot FTL/Lake zones <i>before</i> you visit.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <DollarSign size={16} className="text-green-400 shrink-0 mt-1"/> 
                                <span><b>Negotiation Leverage:</b> Use our "Red Flags" (Road width, Zone) to negotiate a better price.</span>
                            </li>
                            <li className="flex gap-3 items-start pt-2 border-t border-slate-700/50">
                                <Mic size={16} className="text-purple-400 shrink-0 mt-1"/> 
                                <span><b>Evidence:</b> Hear the Owner's Voice directly. No distortion.</span>
                            </li>
                        </ul>
                    </div>

                    {/* CARD 2: AGENT TRANSFORMATION (The Consultant) */}
                    <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all group hover:bg-slate-800/60">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-900/30 rounded-lg text-blue-400"><Users size={24}/></div>
                            <div>
                                <h3 className="font-bold text-lg text-white">For Agents: Digital Showroom</h3>
                                <p className="text-xs text-slate-400 uppercase tracking-wider">Consultant Mode</p>
                            </div>
                        </div>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li className="flex gap-3 items-start">
                                <Zap size={16} className="text-yellow-400 shrink-0 mt-1"/> 
                                <span><b>Identity Shift:</b> Transform from 'Broker' to <b>'Tech Consultant'</b>. Share reports, not just photos.</span>
                            </li>
                            <li className="flex gap-3 items-start">
                                <Lock size={16} className="text-blue-400 shrink-0 mt-1"/> 
                                <span><b>Agent Multiplier:</b> The link routes leads to <span className="text-white font-bold underline decoration-blue-500">YOU</span>. You are the Digital Owner.</span>
                            </li>
                            <li className="flex gap-3 items-start pt-2 border-t border-slate-700/50">
                                <Layers size={16} className="text-purple-400 shrink-0 mt-1"/> 
                                <span><b>Brand Building:</b> Your personal digital office, protected by technology.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* 3. CALL TO ACTION (The Launch) */}
                <div className="flex flex-col items-center gap-5 mt-4">
                    <button 
                        onClick={onEnter} 
                        className="group relative bg-blue-600 hover:bg-blue-500 text-white text-xl font-black px-12 py-5 rounded-full shadow-2xl shadow-blue-900/50 transition-all transform hover:scale-105 overflow-hidden w-full md:w-auto min-w-[320px]"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"/>
                        <span className="flex items-center justify-center gap-3">
                            LAUNCH CONSOLE <ChevronRight className="group-hover:translate-x-1 transition-transform" size={24}/>
                        </span>
                    </button>

                    <div className="flex flex-wrap justify-center gap-3 w-full opacity-80 hover:opacity-100 transition-opacity">
                        
                        {/* UPDATED: SPARK AI BUTTON with DIRECT CHAT LINK */}
                        <button 
                            onClick={() => window.open('https://safelanddeal.com/meet/', '_blank')} 
                            className="flex items-center gap-2 bg-purple-900/30 hover:bg-purple-600/40 text-purple-200 hover:text-white border border-purple-500/30 hover:border-purple-400 transition-all px-6 py-2 rounded-full font-bold text-xs backdrop-blur-md"
                        >
                            <Zap size={14} className="text-purple-400 animate-pulse"/> Ask AI (Spark)
                        </button>

                        <button 
                            onClick={() => window.open(`https://wa.me/${ADMIN_PHONE}`, '_blank')} 
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all px-6 py-2 rounded-full font-bold text-xs"
                        >
                            <MessageCircle size={14} className="text-green-500"/> Founder Hotline
                        </button>
                    </div>
                    
                    <p className="text-slate-600 text-[10px] tracking-[0.2em] uppercase mt-4 font-medium">
                        V18.3 • Vertex AI Online • Hyderabad Region
                    </p>
                </div>
            </div>
        </div>
    );
};
// ============================================================================
// --- COMPONENT: AUDIT WORKFLOW (The "Guided Diligence" Panel) ---
// ============================================================================
const AuditWorkflow = ({ property, onClose }) => {
    if (!property) return null;

    const requestExpertAudit = () => {
        // This opens WhatsApp with a pre-filled message
        const text = `Hello Safe Land Desk! 🛡️\n\nI need an Expert Audit Report for Property ID: ${property.id} (${property.location}).\nPlease send payment details.`;
        window.open(`https://wa.me/919000000000?text=${encodeURIComponent(text)}`, '_blank'); // Replace 919000... with ADMIN_PHONE variable if available
    };

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

                {/* Scrollable Content */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
                    
                    {/* STEP 1: RERA */}
                    <div className="mb-6 relative pl-4 border-l-2 border-slate-700">
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-slate-900"/>
                        <h4 className="text-slate-200 font-bold text-sm mb-1 flex items-center gap-2">
                            <ShieldCheck size={16} className="text-green-500"/> 1. Verify RERA Status
                        </h4>
                        <p className="text-xs text-slate-400 mb-3 leading-relaxed">Ensure this venture is legally approved by the state (TSRERA) to protect your investment from litigation.</p>
                        <button onClick={() => window.open('https://rera.telangana.gov.in/', '_blank')} className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 py-2 px-3 rounded flex items-center justify-between transition-colors group">
                            Open TG RERA Portal <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </div>

                    {/* STEP 2: Dharani */}
                    <div className="mb-6 relative pl-4 border-l-2 border-slate-700">
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-slate-900"/>
                        <h4 className="text-slate-200 font-bold text-sm mb-1 flex items-center gap-2">
                            <Layers size={16} className="text-yellow-500"/> 2. Title & Prohibitions
                        </h4>
                        <p className="text-xs text-slate-400 mb-3 leading-relaxed">Check Dharani records to ensure the Survey No. is not in the "Prohibited List" (Assigned/Endowment land).</p>
                        <button onClick={() => window.open('https://dharani.telangana.gov.in/', '_blank')} className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 py-2 px-3 rounded flex items-center justify-between transition-colors group">
                            Open Dharani Records <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </div>

                    {/* STEP 3: HMDA */}
                    <div className="mb-6 relative pl-4 border-l-2 border-slate-700">
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-slate-900"/>
                        <h4 className="text-slate-200 font-bold text-sm mb-1 flex items-center gap-2">
                            <MapPin size={16} className="text-purple-500"/> 3. Zoning & FTL
                        </h4>
                        <p className="text-xs text-slate-400 mb-3 leading-relaxed">Verify HMDA Master Plan. Ensure it is Residential Zone (Yellow), not FTL/Water Body (Blue) or Buffer Zone.</p>
                        <button onClick={() => window.open('https://www.hmda.gov.in/', '_blank')} className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 py-2 px-3 rounded flex items-center justify-between transition-colors group">
                            Check Master Plan <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </div>
                </div>

                {/* Footer: UPSELL */}
                <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                    <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3">
                        <h4 className="text-white font-bold text-sm mb-1 flex items-center gap-2"><Zap size={14} className="text-yellow-400 fill-yellow-400"/> Confusion? We can help.</h4>
                        <p className="text-xs text-slate-300 mb-3">Get a certified <b>Safe Land Audit Report</b> created by our experts.</p>
                        <button onClick={requestExpertAudit} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/25 transition-all">
                            Request Expert Audit (₹499)
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
// ============================================================================
// --- MAIN APPLICATION COMPONENT ---
// ============================================================================
const RealEstateSearchApp = () => {
  
  // --- STATE VARIABLES ---
  const [auditProperty, setAuditProperty] = useState(null); // Controls the new panel
  
  // View Control
  const [showLanding, setShowLanding] = useState(true);
  const [viewMode, setViewMode] = useState('MARKETPLACE'); 
  
  // Admin & Security
  const [isAdmin, setIsAdmin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  
  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchMarker, setTempSearchMarker] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 

  // Modals Visibility
  const [showLinksModal, setShowLinksModal] = useState(false); 
  const [showPremiumRequest, setShowPremiumRequest] = useState(false); 
  const [showRatingModal, setShowRatingModal] = useState(false);
  
  // Ad Management State
  const [editingAd, setEditingAd] = useState(null);
  const [viewingAd, setViewingAd] = useState(null); 
  const [minimizedAd, setMinimizedAd] = useState(null); 
  const [fullScreenImage, setFullScreenImage] = useState(null); 

  // Admin Filtering
  const [filterText, setFilterText] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); 

  // Map Tools State
  const [adMode, setAdMode] = useState(null); 
  const [radarMode, setRadarMode] = useState(false); 
  const [newAdLocation, setNewAdLocation] = useState(null);
  const [marketAds, setMarketAds] = useState([]); 
  const [radarResults, setRadarResults] = useState(null);
  
  // Agent & Exclusive Mode State
  const [agentPhone, setAgentPhone] = useState(null);
  const [exclusiveAgent, setExclusiveAgent] = useState(null); 

  // New Ad Form Data
  const [newAdData, setNewAdData] = useState({ 
      type: 'SELL', size: '', price: '', contact: '', desc: '', 
      size_unit: 'Sq Yds', image_url: '', video_url: '', audio_url: '' 
  });
  const [uploading, setUploading] = useState(false); 

  // Projects / Planner Mode State
  const [projects, setProjects] = useState([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [currentShape, setCurrentShape] = useState(null); 
  const featureGroupRef = useRef(); 

  // Truth Engine / Audit Data State
  const [ratingData, setRatingData] = useState({ 
      approvalType: 'Unapproved', reraId: '', isInFTL: false, hasRoadAccess: true, 
      roadWidth: '30', hasEc: false, pollution: 'None', vaastu: 'Good', price: '', govtValue: ''
      
  });
  // --- NEW: BULK DELETE STATE ---
  const [selectedAds, setSelectedAds] = useState([]);

  // Toggle Checkbox Logic
  const toggleAdSelection = (id) => {
      if (selectedAds.includes(id)) {
          setSelectedAds(selectedAds.filter(adId => adId !== id)); // Uncheck
      } else {
          setSelectedAds([...selectedAds, id]); // Check
      }
  };

  // Bulk Delete Function
  const handleBulkDelete = async () => {
      if (selectedAds.length === 0) return;
      if (confirm(`Are you sure you want to delete ${selectedAds.length} ads permanently?`)) {
          const { error } = await supabase
              .from('marketplace_ads')
              .delete()
              .in('id', selectedAds); // Magic Supabase command
          
          if (!error) {
              setMarketAds(prev => prev.filter(ad => !selectedAds.includes(ad.id)));
              setSelectedAds([]); // Clear selection
              alert("✅ Bulk Delete Successful!");
          } else {
              alert("Error: " + error.message);
          }
      }
  };

  // ---------------------------------------------------------
  // --- INITIALIZATION EFFECTS ---
  // ---------------------------------------------------------
  
  useEffect(() => {
    // 1. Parse URL Parameters
    const params = new URLSearchParams(window.location.search);
    
    // 2. Check for AGENT Referral (Who gets the lead?)
    const referralAgent = params.get('agent');
    if (referralAgent) {
        setAgentPhone(referralAgent);
    }

    // 3. Check for EXCLUSIVE Mode (Who owns the portal?)
    const exclusive = params.get('exclusive_agent');
    if (exclusive) {
        setExclusiveAgent(exclusive);
        setShowLanding(false); // Skip landing in exclusive mode
    }

    // 4. Deep Link to specific Ad
    if (params.get('ad_id')) {
        setShowLanding(false);
    }
    
    // 5. Load Data
    fetchMarketplaceAds(exclusive);
    fetchProjects();
  }, [isAdmin]);

  // Handle Deep Linking Navigation (Fly to ad)
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

  // ---------------------------------------------------------
  // --- SUPABASE DATABASE FUNCTIONS ---
  // ---------------------------------------------------------

  // Fetch Ads (With Exclusive Mode Logic)
  const fetchMarketplaceAds = async (exclusiveId = null) => {
    try {
        let query = supabase.from('marketplace_ads').select('*').order('created_at', { ascending: false });
        
        // EXCLUSIVE MODE: Only show ads from specific number
        if (exclusiveId) {
            query = query.eq('contact_info', exclusiveId); 
        } 
        // NORMAL MODE: Show all approved ads
        else if (!isAdmin) {
            query = query.eq('status', 'APPROVED');
        }
        
        const { data, error } = await query;
        if (!error) {
            setMarketAds(data || []);
        }
    } catch(e) { 
        console.error(e); 
    }
  };

  // Upload Files (Images/Audio)
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
    } catch (error) {
        alert("Upload Failed: " + error.message);
    } finally {
        setUploading(false);
    }
  };

  // Submit New Ad
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
        lat: newAdLocation.lat, 
        lng: newAdLocation.lng,
        ad_type: newAdData.type, 
        size: newAdData.size + ' ' + newAdData.size_unit,
        price: newAdData.price, 
        contact_info: newAdData.contact, 
        description: newAdData.desc,
        image_url: newAdData.image_url, 
        video_url: newAdData.video_url, 
        audio_url: newAdData.audio_url,
        status: 'PENDING', 
        points: points
    };
    
    const { error } = await supabase.from('marketplace_ads').insert([newAd]);
    
    if (!error) { 
        alert("✅ Ad Submitted!"); 
        setAdMode(null); 
        setNewAdLocation(null); 
        fetchMarketplaceAds(exclusiveAgent);
        setNewAdData({ 
            type: 'SELL', size: '', price: '', contact: '', desc: '', 
            size_unit: 'Sq Yds', image_url: '', video_url: '', audio_url: '' 
        });
    } else { 
        alert(error.message); 
    }
  };

  // Update Ad (WITH LAT/LNG EDITING)
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
          status: editingAd.status,
          // UPDATED: Now updating coordinates too
          lat: parseFloat(editingAd.lat),
          lng: parseFloat(editingAd.lng)
      }).eq('id', editingAd.id);

      if(!error) {
          alert("✅ Ad Updated Successfully!");
          setEditingAd(null);
          fetchMarketplaceAds(exclusiveAgent);
      } else {
          alert("Update Failed: " + error.message);
      }
  };

  // Admin Actions
  const handleApproveAd = async (id) => { 
      await supabase.from('marketplace_ads').update({ status: 'APPROVED' }).eq('id', id); 
      fetchMarketplaceAds(exclusiveAgent); 
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

  // Share Functionality (Agent Mode)
  const handleShareAd = async (ad) => {
      const agentInput = prompt("👩‍💼 AGENT MODE:\nEnter your mobile number to route leads to YOU.\n(Leave empty to keep original owner)");
      
      let shareUrl = `https://maps.safelanddeal.com/?ad_id=${ad.id}`;
      
      if (agentInput && agentInput.trim() !== "") {
          shareUrl += `&agent=${agentInput.trim()}`;
      }

      if (exclusiveAgent) {
          shareUrl += `&exclusive_agent=${exclusiveAgent}`;
      }

      const shareText = `🔥 *${ad.price} | ${ad.size}* \n📍 *Safe Land Verified* \n👇 *View Details & Location:*`;
      
      if (navigator.share) {
          try { await navigator.share({ title: 'Safe Land Deal', text: shareText, url: shareUrl }); } 
          catch (error) { console.log('Error sharing', error); }
      } else {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
      }
  };

  const fetchProjects = async () => { const { data } = await supabase.from('projects').select('*'); if (data) setProjects(data); };
  const handleSaveProject = async (e) => {
    e.preventDefault(); if (!currentShape) return alert("No shape drawn!");
    try {
        const layer = currentShape.layer; let rawLatLngs = layer.getLatLngs(); if (Array.isArray(rawLatLngs[0]) && typeof rawLatLngs[0].lat !== 'number') rawLatLngs = rawLatLngs[0];
        const cleanPoints = rawLatLngs.map(p => ({ lat: p.lat, lng: p.lng })); const formData = new FormData(e.target);
        const newProject = { name: formData.get('label'), survey_number: formData.get('survey_no'), notes: formData.get('note'), points: cleanPoints, color: 'cyan' };
        const { error } = await supabase.from('projects').insert([newProject]); if (!error) { alert("✅ Project Saved!"); setShowSaveForm(false); fetchProjects(); if(featureGroupRef.current) featureGroupRef.current.clearLayers(); setCurrentShape(null); }
    } catch (err) { alert("Error saving shape."); }
  };

  const generatePDF = (isSample = false) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    const data = isSample ? { approvalType: 'HMDA', reraId: 'P02400001234', isInFTL: false, hasRoadAccess: true, roadWidth: '40', hasEc: true, pollution: 'None', vaastu: 'Good', price: '45000', govtValue: '12000' } : ratingData;

    doc.setFillColor(25, 25, 112); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont("helvetica", "bold");
    doc.text("SAFE LAND TRUTH REPORT", 15, 20);
    doc.setFontSize(10); doc.text(isSample ? "SAMPLE ANALYSIS" : "GENERATED BY SAFE LAND INTELLIGENCE", 15, 30);
    doc.text(`Date: ${date}`, 160, 30);

    doc.setTextColor(100, 100, 100); doc.setFontSize(8);
    doc.text("NOTE: This report is based on provided data. It helps in risk assessment but does not guarantee legal clearance.", 15, 48);

    let yPos = 60;
    doc.setTextColor(0, 0, 0); doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("1. Regulatory & Safety Facts", 15, yPos);
    
    const rows = [['Check', 'Fact Provided', 'Risk Level', 'Consequence / Warning']];
    if (data.approvalType === 'HMDA' || data.approvalType === 'DTCP') rows.push(['Authority', data.approvalType, 'LOW', '✅ Eligible for Bank Loan & Building Permission.']); else rows.push(['Authority', 'Unapproved/GP', 'HIGH', '❌ No Bank Loan. Demolition Risk. Resale is hard.']);
    if (data.isInFTL) rows.push(['Lake Buffer (FTL)', 'INSIDE FTL', 'CRITICAL', '⛔ GOVT PROPERTY. DO NOT BUY. 100% Loss Risk.']); else rows.push(['Lake Buffer (FTL)', 'Outside', 'LOW', '✅ Safe from Lake Buffer Regulations.']);
    if (data.hasEc) rows.push(['Encumbrance (EC)', 'Clear (Uploaded)', 'LOW', '✅ Ownership Chain appears verified.']); else rows.push(['Encumbrance (EC)', 'NOT PROVIDED', 'MEDIUM', '⚠️ Ownership dispute possible. Verify 30 years link.']);
    if (parseInt(data.roadWidth) < 30) {
        rows.push([
            'Road Access', 
            `${data.roadWidth} ft`, 
            'HIGH', 
            '❌ Too Narrow. Permit may be denied. Fire truck access?'
        ]);
    } else {
        rows.push([
            'Road Access', 
            `${data.roadWidth} ft`, 
            'LOW', 
            '✅ Good width for permission & value.'
        ]);
    }

    autoTable(doc, { startY: yPos + 5, head: [rows[0]], body: rows.slice(1), theme: 'grid', headStyles: { fillColor: [44, 62, 80] }, styles: { overflow: 'linebreak', fontSize: 9 }, columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 35 }, 2: { cellWidth: 25, fontStyle: 'bold', textColor: [255, 0, 0] }, 3: { cellWidth: 'auto' } } });
    yPos = doc.lastAutoTable.finalY + 20;
    doc.text("2. Vaastu & Environmental Reality", 15, yPos);
    const envRows = [['Factor', 'Observation', 'Impact']];
    envRows.push(['Pollution Zone', data.pollution, data.pollution === 'None' ? 'Positive' : 'Negative Health Impact']);
    envRows.push(['Vaastu Compliance', data.vaastu, data.vaastu === 'Good' ? 'High Demand' : 'Lower Resale Demand']);
    autoTable(doc, { startY: yPos + 5, head: [envRows[0]], body: envRows.slice(1), theme: 'striped', headStyles: { fillColor: [39, 174, 96] } });
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

  // ---------------------------------------------------------
  // --- RENDER UI ---
  // ---------------------------------------------------------
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      
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
                  className="absolute bottom-8 bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl hover:bg-gray-200 z-[11002]"
              >
                  <Download size={18}/> Download HD
              </a>
          </div>
      )}

      {/* 2. MAIN APP CONTENT */}
      <div 
          className={`flex flex-col h-full transition-opacity duration-1000 ${showLanding ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
      
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

      {/* --- MOBILE SEARCH BAR EXPANSION --- */}
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
                              if(data && data[0]) { 
                                  setTempSearchMarker([data[0].lat, data[0].lon]); 
                                  setIsSearchOpen(false); 
                              } 
                          } 
                      }}
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="text-slate-400">
                      <X size={20}/>
                  </button>
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
                <Search size={14} className="text-gray-400"/><input 
                    placeholder="Search..." 
                    className="bg-transparent outline-none text-sm w-32 text-white placeholder-gray-500" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    onKeyDown={async (e) => { 
                        if(e.key === 'Enter'){ 
                            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`); 
                            const data = await res.json(); 
                            if(data && data[0]) setTempSearchMarker([data[0].lat, data[0].lon]); 
                        } 
                    }} 
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

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 relative z-0 pb-16 md:pb-0"> 
        
        {/* --- VIEW: ADMIN DASHBOARD --- */}
        {viewMode === 'ADMIN' ? (
          <div className="h-full overflow-auto p-4 bg-gray-100">
              <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
                      <h2 className="text-xl font-black flex items-center gap-2">
                          <List/> Ad Database
                      </h2>
                      
                      {/* --- BULK DELETE BUTTON (Only shows when ads selected) --- */}
                      {selectedAds.length > 0 && (
                          <button 
                              onClick={handleBulkDelete}
                              className="bg-red-600 text-white px-4 py-2 rounded shadow-lg font-bold animate-pulse flex items-center gap-2"
                          >
                              <Trash2 size={16}/> Delete ({selectedAds.length}) Selected
                          </button>
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
                                      <input 
                                          type="checkbox" 
                                          onChange={(e) => {
                                              if(e.target.checked) setSelectedAds(marketAds.map(ad => ad.id));
                                              else setSelectedAds([]);
                                          }}
                                          checked={selectedAds.length === marketAds.length && marketAds.length > 0}
                                      />
                                  </th>
                                  <th className="p-4">Type</th>
                                  <th className="p-4">Price</th>
                                  <th className="p-4">Contact</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                              {marketAds.map(ad => (
                                  <tr key={ad.id} className={`border-b hover:bg-gray-50 ${selectedAds.includes(ad.id) ? 'bg-red-50' : ''}`}>
                                      <td className="p-4 text-center">
                                          <input 
                                              type="checkbox" 
                                              checked={selectedAds.includes(ad.id)} 
                                              onChange={() => toggleAdSelection(ad.id)}
                                          />
                                      </td>
                                      <td className="p-4">
                                          <span className={`px-2 py-1 rounded text-xs font-bold ${ad.ad_type==='SELL'?'bg-green-100 text-green-800':'bg-blue-100'}`}>
                                              {ad.ad_type}
                                          </span>
                                      </td>
                                      <td className="p-4 font-bold">{ad.price}</td>
                                      <td className="p-4 text-xs">{ad.contact_info}</td>
                                      <td className="p-4 text-xs">
                                          {ad.status === 'APPROVED' ? '✅ Live' : '🟠 Pending'}
                                      </td>
                                      <td className="p-4 text-right flex justify-end gap-1">
                                          {ad.status !== 'APPROVED' && (
                                              <button onClick={()=>handleApproveAd(ad.id)} className="p-1 bg-green-100 text-green-700 rounded"><CheckCircle size={14}/></button>
                                          )}
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
        /* --- VIEW: MAP INTERFACE --- */
        <MapContainer 
            center={[17.2360, 78.4192]} 
            zoom={13} 
            maxZoom={22} 
            style={{ height: "100%", width: "100%" }} 
            zoomControl={false}
        >
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Satellite">
                    <TileLayer 
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
                        attribution="Esri" 
                        maxNativeZoom={18} 
                        maxZoom={22} 
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Street">
                    <TileLayer 
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                        attribution="OSM" 
                    />
                </LayersControl.BaseLayer>
            </LayersControl>

            <FlyToSearchResult />

            {/* --- AD MODE BANNER --- */}
            {adMode && !newAdLocation && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[3000] bg-black text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-bold animate-pulse">
                    <MapPin size={14} className="text-yellow-400"/> Tap map to pin location
                    <button 
                        onClick={()=>setAdMode(null)} 
                        className="ml-2 bg-white/20 p-1 rounded-full"
                    >
                        <X size={12}/>
                    </button>
                </div>
            )}
            
            {/* --- MAP MARKERS --- */}
            {viewMode === 'MARKETPLACE' && marketAds.map((ad) => {
                const isAmbassador = ad.price === '0' || ad.price === '0 ' || ad.price === 'FREE';
                return (
                <React.Fragment key={ad.id}>
                    <Marker position={[ad.lat, ad.lng]} icon={isAmbassador ? GoldIcon : DefaultIcon}>
                      <Popup className={isAmbassador ? "ambassador-popup" : "premium-popup"}>
                          <div className={`min-w-[200px] ${isAmbassador ? 'bg-slate-900 text-white -m-4 rounded-xl border-2 border-yellow-500' : ''}`}>
                              {ad.image_url ? 
                                  <img 
                                      src={ad.image_url} 
                                      className="w-full h-32 object-cover rounded-t-lg"
                                  /> 
                              : null}
                              
                              <div className="p-3">
                                  <h3 className={`font-bold ${isAmbassador ? 'text-yellow-400' : 'text-green-700'}`}>
                                      {isAmbassador ? 'JOIN NOW' : ad.price}
                                  </h3>
                                  <p className="text-xs mb-2">{ad.size} | {ad.ad_type}</p>
                                  
                                  {/* TRUNCATED DESCRIPTION IN POPUP */}
                                  {ad.description && (
                                      <p className={`text-[10px] italic mb-2 p-1.5 rounded border ${isAmbassador ? 'bg-slate-800 border-slate-700 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                                          {ad.description.substring(0, 60)}...
                                      </p>
                                  )}
                                  
                                  {ad.audio_url && (
                                      <audio 
                                          controls 
                                          src={ad.audio_url} 
                                          className="w-full h-6 mt-2" 
                                          style={{filter: isAmbassador?'invert(1)':''}}
                                      />
                                  )}
                                  
                                  {/* POPUP ACTIONS */}
                                  <div className="flex gap-2 mt-2">
                                      <button 
                                          onClick={() => window.open(`https://wa.me/${agentPhone ? agentPhone : ad.contact_info}`, '_blank')} 
                                          className="flex-1 bg-green-600 text-white py-1 rounded text-xs font-bold"
                                      >
                                          {agentPhone ? 'WhatsApp Agent' : 'WhatsApp Owner'}
                                      </button>
                                      
                                      <button 
                                          onClick={() => setViewingAd(ad)} 
                                          className="flex-1 bg-blue-600 text-white py-1 rounded text-xs font-bold"
                                      >
                                          Details
                                      </button>
                                      
                                      <button 
                                          onClick={() => handleShareAd(ad)} 
                                          className="px-3 bg-slate-700 text-white py-1 rounded text-xs"
                                      >
                                          <Share2 size={14}/>
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </Popup>
                    </Marker>
                    
                    {/* DRAW POLYGON IF AVAILABLE */}
                    {ad.points && (
                        <Polygon 
                            positions={ad.points} 
                            pathOptions={{ 
                                color: isAmbassador ? 'gold' : 'yellow', 
                                fillColor: isAmbassador ? 'gold' : 'yellow', 
                                fillOpacity: 0.2 
                            }} 
                        />
                    )}
                </React.Fragment>
            )})}
            
            {/* --- PLANNER MODE SHAPES --- */}
            {viewMode === 'VENTURE' && (
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl 
                        position="topright" 
                        onCreated={(e)=>{setCurrentShape(e); setShowSaveForm(true);}} 
                        draw={{ 
                            rectangle: false, 
                            polygon: { allowIntersection: false, showArea: false }, 
                            circle: false, 
                            circlemarker: false, 
                            marker: false, 
                            polyline: false 
                        }} 
                    />
                    {projects.map(p => (
                        <Polygon 
                            key={p.id} 
                            positions={p.points} 
                            color={p.color || "cyan"}
                        >
                            <Popup>{p.name}</Popup>
                        </Polygon>
                    ))}
                </FeatureGroup>
            )}
            
            {newAdLocation && <Marker position={newAdLocation} icon={DefaultIcon}><Popup>New Ad</Popup></Marker>}
            {tempSearchMarker && <Marker position={tempSearchMarker} icon={DefaultIcon}><Popup>Result</Popup></Marker>}
            
            {/* --- RADAR RESULTS --- */}
            {radarResults && (
                <Popup position={radarResults.pos} onClose={()=>setRadarResults(null)}>
                    <div className="min-w-[180px]">
                        <div className="bg-purple-600 text-white p-2 -m-3 mb-2 rounded-t font-bold text-xs">
                            Growth Radar
                        </div>
                        {radarResults.nodes.map((n,i)=>(
                            <div key={i} className="flex justify-between text-xs border-b py-1">
                                <span>{n.name}</span><b>{n.dist} km</b>
                            </div>
                        ))}
                    </div>
                </Popup>
            )}
            
            <MapClickHandler />
        </MapContainer>
      )}
      </div>

      {/* --- DESKTOP SUB-TOOLBAR --- */}
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
            
            <button 
    onClick={(e) => {
        e.stopPropagation();
        setAuditProperty(property); // <--- THIS OPENS THE NEW PANEL
    }}
    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors"
>
    <ShieldCheck size={14} className="text-green-600"/> Verify Land
</button>
        </div>
      )}

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 md:hidden z-[3000] text-[10px] font-bold text-gray-500">
          <button 
              onClick={() => setViewMode('MARKETPLACE')} 
              className={`flex flex-col items-center ${viewMode==='MARKETPLACE' ? 'text-blue-600' : ''}`}
          >
              <Home size={20}/> Market
          </button>
          
          <button 
              onClick={() => { setRadarMode(!radarMode); setAdMode(null); setViewMode('MARKETPLACE'); }} 
              className={`flex flex-col items-center ${radarMode ? 'text-purple-600 animate-pulse' : ''}`}
          >
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
              <button 
                  onClick={() => setViewMode('ADMIN')} 
                  className={`flex flex-col items-center ${viewMode==='ADMIN' ? 'text-purple-600' : ''}`}
              >
                  <List size={20}/> Admin
              </button>
          ) : (
              <button 
                  onClick={() => setShowPremiumRequest(true)} 
                  className="flex flex-col items-center text-yellow-600"
              >
                  <Award size={20}/> Audit
              </button>
          )}
      </div>

      {/* --------------------------------------------------------- */}
      {/* --- NEW: STICKY CONTACT BAR (MINIMIZED AD) --- */}
      {/* --------------------------------------------------------- */}
      {minimizedAd && !viewingAd && (
          <div className="fixed bottom-20 left-4 right-4 md:bottom-24 md:left-auto md:right-4 md:w-80 bg-slate-900 text-white p-3 rounded-xl shadow-2xl z-[4000] flex items-center justify-between animate-in slide-in-from-bottom-5 border border-slate-700">
              <div className="flex-1 cursor-pointer" onClick={() => { setViewingAd(minimizedAd); setMinimizedAd(null); }}>
                  <p className="font-bold text-sm text-yellow-400">Last Viewed:</p>
                  <p className="font-black">{minimizedAd.price} | {minimizedAd.size}</p>
              </div>
              <div className="flex gap-2">
                  <button 
                      onClick={() => window.open(`https://wa.me/${agentPhone ? agentPhone : minimizedAd.contact_info}`, '_blank')} 
                      className="bg-green-600 p-2 rounded-full hover:bg-green-500"
                  >
                      <Phone size={18}/>
                  </button>
                  <button 
                      onClick={() => setMinimizedAd(null)} 
                      className="bg-slate-700 p-2 rounded-full hover:bg-slate-600"
                  >
                      <X size={18}/>
                  </button>
              </div>
          </div>
      )}

      {/* --------------------------------------------------------- */}
      {/* --- MODALS (POST, EDIT, VIEW, AUDIT) --- */}
      {/* --------------------------------------------------------- */}

      {/* --- POST AD MODAL --- */}

      {/* --- NEW AUDIT WORKFLOW PANEL --- */}
            <AuditWorkflow 
                property={auditProperty} 
                onClose={() => setAuditProperty(null)} 
            />
      {newAdLocation && (
          <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-4 md:w-80 md:right-auto z-[5000] bg-white p-4 rounded-xl shadow-2xl border-2 border-blue-500 animate-in slide-in-from-bottom-10 max-h-[80vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-2 border-b pb-2">
                   <h3 className="font-bold text-blue-600">Post New Ad</h3>
                   <button 
                       onClick={() => { setNewAdLocation(null); setAdMode(null); }} 
                       className="bg-gray-100 p-1 rounded-full"
                   >
                       <X size={16}/>
                   </button>
               </div>
               
               <div className="space-y-2">
                   <select 
                       className="w-full border p-2 rounded text-sm font-bold" 
                       onChange={e => setNewAdData({...newAdData, type: e.target.value})}
                   >
                       <option value="SELL">Sell Plot</option>
                       <option value="LOOKING">Looking For</option>
                   </select>
                   
                   <div className="flex gap-2">
                       <input 
                           placeholder="Size" 
                           type="number" 
                           className="w-full border p-2 rounded text-sm" 
                           onChange={e => setNewAdData({...newAdData, size: e.target.value})} 
                       />
                       <input 
                           placeholder="Price" 
                           className="w-full border p-2 rounded text-sm" 
                           onChange={e => setNewAdData({...newAdData, price: e.target.value})} 
                       />
                   </div>
                   
                   <input 
                       placeholder="WhatsApp" 
                       className="w-full border p-2 rounded text-sm" 
                       onChange={e => setNewAdData({...newAdData, contact: e.target.value})} 
                   />
                   
                   <textarea 
                       placeholder="Description (e.g. 'Corner plot, clear title')" 
                       className="w-full border p-2 rounded text-sm h-16" 
                       onChange={e => setNewAdData({...newAdData, desc: e.target.value})} 
                   />
                   
                   {/* MEDIA UPLOADS (Expanded for clarity) */}
                   <div className="grid grid-cols-2 gap-2">
                       <div className={`border border-dashed p-2 rounded text-center ${newAdData.image_url ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                           <label className="text-xs cursor-pointer block">
                               <UploadCloud size={14} className={`mx-auto ${newAdData.image_url ? 'text-green-600' : 'text-gray-400'}`}/>
                               <span className={newAdData.image_url ? 'text-green-700 font-bold' : ''}>
                                   {newAdData.image_url ? '✅ Ready' : 'Photo'}
                               </span>
                               <input 
                                   type="file" 
                                   accept="image/*" 
                                   className="hidden" 
                                   onChange={(e) => handleFileUpload(e, 'image')} 
                               />
                           </label>
                       </div>
                       
                       <div className={`border border-dashed p-2 rounded text-center ${newAdData.audio_url ? 'border-green-500 bg-green-50' : 'border-purple-300'}`}>
                           <label className="text-xs cursor-pointer block">
                               <Mic size={14} className={`mx-auto ${newAdData.audio_url ? 'text-green-600' : 'text-purple-400'}`}/>
                               <span className={newAdData.audio_url ? 'text-green-700 font-bold' : ''}>
                                   {newAdData.audio_url ? '✅ Ready' : 'Audio'}
                               </span>
                               <input 
                                   type="file" 
                                   accept="audio/*" 
                                   className="hidden" 
                                   onChange={(e) => handleFileUpload(e, 'audio')} 
                               />
                           </label>
                       </div>
                   </div>
                   
                   {/* VIDEO LINK INPUT */}
                   <input 
                       placeholder="Video Link (YouTube)" 
                       className="w-full border p-2 rounded text-sm bg-gray-50" 
                       onChange={e => setNewAdData({...newAdData, video_url: e.target.value})} 
                   />
                   
                   <button 
                       onClick={handlePostAd} 
                       disabled={uploading || !newAdData.contact || !newAdData.price} 
                       className={`w-full py-2 rounded font-bold ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                   >
                       {uploading ? 'Uploading...' : 'Submit Ad'}
                   </button>
               </div>
          </div>
      )}

      {/* --- VIEW AD MODAL (WELCOME CARD) --- */}
      {viewingAd && (
          <div className="fixed inset-0 bg-black/70 z-[9999] flex justify-center items-center p-4 animate-in fade-in">
              <div className={`rounded-xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl ${viewingAd.price === '0' ? 'bg-slate-900 text-white border-2 border-yellow-500' : 'bg-white'}`}>
                  
                  {/* IMAGE HEADER */}
                  <div className="h-48 relative bg-gray-100 group">
                      {viewingAd.image_url ? 
                          <img 
                              src={viewingAd.image_url} 
                              className="w-full h-full object-cover cursor-zoom-in" 
                              onClick={() => setFullScreenImage(viewingAd.image_url)}
                          /> 
                      : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">NO IMAGE</div>}
                      
                      {/* Zoom Hint */}
                      {viewingAd.image_url && (
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100">
                              <Maximize2 className="text-white"/>
                          </div>
                      )}

                      {/* MINIMIZE BUTTON (NEW) */}
                      <button 
                          onClick={() => { setMinimizedAd(viewingAd); setViewingAd(null); }} 
                          className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black"
                      >
                          <Minimize2 size={20}/>
                      </button>
                      
                      {viewingAd.price === '0' && <div className="absolute bottom-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><ShieldCheck size={12}/> OFFICIAL PLATFORM</div>}
                  </div>
                  
                  <div className="p-5">
                      {/* DETAILS HEADER */}
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <h2 className={`text-2xl font-black ${viewingAd.price === '0' ? 'text-yellow-400' : 'text-slate-800'}`}>
                                  {viewingAd.price === '0' ? 'JOIN NOW (FREE)' : viewingAd.price}
                              </h2>
                              <p className={`text-sm font-bold ${viewingAd.price === '0' ? 'text-gray-400' : 'text-slate-500'}`}>
                                  {viewingAd.size} | {viewingAd.ad_type}
                              </p>
                          </div>
                      </div>
                      
                      {/* SCROLLABLE DESCRIPTION */}
                      {viewingAd.description && (
                          <div className={`text-sm mb-4 p-3 rounded-lg border max-h-60 overflow-y-auto custom-scrollbar whitespace-pre-wrap ${viewingAd.price === '0' ? 'bg-slate-800 border-slate-700 text-gray-300' : 'bg-slate-50 text-gray-700 border-slate-200'}`}>
                              {viewingAd.description}
                          </div>
                      )}
                      
                      {/* AUDIO */}
                      {viewingAd.audio_url && (
                          <div className={`mb-4 p-2 rounded border ${viewingAd.price === '0' ? 'bg-slate-800 border-slate-700' : 'bg-purple-50 border-purple-100'}`}>
                              <p className={`text-xs font-bold flex items-center gap-1 mb-1 ${viewingAd.price === '0' ? 'text-yellow-500' : 'text-purple-700'}`}><Mic size={12}/> Voice Note</p>
                              <audio controls src={viewingAd.audio_url} className="w-full h-8" style={{ filter: viewingAd.price === '0' ? 'invert(1)' : 'none' }} />
                          </div>
                      )}

                      {/* ACTION BUTTONS */}
                      <div className="space-y-2">
                          <button 
                              onClick={() => window.open(`https://wa.me/${agentPhone ? agentPhone : viewingAd.contact_info}`, '_blank')} 
                              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${viewingAd.price === '0' ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-green-600 text-white hover:bg-green-700'}`}
                          >
                              <MessageCircle size={18}/> {agentPhone ? 'WhatsApp Agent' : 'WhatsApp Owner'}
                          </button>
                          
                          <div className="flex gap-2">
                              {/* --- VIDEO BUTTON (RED & VISIBLE) --- */}
                              {viewingAd.video_url && (
                                  <button 
                                      onClick={() => window.open(viewingAd.video_url, '_blank')} 
                                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-red-700 shadow-md"
                                  >
                                      <Video size={14}/> Watch Video
                                  </button>
                              )}
                              
                              <button 
                                  onClick={() => handleShareAd(viewingAd)} 
                                  className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 ${viewingAd.price === '0' ? 'bg-slate-700 text-white' : 'bg-blue-100 text-blue-700'}`}
                              >
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
                       
                       {/* --- NEW: SATELLITE COORDINATE CONTROL --- */}
                       <div className="bg-blue-50 p-2 rounded border border-blue-100">
                           <div className="flex justify-between">
                               <label className="text-xs font-bold text-blue-800 flex items-center gap-1"><Navigation size={12}/> Satellite Coordinates</label>
                               <span className="text-[10px] text-blue-600 cursor-pointer" onClick={() => navigator.clipboard.readText().then(text => { try { const [lat, lng] = text.split(','); if(lat && lng) setEditingAd({...editingAd, lat: lat.trim(), lng: lng.trim()}); } catch(e){} })}>Paste from Maps</span>
                           </div>
                           <div className="grid grid-cols-2 gap-2 mt-1">
                               <input 
                                   type="number" step="any"
                                   className="w-full border p-1 rounded text-xs" 
                                   placeholder="Latitude"
                                   value={editingAd.lat || ''} 
                                   onChange={e => setEditingAd({...editingAd, lat: e.target.value})} 
                               />
                               <input 
                                   type="number" step="any"
                                   className="w-full border p-1 rounded text-xs" 
                                   placeholder="Longitude"
                                   value={editingAd.lng || ''} 
                                   onChange={e => setEditingAd({...editingAd, lng: e.target.value})} 
                               />
                           </div>
                       </div>

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
                       
                       {/* --- VIDEO EDIT FIELD --- */}
                       <div>
                           <label className="text-xs font-bold text-gray-500">Video Link</label>
                           <input 
                               className="w-full border p-2 rounded text-sm" 
                               value={editingAd.video_url || ''} 
                               onChange={e => setEditingAd({...editingAd, video_url: e.target.value})} 
                           />
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