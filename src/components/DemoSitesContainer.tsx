import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Monitor, 
  Smartphone, 
  ExternalLink, 
  Sparkles, 
  Briefcase, 
  Camera, 
  Wrench, 
  Utensils, 
  ShoppingBag, 
  Award, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Phone, 
  Send, 
  X, 
  Percent, 
  ChevronRight, 
  MapPin, 
  Minus, 
  Plus, 
  DollarSign, 
  ShieldCheck,
  Star,
  Activity
} from "lucide-react";

interface DemoSitesContainerProps {
  currentPath: string;
}

import { useLeadTracker } from '../hooks/useLeadTracker';

export default function DemoSitesContainer({ currentPath }: DemoSitesContainerProps) {
  useLeadTracker('demo_viewed');

  const location = useLocation();
  const navigate = useNavigate();
  const internalPath = location.pathname;

  // 1. View State: Desktop vs Mobile View
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  
  // 2. Identify which demo to render based on URL
  const getDemoIdFromPath = (path: string): string => {
    const p = path.toLowerCase();
    if (p.includes("physio") || p.includes("medical") || p.includes("health")) return "physio";
    if (p.includes("portfolio") || p.includes("creative")) return "creative";
    if (p.includes("trades") || p.includes("builders")) return "trades";
    if (p.includes("restaurant") || p.includes("dining") || p.includes("cafe")) return "dining";
    if (p.includes("local") || p.includes("boutique") || p.includes("retail")) return "retail";
    if (p.includes("swimming") || p.includes("swim")) return "swim";
    return "corporate"; // default
  };

  const activeDemo = getDemoIdFromPath(internalPath);

  // Quick navigation helpers
  const handleBackToHomepage = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ----------------- DEMO STATE 1: CORPORATE / AEGIS ADVISORY -----------------
  const [roiRevenue, setRoiRevenue] = useState(1200000); // 1.2M default
  const [activePartner, setActivePartner] = useState<string | null>("andrew");
  const calculatedGrowth = Math.round(roiRevenue * 0.18); // 18% model uplift

  const partnersList = [
    { id: "andrew", name: "Andrew Sterling", role: "Managing Partner", bio: "Former Tier-1 Investment Strategy lead. Specializes in multi-channel scaling & operational transformation.", location: "Sydney Office" },
    { id: "sarah", name: "Sarah Chen", role: "Principal Architect", bio: "Leading digital system engineer. Expert at integrating secure SaaS workflows and cloud advisory services.", location: "Melbourne Office" },
    { id: "marcus", name: "Marcus Vance", role: "Risk Advisory Partner", bio: "Advises on enterprise risk mitigation, cross-border digital governance, and compliance protocols.", location: "Brisbane Guild" }
  ];

  // ----------------- DEMO STATE 2: CREATIVE PORTFOLIO / KRONOS -----------------
  const [portfolioTab, setPortfolioTab] = useState<"all" | "residential" | "commercial" | "installations">("all");
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<{title: string, desc: string, category: string, img: string} | null>(null);

  const galleryItems = [
    { title: "The Obsidian Pavilion", category: "residential", desc: "A sleek minimalist residential construct crafted in black basalt rock and tempered glass overlooking alpine panoramas.", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
    { title: "Aether Corporate Gallery", category: "commercial", desc: "Highly collaborative office atrium maximizing natural lux meters and acoustic dampening structural panels.", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" },
    { title: "Neo-Brutalist Studio", category: "residential", desc: "Raw architectural concrete spaces sculpted to frame visual contrasts, perfect for executive focus sessions.", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80" },
    { title: "Lumina Pavilion", category: "installations", desc: "Interactive lighting structure responsive to client presence, custom-designed to demonstrate architectural kinetic engineering.", img: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80" },
    { title: "Verdant Terrace Lofts", category: "commercial", desc: "Sustainable residential design integrating real hydroponic vertical walls and solar heat shielding.", img: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80" }
  ];

  // ----------------- DEMO STATE 3: APEX CONTRACTING & TRADES -----------------
  const [tradeSelection, setTradeSelection] = useState<"plumbing" | "electrical" | "construction" | "hvac">("plumbing");
  const [urgencyMode, setUrgencyMode] = useState<"routine" | "urgent" | "emergency">("urgent");
  const [tradesPostcode, setTradesPostcode] = useState("2000");
  const [showTradesResult, setShowTradesResult] = useState(true);

  const calculateTradesPrice = () => {
    let base = 120;
    if (tradeSelection === "electrical") base = 140;
    if (tradeSelection === "hvac") base = 155;
    if (tradeSelection === "construction") base = 180;

    let multiplier = 1.0;
    if (urgencyMode === "urgent") multiplier = 1.35;
    if (urgencyMode === "emergency") multiplier = 1.85;

    return Math.round(base * multiplier);
  };

  // ----------------- DEMO STATE 4: CAFE & DINING MENU -----------------
  const [menuTab, setMenuTab] = useState<"brunch" | "mains" | "drinks">("mains");
  const [bookedGuests, setBookedGuests] = useState(2);
  const [bookedDate, setBookedDate] = useState("2026-06-15");
  const [bookedTime, setBookedTime] = useState("19:00");
  const [bookedRoom, setBookedRoom] = useState("Tavern Hall");
  const [showBookingConf, setShowBookingConf] = useState(false);

  const menuItems = {
    brunch: [
      { name: "Organic Smashed Avocado", price: "24", desc: "Sourdough, fresh local goat feta, heirloom cherry vine tomatoes, organic sumac pearls." },
      { name: "Woodfire Shakshuka", price: "26", desc: "Three free-range eggs poached in heirloom bell pepper passata, served with burnt butter flatbread." },
      { name: "Single-Origin Colombia Drip Coffee", price: "8.5", desc: "Slow slow-brew extraction with chocolate aroma profile sourced from Antioquia cooperative producers." }
    ],
    mains: [
      { name: "Aged Victorian Duck Breast", price: "48", desc: "Pan-roasted crisp duck with salt-cured plum reductions, local parsnip purée, and native saltbush." },
      { name: "Smoked Wagyu Sirloin (MBS 7+)", price: "64", desc: "Cooked on red gum firebeds, with dry-hop red wine glaze, tallow chips, garden herbs." },
      { name: "Charred Heirloom Cauliflower Slab", price: "36", desc: "Creamy macadamia pureed base, spiced raisin chimichurri dressing, hand-picked lemon balm." }
    ],
    drinks: [
      { name: "Smoked Rosemary Negroni", price: "24", desc: "Dry botanical paper gin, Italian bitters, sweet vermouth, table-smoked on hickory wood boards." },
      { name: "Lemon Myrtle Spritz", price: "21", desc: "Prosecco base, local lemon myrtle tea concentrate, sparkling soda, fresh wild mint sprig." }
    ]
  };

  // ----------------- DEMO STATE 5: LUXURY BOUTIQUE RETAIL -----------------
  const [cartItems, setCartItems] = useState<{id: string, name: string, price: number, qty: number}[]>([]);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [showRetailConf, setShowRetailConf] = useState(false);
  const [selectedBoutiqueBranch, setSelectedBoutiqueBranch] = useState("Sydney - Paddington");

  const boutiqueItems = [
    { id: "robe", name: "Satin Silk Lounge Robe", price: 340, img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80", tagline: "100% fine mulberry threads." },
    { id: "concentrate", name: "Botanical Bath Concentrate", price: 85, img: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=400&q=80", tagline: "Chamomile extract and white cedar tea." },
    { id: "burner", name: "Solid Brass Incense Burner", price: 165, img: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=400&q=80", tagline: "Hand-molded in our Sydney workshop." }
  ];

  const addToCart = (item: typeof boutiqueItems[0]) => {
    const existing = cartItems.find(c => c.id === item.id);
    if (existing) {
      setCartItems(cartItems.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCartItems([...cartItems, { id: item.id, name: item.name, price: item.price, qty: 1 }]);
    }
    setIsBagOpen(true);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCartItems(cartItems.map(c => {
      if (c.id === id) {
        const nextQty = c.qty + delta;
        return nextQty > 0 ? { ...c, qty: nextQty } : null;
      }
      return c;
    }).filter(Boolean) as any);
  };

  const getCartTotal = () => cartItems.reduce((acc, c) => acc + (c.price * c.qty), 0);

  // ----------------- DEMO STATE 6: SWIM SCHEDULER -----------------
  const [swimBranch, setSwimBranch] = useState<"causeway" | "kowloon" | "pokfulam">("causeway");
  const [swimFilter, setSwimFilter] = useState<"all" | "kids" | "squads" | "master">("all");
  const [showSwimEnroll, setShowSwimEnroll] = useState<string | null>(null);
  const [swimEnrollName, setSwimEnrollName] = useState("");
  const [swimEnrollPhone, setSwimEnrollPhone] = useState("");
  const [showSwimSuccess, setShowSwimSuccess] = useState(false);

  const swimClasses = [
    { id: "aqua-kids-1", title: "AquaKids Foundation I", branch: "causeway", tier: "kids", time: "Mon 16:30 - 17:15", coach: "Coach Natalie", spots: 2, price: 280 },
    { id: "aqua-kids-2", title: "AquaKids Foundation I", branch: "pokfulam", tier: "kids", time: "Wed 15:30 - 16:15", coach: "Coach Natalie", spots: 4, price: 280 },
    { id: "junior-sprints", title: "Olympic Junior Sprints Squad", branch: "kowloon", tier: "squads", time: "Tue & Thu 18:00 - 19:30", coach: "Coach Marcus", spots: 1, price: 420 },
    { id: "master-analysis", title: "Master Stroke Analysis Slot", branch: "causeway", tier: "master", time: "Sat 09:00 - 10:15", coach: "Coach Gary (Olympic Rep)", spots: 1, price: 650 },
    { id: "adult-fit", title: "Adult Cardio Lap Endurance", branch: "pokfulam", tier: "master", time: "Fri 19:30 - 20:30", coach: "Coach Gary", spots: 6, price: 320 }
  ];

  const filteredSwimClasses = swimClasses.filter(c => {
    if (c.branch !== swimBranch) return false;
    if (swimFilter !== "all" && c.tier !== swimFilter) return false;
    return true;
  });

  // ----------------- DEMO STATE 7: MOTION PHYSIO -----------------
  const [physioStage, setPhysioStage] = useState<"home" | "booking">("home");
  const [physioService, setPhysioService] = useState<string | null>(null);

  // ...

  return (
    <div className="min-h-screen bg-[#070a19] text-slate-100 flex flex-col font-sans select-none">
      
      {/* 1. TOP PREMIUM CONTROL BAR */}
      <div className="bg-[#020512] border-b border-cyan-500/10 py-3.5 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 z-40 relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBackToHomepage}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/15 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Homepage</span>
          </button>
          
          <div className="h-4 w-px bg-white/10 hidden md:block" />
          
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">Clarity Design Preview</span>
            <span className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              {activeDemo === "corporate" && "Advisory Spec Demonstration Website Theme"}
              {activeDemo === "creative" && "Agency Showcase Portfolio Web Theme"}
              {activeDemo === "trades" && "Trades Contractor Responsive Portal Theme"}
              {activeDemo === "dining" && "Atmospheric Dining Menu & Booking Theme"}
              {activeDemo === "retail" && "Bespoke Luxury Boutique Catalog Theme"}
              {activeDemo === "swim" && "Sports Academy Timetable Scheduler Theme"}
              {activeDemo === "physio" && "Allied Health & Clinic Booking Theme"}
            </span>
          </div>
        </div>

        {/* Outer Control center */}
        <div className="flex items-center justify-between sm:justify-start gap-4 shrink-0">
          
          {/* Responsive Layout Switcher */}
          <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setDeviceMode("desktop")}
              className={`flex items-center gap-1 text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${deviceMode === "desktop" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop Web</span>
            </button>
            <button
              onClick={() => setDeviceMode("mobile")}
              className={`flex items-center gap-1 text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${deviceMode === "mobile" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile Phone</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE VIEW CONTAINER FRAME */}
      <div className="flex-grow p-4 md:p-8 bg-[#040716] flex items-center justify-center relative overflow-hidden">
        
        {/* Subtle decorative background patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute top-[30%] left-[10%] w-[350px] h-[350px] rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
        
        <div className={`w-full transition-all duration-300 flex justify-center items-center ${deviceMode === "mobile" ? "max-w-[430px]" : "max-w-[1300px]"}`}>
          
          {/* Simulated Browser Frame with visual Title/Address toolbar */}
          <div className="w-full bg-[#020412]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] container-scroll">
            
            {/* Browser Top URL Line Bar */}
            <div className="bg-[#0b0f27] border-b border-white/5 py-2.5 px-4 flex items-center justify-between pointer-events-none select-none">
              <div className="flex items-center gap-1.5 font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="bg-[#020514] border border-white/5 rounded-md px-4 sm:px-16 py-1 text-[10px] text-slate-500 font-mono tracking-tight text-center min-w-[180px] sm:min-w-[480px]">
                https://demo.clarityspace.com.au{internalPath}/preview
              </div>
              <div className="w-8 sm:w-12" /> {/* alignment spacer */}
            </div>

            {/* LIVE WEBSITE PREVIEW CANVAS - INTERNAL RENDER */}
            <div className="flex-grow overflow-y-auto overflow-x-hidden min-h-[500px] h-[64vh] text-left relative bg-slate-900">
              
              {/* ========================================================= */}
              {/* === THEME 1: Swiss Prussian Corporate (AEGIS ADVISORY) === */}
              {/* ========================================================= */}
              {activeDemo === "corporate" && (
                <div className="min-h-full bg-[#050b14] font-sans text-slate-200" id="corporate-theme-root">
                  {/* Mock Site Navbar */}
                  <header className="border-b border-amber-500/10 py-4.5 px-6 flex justify-between items-center bg-[#050b14]/90 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center font-bold font-mono text-slate-950 text-base shadow-lg shadow-amber-500/10">A</div>
                      <div className="flex flex-col text-left">
                        <span className="font-display font-black tracking-widest text-[#f5ebd6] text-sm leading-none uppercase">AEGIS ADVISORY</span>
                        <span className="text-[8px] font-mono tracking-wider text-amber-500 uppercase mt-0.5 font-bold">Advisory Desk Australia</span>
                      </div>
                    </div>
                    <nav className="hidden lg:flex items-center gap-6 text-[11px] uppercase tracking-wider text-slate-450 font-semibold font-mono">
                      <span className="hover:text-amber-350 cursor-pointer text-amber-400">01. Growth Matrix</span>
                      <span className="hover:text-amber-350 cursor-pointer">02. Executive Guild</span>
                      <span className="hover:text-amber-350 cursor-pointer">03. High-Trust SLA</span>
                    </nav>
                    <button className="bg-amber-400/10 border border-amber-400/35 hover:bg-amber-400 hover:text-slate-950 transition-all text-[10px] uppercase tracking-widest font-black font-mono px-3.5 py-1.5 rounded-md cursor-pointer">
                      Institutional Gate →
                    </button>
                  </header>

                  {/* Highbrow Corporate Hero */}
                  <div className="relative py-14 px-6 sm:px-10 border-b border-amber-500/5 bg-gradient-to-b from-slate-950 to-transparent">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-3.5">
                      <span className="h-px w-6 bg-amber-400" />
                      <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase">GLOBAL TRUST STANDARDS</span>
                    </div>
                    
                    <h1 className="text-2xl sm:text-3xl lg:text-[2.2rem] font-serif font-black tracking-tight text-white leading-tight max-w-2xl">
                      We guide digital infrastructure & growth capital for institutional operators.
                    </h1>
                    <p className="text-slate-400 mt-3 text-xs sm:text-sm max-w-lg font-light leading-relaxed">
                      Forging high-performance pipeline architectures, rigorous compliance defense parameters, and industry-best 14-day integration guarantees.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4 text-[11px] font-mono">
                      <div className="bg-[#0c1322] rounded-xl border border-amber-500/15 px-4.5 py-3 flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                          <span className="text-slate-500 text-[9px] block uppercase">Managed Asset Volume</span>
                          <span className="text-[#f5ebd6] font-bold text-sm">$4.82B USD</span>
                        </div>
                      </div>
                      <div className="bg-[#0c1322] rounded-xl border border-amber-500/15 px-4.5 py-3 flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                        <div>
                          <span className="text-slate-500 text-[9px] block uppercase">Priority Delivery Model</span>
                          <span className="text-amber-400 font-bold text-sm">14-Day Lock SLA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Dynamic Growth Modeler */}
                  <div className="py-12 px-6 sm:px-10 bg-slate-950/40 border-b border-amber-500/5">
                    <div className="max-w-2xl">
                      <span className="text-[9px] font-mono tracking-widest uppercase font-black text-amber-500 block mb-1">01 / DYNAMIC VALUE PREVIEW</span>
                      <h2 className="text-xl font-serif text-white tracking-tight">Interactive Systems ROI Model</h2>
                      <p className="text-xs text-slate-450 mt-1 max-w-lg">Estimate projected business digital acceleration upon deploying Aegis engineered micro-systems.</p>
                      
                      <div className="bg-[#080d19] rounded-2xl border border-amber-500/15 p-6 mt-8 space-y-6">
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center font-mono text-[11px]">
                            <span className="text-slate-400">Current Base Annual Revenue:</span>
                            <span className="text-amber-300 font-bold">${(roiRevenue / 1000).toLocaleString()}k USD</span>
                          </div>
                          <input 
                            type="range" 
                            min={250000} 
                            max={5000000} 
                            step={125000}
                            value={roiRevenue} 
                            onChange={(e) => setRoiRevenue(Number(e.target.value))}
                            className="w-full accent-amber-505 bg-slate-950 hover:accent-amber-400 rounded-lg cursor-pointer h-2 border border-white/5"
                          />
                        </div>

                        {/* Interactive Growth Vector Diagram */}
                        <div className="pt-4 border-t border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-amber-500/10">
                            <span className="text-[9px] font-mono uppercase text-slate-500 block">Digital Uplift Rate</span>
                            <span className="text-sm font-bold font-mono text-emerald-400 tracking-tight flex items-center gap-1 mt-0.5">
                              <span>+18.4% Uplift</span>
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            </span>
                          </div>
                          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-amber-500/10 sm:col-span-2">
                            <span className="text-[9px] font-mono uppercase text-slate-500 block">Anticipated Added Net Yield</span>
                            <span className="text-sm font-bold font-mono text-amber-300 tracking-tight mt-0.5 block">
                              +${(calculatedGrowth / 1000).toLocaleString()}k USD / Year
                            </span>
                          </div>
                        </div>

                        {/* Mock SEC, SOC2 Cyber Badges */}
                        <div className="p-3 bg-slate-950/20 border border-amber-500/5 rounded-xl flex items-center justify-between text-[10px] font-mono text-slate-550">
                          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> ISO27001 & SOC2 Trust System</span>
                          <span className="text-slate-600">Secure SHA256 Signature verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Partner Switcher Module */}
                  <div className="py-12 px-6 sm:px-10 bg-transparent">
                    <span className="text-[9px] font-mono tracking-widest uppercase font-black text-amber-500 block mb-1">02 / EXECUTIVE CABINET</span>
                    <h2 className="text-xl font-serif text-white tracking-tight">Managing Partners & Directors</h2>
                    <p className="text-xs text-slate-450 mt-1 mb-8">Audited coordinates of Aegis advisory team leaders.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {partnersList.map((partner) => (
                        <div 
                          key={partner.id}
                          onClick={() => setActivePartner(partner.id)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden flex flex-col justify-between min-h-[160px] ${activePartner === partner.id ? "border-amber-500/40 bg-amber-500/[0.04]" : "border-amber-500/5 bg-[#080d19]/60 hover:bg-[#080d19] hover:border-amber-500/15"}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-black text-white text-sm">{partner.name}</span>
                              <span className="text-[8px] font-mono text-amber-500 font-bold bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded uppercase">{partner.location.split(" ")[0]}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">{partner.role}</span>
                          </div>
                          
                          {activePartner === partner.id ? (
                            <p className="text-[11px] text-slate-350 font-light mt-3.5 pt-3 border-t border-slate-900 leading-relaxed font-sans animate-fadeIn">{partner.bio}</p>
                          ) : (
                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-6 pt-2 border-t border-slate-950">
                              <span>Explore bios</span>
                              <ChevronRight className="w-3 h-3 text-amber-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock Footer */}
                  <footer className="bg-slate-950 border-t border-amber-500/10 py-8 px-6 text-center text-slate-500 text-[10px] font-mono uppercase tracking-wider space-y-2">
                    <p>© 2026 Aegis Global Advisory Group. Registered ASIC Australia Partners.</p>
                    <p className="text-slate-600 text-[9px] lowercase">Secured node delivery with redundancy via priority digital architectural pathways.</p>
                  </footer>
                </div>
              )}

              {/* ========================================================= */}
              {/* === THEME 2: Brutalist Alpine Obsidian (KRONOS SPACE) ==== */}
              {/* ========================================================= */}
              {activeDemo === "creative" && (
                <div className="min-h-full bg-black font-sans text-stone-350 relative" id="creative-theme-root">
                  
                  {/* Brutalist Fine Hairline Header */}
                  <header className="border-b border-purple-500/10 py-5 px-6 sm:px-10 flex justify-between items-center bg-black/95 sticky top-0 z-20">
                    <div className="flex flex-col text-left">
                      <span className="font-serif tracking-[0.4em] uppercase text-sm font-black text-white">KRŌNOS</span>
                      <span className="text-[7.5px] font-mono uppercase tracking-[0.52em] text-purple-400 mt-1">Spatial Bureau</span>
                    </div>
                    
                    {/* Category Filter Selector pills */}
                    <div className="flex gap-2.5 sm:gap-4 text-[9px] tracking-widest uppercase font-black font-mono text-stone-500">
                      {["all", "residential", "commercial", "installations"].map((tab) => (
                        <span 
                          key={tab}
                          onClick={() => setPortfolioTab(tab as any)}
                          className={`cursor-pointer hover:text-white transition-all ${portfolioTab === tab ? "text-purple-400 border-b border-purple-400" : ""}`}
                        >
                          {tab}
                        </span>
                      ))}
                    </div>
                  </header>

                  {/* Editorial Layout Hero Banner */}
                  <div className="relative py-16 px-6 sm:px-10 border-b border-white/5 bg-gradient-to-br from-purple-950/10 via-black to-black text-left">
                    <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500/[0.03] rounded-full blur-[140px] pointer-events-none" />
                    
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.55em] text-purple-400 block mb-3.5">SELECTED MONUMENTS · ARCHITECTURE</span>
                    <h1 className="text-3xl sm:text-4xl tracking-tight text-white font-extralight font-serif leading-[1.12] max-w-2xl">
                      We curate spatial landmarks of raw physical permanence & pure light.
                    </h1>
                    <p className="text-xs text-[#a3a3a3] max-w-md font-light tracking-wide mt-4.5 leading-relaxed font-sans">
                      Raw architectural concrete forms structured to balance natural lux factors. Conceptualized, simulated, and deployed in high-performance digital render workspaces.
                    </p>
                    
                    <div className="mt-8 flex gap-6 text-[10px] font-mono tracking-widest text-[#737373] border-t border-white/5 pt-6 uppercase">
                      <div>
                        <span>latitude coordinate</span>
                        <span className="block text-white font-normal mt-0.5">36.2048° N, 138.2529° E</span>
                      </div>
                      <div className="h-8 w-px bg-white/5" />
                      <div>
                        <span>focal altitude</span>
                        <span className="block text-purple-400 font-semibold mt-0.5">1412 LUX METERS</span>
                      </div>
                    </div>
                  </div>

                  {/* Masonry-Grid Architecture Showcase Item List */}
                  <main className="px-6 sm:px-10 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {galleryItems
                        .filter(item => portfolioTab === "all" || item.category === portfolioTab)
                        .map((item, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setSelectedGalleryItem(item)}
                            className="group cursor-pointer text-left bg-[#080808] border border-white/15 rounded-xl overflow-hidden hover:border-purple-400/40 hover:shadow-2xl hover:shadow-purple-400/5 transition-all duration-300"
                          >
                            <div className="relative aspect-video w-full overflow-hidden bg-stone-900">
                              <img 
                                src={item.img} 
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="object-cover w-full h-full transform group-hover:scale-[1.04] transition-transform duration-700" 
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest bg-stone-950/80 px-4 py-2 rounded-lg border border-white/10 shadow-lg flex items-center gap-1.5">
                                  <span>Inspect Blueprint</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                                </span>
                              </div>
                            </div>
                            <div className="p-5 space-y-2">
                              <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block font-bold">{item.category}</span>
                              <h3 className="text-white font-serif text-base font-medium group-hover:text-purple-300 transition-colors leading-tight">{item.title}</h3>
                              <p className="text-[11px] text-stone-400 font-light leading-relaxed line-clamp-2">{item.desc}</p>
                            </div>
                          </div>
                      ))}
                    </div>
                  </main>

                  {/* PHOTO GRAPH LIGHTBOX OVERLAY */}
                  {selectedGalleryItem && (
                    <div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-md p-6 flex flex-col justify-center items-center">
                      <div className="max-w-2xl bg-[#0d0d0d] border border-white/20 rounded-2xl overflow-hidden shadow-2xl relative text-left">
                        <button 
                          onClick={() => setSelectedGalleryItem(null)}
                          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-white/10 rounded-full text-slate-450 hover:text-white transition-all cursor-pointer z-40"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="aspect-video bg-black relative">
                          <img 
                            src={selectedGalleryItem.img} 
                            alt={selectedGalleryItem.title} 
                            referrerPolicy="no-referrer"
                            className="object-cover w-full h-full" 
                          />
                        </div>
                        <div className="p-6 sm:p-8 space-y-4">
                          <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block font-black border-b border-white/5 pb-2">{selectedGalleryItem.category} project index</span>
                          <div>
                            <h2 className="text-white text-xl font-serif font-bold tracking-tight">{selectedGalleryItem.title}</h2>
                            <p className="text-xs text-stone-400 font-light leading-relaxed mt-2">{selectedGalleryItem.desc}</p>
                          </div>
                          
                          <div className="pt-3 border-t border-white/5 flex flex-wrap gap-2 text-[9px] font-mono">
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-stone-400">Spec Node: Double Glazed Solar Cap</span>
                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-stone-400">Chronological Phase: IV (2025)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Foot */}
                  <footer className="p-10 border-t border-white/10 bg-black text-center font-mono text-[9px] text-stone-500 tracking-widest uppercase">
                    © 2026 KRŌNOS Architectural Corporation. Built with pristine design standards.
                  </footer>
                </div>
              )}

              {/* ========================================================= */}
              {/* === THEME 3: Apex Safety Dispatcher (APEX CONTRACTORS) == */}
              {/* ========================================================= */}
              {activeDemo === "trades" && (
                <div className="min-h-full bg-[#0b0f19] font-sans text-slate-200" id="trades-theme-root">
                  {/* Top Safety Strip */}
                  <div className="bg-[#f59e0b] text-slate-950 font-mono text-[9px] font-black py-1.5 px-4 text-center tracking-widest uppercase flex items-center justify-center gap-1">
                    <span className="animate-pulse">●</span>
                    <span>EMERGENCY DISPATCH WARNING: ON-CALL TRADES CREWS EN ROUTE 24/7</span>
                    <span className="animate-pulse">●</span>
                  </div>

                  {/* Header */}
                  <header className="border-b border-slate-800 py-4.5 px-6 flex justify-between items-center bg-slate-950">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-[#f59e0b] text-slate-950">
                        <Wrench className="w-5 h-5 text-slate-950 font-bold" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-sans font-black tracking-tight text-white text-sm">APEX PRO TRADES</span>
                        <span className="text-[8px] font-mono text-[#f59e0b] leading-none mt-0.5">CONTRACTOR REGISTRY LIC: 290124C</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div className="hidden sm:block">
                        <span className="text-[8px] text-slate-400 block font-mono">EMERGENCY HOTLINE</span>
                        <a href="tel:130000APEX" className="text-xs font-black font-mono text-[#f59e0b] hover:underline">1300 00 APEX</a>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-mono font-bold bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/20 rounded-full animate-pulse uppercase">
                        Dispatch Active
                      </span>
                    </div>
                  </header>

                  {/* Industrial Contractor Hero */}
                  <div className="py-12 px-6 sm:px-10 bg-[#060913] border-b border-slate-800 text-left relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[repeating-linear-gradient(45deg,#f59e0b04,#f59e0b04_15px,#00000000_15px,#00000000_30px)] pointer-events-none" />
                    
                    <div className="max-w-xl space-y-3 relative z-10">
                      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase leading-tight">
                        Fixed-Rate Mechanical Plumbing, Electrical & HVAC Dispatch.
                      </h1>
                      <p className="text-slate-400 text-xs sm:text-sm font-light">
                        Locked-line pre-quotes, certified master plumbers/sparkies, Australian native work guarantees. Zero surprise hourly costs.
                      </p>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <button className="h-10 px-4 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black font-mono text-xs rounded-xl inline-flex items-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer transition-colors">
                          <Phone className="w-3.5 h-3.5 text-slate-950" />
                          <span>Book Today Urgent Crew</span>
                        </button>
                        <button className="h-10 px-4 bg-[#1e293b] hover:bg-slate-800 text-white font-bold font-mono text-xs rounded-xl transition-all border border-slate-700 cursor-pointer">
                          No Callout Fee Areas
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Dynamic Estimates Calculator */}
                  <div className="py-12 px-5 sm:px-10 text-left bg-slate-950/60 border-b border-slate-800">
                    <div className="max-w-xl bg-[#0e1424] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
                      <div className="text-left border-b border-slate-800 pb-3">
                        <span className="text-[9px] font-mono text-[#f59e0b] uppercase tracking-widest block font-bold mb-1">01 / DISPATCH PARAMETERS</span>
                        <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#f59e0b]" />
                          Calculate Emergency Callout Budget Block
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Calculates site dispatch rates under contract SLA rules.</p>
                      </div>

                      {/* Trade Category Selection list */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono text-slate-450 uppercase font-bold block">1. Choose Mechanical Trade Profile:</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: "plumbing", label: "Plumbing" },
                            { id: "electrical", label: "Electrical" },
                            { id: "hvac", label: "Ducted Air-Con" },
                            { id: "construction", label: "Carpentry" }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setTradeSelection(t.id as any);
                                setShowTradesResult(true);
                              }}
                              className={`py-2 px-2 rounded-lg border text-[10px] font-bold font-mono uppercase transition-all cursor-pointer text-center ${tradeSelection === t.id ? "bg-[#f59e0b] border-[#f59e0b] text-slate-950 shadow-md shadow-amber-500/5 font-black" : "bg-[#080b13] border-slate-800 text-slate-350 hover:border-slate-700"}`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Urgency Factor Selection switches */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono text-slate-450 uppercase font-bold block">2. Select Urgency Priority Level:</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "routine", label: "Standard Book" },
                            { id: "urgent", label: "Same Day Dispatch" },
                            { id: "emergency", label: "RED EMERGENCY" }
                          ].map(u => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setUrgencyMode(u.id as any);
                                setShowTradesResult(true);
                              }}
                              className={`py-2.5 px-1.5 rounded-lg border text-[10px] font-bold font-mono uppercase transition-all cursor-pointer text-center ${urgencyMode === u.id ? "bg-[#f59e0b] border-[#f59e0b] text-slate-950 font-black" : "bg-[#080b13] border-slate-800 text-slate-350 hover:border-slate-700"}`}
                            >
                              {u.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Postcode selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono text-slate-450 uppercase font-bold block">3. Dispatch Destination Postcode:</label>
                          <input 
                            type="text" 
                            maxLength={4}
                            value={tradesPostcode} 
                            onChange={(e) => {
                              setTradesPostcode(e.target.value.replace(/\D/g, ""));
                              setShowTradesResult(true);
                            }}
                            placeholder="e.g. 2000"
                            className="w-full bg-[#080c14] border border-slate-800 focus:border-[#f59e0b] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none" 
                          />
                        </div>

                        {/* Computed block representation */}
                        {showTradesResult && (
                          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col justify-center text-left">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold leading-none">Estimate Range</span>
                            <span className="text-sm font-black font-mono text-[#f59e0b] tracking-wider mt-1 block">
                              AUD ${calculateTradesPrice()} - ${Math.round(calculateTradesPrice() * 1.25)}
                            </span>
                            <span className="text-[9px] text-[#10b981] font-mono mt-0.5 font-bold block">Fixed dispatch fee locked</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          alert(`Mocking crew alert! Driver SMS notification dispatch registered for postcode: ${tradesPostcode || "2000"}`);
                        }}
                        className="w-full py-3 bg-[#f59e0b] hover:bg-amber-400 text-slate-950 text-xs font-mono font-black rounded-xl cursor-pointer transition-colors uppercase tracking-widest shadow-md shadow-amber-500/10"
                      >
                        Lock Crew Slot & Contact Driver →
                      </button>
                    </div>
                  </div>

                  {/* Foot */}
                  <footer className="bg-slate-950 p-6.5 text-center text-slate-500 text-[10px] font-mono uppercase tracking-widest">
                    © 2026 Apex Trades Consortium Ltd. Registered Plumbing Commission of NSW.
                  </footer>
                </div>
              )}

              {/* ========================================================= */}
              {/* === THEME 4: Organic Botanical Olive (MESA & OAK BISTRO) = */}
              {/* ========================================================= */}
              {activeDemo === "dining" && (
                <div className="min-h-full bg-[#fbf9f4] font-serif text-[#2a362e] relative flex flex-col justify-between" id="dining-theme-root">
                  
                  {/* Elegant Forestry Green Header */}
                  <header className="border-b border-[#2a362e]/10 py-5 px-6 sm:px-10 flex justify-between items-center bg-[#fbf9f4] sticky top-0 z-20 text-[#2a362e]">
                    <div className="flex flex-col text-left">
                      <span className="font-serif tracking-[0.25em] uppercase text-sm font-bold text-[#1f2c23]">MESA & OAK</span>
                      <span className="text-[8px] font-mono tracking-widest text-[#5a6a5f] uppercase mt-0.5">Woodfire & Harvest Room</span>
                    </div>
                    
                    <div className="flex gap-4 text-[9px] uppercase font-mono tracking-wider font-extrabold text-[#5a6a5f]">
                      <span className="hover:text-[#1f2c23] cursor-pointer">Our Sourcing</span>
                      <span className="hover:text-[#1f2c23] cursor-pointer text-[#1f2c23] border-b border-[#1f2c23]">La Carte Menu</span>
                      <span className="hover:text-[#1f2c23] cursor-pointer">Table Booking</span>
                    </div>
                  </header>

                  {/* Aesthetic Food Hero */}
                  <div className="py-14 px-6 sm:px-10 max-w-2xl text-left bg-gradient-to-b from-[#1f2c23]/5 to-transparent">
                    <span className="text-[10px] font-mono tracking-[0.35em] text-[#c07850] block mb-2 uppercase font-black">LOCAL INGREDIENTS ADVISORY</span>
                    <h1 className="text-3xl sm:text-4xl font-serif text-[#1f2c23] font-normal leading-[1.14]">
                      Placing pristine earth, smoke, salt & local woodfire fields on the table.
                    </h1>
                    <p className="text-xs text-[#526359] mt-3 font-sans font-light leading-relaxed max-w-md">
                      Curated daily from small single-origin organic farmers in regional Victoria. Menus adapt dynamically with monthly harvest yield parameters.
                    </p>
                  </div>

                  {/* Active Dining Menu with Tab selections */}
                  <div className="py-12 px-6 sm:px-10 bg-[#f4f2ea] border-t border-b border-[#2a362e]/5">
                    <div className="max-w-xl mx-auto space-y-6 text-center">
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-[#c07850] uppercase font-bold tracking-widest">01 / AUTUMN HARVEST</span>
                        <h2 className="font-serif text-xl sm:text-2xl text-[#1f2c23]">Dynamic Culinary Renders</h2>
                      </div>
                      
                      {/* Grid Switches */}
                      <div className="p-1 bg-[#eae7de] border border-[#2a362e]/10 rounded-xl flex">
                        {["brunch", "mains", "drinks"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setMenuTab(tab as any)}
                            className={`flex-1 py-1.5 text-xs font-mono font-bold tracking-widest uppercase rounded-lg capitalize cursor-pointer transition-all ${menuTab === tab ? "bg-[#1f2c23] text-[#fbf9f4] shadow-md" : "text-[#5a6a5f] hover:text-[#1f2c23]"}`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>

                      {/* Display Menu list items formatted beautifully */}
                      <div className="space-y-6 text-left pt-3.5 animate-fadeIn">
                        {menuItems[menuTab].map((item, id) => (
                          <div key={id} className="border-b border-dashed border-[#1f2c23]/15 pb-4 flex justify-between gap-5">
                            <div className="space-y-1">
                              <span className="text-[#1f2c23] font-bold text-sm sm:text-base font-serif block tracking-tight">{item.name}</span>
                              <span className="text-[11px] text-[#526359] font-sans font-light leading-relaxed block">{item.desc}</span>
                            </div>
                            <span className="font-mono text-sm font-black text-[#c07850] text-right shrink-0">${item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Table Reservation Module */}
                  <div className="py-12 px-6 sm:px-10 text-left">
                    <div className="max-w-md mx-auto bg-[#fbf9f4] border border-[#2a362e]/10 p-5 sm:p-6 rounded-2xl shadow-xl space-y-5">
                      <div>
                        <span className="text-[9px] font-mono text-[#c07850] uppercase font-bold tracking-widest">02 / RESERVATION BOARD</span>
                        <h3 className="font-serif text-[#1f2c23] text-lg font-bold">Secure Dining Space</h3>
                        <p className="text-[10px] text-[#5a6a5f] mt-0.5 font-sans font-light">Confirm private tables or main room rosters.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-[#5a6a5f] uppercase block font-bold">Party Volume:</label>
                          <input 
                            type="number" 
                            min={1} 
                            max={12} 
                            value={bookedGuests} 
                            onChange={(e) => setBookedGuests(Number(e.target.value))}
                            className="w-full bg-[#f4f2ea] border border-[#2a362e]/10 rounded-lg p-2 text-[#1f2c23] font-bold outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-[#5a6a5f] uppercase block font-bold">Dining Zone Area:</label>
                          <select 
                            value={bookedRoom} 
                            onChange={(e) => setBookedRoom(e.target.value)}
                            className="w-full bg-[#f4f2ea] border border-[#2a362e]/10 rounded-lg p-2 text-[#1f2c23] font-bold outline-none cursor-pointer"
                          >
                            <option value="Tavern Hall">Main Woodfire Tavern</option>
                            <option value="Glasshouse">Botanical Glasshouse</option>
                            <option value="Bar Counter">Oyster Bar Counter</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-[#5a6a5f] uppercase block font-bold">Choose Date:</label>
                          <input 
                            type="date" 
                            value={bookedDate} 
                            onChange={(e) => setBookedDate(e.target.value)}
                            className="w-full bg-[#f4f2ea] border border-[#2a362e]/10 rounded-lg p-2 text-[#1f2c23] outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-[#5a6a5f] uppercase block font-bold">Seat Slots:</label>
                          <select 
                            value={bookedTime} 
                            onChange={(e) => setBookedTime(e.target.value)}
                            className="w-full bg-[#f4f2ea] border border-[#2a362e]/10 rounded-lg p-2 text-[#1f2c23] font-bold outline-none cursor-pointer"
                          >
                            <option value="17:30">5:30 PM (Sunset Session)</option>
                            <option value="19:00">7:00 PM (Dining Session)</option>
                            <option value="20:45">8:45 PM (Candelight Session)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowBookingConf(true)}
                        className="w-full py-3 bg-[#1f2c23] hover:bg-[#2d3e32] text-[#fbf9f4] text-xs font-mono font-black rounded-lg cursor-pointer transition-colors uppercase tracking-widest shadow-md shadow-[#1f2c23]/15"
                      >
                        Submit Seat Application →
                      </button>

                      {showBookingConf && (
                        <div className="p-4 rounded-xl bg-[#f4f2ea] border border-[#1f2c23]/25 text-left animate-fadeIn space-y-1.5 font-sans">
                          <div className="flex items-center gap-1.5 text-[#1f2c23] font-bold text-xs">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Bistro Seat Confirmed</span>
                          </div>
                          <p className="text-[10px] text-[#526359] leading-relaxed font-light">
                            Provisional reservation locked for <strong>{bookedGuests} guests</strong> at <strong>{bookedRoom}</strong> on {bookedDate} at {bookedTime}. Confirmation ID: <strong className="font-mono text-[#c07850]">{Math.random().toString(36).substr(2, 6).toUpperCase()}</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Foot */}
                  <footer className="p-8 border-t border-[#2a362e]/10 bg-[#1f2c23] text-center font-mono text-[9px] text-[#eae7de]/60 tracking-wider uppercase">
                    © 2026 MESA & OAK Group Pty Ltd. Maps Schema-marked.
                  </footer>
                </div>
              )}

              {/* ========================================================= */}
              {/* === THEME 5: Minimal Stone Platinum (AURA LUXURY APOTHECARY) */}
              {/* ========================================================= */}
              {activeDemo === "retail" && (
                <div className="min-h-full bg-[#f6f5f0] font-sans text-[#1c1917] relative flex flex-col justify-between" id="retail-theme-root">
                  
                  {/* Luxury Apothecary Header */}
                  <header className="border-b border-[#1c1917]/5 py-5 px-6 sm:px-10 flex justify-between items-center bg-[#f6f5f0]/95 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex flex-col text-left">
                      <span className="font-serif tracking-[0.35em] uppercase text-sm font-black text-[#1c1917]">AURA</span>
                      <span className="text-[7.5px] font-mono uppercase tracking-[0.52em] text-[#878680] mt-1">APOTHECARY & HOME</span>
                    </div>
                    
                    <button 
                      onClick={() => setIsBagOpen(!isBagOpen)}
                      className="inline-flex items-center gap-2 bg-[#1c1917] hover:bg-[#2e2a26] text-white text-[10px] font-mono tracking-widest uppercase px-4 py-2 rounded-lg cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-amber-200" />
                      <span>Curation Bag ({cartItems.reduce((a,c)=>a+c.qty, 0)})</span>
                    </button>
                  </header>

                  <div className="flex-grow text-left">
                    {/* Lookbook Hero Banner */}
                    <div className="py-14 px-6 sm:px-10 max-w-xl bg-gradient-to-b from-[#e3e1d6]/50 via-[#f6f5f0] to-[#f6f5f0]">
                      <span className="text-[10px] font-mono tracking-widest text-[#878680] block mb-1 uppercase font-bold">ESSENTIAL RITUALS</span>
                      <h1 className="text-2xl sm:text-3.5xl font-serif font-light text-[#1c1917] tracking-wide leading-tight mt-1">
                        Formulated organic concentrates, pure botanical skincare & raw brass objects.
                      </h1>
                      <p className="text-[11px] text-[#6b6a64] mt-2.5 font-light leading-relaxed">
                        Every item is slow-hand molded in regional Sydney guilds. Using pristine plant extracts, white cedar oils, and earth pigments.
                      </p>
                    </div>

                    {/* Products Grid List */}
                    <div className="px-6 sm:px-10 pb-14">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {boutiqueItems.map((item) => (
                          <div key={item.id} className="bg-white rounded-2xl border border-[#1c1917]/5 p-4 flex flex-col justify-between text-left shadow-sm hover:shadow-lg transition-shadow duration-300">
                            <div className="aspect-square rounded-xl overflow-hidden bg-[#fafafa] mb-4 relative border border-stone-100">
                              <img 
                                src={item.img} 
                                alt={item.name} 
                                referrerPolicy="no-referrer"
                                className="object-cover w-full h-full transform hover:scale-[1.03] transition-transform duration-500" 
                              />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-serif text-sm sm:text-base text-[#1c1917] font-normal">{item.name}</h3>
                              <p className="text-[10px] text-[#6b6a64] italic font-serif leading-snug">{item.tagline}</p>
                              
                              <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between font-sans">
                                <span className="font-mono text-xs font-black text-[#1c1917]">${item.price} AUD</span>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="h-8 px-3.5 bg-[#1c1917] hover:bg-[#2e2a26] text-white text-[9.5px] font-mono tracking-widest uppercase rounded-lg transition-colors cursor-pointer"
                                >
                                  Add to Bag
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE RESERVATION BAG DRAWER SLIDE OVERLAY */}
                  {isBagOpen && (
                    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm z-30 flex justify-end animate-fadeIn">
                      <div className="w-80 sm:w-96 max-w-full bg-[#fbfbf8] h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between text-left relative border-l border-[#1c1917]/10 animate-slideLeft">
                        <div>
                          <div className="flex justify-between items-center border-b border-stone-200 pb-4.5 mb-5">
                            <div className="flex flex-col">
                              <span className="font-serif text-[#1c1917] font-bold uppercase text-xs tracking-wider">Curation Cart</span>
                              <span className="text-[8px] font-mono text-[#878680] uppercase tracking-widest mt-0.5">Paddington Showroom Pickup</span>
                            </div>
                            <button onClick={() => setIsBagOpen(false)} className="p-1 hover:bg-stone-100 rounded-full text-stone-500 hover:text-stone-950 transition-colors cursor-pointer">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {cartItems.length === 0 ? (
                            <div className="text-center py-16 space-y-2">
                              <p className="text-xs text-[#878680] font-light">Your botanical selection is currently empty.</p>
                              <span className="text-[9px] font-mono text-stone-450 uppercase cursor-pointer underline" onClick={() => setIsBagOpen(false)}>Discover Items</span>
                            </div>
                          ) : (
                            <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
                              {cartItems.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-xs pb-4 border-b border-stone-100 font-sans">
                                  <div className="space-y-0.5 max-w-[65%]">
                                    <span className="font-serif text-[#1c1917] block font-medium max-w-full truncate">{item.name}</span>
                                    <span className="text-[10px] text-[#6b6a64] font-mono italic block">${item.price} ea</span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-[#f6f5f0] border border-stone-200/60 rounded-xl p-1.5 shrink-0">
                                    <button onClick={() => updateCartQty(item.id, -1)} className="text-stone-400 hover:text-stone-950 p-0.5 cursor-pointer">
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="font-mono text-[11px] font-black text-stone-900 px-1.5">{item.qty}</span>
                                    <button onClick={() => updateCartQty(item.id, 1)} className="text-stone-400 hover:text-[#1c1917] p-0.5 cursor-pointer">
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="border-t border-stone-200 pt-5 space-y-4 font-sans">
                          {/* Pick Up Room Selection */}
                          <div className="space-y-1">
                            <label className="text-[8.5px] font-mono text-[#878680] uppercase block font-bold">Pick-up Atelier showroom:</label>
                            <select 
                              value={selectedBoutiqueBranch} 
                              onChange={(e) => setSelectedBoutiqueBranch(e.target.value)}
                              className="w-full bg-[#f6f5f0] border border-stone-200 text-stone-900 text-xs rounded-lg p-2 font-bold outline-none cursor-pointer"
                            >
                              <option>Sydney - Paddington Studio</option>
                              <option>Melbourne - Fitzroy Gallery</option>
                              <option>Brisbane - Fortitude Valley Conservatory</option>
                            </select>
                          </div>

                          <div className="flex justify-between font-mono text-xs border-b border-stone-100 pb-3">
                            <span className="text-[#6b6a64] uppercase font-bold">Subtotal Amount</span>
                            <span className="font-black text-[#1c1917]">${getCartTotal()} AUD</span>
                          </div>

                          <button
                            onClick={() => {
                              setShowRetailConf(true);
                              setCartItems([]);
                            }}
                            disabled={cartItems.length === 0}
                            className="w-full py-3 bg-[#1c1917] hover:bg-[#2e2a26] disabled:bg-stone-300 disabled:text-stone-400 text-white text-xs font-mono tracking-widest font-black rounded-lg cursor-pointer transition-all uppercase"
                          >
                            Click & Secure Allocation ➔
                          </button>

                          {showRetailConf && (
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-250 text-left animate-fadeIn space-y-1">
                              <span className="text-[9px] font-mono text-emerald-800 uppercase block font-black flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                                Item Allocation Reserved!
                              </span>
                              <p className="text-[10px] text-stone-605 leading-relaxed font-light">
                                Custom lot is provisionally allocated for pick up at <strong>{selectedBoutiqueBranch}</strong> in 3 working hours. SMS verification sent.
                              </p>
                              <button onClick={() => setShowRetailConf(false)} className="text-[9px] font-mono text-[#878680] underline block hover:text-stone-900 cursor-pointer pt-1">Dismiss</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Foot */}
                  <footer className="p-8 border-t border-[#1c1917]/5 bg-[#1c1917] text-center font-mono text-[9px] text-[#eae7de]/40 tracking-wider uppercase">
                    © 2026 Aura Goods Pty Ltd. Handcrafted Apothecary Australia.
                  </footer>
                </div>
              )}

              {/* ========================================================= */}
              {/* === THEME 6: Atomic Cobalt Cyan (OCEANIC AQUATICS SCHEDULER) */}
              {/* ========================================================= */}
              {activeDemo === "swim" && (
                <div className="min-h-full bg-[#03091e] font-sans text-slate-200" id="swim-theme-root">
                  
                  {/* High performance Header */}
                  <header className="border-b border-cyan-500/15 py-4.5 px-6 flex justify-between items-center bg-[#010617] sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-cyan-400 to-cyan-650 rounded-lg shadow-lg shadow-cyan-400/10">
                        <Award className="w-4.5 h-4.5 text-slate-950 font-extrabold" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-display font-black tracking-tighter text-white text-base italic uppercase leading-none">OCEANIC AQUATICS</span>
                        <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-widest mt-0.5">ELITE COACHING DIVISION</span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">
                      <span className="hover:text-cyan-400 cursor-pointer text-cyan-400">Lesson Timetables</span>
                      <span className="hover:text-cyan-400 cursor-pointer">Pool Facilities</span>
                      <span className="hover:text-cyan-400 cursor-pointer">Coaches</span>
                    </div>
                  </header>

                  {/* Scientific Athletic Style Hero */}
                  <div className="py-12 px-6 sm:px-10 text-left bg-gradient-to-b from-cyan-950/20 via-[#03091e] to-[#03091e] relative overflow-hidden">
                    <div className="absolute right-[-10%] top-0 w-80 h-80 bg-cyan-505/10 rounded-full blur-[120px] pointer-events-none" />
                    
                    <div className="max-w-xl space-y-2 relative z-10">
                      <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 block uppercase font-bold">HONG KONG CHAMPIONSHIP PRESETS</span>
                      <h1 className="text-2xl sm:text-[2.2rem] font-sans font-black text-white tracking-tighter uppercase italic leading-none">
                        Scientific Coaching. Premium Heated Pools. Verified Results.
                      </h1>
                      <p className="text-xs text-slate-450 max-w-sm font-light leading-relaxed">
                        Authorized training rosters spanning 3 chlorinated pools in Hong Kong. Low classroom student ratios with certified Olympic-trial coaches.
                      </p>
                    </div>
                  </div>

                  {/* Schedulers grids with Pool facility selections */}
                  <div className="py-10 px-5 sm:px-10 bg-[#020716] border-t border-cyan-500/15">
                    <div className="max-w-xl mx-auto space-y-6">
                      
                      {/* Grid Filters */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left font-mono">
                          <label className="text-[9px] uppercase text-cyan-400 font-bold tracking-wider">Choose Active Pool Complex Division:</label>
                          <select 
                            value={swimBranch} 
                            onChange={(e) => setSwimBranch(e.target.value as any)}
                            className="w-full bg-[#03091c] border border-cyan-800/30 rounded-lg text-xs p-2 text-white outline-none cursor-pointer font-sans font-bold focus:border-cyan-400"
                          >
                            <option value="causeway">Victoria Club (Causeway Bay)</option>
                            <option value="kowloon">Olympic Complex (Kowloon Bay)</option>
                            <option value="pokfulam">Green Hill Atrium (Pok Fu Lam)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5 text-left font-mono">
                          <label className="text-[9px] uppercase text-cyan-400 font-bold tracking-wider">Cohort Type Filter:</label>
                          <div className="grid grid-cols-4 gap-1 select-none">
                            {[
                              { id: "all", label: "All" },
                              { id: "kids", label: "Kids" },
                              { id: "squads", label: "Squads" },
                              { id: "master", label: "Master" }
                            ].map(t => (
                              <button
                                key={t.id}
                                onClick={() => setSwimFilter(t.id as any)}
                                className={`py-2 rounded-lg text-[9px] font-bold font-mono uppercase transition-colors cursor-pointer text-center ${swimFilter === t.id ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-450/15" : "bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10"}`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Timetables cells listed */}
                      <div className="space-y-4 pt-4 text-left">
                        <div className="flex justify-between items-center border-b border-cyan-550/10 pb-2">
                          <h4 className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-black">Active Registration Rosters:</h4>
                          <span className="text-[8.5px] font-mono text-slate-500 uppercase">Synchronized live</span>
                        </div>
                        
                        {filteredSwimClasses.length === 0 ? (
                          <div className="py-12 text-center border border-dashed border-cyan-500/20 rounded-xl bg-[#03091e]/50">
                            <p className="text-xs text-slate-400">No active swim groups schedule found for this tier.</p>
                          </div>
                        ) : (
                          filteredSwimClasses.map((cl) => (
                            <div key={cl.id} className="p-4 rounded-xl bg-[#03091d]/80 border border-cyan-500/10 hover:border-cyan-400/30 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-sm sm:text-base tracking-tight leading-none">{cl.title}</span>
                                  <span className="text-[8.5px] font-mono text-cyan-400 uppercase tracking-widest font-black px-2 py-0.5 bg-cyan-955/40 border border-cyan-800/20 rounded">
                                    {cl.tier}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-410 font-mono font-light">
                                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {cl.time}</span>
                                  <span className="text-slate-500">·</span>
                                  <span>{cl.coach}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                                <div className="text-left sm:text-right font-mono">
                                  <span className="text-[8px] uppercase text-slate-500 block font-bold">Class Rate</span>
                                  <span className="text-xs sm:text-sm font-black text-[#06b6d4]">HKD ${cl.price}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setShowSwimEnroll(cl.id);
                                    setSwimEnrollName("");
                                    setSwimEnrollPhone("");
                                    setShowSwimSuccess(false);
                                  }}
                                  className="py-2 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black font-mono text-[10px] uppercase tracking-wider rounded-lg shadow-md shadow-cyan-455/15 cursor-pointer"
                                >
                                  Enroll ({cl.spots} slots)
                                </button>
                              </div>
                            </div>
                        )))}
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE REGISTER MODAL POPUP FOR TIMETABLE SLOT */}
                  {showSwimEnroll && (
                    <div className="absolute inset-0 z-35 bg-[#020614]/95 backdrop-blur-sm p-6 flex items-center justify-center animate-fadeIn">
                      <div className="max-w-sm w-full bg-[#03091e] border border-cyan-500/20 rounded-2xl p-5 sm:p-6 text-left relative space-y-5 animate-scaleIn">
                        <button 
                          onClick={() => {
                            setShowSwimEnroll(null);
                            setShowSwimSuccess(false);
                          }}
                          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="border-b border-cyan-500/10 pb-3">
                          <span className="text-[8px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">Cohort Registry application</span>
                          <h2 className="text-white text-sm sm:text-base font-black uppercase italic tracking-tight mt-0.5">Secure Swim Entrance Slot</h2>
                        </div>

                        <div className="space-y-4 font-mono text-xs">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[9px] text-slate-400 uppercase font-black">Student Swim Competitor Name:</label>
                            <input 
                              type="text" 
                              value={swimEnrollName} 
                              onChange={(e) => setSwimEnrollName(e.target.value)}
                              placeholder="e.g. Audrey Han"
                              className="w-full bg-[#010512] border border-cyan-800/30 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white outline-none font-sans" 
                            />
                          </div>
                          
                          <div className="space-y-1.5 text-left">
                            <label className="text-[9px] text-slate-400 uppercase font-black">Parent Mobile SMS Contact:</label>
                            <input 
                              type="tel" 
                              value={swimEnrollPhone} 
                              onChange={(e) => setSwimEnrollPhone(e.target.value)}
                              placeholder="e.g. +852 9123 4567"
                              className="w-full bg-[#010512] border border-cyan-800/30 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white outline-none font-sans" 
                            />
                          </div>

                          <button
                            onClick={() => setShowSwimSuccess(true)}
                            disabled={!swimEnrollName || !swimEnrollPhone}
                            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black tracking-widest uppercase rounded-lg disabled:grayscale disabled:opacity-50 cursor-pointer transition-all hover:scale-[1.01]"
                          >
                            Send Admission Request ➔
                          </button>

                          {showSwimSuccess && (
                            <div className="p-4 bg-cyan-950/50 rounded-xl border border-cyan-500/30 text-left animate-fadeIn space-y-1">
                              <span className="text-[9px] font-mono text-cyan-400 uppercase font-black block">✓ CHANNELS RESERVED LIVE</span>
                              <p className="text-[9px] text-slate-350 leading-relaxed font-sans font-light">
                                provisional placement secured. Entrance invoice sent to HK mobile parent contacts. Please present reference ID: <strong className="font-mono text-white text-xs">{Math.random().toString(36).substr(2, 6).toUpperCase()}</strong>.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Foot */}
                  <footer className="bg-slate-950/80 p-6.5 border-t border-cyan-850/10 text-center text-slate-500 text-[9px] font-mono uppercase tracking-widest">
                    © 2026 Oceanic Aquatic Academy Ltd. Hong Kong Swimming Association Affiliate.
                  </footer>
                </div>
              )}

              {/* ========================================================= */}
              {/* === THEME 7: Motion Physiotherapy & Allied Health === */}
              {/* ========================================================= */}
              {activeDemo === "physio" && (
                <div className="min-h-full bg-stone-50 font-sans text-stone-800" id="physio-theme-root">
                  {/* Clinic Header */}
                  <header className="border-b border-stone-200 py-4 px-6 flex justify-between items-center bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-md">
                        <Activity className="w-4 h-4 text-white font-bold" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-serif font-bold tracking-tight text-emerald-900 text-lg leading-none">Motion</span>
                        <span className="text-[9px] font-sans tracking-wide text-stone-500 uppercase mt-[1px] font-bold">Physiotherapy & Rehab</span>
                      </div>
                    </div>
                    <nav className="hidden sm:flex items-center gap-6 text-[11px] uppercase tracking-widest text-stone-500 font-bold font-sans">
                      <span className="hover:text-emerald-700 cursor-pointer">Treatments</span>
                      <span className="hover:text-emerald-700 cursor-pointer">Practitioners</span>
                      <span className="hover:text-emerald-700 cursor-pointer">Medicare Info</span>
                    </nav>
                    <button 
                      onClick={() => setPhysioStage("booking")}
                      className="bg-emerald-600 hover:bg-emerald-700 transition-all text-[11px] font-bold font-sans text-white px-4 py-2 rounded-full shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book 
                      <span className="hidden sm:inline">Appointment</span>
                    </button>
                  </header>

                  {/* Body Content */}
                  {physioStage === "home" ? (
                    <div className="animate-fadeIn">
                      <div className="relative py-16 sm:py-20 px-6 sm:px-10 overflow-hidden">
                        {/* Background elements */}
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-stone-50 via-white to-emerald-50/50 -z-10" />
                        
                        <div className="max-w-2xl text-left space-y-4">
                          <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full inline-block">Sydney CBD Clinic</span>
                          <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-serif font-black tracking-tight text-emerald-950 leading-[1.15]">
                            Restore your active movement with evidence-based recovery.
                          </h1>
                          <p className="text-stone-600 mt-3 text-sm sm:text-base max-w-lg font-light leading-relaxed">
                            Personalized treatment plans for sports injuries, persistent back pain, and post-operative rehabilitation. We align our therapies to your functional goals.
                          </p>

                          <div className="pt-6 flex flex-wrap gap-4">
                            <button 
                              onClick={() => setPhysioStage("booking")}
                              className="px-6 py-3 bg-emerald-900 text-white rounded-full text-sm font-bold shadow-lg shadow-emerald-900/10 hover:-translate-y-0.5 transition-all cursor-pointer"
                            >
                              Check Availability
                            </button>
                            <button className="px-6 py-3 bg-white text-stone-700 border border-stone-200 rounded-full text-sm font-bold shadow-sm hover:border-stone-300 transition-all cursor-pointer flex items-center gap-2">
                              <Phone className="w-4 h-4" /> (02) 8000 1234
                            </button>
                          </div>
                        </div>

                        {/* Quick Services Row */}
                        <div className="mt-16 pt-8 border-t border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                          <div>
                            <span className="font-bold text-emerald-950 block mb-1">Sports Physio</span>
                            <span className="text-xs text-stone-500 leading-snug block">Acute injury management and return-to-play protocols.</span>
                          </div>
                          <div>
                            <span className="font-bold text-emerald-950 block mb-1">Clinical Pilates</span>
                            <span className="text-xs text-stone-500 leading-snug block">Reformer-based core strengthening and postural correction.</span>
                          </div>
                          <div>
                            <span className="font-bold text-emerald-950 block mb-1">Post-Op Rehab</span>
                            <span className="text-xs text-stone-500 leading-snug block">Guided post-surgical orthopedic recovery pathways.</span>
                          </div>
                          <div>
                            <span className="font-bold text-emerald-950 block mb-1">Dry Needling</span>
                            <span className="text-xs text-stone-500 leading-snug block">Targeted western acupuncture for muscular trigger points.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-fadeIn p-6 sm:p-10 text-left bg-stone-50/50">
                      <div className="max-w-xl mx-auto bg-white border border-stone-200 shadow-xl shadow-stone-200/50 rounded-3xl p-6 sm:p-8 space-y-8 relative overflow-hidden">
                        {/* Decorative side accent */}
                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
                        
                        <div className="space-y-1">
                          <button 
                            onClick={() => {
                              setPhysioStage("home");
                              setPhysioService(null);
                            }}
                            className="flex items-center gap-1 text-[10px] uppercase font-bold text-stone-400 hover:text-emerald-700 transition-colors mb-4"
                          >
                            <ArrowLeft className="w-3 h-3" /> Go Back
                          </button>
                          <h2 className="text-2xl font-serif font-bold text-emerald-950 tracking-tight">Select your consultation</h2>
                          <p className="text-sm text-stone-500">Pick a service to see our practitioners&apos; next available timeslots.</p>
                        </div>

                        <div className="space-y-3">
                          {[
                            { id: "initial", name: "Initial Consultation", time: "45 mins", price: "$130", desc: "For new patients or a new injury. Includes comprehensive assessment and first treatment.", tag: "Most Popular" },
                            { id: "standard", name: "Standard Return Visit", time: "30 mins", price: "$95", desc: "Follow-up treatment for an existing, already-assessed injury condition." },
                            { id: "pilates", name: "1-on-1 Clinical Pilates Assessment", time: "45 mins", price: "$140", desc: "Ultrasound real-time core assessment and personalized program design." }
                          ].map(service => (
                            <div 
                              key={service.id}
                              onClick={() => setPhysioService(service.id)}
                              className={`p-4 border rounded-xl cursor-pointer transition-all ${physioService === service.id ? "border-emerald-500 bg-emerald-50/50 shadow-sm" : "border-stone-200 hover:border-emerald-300"}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-emerald-950">{service.name}</span>
                                    {service.tag && <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-sm uppercase font-bold tracking-wider">{service.tag}</span>}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] font-bold text-stone-500 font-sans">
                                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {service.time}</span>
                                    <span>•</span>
                                    <span>{service.price}</span>
                                  </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${physioService === service.id ? "border-emerald-500 bg-emerald-500" : "border-stone-300"}`}>
                                  {physioService === service.id && <CheckCircle className="w-3 h-3 text-white" />}
                                </div>
                              </div>
                              <p className="text-xs text-stone-500 leading-relaxed max-w-sm mt-2">{service.desc}</p>
                            </div>
                          ))}
                        </div>

                        {physioService && (
                          <div className="pt-6 border-t border-stone-100 animate-slideUp">
                            <span className="text-xs font-bold text-stone-800 block mb-3">Soonest Availability (Sydney CBD)</span>
                            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 container-scroll">
                              {["Today, 3:30 PM", "Tomorrow, 9:00 AM", "Tomorrow, 1:45 PM", "Wed, 10:30 AM"].map((slot, i) => (
                                <div key={i} className="shrink-0 px-4 py-2 border border-emerald-200 bg-white hover:bg-emerald-50 rounded-lg text-xs font-bold text-emerald-800 cursor-pointer transition-colors">
                                  {slot}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <footer className="bg-stone-100 py-8 text-center text-stone-500 text-[10px] uppercase tracking-widest font-bold">
                    © 2026 Motion Physiotherapy. Registered Allied Health Practitioners. HICAPS Available.
                  </footer>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Decorative interactive info hint in footer */}
      <div className="py-4 bg-[#020512] border-t border-white/5 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5 relative z-10 select-none">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Demonstration Sandboxes run in full React runtime context with responsive layout adjustments</span>
      </div>

    </div>
  );
}
