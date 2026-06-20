import { useState, ReactNode } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Coffee, Activity, Wrench, Waves, ArrowRight, CheckCircle2, 
  Star, Quote, ExternalLink, Calendar, CheckSquare, Sparkles, AlertCircle, Briefcase, Camera
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Language, Currency } from "../translations";

function BackgroundEffects() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[#020617] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15], x: [0, 50, 0], y: [0, -50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/30 blur-[120px]"
      />
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1], x: [0, -30, 0], y: [0, 60, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[150px]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  );
}

const FadeIn = ({ children, delay = 0 }: { children: ReactNode, delay?: number, key?: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className="relative z-10"
  >
    {children}
  </motion.div>
);

interface PortfolioItem {
  id: string;
  client: string;
  type: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  tagline: string;
  description: string;
  beforeState: string;
  afterState: string;
  results: string[];
  demoUrl?: string;
  demoLabel?: string;
  industryStandardQuote: string;
  visualMockup: ReactNode;
}

export default function WorkPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [currency, setCurrency] = useState<Currency>("AUD");
  const [activeTab, setActiveTab] = useState<"all" | "local" | "corporate" | "booking" | "creative">("all");

  const portfolioItems: PortfolioItem[] = [
    {
      id: "aegis-advisory",
      client: "Aegis Advisory Group",
      type: "Institutional Consulting",
      icon: Briefcase,
      iconBg: "bg-amber-950/40",
      iconColor: "text-amber-500",
      tagline: "High-trust digital infrastructure for capital advisory firms.",
      description: "Aegis required a digital presence that articulated absolute authority and data security for their institutional clients. We built a 'Swiss Prussian' inspired layout featuring dynamic ROI models and zero-latency loading, instantly elevating their market perception.",
      beforeState: "Generic corporate template lacking distinct value proposition",
      afterState: "Premium interactive layout with integrated growth modeling and partner tracking",
      results: [
        "+35% High-Net-Worth Leads",
        "Sub-1s Initial Load Time",
        "Trust Verification Built-in"
      ],
      demoUrl: "/site/corporate",
      demoLabel: "Launch Advisory Demo",
      industryStandardQuote: "This level of architectural rigor and visual authority is exactly what tier-1 consultancies, legal firms, and specialized financial advisors require to convert enterprise traffic.",
      visualMockup: (
        <div className="relative w-full aspect-[4/3] rounded-xl border border-white/10 bg-slate-900/50 shadow-2xl flex flex-col overflow-hidden group">
          <div className="h-6 bg-slate-950 flex items-center px-3 border-b border-white/5 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/80"></span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mx-auto">aegis-advisory.com.au</span>
          </div>
          <div className="flex-1 p-4 relative flex flex-col justify-between font-sans">
            <div className="space-y-2">
              <span className="text-[9px] font-mono tracking-widest text-amber-500 uppercase font-semibold">AEGIS ADVISORY</span>
              <div className="h-6 w-3/4 bg-white/10 rounded flex items-center px-2">
                <span className="text-[10px] text-slate-300 font-bold">Interactive Growth Modeler</span>
              </div>
            </div>
            <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-2">
              <div className="flex gap-1.5 justify-between">
                <span className="text-[8px] font-mono text-amber-400 font-bold uppercase">Estimated Yield Profile</span>
              </div>
              <div className="h-[1px] bg-white/5"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/40 p-1.5 rounded text-[8px] text-slate-400">
                  <span className="font-bold text-emerald-400 block">+18.4% Uplift</span>
                  Digital Growth
                </div>
                <div className="bg-slate-950/40 p-1.5 rounded text-[8px] text-slate-400">
                  <span className="font-bold text-amber-300 block">14-Day SLA</span>
                  Deployment Risk
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "kronos-spatial",
      client: "Kronos Spatial Bureau",
      type: "Architectural Design Firm",
      icon: Camera,
      iconBg: "bg-purple-950/40",
      iconColor: "text-purple-400",
      tagline: "Immersive editorial portfolio framing raw spatial landmarks.",
      description: "Kronos previously showcased their high-end residential and commercial builds on a standard grid template. We engineered a bespoke masonry-grid lightbox layout with brutalist fine-hairline borders, transforming their web presence into an interactive editorial magazine.",
      beforeState: "Standard cropped grid losing photographic impact",
      afterState: "High-performance masonry gallery with instant lightbox rendering",
      results: [
        "Zero-Layout-Shift Images",
        "+60% Time on Site",
        "Magazine-Grade Aesthetics"
      ],
      demoUrl: "/site/creative",
      demoLabel: "Launch Portfolio Demo",
      industryStandardQuote: "Creative agencies, prestige photography studios, and high-end architects require this kind of unobstructed photographic presentation to close six-figure briefs.",
      visualMockup: (
        <div className="relative w-full aspect-[4/3] rounded-xl border border-white/10 bg-slate-900/50 shadow-2xl flex flex-col overflow-hidden group">
          <div className="h-6 bg-slate-950 flex items-center px-3 border-b border-white/5 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/80"></span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mx-auto">kronosbureau.com</span>
          </div>
          <div className="flex-1 p-4 relative flex flex-col justify-between font-sans bg-black">
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest text-purple-500 uppercase font-semibold">KRŌNOS</span>
              <div className="h-5 w-2/3 bg-white/10 rounded flex items-center px-2">
                <span className="text-[9px] text-slate-300 font-bold">Selected Monuments</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 h-2/3">
              <div className="bg-stone-900 w-full h-full rounded border border-white/10 flex items-end p-2 relative overflow-hidden group-hover:border-purple-500/40 transition-colors">
                <span className="text-[8px] font-mono text-purple-300 relative z-10 font-bold bg-black/60 px-1 rounded">Residential</span>
              </div>
              <div className="bg-stone-900 w-full h-full rounded border border-white/10 flex items-end p-2 relative overflow-hidden group-hover:border-purple-500/40 transition-colors">
                <span className="text-[8px] font-mono text-purple-300 relative z-10 font-bold bg-black/60 px-1 rounded">Commercial</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "coastline-roasters",
      client: "Coastline Roasters",
      type: "Cafe & Wholesale Co.",
      icon: Coffee,
      iconBg: "bg-amber-950/40",
      iconColor: "text-amber-500",
      tagline: "Digitally streamlined multi-branch café order pipelines.",
      description: "Coastline Roasters was managing high-volume wholesale applications and green bean allocations via scattered Instagram direct messages and late-night texts. We engineered a fast, edge-cached static showcase with a structured multi-page wholesale qualifier, reducing clerical order dispatch overhead by 85%.",
      beforeState: "Fragmented Instagram messaging and SMS threads",
      afterState: "Structured online wholesale onboarding and instant admin dispatch alert rules",
      results: [
        "+180% Wholesale Accounts",
        "85% Admin Workload Savings",
        "0ms Dynamic CDN Loading Speed"
      ],
      demoUrl: "/site/dining",
      demoLabel: "Launch Cafe & Wholesale Demo",
      industryStandardQuote: "This approach to B2B and wholesale applications aligns perfectly with the scalable service models used across the dynamic hospitality industry, providing immediate workflow improvements for cafes and restaurants.",
      visualMockup: (
        <div className="relative w-full aspect-[4/3] rounded-xl border border-white/10 bg-slate-900/50 shadow-2xl flex flex-col overflow-hidden group">
          {/* Mockup header bar */}
          <div className="h-6 bg-slate-950 flex items-center px-3 border-b border-white/5 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/80"></span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mx-auto">coastlineroasters.com.au</span>
          </div>
          {/* Mockup body */}
          <div className="flex-1 p-4 relative flex flex-col justify-between font-sans">
            <div className="space-y-2">
              <span className="text-[9px] font-mono tracking-widest text-amber-500 uppercase font-semibold">COASTLINE SPECIALTY WHOLESALE</span>
              <div className="h-6 w-3/4 bg-white/10 rounded flex items-center px-2">
                <span className="text-[10px] text-slate-300 font-bold">Premium Roast Partner Application</span>
              </div>
              <div className="h-2 w-1/2 bg-white/5 rounded"></div>
            </div>
            {/* Interactive representation of form */}
            <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-2 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <div className="flex gap-1.5 justify-between">
                <span className="text-[8px] font-mono text-amber-400 font-bold uppercase">Wholesale Inquiry #4102</span>
                <span className="text-[8px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded uppercase font-bold">Verified Business</span>
              </div>
              <div className="h-[1px] bg-white/5"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/40 p-1.5 rounded text-[8px] text-slate-400">
                  <span className="font-bold text-slate-300 block">Est. Volume</span>
                  40kg - 60kg per week
                </div>
                <div className="bg-slate-950/40 p-1.5 rounded text-[8px] text-slate-400">
                  <span className="font-bold text-slate-300 block">Primary Coffee Target</span>
                  Organic House Blend & Single Origins
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "swim-star-academy",
      client: "Swim Star Academy",
      type: "Premium Aquatics School",
      icon: Waves,
      iconBg: "bg-cyan-950/40",
      iconColor: "text-cyan-400",
      tagline: "Multilingual parental enroller with zero manual coordination overhead.",
      description: "Based in Hong Kong, Swim Star Academy was spending 20+ hours per week coordinating student slots and tuition billing over WhatsApp. We developed an advanced parent portal featuring localized HKD options, automated timetable estimators and Stripe payment links.",
      beforeState: "Manual calendar mapping over chat & coordinate backups",
      afterState: "Instant self-serve course selection, localized quote generator and automatic registration logs",
      results: [
        "+140% Successful Enrolments",
        "0 Hours Coordination Noise",
        "100% Parent Upfront Payments"
      ],
      demoUrl: "/site/swim",
      demoLabel: "Launch Swim Academy Demo",
      industryStandardQuote: "This automated enrolment pattern is directly transferable to fitness studios, dance academies, and tutoring centers, ensuring seamless multi-class bookings and immediate payment captures.",
      visualMockup: (
        <div className="relative w-full aspect-[4/3] rounded-xl border border-white/10 bg-slate-900/50 shadow-2xl flex flex-col overflow-hidden group">
          {/* Mockup header bar */}
          <div className="h-6 bg-slate-950 flex items-center px-3 border-b border-white/5 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/80"></span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mx-auto">swimstar.hk</span>
          </div>
          {/* Mockup body */}
          <div className="flex-1 p-4 relative flex flex-col justify-between font-sans">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">SWIM STAR PORTAL</span>
              <div className="h-5 w-2/3 bg-white/10 rounded flex items-center px-2">
                <span className="text-[9px] text-slate-300 font-bold">Child Enrolment Dashboard</span>
              </div>
            </div>
            {/* Class Cards list */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 border border-slate-800 bg-slate-950/40 rounded-lg text-[8px] space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>Toddler Aqua Basic</span>
                  <span className="text-cyan-400">Class Full</span>
                </div>
                <div className="h-1 bg-white/5 rounded"></div>
              </div>
              <div className="p-2 border border-cyan-500/30 bg-cyan-950/10 rounded-lg text-[8px] space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>Elite Youth Squad</span>
                  <span className="text-emerald-405">4 Slots Left</span>
                </div>
                <div className="h-1 bg-cyan-500/30 rounded"></div>
              </div>
            </div>
            {/* Total Badge */}
            <div className="mt-2 p-2 bg-slate-950/70 border border-slate-800 rounded-lg flex justify-between items-center text-[8px]">
              <span className="text-slate-400 font-mono">Total Estimated Tuition:</span>
              <span className="text-emerald-400 font-mono font-bold font-semibold">HKD 11,700</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "motion-physio",
      client: "Motion Physiotherapy",
      type: "Health & Rehabilitation Clinic",
      icon: Activity,
      iconBg: "bg-indigo-950/40",
      iconColor: "text-indigo-400",
      tagline: "High-precision layout for trusted allied health services.",
      description: "Primary healthcare clinics lose up to 30% of potential patients due to slow-loading CMS templates and confusing booking portals. We engineered Motion Physiotherapy's digital presence into a crisp, accessible patient layout that aligns perfectly with Australian health communication standards, prioritizing rapid schedule checking and seamless practitioner selection.",
      beforeState: "Slow template with complex PDF intake forms",
      afterState: "Blazing-fast mobile scheduling, clinical practitioner profiles, and clean digital patient intake",
      results: [
        "8s Form Onboarding Speed",
        "+42% Local Patients Booked",
        "Top 3 Google Map Pack Ranking"
      ],
      demoUrl: "/site/physio",
      demoLabel: "Launch Physio Booking Demo",
      industryStandardQuote: "This clean, authoritative layout aligns with the strictest health and medical standards in Australia, making it the perfect foundational engine for podiatrists, chiropractors, and dental specialists.",
      visualMockup: (
        <div className="relative w-full aspect-[4/3] rounded-xl border border-white/10 bg-slate-900/50 shadow-2xl flex flex-col overflow-hidden group">
          {/* Mockup header bar */}
          <div className="h-6 bg-slate-950 flex items-center px-3 border-b border-white/5 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/80"></span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mx-auto">motionphysio.com.au</span>
          </div>
          {/* Mockup body */}
          <div className="flex-1 p-4 relative flex flex-col justify-between font-sans">
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest text-indigo-400 uppercase font-semibold">MOTION PHYSIOTHERAPY</span>
              <div className="h-5 w-4/5 bg-white/10 rounded flex items-center px-2">
                <span className="text-[9px] text-slate-305 font-bold">Expert Musculoskeletal Rehab</span>
              </div>
            </div>
            {/* Interactive representation of checklist */}
            <div className="space-y-1.5 p-2 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
              <div className="flex justify-between items-center text-[8px] text-slate-300">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Sports Injury & Rehab</span>
                <span className="font-bold text-white">Available</span>
              </div>
              <div className="flex justify-between items-center text-[8px] text-slate-300">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> Medicare & NDIS Ready</span>
                <span className="font-bold text-white">Verified</span>
              </div>
            </div>
            {/* Urgent Phone CTA */}
            <div className="bg-cyan-500 text-slate-950 py-1.5 px-3 rounded-lg text-center font-bold text-[9px] hover:bg-cyan-400 transition cursor-pointer">
              🗓 Book Initial Consultation Now
            </div>
          </div>
        </div>
      )
    },
    {
      id: "apex-plumbing",
      client: "Apex Plumbing & Maintenance",
      type: "Trades & Construction Collective",
      icon: Wrench,
      iconBg: "bg-rose-950/40",
      iconColor: "text-rose-400",
      tagline: "Ultra-high-converting local emergency dispatch dispatch hubs.",
      description: "Trades operators get most of their business via mobile searchers in high-stress emergency plumbing scenarios. We built a high-contrast emergency layout for Apex with a simplified 3-field contact box, transforming their standard landing template into a conversion engine that dominates search campaigns.",
      beforeState: "Cluttered template site that loaded slowly and leaked potential clicks",
      afterState: "Mobile optimized emergency click trigger and immediate SMS dispatch automation hooks",
      results: [
        "Double Web Booking Conversion",
        "+110% Emergency Dispatch Calls",
        "Fixed-Scope 2-Week Launch"
      ],
      demoUrl: "/site/trades",
      demoLabel: "Launch Emergency Trades Demo",
      industryStandardQuote: "Emergency conversion structures like this translate rapidly and effectively across other local service industries, providing the perfect blueprint for electricians, locksmiths, and HVAC repair services.",
      visualMockup: (
        <div className="relative w-full aspect-[4/3] rounded-xl border border-white/10 bg-slate-900/50 shadow-2xl flex flex-col overflow-hidden group">
          {/* Mockup header bar */}
          <div className="h-6 bg-slate-950 flex items-center px-3 border-b border-white/5 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/80"></span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mx-auto">apexplumbingservices.com.au</span>
          </div>
          {/* Mockup body */}
          <div className="flex-1 p-4 relative flex flex-col justify-between font-sans">
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest text-rose-400 uppercase font-semibold">APEX PLUMBING SYDNEY</span>
              <div className="h-5 w-5/6 bg-white/10 rounded flex items-center px-2">
                <span className="text-[9px] text-slate-205 font-bold">Rapid Emergency Outcall &amp; Blockages</span>
              </div>
            </div>
            {/* Immediate Form Mockup */}
            <div className="p-2 border border-rose-500/30 bg-rose-950/20 rounded-xl space-y-1.5">
              <div className="h-3 w-3/4 bg-white/10 rounded"></div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-3 bg-slate-950/40 border border-slate-800 rounded"></div>
                <div className="h-3 bg-slate-950/40 border border-slate-800 rounded"></div>
              </div>
              <div className="h-4 bg-rose-500 rounded flex items-center justify-center">
                <span className="text-[7.5px] font-extrabold text-slate-950 block">DISPATCH PLUMBER NOW</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "rosewood-atelier",
      client: "Rosewood Atelier",
      type: "Local Fashion Boutique",
      icon: Sparkles,
      iconBg: "bg-purple-950/40",
      iconColor: "text-purple-400",
      tagline: "Elegant retail and boutique catalog showcase.",
      description: "A beautifully structured boutique catalog allowing localized in-store reservations and visually stunning lookbooks. Perfect for capturing high-end custom fashion traffic before guiding visitors to the physical storefront.",
      beforeState: "Static social media links generating zero direct traffic",
      afterState: "An immersive e-catalog with local collection reservation pipelines",
      results: [
        "In-store Appointments +42%",
        "Premium Brand Positioning",
        "Streamlined Inventory Checks"
      ],
      demoUrl: "/site/retail",
      demoLabel: "Launch Boutique Demo",
      industryStandardQuote: "High-end retail relies strictly on pristine visual aesthetics. A bespoke catalog presentation provides absolute trust for premium-spending local clients searching for specialized fashion and jewelry items.",
      visualMockup: (
        <div className="relative w-full aspect-[4/3] rounded-xl border border-white/10 bg-slate-900/50 shadow-2xl flex flex-col overflow-hidden group">
          <div className="h-6 bg-slate-950 flex items-center px-3 border-b border-white/5 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/80"></span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono mx-auto">rosewood-atelier.com</span>
          </div>
          <div className="flex-1 p-4 relative flex flex-col justify-between font-sans bg-slate-950">
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest text-purple-400 uppercase font-semibold">ROSEWOOD ATELIER</span>
              <div className="p-2 bg-purple-900/20 border border-purple-500/10 rounded-lg text-center mt-2">
                <span className="text-[9px] text-white font-bold italic block">Meticulously Tailored Organic Linen</span>
                <span className="text-[6.5px] text-slate-400 block mt-1">Sustainably stitched & curated collections</span>
              </div>
            </div>
            <div className="h-10 mt-2 bg-gradient-to-r from-slate-900 to-black rounded border border-white/5 flex items-center justify-between px-3">
               <span className="text-[8px] font-mono text-purple-300">New Arrivals</span>
               <span className="text-[8px] font-mono text-slate-500">View Lookbook &rarr;</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredItems = activeTab === "all" ? portfolioItems : portfolioItems.filter(item => {
    if (activeTab === "local") return ["coastline-roasters", "apex-plumbing", "rosewood-atelier"].includes(item.id);
    if (activeTab === "corporate") return ["aegis-advisory", "motion-physio"].includes(item.id);
    if (activeTab === "booking") return ["swim-star-academy", "motion-physio", "coastline-roasters"].includes(item.id);
    if (activeTab === "creative") return ["kronos-spatial", "rosewood-atelier"].includes(item.id);
    return true;
  });

  const handleScrollToSection = (sectionId: string) => {
    // Scroll safely or route home if needed
    window.location.href = `/?sec=${sectionId}`;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white relative flex flex-col overflow-x-hidden pt-16 sm:pt-20">
      <BackgroundEffects />

      {/* Embedded Header component */}
      <Header 
        onScrollToSection={handleScrollToSection} 
        activeSection="pricing" 
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* Main Container Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10 w-full text-left">
        
        {/* Intro Hero Section Header */}
        <section id="work-examples-intro" className="max-w-3xl mb-12 sm:mb-20">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold px-3 py-1 bg-cyan-950/35 border border-cyan-500/20 rounded-full inline-block">
            Our Client Showcase
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white mt-4 leading-none">
            Proven platforms. <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Pristine execution.</span>
          </h1>
          <p className="text-slate-400 mt-6 text-sm sm:text-base font-light leading-relaxed max-w-2xl">
            We don&apos;t build generic templates. We construct professional visual frameworks tailored to extract commercial inquiries, drive bookings, and command authority in your market. Explore case studies from our Sydney &amp; Hong Kong clients below.
          </p>

          {/* Filtering buttons */}
          <div className="flex flex-wrap gap-2 mt-8 sm:mt-10">
            {[
              { id: "all", label: "All Completed Work" },
              { id: "local", label: "Local Services / Retail" },
              { id: "corporate", label: "Corporate & Clinic" },
              { id: "booking", label: "Advanced Booking Systems" },
              { id: "creative", label: "Creative Portfolios" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer select-none
                  ${activeTab === tab.id 
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_4px_16px_rgba(34,211,238,0.25)]" 
                    : "bg-white/5 text-slate-400 border-white/5 hover:border-white/10 hover:text-white"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Dynamic Showcase List */}
        <div className="space-y-16 lg:space-y-24">
          {filteredItems.map((item, index) => {
            const ItemIcon = item.icon;
            const isEven = index % 2 === 0;

            return (
              <FadeIn key={item.id}>
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-14 items-stretch border border-white/10 rounded-3xl bg-slate-900/50 hover:bg-slate-900/80 transition-all duration-300 p-6 sm:p-10 relative overflow-hidden`}>
                  
                  {/* Backdrop lights */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none"></div>

                  {/* Left: detailed copy & testimonial */}
                  <div className="lg:w-1/2 flex flex-col justify-between space-y-8 text-left">
                    <div className="space-y-4">
                      {/* Badge / Type */}
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border border-white/5 ${item.iconBg} ${item.iconColor}`}>
                          <ItemIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-display font-semibold text-white block leading-none">{item.client}</span>
                          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-500 block mt-1">{item.type}</span>
                        </div>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight leading-snug">
                        {item.tagline}
                      </h2>

                      <p className="text-slate-400 font-light text-xs sm:text-sm leading-relaxed">
                        {item.description}
                      </p>

                      {/* Before / After comparison */}
                      <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl text-xs space-y-2 max-w-md">
                        <div className="flex gap-2 items-start">
                          <span className="px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded text-[9px] font-mono font-bold uppercase shrink-0 mt-0.5">BEFORE:</span>
                          <span className="text-slate-400">{item.beforeState}</span>
                        </div>
                        <div className="h-[1px] bg-white/5"></div>
                        <div className="flex gap-2 items-start">
                          <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-mono font-bold uppercase shrink-0 mt-0.5">AFTER:</span>
                          <span className="text-white font-medium">{item.afterState}</span>
                        </div>
                      </div>
                    </div>

                    {/* Results grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {item.results.map((res, rIdx) => (
                        <div key={rIdx} className="p-3 bg-cyan-950/20 border border-cyan-500/15 rounded-xl text-center">
                          <span className="text-[10px] font-mono uppercase text-cyan-400 block tracking-wider mb-1">Result achieved</span>
                          <span className="text-xs font-bold text-white tracking-tight leading-dense block">{res}</span>
                        </div>
                      ))}
                    </div>

                    {/* Demonstration Link */}
                    {item.demoUrl && (
                      <div className="pt-2 border-t border-white/5">
                        <Link
                          to={item.demoUrl}
                          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-bold hover:text-cyan-300 transition-colors cursor-pointer group"
                        >
                          <span>{item.demoLabel || "Launch Demo"}</span>
                          <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                      </div>
                    )}

                    {/* Industry Usage & Marketing Quote */}
                    <div className="p-5 bg-slate-950/50 border border-white/5 rounded-2xl relative">
                      <Sparkles className="w-6 h-6 text-cyan-500/10 absolute top-4 right-4 animate-pulse opacity-50" />
                      <p className="text-slate-300 font-light text-xs sm:text-sm leading-relaxed pr-6">
                        {item.industryStandardQuote}
                      </p>
                    </div>

                  </div>

                  {/* Right: abstract, elegant live component browser mockup */}
                  <div className="lg:w-1/2 flex items-center justify-center relative bg-slate-950/60 p-6 sm:p-10 rounded-2xl min-h-[280px] sm:min-h-[380px] lg:min-h-auto">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.1),transparent_70%)] pointer-events-none"></div>
                    <div className="w-full max-w-md transition-transform duration-300 hover:scale-[1.01]">
                      {item.visualMockup}
                    </div>
                  </div>

                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Lower section CTA */}
        <section id="work-lower-cta" className="mt-16 sm:mt-24 text-center max-w-xl mx-auto glass-card rounded-3xl p-8 sm:p-12 border border-white/5 flex flex-col items-center">
          <Sparkles className="w-8 h-8 text-cyan-400 mb-4 animate-pulse" />
          <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
            Ready to deploy your professional digital upgrade?
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed mb-8">
            Let&apos;s map out your required screens, forms, and features. Receive a robust interactive quote estimate instantaneously.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link
              to="/client-intake?source=work-cta"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/10 cursor-pointer text-center block"
            >
              Configure Website Proposal
            </Link>
            <button
              onClick={() => handleScrollToSection("services")}
              className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-705 text-sm font-semibold transition-all cursor-pointer block text-center"
            >
              Analyze Plan Features
            </button>
          </div>
        </section>

      </main>

      {/* Embedded Footer component */}
      <Footer onScrollToSection={handleScrollToSection} language={language} />
    </div>
  );
}
