import React, { useState, useEffect, ReactNode } from "react";
import { 
  FileText, 
  ArrowLeft, 
  Printer, 
  Check, 
  Percent, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown,
  Settings, 
  Info,
  Layers,
  Award,
  CircleHelp,
  TrendingUp,
  User,
  Briefcase,
  Camera,
  Wrench,
  Utensils,
  Store,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  Layers3,
  ExternalLink,
  Globe,
  HelpCircle,
  Clock,
  PhoneCall,
  MapPin,
  Star,
  QrCode,
  ShoppingBag,
  ExternalLink as LinkIcon,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, isFirebaseConfigured, withTimeout, saveToLocalFallback, getLocalFallbackSubmissions, updateLocalFallback } from "../firebase";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useLeadTracker } from '../hooks/useLeadTracker';
import { packages as appPackages } from "../config/pricing";

// Structure for industry profile data
interface IndustryProfile {
  id: string;
  name: string;
  paths: string[];
  mainPath: string;
  icon: any;
  letterheadName: string;
  letterheadSlogan: string;
  quoteTitle: string;
  normalPrice: number;
  finalPrice: number;
  discountPrice: number;
  alignedPackageName: string;
  description: string;
  repPlaceholder: string;
  businessPlaceholder: string;
  scopeItems: {
    title: string;
    description: string;
    visual: ReactNode;
  }[];
}

export default function StaticBusinessQuote() {
  useLeadTracker('proposal_viewed');

  // Navigation back to workspace
  const handleBackToWorkspace = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // Safe window/pathname access
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync state if URL updates
  useEffect(() => {
    const path = window.location.pathname;
    const foundProfile = profiles.find(p => p.paths.includes(path) || p.mainPath === path);
    if (foundProfile && foundProfile.id !== activeProfileId) {
      setActiveProfileId(foundProfile.id);
    }
  }, [currentPath]);

  // Iframe detector for print warnings
  const [isIframe, setIsIframe] = useState(false);
  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);

  // Set default client field details
  const [clientName, setClientName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const [leadData, setLeadData] = useState<any>(null);
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const [approvalState, setApprovalState] = useState<'idle' | 'submitting' | 'approved' | 'error'>('idle');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [clientQuestion, setClientQuestion] = useState("");
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalUnderstandingChecked, setApprovalUnderstandingChecked] = useState(false);

  // Accordion state variables - Collapsed first
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [isAddonsOpen, setIsAddonsOpen] = useState(false);
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  // Fetch lead information if leadId, intakeId, or ID exists in query string
  useEffect(() => {
    const fetchLead = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const leadId = urlParams.get('leadId') || urlParams.get('intakeId') || urlParams.get('id');
      if (leadId) {
        setIsLoadingLead(true);
        
        if (!isFirebaseConfigured) {
          console.warn("Firebase not configured. Entering offline mode for proposal.");
          const localItems = getLocalFallbackSubmissions();
          const found = localItems.find(item => item.id === leadId);
          if (found) {
            const data = found.data;
            setLeadData({ id: leadId, collection: found.collection, ...data });
            if (data.contact_name) setClientName(data.contact_name);
            else if (data.contactName) setClientName(data.contactName);
            
            if (data.business_name) setBusinessName(data.business_name);
            else if (data.businessName) setBusinessName(data.businessName);
            
            if (data.email) setEmail(data.email);
            if (data.phone) setPhone(data.phone);
            if (data.selected_addons) setSelectedAddons(data.selected_addons || []);
          }
          setIsLoadingLead(false);
          return;
        }

        try {
          // Try intakes collection first with safe 2.5s timeout
          const intakeRef = doc(db, "intakes", leadId);
          let intakeSnap;
          try {
            intakeSnap = await withTimeout(getDoc(intakeRef), 2500);
          } catch (tErr) {
            console.warn("Intakes retrieval timed out, trying outreachLeads.");
          }

          if (intakeSnap && intakeSnap.exists()) {
            const data = intakeSnap.data();
            setLeadData({ id: leadId, collection: "intakes", ...data });
            if (data.contact_name) setClientName(data.contact_name);
            else if (data.contactName) setClientName(data.contactName);
            
            if (data.business_name) setBusinessName(data.business_name);
            else if (data.businessName) setBusinessName(data.businessName);
            
            if (data.email) setEmail(data.email);
            if (data.phone) setPhone(data.phone);
            if (data.selected_addons) setSelectedAddons(data.selected_addons);
            return;
          }

          // Try outreachLeads (safe 2.5s timeout)
          let outreachSnap;
          try {
            const outreachRef = doc(db, "outreachLeads", leadId);
            outreachSnap = await withTimeout(getDoc(outreachRef), 2500);
          } catch (oErr) {
            console.warn("OutreachLeads retrieval failed or timed out: ", oErr);
          }

          if (outreachSnap && outreachSnap.exists()) {
            const data = outreachSnap.data();
            setLeadData({ id: leadId, collection: "outreachLeads", ...data });
            if (data.contactName) setClientName(data.contactName);
            else if (data.contact_name) setClientName(data.contact_name);

            if (data.businessName) setBusinessName(data.businessName);
            else if (data.business_name) setBusinessName(data.business_name);

            if (data.email) setEmail(data.email);
            if (data.phone) setPhone(data.phone);
            if (data.selected_addons) setSelectedAddons(data.selected_addons);
          } else {
            // Check local fallback
            const localItems = getLocalFallbackSubmissions();
            const found = localItems.find(item => item.id === leadId);
            if (found) {
              const data = found.data;
              setLeadData({ id: leadId, collection: found.collection, ...data });
              if (data.contact_name) setClientName(data.contact_name);
              else if (data.contactName) setClientName(data.contactName);
              
              if (data.business_name) setBusinessName(data.business_name);
              else if (data.businessName) setBusinessName(data.businessName);
              
              if (data.email) setEmail(data.email);
              if (data.phone) setPhone(data.phone);
              if (data.selected_addons) setSelectedAddons(data.selected_addons || []);
            }
          }
        } catch (err) {
          console.warn("Could not fetch remote lead details (falling back to local data):", err);
          // Fallback to local
          const localItems = getLocalFallbackSubmissions();
          const found = localItems.find(item => item.id === leadId);
          if (found) {
            const data = found.data;
            setLeadData({ id: leadId, collection: found.collection, ...data });
            if (data.contact_name) setClientName(data.contact_name);
            else if (data.contactName) setClientName(data.contactName);
            
            if (data.business_name) setBusinessName(data.business_name);
            else if (data.businessName) setBusinessName(data.businessName);
            
            if (data.email) setEmail(data.email);
            if (data.phone) setPhone(data.phone);
            if (data.selected_addons) setSelectedAddons(data.selected_addons || []);
          }
        } finally {
          setIsLoadingLead(false);
        }
      }
    };
    fetchLead();
  }, []);

  const handleStartIntake = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('leadId') || urlParams.get('intakeId') || urlParams.get('id');

    if (isFirebaseConfigured && leadId && leadData) {
      try {
        const ref = doc(db, leadData.collection, leadId);
        if (leadData.status !== 'Proposal Approved' && leadData.status !== 'Project Started' && leadData.status !== 'Deposit Paid') {
          await withTimeout(updateDoc(ref, {
            status: "Intake Started",
            updated_at: serverTimestamp()
          }), 2500);
        }
      } catch (err) {
        console.warn("Could not log status update to db before intake navigate (not blocker):", err);
      }
    }
    
    window.location.href = `/client-intake?source=proposal&industry=${leadData?.industry || 'trades-business'}${leadId ? `&lead=${leadId}` : ''}`;
  };

  const handleApproveProposal = async () => {
    setApprovalState('submitting');
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('leadId') || urlParams.get('intakeId') || urlParams.get('id');
    
    const payload = {
      contact_name: clientName || "Prospective Client",
      business_name: businessName || "Prospective Business",
      email: email || "unknown@email.com",
      phone: phone || "",
      status: "Proposal Approved",
      proposal_approved_at: new Date().toISOString(),
      proposal_approved_from_page: true,
      proposal_approval_confirmed: true,
      lead_type: 'project_intake',
      industry: leadData?.industry || 'trades-business',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: `Proposal approved from trades-business landing page`
    };

    if (!isFirebaseConfigured) {
      console.warn("Local/Demo Mode Active: capturing approval offline.");
      saveToLocalFallback('intakes', payload, leadId || undefined);
      setApprovalState('approved');
      setShowApprovalModal(false);
      return;
    }

    try {
      if (leadId && leadData) {
        const ref = doc(db, leadData.collection, leadId);
        await withTimeout(updateDoc(ref, {
          status: "Proposal Approved",
          proposal_approved_at: serverTimestamp(),
          proposal_approved_from_page: true,
          proposal_approval_confirmed: true,
          signature_name: clientName || "Client Representative",
          signature_date: new Date().toLocaleDateString(),
          scope_approved: true,
          updated_at: serverTimestamp()
        }), 3000);
      } else {
        await withTimeout(addDoc(collection(db, "intakes"), {
          ...payload,
          proposal_approved_at: serverTimestamp(),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        }), 3000);
      }
      setApprovalState('approved');
      setShowApprovalModal(false);
    } catch (err) {
      console.error("Database confirm failed or timed out. Bypassing and recording local fallback:", err);
      // Fallback gracefully so client experiences perfect success:
      saveToLocalFallback('intakes', payload, leadId || undefined);
      setApprovalState('approved');
      setShowApprovalModal(false);
    }
  };

  const handleSendQuestion = async () => {
    if (!clientQuestion.trim()) return;
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('leadId') || urlParams.get('intakeId') || urlParams.get('id');

    const payload = {
      contact_name: clientName || "Prospective Client",
      business_name: businessName || "Prospective Business",
      email: email || "unknown@email.com",
      phone: phone || "",
      status: "Question Asked",
      lead_type: 'project_intake',
      industry: leadData?.industry || 'trades-business',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: `Question from business proposal: ${clientQuestion}`
    };

    if (!isFirebaseConfigured) {
      console.warn("Local/Demo Mode Active: capturing question offline.");
      saveToLocalFallback('intakes', payload, leadId || undefined);
      setQuestionSubmitted(true);
      return;
    }

    try {
      if (leadId && leadData) {
        const ref = doc(db, leadData.collection, leadId);
        await withTimeout(updateDoc(ref, {
          notes: `${leadData.notes || ''}\n[Question from Business Proposal]: ${clientQuestion}`.trim(),
          status: "Question Asked",
          updated_at: serverTimestamp()
        }), 3000);
      } else {
        await withTimeout(addDoc(collection(db, "intakes"), {
          ...payload,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        }), 3000);
      }
      setQuestionSubmitted(true);
    } catch (err) {
      console.error("Firebase submit error or timeout. Bypassing with local fallback:", err);
      saveToLocalFallback('intakes', payload, leadId || undefined);
      setQuestionSubmitted(true);
    }
  };

  // Optional toggles to enrich user interaction and dynamic subtotaling
  const [includeMaintenance, setIncludeMaintenance] = useState<"none" | "basic" | "managed">("none");
  const [includeDomain, setIncludeDomain] = useState<boolean>(false);

  // Special request state
  const [specialRequest, setSpecialRequest] = useState("");
  const [isSavingSpecialRequest, setIsSavingSpecialRequest] = useState(false);
  const [specialRequestSaved, setSpecialRequestSaved] = useState(false);

  useEffect(() => {
    if (leadData) {
      setSpecialRequest(leadData.special_request || leadData.specialRequest || "");
    }
  }, [leadData]);

  // Document metadata defaults
  const quoteNumber = "CS-STC-2026-089";
  const quoteDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const handlePrint = () => {
    window.print();
  };

  // Define 5 custom tailored industry profile specs complete with gorgeous miniature layout wireframes
  const profiles: IndustryProfile[] = [
    {
      id: "corporate",
      name: "Corporate & Advisory",
      paths: ["/static-business-quote", "/cheap-business-quote", "/business-quote", "/consultant-quote", "/consultant-website"],
      mainPath: "/consultant-quote",
      icon: Briefcase,
      letterheadName: "Clarity Advisory",
      letterheadSlogan: "Enterprise Strategy & Professional Advisory",
      quoteTitle: "Advisory & Corporate Static Web Proposal",
      normalPrice: 15600,
      finalPrice: 4680,
      discountPrice: 10920,
      alignedPackageName: "Growth Website & Client Workflow",
      description: "Includes professional high-trust financial advisory guidelines, integrated client screening metrics, beautiful partner bios, executive value-proposition layouts, search ranking structures, and lightning fast SLA delivery.",
      repPlaceholder: "Marcus Peterson",
      businessPlaceholder: "Peterson Advisory Group",
      scopeItems: [
        {
          title: "Bespoke consultancy hero & trust frame",
          description: "High-level institutional branding designed to communicate expertise. Focuses beautifully on elite value proposition and corporate conversion.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-2 font-sans overflow-hidden print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[7px] font-mono text-slate-500 border-b border-white/5 pb-1 print:border-slate-200">
                <span className="font-bold text-cyan-400 print:text-slate-800">💼 PETERSON ADVISORY</span>
                <span>Advisory | Partners | Contact</span>
              </div>
              <div className="py-2.5 px-2 bg-gradient-to-r from-slate-900 to-slate-955 rounded-lg text-center border border-white/5 print:from-slate-100 print:to-slate-100 print:border-slate-200">
                <div className="text-[9px] font-extrabold text-white print:text-slate-900 leading-snug">Elite Enterprise Strategy &amp; Sustainable Mergers</div>
                <div className="text-[6.5px] text-slate-450 mt-1 max-w-xs mx-auto print:text-slate-500">Helping forward-thinking firms drive lasting enterprise outcomes.</div>
                <div className="mt-2 text-[8px] inline-block px-3 py-0.5 bg-cyan-400 font-bold text-slate-950 rounded-full print:bg-slate-800 print:text-white">Schedule Partner Brief</div>
              </div>
            </div>
          )
        },
        {
          title: "Flawless mobile layout & scroll performance",
          description: "Optimized mobile grid scrolling built specifically to make PDFs and bio sheets easily downloadable on smartphone devices.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 flex gap-4 items-center justify-around font-sans print:bg-slate-50 print:border-slate-200">
              <div className="border border-white/10 rounded px-1.5 py-1 w-1/2 scale-95 opacity-80 print:border-slate-300">
                <div className="text-[7px] text-cyan-400 font-bold print:text-slate-800">🖥️ Desktop Spec</div>
                <div className="flex gap-1 mt-1">
                  <div className="w-2/3 h-5 bg-white/5 rounded border border-white/5 print:bg-white print:border-slate-200" />
                  <div className="w-1/3 h-5 bg-cyan-450/10 rounded print:bg-cyan-50" />
                </div>
              </div>
              <div className="border-2 border-cyan-500/20 rounded-xl p-1.5 w-1/3 text-center bg-[#020617] print:border-slate-300 print:bg-white">
                <div className="text-[7px] text-emerald-400 font-bold print:text-emerald-700">📱 Mobile Spec</div>
                <div className="h-6 w-full bg-cyan-950/30 rounded border border-cyan-800/20 flex flex-col justify-center items-center mt-1 print:bg-slate-100">
                  <span className="text-[5.5px] font-mono text-cyan-400 font-bold">Fast-Touch Navigation</span>
                </div>
              </div>
            </div>
          )
        },
        {
          title: "Advisory solutions & advisory rates table",
          description: "Structured display grid defining corporate consultation packages, retainer milestones, or advisory terms.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[8px] font-bold text-slate-300 print:text-slate-900">
                <span>Advisory Specialities</span>
                <span className="text-[7px] text-cyan-400 font-normal">AUD Per Unit Retainer</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-[7px]">
                {[
                  { name: "Risk Assessment", rate: "Hourly basis", lvl: "SGA Audit" },
                  { name: "Compliance Check", rate: "Per quarter", lvl: "Regulatory" },
                  { name: "SOW Formulation", rate: "Project flat", lvl: "Strategic" }
                ].map((s, idx) => (
                  <div key={idx} className="p-1.5 bg-white/5 rounded border border-white/5 print:bg-white print:border-slate-200">
                    <div className="font-bold text-white print:text-slate-900 leading-tight">{s.name}</div>
                    <div className="text-[5.5px] text-slate-500 mt-0.5">{s.rate}</div>
                    <span className="inline-block mt-1 px-1 bg-cyan-950 text-[5px] text-cyan-400 rounded-sm print:bg-slate-100 print:text-slate-800">{s.lvl}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        },
        {
          title: "Interactive partner intake flow",
          description: "Sophisticated diagnostic screen facilitating rapid partner introductions and screening details before booking.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200 text-left">
              <span className="text-[8.5px] font-bold text-white print:text-slate-900 block">Schedule Confidential Diagnostic Call</span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-1 bg-[#020617] text-[6.5px] text-slate-500 rounded border border-white/5 print:bg-white print:border-slate-200">Legal Business Entity</div>
                <div className="p-1 bg-[#020617] text-[6.5px] text-slate-500 rounded border border-white/5 print:bg-white print:border-slate-200">Projected Capital</div>
              </div>
              <div className="p-1 bg-[#020617] text-[6.5px] text-cyan-300 rounded border border-cyan-500/20 text-center font-bold print:bg-slate-800 print:text-white">Verify SOW Availability</div>
            </div>
          )
        },
        {
          title: "Zero-maintenance CDN static servers",
          description: "Zero servers to slow you down. The site loads in 0.4s globally with zero risk of database hacks or leaks.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-2 font-sans print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[7.5px] text-slate-400 print:text-slate-650">
                <span>Core Performance Audit:</span>
                <span className="font-mono text-emerald-450 font-black print:text-emerald-700">100 / 100 Speed</span>
              </div>
              <p className="text-[7.5px] text-slate-500 leading-normal">Global edge network deployment ensures 99.99% uptime with SSL configurations automated for client privacy protection.</p>
            </div>
          )
        },
        {
          title: "Institutional local SEO schema",
          description: "Structured schema metadata embedded to assist consultant search indexing across corporate zip locations.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans print:bg-slate-50 print:border-slate-200 text-left">
              <div className="text-[8.5px] text-[#8ab4f8] hover:underline cursor-pointer font-semibold leading-tight print:text-blue-700">
                Top Commercial Consultant Advisor Sydney | Peterson Advisory Group
              </div>
              <div className="text-[6.5px] text-[#81c995] font-mono">https://peterson.com.au/corporate-advisory</div>
              <p className="text-[7px] text-slate-400 leading-snug print:text-slate-500">Corporate strategy audits, regulatory compliance checklists, and static digital deployment briefs in the CBD.</p>
            </div>
          )
        },
        {
          title: "Premium Google conversion analytics",
          description: "Deep reporting setups tracking visual clicks on phone lines, book proposals, and brochure downloads.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[8px] text-cyan-400 font-bold print:text-slate-900 border-b border-white/5 pb-1 print:border-slate-200">
                <span>Google Console Integration</span>
                <span className="text-[6.5px] text-slate-500">Partner Conversions</span>
              </div>
              <div className="h-6 flex items-end gap-1">
                {[15, 30, 45, 25, 70, 85, 40].map((h, i) => (
                  <div key={i} style={{ height: `${h}%` }} className="bg-gradient-to-t from-cyan-500 to-blue-500 w-full rounded-t-sm print:from-cyan-800 print:to-cyan-800" />
                ))}
              </div>
            </div>
          )
        },
        {
          title: "Strategic handover blueprint manual",
          description: "Clear manual guiding partners on how to instantly edit team bios, list advisory updates, or publish announcements.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 flex gap-2.5 items-center font-sans print:bg-slate-50 print:border-slate-200 text-left">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold shrink-0 print:bg-cyan-150">
                PDF
              </div>
              <div>
                <div className="text-[8px] font-bold text-white print:text-slate-905">Executive_Advisory_Operations_Playbook.pdf</div>
                <p className="text-[6.5px] text-slate-500">Step-by-step guidance on zero-overhead updates and staff access configurations.</p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: "creative",
      name: "Creative Portfolio",
      paths: ["/portfolio-quote", "/portfolio-website"],
      mainPath: "/portfolio-quote",
      icon: Camera,
      letterheadName: "Prism Creative Labs",
      letterheadSlogan: "Bespoke Portfolio & Digital Showroom Designs",
      quoteTitle: "Creative Agency & Portfolio Web SOW Proposal",
      normalPrice: 9600,
      finalPrice: 2880,
      discountPrice: 6720,
      alignedPackageName: "Small Business Website",
      description: "Designed explicitly for highly visual creatives, architects, photographers and design studios. Features beautiful fullscreen masonry grids, instant retina optimizations, image overlays, and ultra-sleek high-fashion aesthetics.",
      repPlaceholder: "Sarah Lawson",
      businessPlaceholder: "Prism Collective Art",
      scopeItems: [
        {
          title: "Cinema widescreen hero & media gallery",
          description: "High-contrast editorial grid focusing completely on stunning visual assets, projects, typography, and clean layouts.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-2 font-sans overflow-hidden print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[7px] font-mono text-slate-500">
                <span className="font-bold text-white print:text-slate-900">PRISM STUDIO</span>
                <span className="text-cyan-400">View Selected Works ↗</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="h-10 bg-gradient-to-r from-purple-950 to-indigo-950 rounded border border-white/10 flex items-center justify-center text-[6px] text-slate-400 font-bold print:from-slate-100">Gallery A</div>
                <div className="h-10 bg-gradient-to-r from-blue-950 to-cyan-950 rounded border border-white/10 flex items-center justify-center text-[6px] text-slate-400 font-bold print:from-slate-100">Gallery B</div>
                <div className="h-10 bg-gradient-to-r from-slate-900 to-slate-950 rounded border border-white/10 flex items-center justify-center text-[6px] text-slate-400 font-bold print:from-slate-100">Gallery C</div>
              </div>
            </div>
          )
        },
        {
          title: "Retina image lazy loading technology",
          description: "Optimized image pipelines that compress raw media automatically into next-gen webp, generating 0.2s content load speeds.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[7px] text-slate-400 print:text-slate-800 font-bold">
                <span>Retina Media Pipeline Active</span>
                <span className="text-emerald-400 font-mono">Compressed -78% Span</span>
              </div>
              <div className="w-full bg-[#020617] h-3.5 rounded border border-white/5 p-0.5 flex items-center print:bg-slate-100">
                <div className="h-full bg-cyan-400 w-4/5 rounded-sm" />
              </div>
            </div>
          )
        },
        {
          title: "Curated filterable creative project grid",
          description: "Dynamic project tag selections (e.g., Photography, Film, Brand, Layouts) working purely via lightning client state.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-2 font-sans print:bg-slate-50 print:border-slate-200">
              <div className="flex gap-1 justify-center">
                <span className="px-1.5 py-0.5 bg-cyan-500 text-slate-950 text-[5.5px] font-bold rounded-sm">All Works</span>
                <span className="px-1.5 py-0.5 bg-white/5 text-slate-400 text-[5.5px] rounded-sm print:bg-white print:border print:border-slate-300">Identity</span>
                <span className="px-1.5 py-0.5 bg-white/5 text-slate-400 text-[5.5px] rounded-sm print:bg-white print:border print:border-slate-300">Photography</span>
              </div>
              <div className="h-6 bg-white/5 rounded border border-dashed border-white/10 flex items-center justify-center text-[6px] text-slate-500">Filter Active Overlay</div>
            </div>
          )
        },
        {
          title: "Interactive Brief Planner client intake",
          description: "Visually elegant interactive service configuration designed to let prospects lay out goals, budgets, and creative parameters.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <span className="text-[8px] font-bold text-white print:text-slate-950 block">Draft Selected Deliverables</span>
              <div className="flex justify-between items-center p-1 bg-[#020617] rounded text-[6.5px] text-slate-400 border border-white/5 print:bg-white">
                <span>Visual Brand Standards Guideline</span>
                <span className="text-cyan-400">Selected ✔</span>
              </div>
            </div>
          )
        },
        {
          title: "Zero-Latency static content network",
          description: "Built strictly with CSS static layouts meaning zero database query delays, providing flawless protection against script attacks.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <span className="text-[8.5px] font-bold text-white print:text-slate-950 block">High Security Global Handover</span>
              <p className="text-[6.5px] text-slate-500 leading-normal">Compiled build files hosted directly across continuous integration CDN points, guaranteeing 100% security.</p>
            </div>
          )
        },
        {
          title: "Creative-focused Organic SEO schemas",
          description: "Embedded tags highlighting regional design queries and creative capabilities to boost search engine traffic.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <span className="text-[8.5px] text-blue-400 hover:underline block leading-tight">Bespoke Design Agency &amp; Art Studio | Prism Collective</span>
              <span className="text-[6.5px] text-emerald-400 block font-mono">https://prismcollective.art</span>
              <p className="text-[7px] text-slate-500 leading-snug">Sydney metropolitan architectural photographer and premium digital campaign consultants.</p>
            </div>
          )
        },
        {
          title: "Audience analytics & visual insights panel",
          description: "Invisible web analytics tracking which images get hovered most, and which visual campaigns are most popular with visitors.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans print:bg-slate-50 print:border-slate-200">
              <div className="text-[7.5px] font-bold text-cyan-400 print:text-slate-900 flex justify-between border-b border-white/5 pb-1">
                <span>Visual Hover Tracking Insights</span>
                <span className="text-emerald-400">● 97% Hotrate</span>
              </div>
              <div className="h-5 bg-gradient-to-r from-purple-500/10 via-cyan-500/20 to-blue-500/10 rounded border border-cyan-500/15 text-center text-[5.5px] flex items-center justify-center font-mono text-cyan-300">IMAGE_GRID_3 (HIGH ENGAGEMENT)</div>
            </div>
          )
        },
        {
          title: "Drag-and-drop media upload template guide",
          description: "Simple user-friendly guide empowering you to easily add new imagery to Netlify/Vercel with zero code required.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 flex gap-2.5 items-center font-sans print:bg-slate-50 print:border-slate-200 text-left">
              <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold shrink-0">
                MD
              </div>
              <div>
                <div className="text-[8px] font-bold text-white print:text-slate-905">Media_Showcase_Upload_Manual.md</div>
                <p className="text-[6.5px] text-slate-500">Quick steps explaining drag-keep media folder sync setups.</p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: "trades",
      name: "Trades & Builders",
      paths: ["/trades-quote", "/trades-website"],
      mainPath: "/trades-quote",
      icon: Wrench,
      letterheadName: "Miller Tradie Build",
      letterheadSlogan: "Local Contractor & Builder Lead Solutions",
      quoteTitle: "Builder & Tradie Local Lead Page SOW",
      normalPrice: 5600,
      finalPrice: 1680,
      discountPrice: 3920,
      alignedPackageName: "Landing Page",
      description: "Designed for high converting business builders, plumbing businesses, electricians and tradesmen. Focused on getting immediate calls, displaying clear local suburb servicing areas, simple quotation request boxes, and high-trust star reviews.",
      repPlaceholder: "Dave Miller",
      businessPlaceholder: "Miller Brother Plumbers",
      scopeItems: [
        {
          title: "Emergency Floating Contact Actions",
          description: "One-click thumb-friendly floating call and plumbing query buttons optimized for people needing assistance immediately.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-2 font-sans overflow-hidden print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[7.5px] text-white print:text-slate-900 border-b border-white/5 pb-1 select-none">
                <span className="font-bold text-emerald-450">⚡ MILLER TRADES</span>
                <span className="font-mono text-cyan-400">Available 24/7 ✔</span>
              </div>
              <div className="flex gap-1.5 justify-around">
                <div className="py-1 px-3 bg-emerald-500 text-slate-950 text-[7px] font-bold rounded-lg flex items-center gap-1 shrink-0">
                  <PhoneCall className="w-2.5 h-2.5" /> Call Dispatch Hotline
                </div>
                <div className="py-1 px-2.5 bg-[#020617] border border-white/10 text-slate-300 text-[6.5px] rounded-lg shrink-0 print:bg-white print:border-slate-300 print:text-slate-800">
                  Online Booking
                </div>
              </div>
            </div>
          )
        },
        {
          title: "Interactive suburb and territory coverage map",
          description: "Visually stunning local suburb service maps showing your client exactly which locations you service around the region.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[7.5px] text-slate-400 print:text-slate-800 border-b border-white/5 pb-1">
                <span>Syd Metropolitan Coverage Limit</span>
                <span className="text-cyan-400 font-bold">25km Active Radius</span>
              </div>
              <div className="h-10 rounded bg-[#020617] border border-cyan-500/20 relative overflow-hidden flex items-center justify-center print:bg-slate-100">
                <div className="w-6 h-6 rounded-full bg-cyan-400/10 border border-cyan-400/35 flex items-center justify-center animate-pulse">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="absolute bottom-1 right-1 text-[5px] text-slate-500 font-mono">Central Base Location</span>
              </div>
            </div>
          )
        },
        {
          title: "Service capabilities checklist grids",
          description: "Pragmatic, easily scannable grids displaying service offerings (e.g., Gas Leaks, Hot Water, Rewiring, Emergency).",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <span className="text-[8.5px] font-bold text-slate-300 print:text-slate-905 block">Specialist Services</span>
              <div className="grid grid-cols-2 gap-1.5 text-[6.5px]">
                <div className="flex items-center gap-1 text-slate-400"><Check className="w-2.5 h-2.5 text-emerald-450 shrink-0" /> Burst pipe emergency repair</div>
                <div className="flex items-center gap-1 text-slate-400"><Check className="w-2.5 h-2.5 text-emerald-450 shrink-0" /> Certified hot water diagnostics</div>
              </div>
            </div>
          )
        },
        {
          title: "Intelligent instant dispatch query form",
          description: "Conversion-optimized intake form that submits plumbing or electrician client leads directly to your email in real-time.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 text-left font-sans print:bg-slate-50 print:border-slate-200">
              <span className="text-[8px] font-bold text-white print:text-slate-950 block">Request Local Suburb Booking</span>
              <div className="grid grid-cols-2 gap-1 text-[6px]">
                <div className="p-1 bg-[#020617] rounded border border-white/5 text-slate-500">Postcode Location</div>
                <div className="p-1 bg-[#020617] rounded border border-white/5 text-slate-500">Service Category</div>
              </div>
              <div className="py-1 text-slate-950 font-bold text-center bg-cyan-400 text-[7px] rounded-lg cursor-pointer print:bg-cyan-800 print:text-white">Submit Dispatch Request</div>
            </div>
          )
        },
        {
          title: "Speed performance mobile delivery",
          description: "Ultra-compact code footprint that loads instantly over 3G/4G network grids in construction areas or remote locations.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[7px] text-slate-400 print:text-slate-800">
                <span>Mobile Load Rank Score</span>
                <span className="text-emerald-405 font-bold font-mono">0.18s First Screen</span>
              </div>
              <p className="text-[6.5px] text-slate-500 text-left">Ensures contractors receive calls prior to competitors due to zero loading wait-times.</p>
            </div>
          )
        },
        {
          title: "Local contractor high SEO keyword setup",
          description: "Engineered specifically to lock in search priorities across local suburbs e.g. 'Emergency plumber near me'.",
          visual: (
            <div className="mt-3 p-3 bg-[#020617] rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <span className="text-[8.5px] text-blue-400 font-semibold leading-tight hover:underline">Licensed Emergency Plumber Sydney East | Miller Bros</span>
              <span className="text-[6.5px] text-emerald-450 font-mono block">https://millerbrothersplumbing.com.au</span>
              <p className="text-[7px] text-slate-500 leading-normal">Fast responsive plumbing service, leak detections, and gas maintenance across metropolitan districts.</p>
            </div>
          )
        },
        {
          title: "Star rated trust validation metrics",
          description: "High visibility Google My Business testimonial block showcasing elite ratings with golden star overlays.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500 shrink-0" />)}
                <span className="text-[7.5px] text-amber-300 font-bold shrink-0 ml-1">5.0 Star G-Rating (214 Reviews)</span>
              </div>
              <p className="text-[6.5px] text-slate-400 font-light italic leading-snug">\"Millers arrived under 30 minutes to solve a huge hot water leak. Highly recommended plumbers!\"</p>
            </div>
          )
        },
        {
          title: "Tradie local launch deployment booklet",
          description: "Step-by-step PDF detailing how to update phone numbers, edit servicing postcodes or adapt pricing ranges.",
          visual: (
            <div className="mt-3 p-3 bg-[#020617] rounded-xl border border-white/5 flex gap-2.5 items-center font-sans print:bg-slate-50 print:border-slate-200 text-left">
              <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
                PDF
              </div>
              <div>
                <div className="text-[8px] font-bold text-white print:text-slate-905">Local_Contractor_SEO_Uptime_Blueprint.pdf</div>
                <p className="text-[6.5px] text-slate-500">Quick-start handbook detailing localized Google Business listing link steps.</p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: "dining",
      name: "Cafe & Restaurant",
      paths: ["/restaurant-quote", "/restaurant-website"],
      mainPath: "/restaurant-quote",
      icon: Utensils,
      letterheadName: "Rustica Culinary Labs",
      letterheadSlogan: "Hospitality Web Design & Menu Builders",
      quoteTitle: "Cafe & Restaurant Menu Landing Specifics",
      normalPrice: 24000,
      finalPrice: 7200,
      discountPrice: 16800,
      alignedPackageName: "Growth Website & Client Workflow",
      description: "Crafted to show digital food/drink menus, party bookings, opening hours, local addresses, and social reservations. Features responsive visual menus, optimized search indexing for food delivery searches, and maps schemas.",
      repPlaceholder: "Chef Matteo",
      businessPlaceholder: "Rustica Woodfire Bistro",
      scopeItems: [
        {
          title: "Bespoke culinary visual landing homepage",
          description: "Warm, sophisticated branding structured to emphasize beautiful dish visuals, interior cozy atmospheres, and instant call-to-actions.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-2 font-sans overflow-hidden print:bg-slate-50 print:border-slate-200 text-left">
              <div className="flex justify-between items-center text-[7px] font-mono text-slate-500 border-b border-white/5 pb-1 select-none">
                <span className="font-bold text-[#f59e0b]">🍷 RUSTICA BISTRO</span>
                <span>Our Menu | Reservation | Find Us</span>
              </div>
              <div className="py-2.5 px-2 bg-gradient-to-r from-amber-950/40 to-slate-950 rounded-lg text-center border border-white/5 print:from-slate-100">
                <span className="text-[9px] font-bold text-amber-100 block">Authentic Woodfire Neapolitan Pizza</span>
                <p className="text-[6px] text-slate-400 mt-1">Sourdough fermentations hand-stretched and cooked in 400° stone ovens.</p>
                <div className="mt-1.5 text-[7px] inline-block px-2.5 py-0.5 bg-amber-500 text-slate-950 font-bold rounded-full">Reserve Chef Table</div>
              </div>
            </div>
          )
          
        },
        {
          title: "Beautiful text menus & fast updates",
          description: "Clean responsive list showing menu dishes styled perfectly. Written in static code allowing simple price or dish changes in seconds.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[8px] font-bold border-b border-white/5 pb-1 text-slate-200">
                <span>Woodfire Red Pizzas</span>
                <span className="text-amber-500 font-mono">Chef Recommended</span>
              </div>
              <div className="space-y-1 text-[6.5px] text-slate-400">
                <div className="flex justify-between font-medium text-white print:text-slate-905">
                  <span>Margherita Extra (Buffalo Mozzarella, Basil, Olive Oil)</span>
                  <span className="font-mono text-amber-500">AUD $23</span>
                </div>
                <div className="flex justify-between font-medium text-white print:text-slate-905">
                  <span>Diavola DOC (Hot Salami, Mozzarella, Black Olives)</span>
                  <span className="font-mono text-amber-500">AUD $26</span>
                </div>
              </div>
            </div>
          )
        },
        {
          title: "Local Google Maps & TripAdvisor coordinates",
          description: "Direct maps integrations displaying coordinates, opening hours, parking spaces, and street listings.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <span className="text-[8.5px] font-bold text-white print:text-slate-905 block">Location &amp; Business Uptime Hours</span>
              <div className="grid grid-cols-2 gap-1.5 text-[6px] text-slate-400">
                <div>📬 124 Crown St, Surry Hills NSW</div>
                <div>🕒 Wednesday – Sunday (4pm – 11pm)</div>
              </div>
              <div className="p-1 rounded bg-[#020617] border border-white/5 text-[5.5px] text-slate-500 text-center">Parking validation is available inside adjacent malls.</div>
            </div>
          )
        },
        {
          title: "Catering & table reservation flow",
          description: "Clean reservation trigger gathering headcount details, dietary requirements, phone contacts, and dates.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 text-left font-sans print:bg-slate-50 print:border-slate-200">
              <span className="text-[8px] font-bold text-white print:text-slate-950 block">Party / Group Table Selection</span>
              <div className="grid grid-cols-3 gap-1 text-[6.5px] text-slate-500 font-mono">
                <div className="p-0.5 bg-[#020617] rounded border border-white/5 text-center">4 Guests</div>
                <div className="p-0.5 bg-amber-500 text-slate-950 font-bold rounded text-center">8 Guests</div>
                <div className="p-0.5 bg-[#020617] rounded border border-white/5 text-center">12+ Event</div>
              </div>
              <div className="py-1 bg-amber-500 text-slate-950 text-center text-[7.5px] font-bold rounded-md">Proceed RSVP Reservation</div>
            </div>
          )
        },
        {
          title: "Instant mobile network menu rendering",
          description: "Designed strictly on ultra-clean static grids loading in 0.15s, ensuring hunger clicks trigger immediately without delays.",
          visual: (
            <div className="mt-3 p-3 bg-[#020617] rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[7.5px] text-slate-400">
                <span>G-Vitals Dining Score:</span>
                <span className="text-emerald-450 font-mono font-bold">100/100 Core</span>
              </div>
              <p className="text-[6.5px] text-slate-500 leading-normal">Optimized CSS and media caching allows flawless loading across cellar-depth cellular networks.</p>
            </div>
          )
        },
        {
          title: "Restaurant local area SEO schema",
          description: "Assists ranking on regional keywords: e.g. 'Best italian restaurant Surry Hills' or organic Neapolitan sourdough pizza.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 text-left font-sans print:bg-slate-50 print:border-slate-200">
              <span className="text-[8px] text-[#8ab4f8] hover:underline font-semibold block leading-tight">Rustica Woodfire Bistro | Surry Hills Authentic Dining</span>
              <span className="text-[6.5px] text-emerald-400 block font-mono">https://rusticabistro.com.au/dinner-reservations</span>
              <p className="text-[7px] text-slate-500 leading-normal">Delicious woodfired Italian pizzas, house pastas, and natural Italian boutique wines.</p>
            </div>
          )
        },
        {
          title: "Contactless QR-Code routing codes",
          description: "Generates custom qr codes redirecting clients seamlessly to your online digital menu from tables.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 flex gap-2.5 items-center justify-center font-sans print:bg-slate-50 print:border-slate-200 text-left">
              <div className="p-1 bg-white rounded border border-slate-200 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-slate-950" />
              </div>
              <div>
                <div className="text-[8px] font-bold text-white print:text-slate-905">Static_Table_QR_Config.svg</div>
                <p className="text-[6.5px] text-slate-500 font-light">Custom print-ready codes linked directly to your free CDN-hosted menu URLs.</p>
              </div>
            </div>
          )
        },
        {
          title: "Bistro menu modification guidebook",
          description: "Simple booklet showing waitstaff or kitchen managers how to add specials or adjust rates via a simple spreadsheet.",
          visual: (
            <div className="mt-3 p-3 bg-[#020617] rounded-xl border border-white/5 flex gap-2.5 items-center font-sans print:bg-slate-50 print:border-slate-200 text-left">
              <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-405 text-sm font-bold shrink-0">
                PDF
              </div>
              <div>
                <div className="text-[8px] font-bold text-white print:text-slate-905">Matteos_Sourdough_Menu_Update_Guide.pdf</div>
                <p className="text-[6.5px] text-slate-500">Quick steps to safely overwrite menu data options on Netlify.</p>
              </div>
            </div>
          )
        }
      ]
    },
    {
      id: "retail",
      name: "Local Boutique",
      paths: ["/local-quote", "/local-business-quote"],
      mainPath: "/local-quote",
      icon: Store,
      letterheadName: "Atelier Boutique Labs",
      letterheadSlogan: "Creative Retail Showcases & Boutique Brand Webs",
      quoteTitle: "Local Boutique Showcase Static Proposal",
      normalPrice: 9600,
      finalPrice: 2880,
      discountPrice: 6720,
      alignedPackageName: "Small Business Website",
      description: "Custom built to display luxury local designers, jewelry showrooms, beauty salons or craft labels. Focused on displaying dynamic visual lookbooks, Click-and-Collect localized order templates, and high street maps schemas.",
      repPlaceholder: "Beatrice Vance",
      businessPlaceholder: "Rosewood Atelier Boutique",
      scopeItems: [
        {
          title: "Elegant boutique landing and visual catalog",
          description: "Refined aesthetic layouts emphasizing craftsmanship, luxury product photography, and high street brand locations.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-2 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[7px] font-mono text-slate-500 border-b border-white/5 pb-1 select-none">
                <span className="font-bold text-purple-400">❀ ROSEWOOD ATELIER</span>
                <span>The Lookbook | Studio | Inquire</span>
              </div>
              <div className="py-2 px-2 bg-[#020617] rounded-lg text-center border border-white/5 print:bg-white print:border-slate-200">
                <span className="text-[8.5px] font-light text-rose-300 tracking-wide block italic">Meticulously Tailored Organic Linen</span>
                <p className="text-[6px] text-slate-400 mt-0.5">Sustainably stitched and sourced across local weavers.</p>
              </div>
            </div>
          )
        },
        {
          title: "Localized Click & Collect order template",
          description: "Convenient conversion-optimized product inquiry form enabling local buyers to lock in pickup reservations safely with zero card processing fees.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <span className="text-[8.5px] font-bold text-white print:text-slate-955 block">Click &amp; Collect Reservation</span>
              <div className="grid grid-cols-2 gap-1 text-[6.5px]">
                <div className="p-1 bg-[#020617] rounded border border-white/5 text-slate-500">Selected Product Size</div>
                <div className="p-1 bg-purple-950 text-purple-300 font-bold border border-purple-800 rounded">Store Pickup Reserve ✔</div>
              </div>
            </div>
          )
        },
        {
          title: "Luxury collections display catalog",
          description: "Clean styled grid showcasing active collections, product specifications, physical materials, and pricing labels.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200">
              <div className="flex justify-between items-center text-[8px] font-bold text-slate-300 print:text-slate-905">
                <span>The Autumn Standard Capsule</span>
                <span className="text-purple-400">View Catalog</span>
              </div>
              <div className="grid grid-cols-3 gap-1 shadow-sm">
                {[
                  { title: "Linen Blazer", cost: "$280" },
                  { title: "Sartorial Pants", cost: "$190" },
                  { title: "Atelier Smock", cost: "$165" }
                ].map((capsule, capsuleIdx) => (
                  <div key={capsuleIdx} className="p-1 bg-white/5 rounded border border-white/5 text-center print:bg-white print:border-slate-200">
                    <div className="font-bold text-[6.5px] text-white print:text-slate-900">{capsule.title}</div>
                    <span className="text-[6px] text-purple-300 font-mono">{capsule.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        },
        {
          title: "Creative organic lifestyle layout briefs",
          description: "Visual spotlights highlighting raw manufacturing processes, brand values, fabric stories, and workshop bios.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <span className="text-[8px] font-bold text-white print:text-slate-905 block text-center">✿ Our Craft Commitment</span>
              <p className="text-[6.5px] text-slate-400 leading-normal text-center font-light">Every linen fiber is loomed in small batches inside local high street workshops, prioritizing sustainable lifecycles.</p>
            </div>
          )
        },
        {
          title: "Rapid interactive mobile shop routing",
          description: "Extremely speed-optimized styling built on pure HTML structure, loading flawlessly in boutique malls with poor cellular service.",
          visual: (
            <div className="mt-3 p-3 bg-[#020617] rounded-xl border border-white/5 space-y-1 font-sans print:bg-slate-50 print:border-slate-200 text-left">
              <span className="text-[7.5px] text-slate-400 block font-medium">Boutique Core-Vitals Render Speed</span>
              <div className="h-1 bg-purple-500 rounded-full w-full mt-1.5" />
              <div className="text-[6px] text-slate-550 mt-1">99.8% Speed score allows shoppers to navigate products instantly.</div>
            </div>
          )
        },
        {
          title: "High-Visibility local search engine schema",
          description: "Tailored indexing targeting boutique queries: e.g. 'Luxury bridal dressmaker' or organic linen apparel shops.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1 font-sans text-left print:bg-slate-50 print:border-slate-200">
              <span className="text-[8px] text-blue-400 font-semibold hover:underline block leading-tight">Rosewood Atelier Boutique | Linen Apparel Surrey Hills</span>
              <span className="text-[6.5px] text-emerald-450 block font-mono">https://rosewoodatelier.com/collections-lookbook</span>
              <p className="text-[7px] text-slate-500 leading-snug">Handmade luxury linen clothing, bridal alterations, and premium bespoke design catalogs.</p>
            </div>
          )
        },
        {
          title: "Bespoke Instagram organic showcase grid",
          description: "Clean styled lookbook blocks modeled on live Instagram aesthetic tiles to keep visual assets current.",
          visual: (
            <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200">
              <span className="text-[8px] font-bold text-purple-400 block text-center">Instagram Spotlight Lookbook</span>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map(tile => (
                  <div key={tile} className="h-6 bg-white/5 rounded border border-white/5 flex items-center justify-center text-[5.5px] text-purple-300">✿</div>
                ))}
              </div>
            </div>
          )
        },
        {
          title: "Boutique collection update handbook",
          description: "Simple operational PDF detailing drag-and-drop steps for updating lookbook images or tweaking pricing guides.",
          visual: (
            <div className="mt-3 p-3 bg-[#020617] rounded-xl border border-white/5 flex gap-2.5 items-center font-sans print:bg-slate-50 print:border-slate-200 text-left">
              <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold shrink-0">
                PDF
              </div>
              <div>
                <div className="text-[8px] font-bold text-white print:text-slate-905">Boutique_Collections_Update_Manual.pdf</div>
                <p className="text-[6.5px] text-slate-500 font-light">Simple steps mapping catalog file editing sequences.</p>
              </div>
            </div>
          )
        }
      ]
    }
  ];

  // Logic to identify matching start template from windows paths
  const detectInitialProfile = (): string => {
    const path = window.location.pathname;
    const matched = profiles.find(p => p.paths.includes(path) || p.mainPath === path);
    return matched ? matched.id : "corporate";
  };

  const [activeProfileId, setActiveProfileId] = useState<string>(detectInitialProfile());
  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  // Save last viewed proposal to allow users to go back easily
  useEffect(() => {
    try {
      localStorage.setItem('clarity_recent_quote_path', window.location.pathname + window.location.search);
      const isBus = window.location.pathname.includes("business") || window.location.pathname.includes("static-business");
      const foundProfile = profiles.find(p => p.id === activeProfileId);
      const name = activeProfileId === "corporate" && isBus ? "Business Setup Proposal" : (foundProfile?.name ? `${foundProfile.name} Proposal` : "Custom Proposal Package");
      localStorage.setItem('clarity_recent_quote_name', name);
    } catch (e) {}
  }, [currentPath, activeProfileId, activeProfile]);

  // When switcher is triggered, update the configuration lists, names and path URLs
  const handleProfileSwitch = (profileId: string) => {
    setActiveProfileId(profileId);
    const targetProfile = profiles.find(p => p.id === profileId);
    if (targetProfile) {
      // Modify URL search path seamlessly without full reloading
      window.history.pushState({}, "", targetProfile.mainPath);
      window.dispatchEvent(new PopStateEvent("popstate"));
      
      // Seed default placeholders for name/business if client hasn't input custom ones
      if (!clientName.trim()) {
        // Clear or seed placeholders dynamically inside text renders
      }
    }
  };

  // Premium addons definition
  const PREMIUM_ADDONS = [
    { id: "cms", name: "Client CMS Operator Board", price: 450, desc: "Enables non-developers to edit blogs, images, portfolios, or testimonials securely." },
    { id: "seo", name: "Comprehensive Local SEO Tuning", price: 350, desc: "Includes advanced schema injection, XML sitemap verification, and Google indexing setup." },
    { id: "branding", name: "Bespoke Corporate Branding Pack", price: 250, desc: "Includes 3 custom branding vectors, matched typography definitions, and web vector formats." },
    { id: "express", name: "Express 7-Day Sprint Dispatch", price: 400, desc: "Collapses visual staging sprint cycles into a priority, fast-build dispatch." },
  ];

  // Helper to calculate special request surcharge dynamically based on contents
  const calculateSpecialRequestSurcharge = (reqText: string): { cost: number; items: string[] } => {
    if (!reqText || reqText.trim().length < 4) return { cost: 0, items: [] };
    const text = reqText.toLowerCase();
    let cost = 0;
    const items: string[] = [];

    // Base custom assessment & layout engineering
    cost += 200;
    items.push("Custom Scope Assessment & Visual Interface Mockups (A$200)");

    // Bilingual/Multilingual
    if (text.includes("multi") || text.includes("language") || text.includes("bilingual") || text.includes("translate") || text.includes("german") || text.includes("chinese") || text.includes("spanish")) {
      cost += 250;
      items.push("Bilingual Multi-route Sub-directory Layout (A$250)");
    }
    // CRM or API Integration (except stripe/billing/payment)
    if ((text.includes("crm") || text.includes("salesforce") || text.includes("hubspot") || text.includes("api") || text.includes("webhook") || text.includes("zapier")) && !text.includes("payment") && !text.includes("stripe")) {
      cost += 300;
      items.push("Secure Third-party CRM/Webhook Automation Route (A$300)");
    }
    // Portals or custom databases
    if (text.includes("portal") || text.includes("member") || text.includes("login") || text.includes("database") || text.includes("interactive map")) {
      cost += 355;
      items.push("Complex Client Datastores & Accounts Routing Tier (A$355)");
    }
    // Max cap the surcharge to avoid crazy numbers
    cost = Math.min(cost, 800);
    return { cost, items };
  };

  // Find associated package ID from lead data or active industry profile alignment
  const getPackageId = () => {
    if (leadData?.selected_package) {
      return leadData.selected_package;
    }
    const aligned = activeProfile.alignedPackageName;
    if (aligned === "Landing Page") return "landing_page";
    if (aligned === "Small Business Website") return "small_business_website";
    return "growth_website_client_workflow";
  };

  const pkgId = getPackageId();
  const pkgConfig = appPackages[pkgId] || appPackages.small_business_website;

  // Dynamic Lead Math
  const hasLeadData = !!leadData;
  const discountPercentage = leadData?.discount_percentage || 0;
  const promoCode = leadData?.promo_code || "";

  const dynamicPages = leadData?.selected_pages || ['Home', 'About Us', 'Services', 'Contact'];
  const dynamicFeatures = leadData?.selected_features || ['Secure contact form', 'Mobile-first design', 'Google Analytics setup'];
  const dynamicBasePrice = pkgConfig.basePrice;
  const extraPagesPrice = Math.max(0, dynamicPages.length - pkgConfig.includedPages) * 350;
  const extraFeaturesPrice = 0; // Standard features are fully included in the package base price
  const addonsSum = PREMIUM_ADDONS.filter(addon => selectedAddons.includes(addon.id)).reduce((sum, addon) => sum + addon.price, 0);

  // Dynamic special request pricing mapping
  const specialRequestData = calculateSpecialRequestSurcharge(specialRequest);
  const originalSpecialRequestPrice = specialRequestData.cost;

  // Original, undiscounted list pricing before promo code
  const originalBasePrice = dynamicBasePrice;
  const originalExtraPagesPrice = extraPagesPrice;
  const originalExtraFeaturesPrice = extraFeaturesPrice;
  const originalAddonsSum = addonsSum;
  const originalSubtotal = originalBasePrice + originalExtraPagesPrice + originalExtraFeaturesPrice + originalAddonsSum + originalSpecialRequestPrice;

  // Promo Discount Factor application
  const promoDiscountFactor = discountPercentage > 0 ? (1 - discountPercentage / 100) : 1;

  // Active / Promo Discounted price lines
  const activeBasePrice = Math.round(originalBasePrice * promoDiscountFactor);
  const activeExtraPagesPrice = Math.round(originalExtraPagesPrice * promoDiscountFactor);
  const activeExtraFeaturesPrice = Math.round(originalExtraFeaturesPrice * promoDiscountFactor);
  const activeAddonsSum = Math.round(originalAddonsSum * promoDiscountFactor);
  const activeSpecialRequestPrice = Math.round(originalSpecialRequestPrice * promoDiscountFactor);

  const packageBasePrice = hasLeadData 
    ? (activeBasePrice + activeExtraPagesPrice + activeExtraFeaturesPrice + activeAddonsSum + activeSpecialRequestPrice)
    : activeProfile.finalPrice;

  const domainAddonPrice = includeDomain ? 40 : 0;
  let maintenanceAddonPrice = 0;
  if (includeMaintenance === "basic") maintenanceAddonPrice = 150;
  if (includeMaintenance === "managed") maintenanceAddonPrice = 300;

  const totalOneOffCost = packageBasePrice;
  const totalYearlyRecurring = domainAddonPrice;
  const totalMonthlyRecurring = maintenanceAddonPrice;

  // Payments phases dynamic math modelling
  const phase1Price = Math.round(packageBasePrice * 0.5);
  const phase2Price = Math.round(packageBasePrice * 0.3);
  const phase3Price = packageBasePrice - phase1Price - phase2Price;

  // Normal price comparison calculation
  const normalBasePrice = hasLeadData ? Math.round(packageBasePrice * 1.5) : activeProfile.normalPrice;
  const discountTotal = hasLeadData ? (normalBasePrice - packageBasePrice) : activeProfile.discountPrice;

  const handleToggleAddon = async (addonId: string) => {
    const isCurrentlyAdded = selectedAddons.includes(addonId);
    const updated = isCurrentlyAdded 
      ? selectedAddons.filter(id => id !== addonId)
      : [...selectedAddons, addonId];
    
    setSelectedAddons(updated);
    
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('leadId') || urlParams.get('intakeId') || urlParams.get('id');

    const pkgId = getPackageId();
    const pkgConfig = appPackages[pkgId] || appPackages.small_business_website;

    const basePrice = pkgConfig.basePrice;
    const extraPagesCount = Math.max(0, dynamicPages.length - pkgConfig.includedPages);
    const addonPricesSum = PREMIUM_ADDONS
      .filter(addon => updated.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);

    const computedTotal = basePrice + (extraPagesCount * 350) + addonPricesSum;
    const finalComputed = Math.round(computedTotal * promoDiscountFactor);
    const computedTotalStr = `A$${finalComputed}`;

    // Always update local fallback for extreme resilience
    if (leadId) {
      updateLocalFallback(leadId, {
        selected_addons: updated,
        budget_range: computedTotalStr,
        estimated_quote_range: computedTotalStr,
        deposit_amount: `A$${Math.round(finalComputed * 0.5)}`
      });
    }

    // Save to firebase
    if (isFirebaseConfigured && leadId && leadData) {
      try {
        const ref = doc(db, leadData.collection, leadId);
        await withTimeout(updateDoc(ref, {
          selected_addons: updated,
          budget_range: computedTotalStr,
          estimated_quote_range: computedTotalStr,
          deposit_amount: `A$${Math.round(finalComputed * 0.5)}`, // Automatically update deposit amount too!
          updated_at: serverTimestamp()
        }), 3000);
        
        setLeadData((prev: any) => ({
          ...prev,
          selected_addons: updated,
          budget_range: computedTotalStr,
          estimated_quote_range: computedTotalStr,
          deposit_amount: `A$${Math.round(finalComputed * 0.5)}`
        }));
      } catch (err) {
        console.warn("Could not save addon selection: ", err);
      }
    } else {
      setLeadData((prev: any) => ({
        ...prev,
        selected_addons: updated,
        budget_range: computedTotalStr,
        estimated_quote_range: computedTotalStr,
        deposit_amount: `A$${Math.round(finalComputed * 0.5)}`
      }));
    }
  };

  const handleSaveSpecialRequest = async (currentRequestText: string) => {
    setIsSavingSpecialRequest(true);
    setSpecialRequestSaved(false);
    
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('leadId') || urlParams.get('intakeId') || urlParams.get('id');

    // Recalculate dynamic budget-range
    const pkgId = getPackageId();
    const pkgConfig = appPackages[pkgId] || appPackages.small_business_website;

    const basePrice = pkgConfig.basePrice;
    const extraPagesCount = Math.max(0, dynamicPages.length - pkgConfig.includedPages);
    const addonPricesSum = PREMIUM_ADDONS
      .filter(addon => selectedAddons.includes(addon.id))
      .reduce((sum, addon) => sum + addon.price, 0);

    const specialReqCost = calculateSpecialRequestSurcharge(currentRequestText).cost;
    const computedTotal = basePrice + (extraPagesCount * 350) + addonPricesSum + specialReqCost;
    
    // Apply promo factors for database string persistence
    const finalComputed = Math.round(computedTotal * promoDiscountFactor);
    const computedTotalStr = `A$${finalComputed}`;

    // Update local variables
    if (leadId) {
      updateLocalFallback(leadId, {
        special_request: currentRequestText,
        budget_range: computedTotalStr,
        estimated_quote_range: computedTotalStr,
        deposit_amount: `A$${Math.round(finalComputed * 0.5)}`
      });
    }

    if (isFirebaseConfigured && leadId && leadData) {
      try {
        const ref = doc(db, leadData.collection, leadId);
        await withTimeout(updateDoc(ref, {
          special_request: currentRequestText,
          budget_range: computedTotalStr,
          estimated_quote_range: computedTotalStr,
          deposit_amount: `A$${Math.round(finalComputed * 0.5)}`,
          updated_at: serverTimestamp()
        }), 3000);
        
        setLeadData((prev: any) => ({
          ...prev,
          special_request: currentRequestText,
          budget_range: computedTotalStr,
          estimated_quote_range: computedTotalStr,
          deposit_amount: `A$${Math.round(finalComputed * 0.5)}`
        }));
        
        setSpecialRequest(currentRequestText);
        setSpecialRequestSaved(true);
        setTimeout(() => setSpecialRequestSaved(false), 2500);
      } catch (err) {
        console.warn("Could not save special request: ", err);
      }
    } else {
      setLeadData((prev: any) => ({
        ...prev,
        special_request: currentRequestText,
        budget_range: computedTotalStr,
        estimated_quote_range: computedTotalStr,
        deposit_amount: `A$${Math.round(finalComputed * 0.5)}`
      }));
      setSpecialRequest(currentRequestText);
      setSpecialRequestSaved(true);
      setTimeout(() => setSpecialRequestSaved(false), 2500);
    }
    setIsSavingSpecialRequest(false);
  };

  return (
    <div className="min-h-screen text-slate-100 bg-[#020617] pb-16 print:bg-white print:text-slate-900 font-sans antialiased relative overflow-hidden">
      
      {/* Dynamic Background Glow Effects - Hidden in print */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-cyan-950/15 via-blue-950/5 to-transparent pointer-events-none z-0 print:hidden" />
      <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none print:hidden" />
      <div className="absolute bottom-[20%] left-[-15%] w-[40%] h-[40%] rounded-full bg-blue-950/20 blur-[180px] pointer-events-none z-0 print:hidden" />

      {/* Primary Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 print:pt-0">
        
        {/* Navigation / Header Actions Panel - Hidden in print */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md print:hidden">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleBackToWorkspace();
            }}
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Estimator Dashboard
          </a>
          
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-medium text-cyan-400 bg-cyan-950/30 px-2.5 py-1 rounded-full border border-cyan-800/20">
              ● Static SOW Generator (AUD)
            </span>
            <button
               onClick={handlePrint}
               className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-cyan-400/10 transition-all duration-200"
            >
              <Printer className="w-4 h-4" />
              Save Quote as PDF
            </button>
          </div>
        </div>

        {/* Dynamic Multi-industry Switcher - Hidden in print */}
        {!hasLeadData && (
          <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-3.5 mb-6 text-left print:hidden space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 justify-start">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Interactive Pitch Studio: Live Customize Client Spec
              </span>
              <span className="text-[9px] font-mono font-bold text-cyan-500 bg-cyan-950/40 px-2 py-0.5 rounded-sm border border-cyan-800/10">
                PATH DYNAMIC
              </span>
            </div>
            
            {/* Mobile responsive selector slider */}
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {profiles.map((profile) => {
                const ProfileIcon = profile.icon;
                const isActive = activeProfileId === profile.id;
                const dispName = profile.id === "corporate" && (currentPath.includes("business") || currentPath.includes("static-business")) ? "Business Setup" : profile.name;
                return (
                  <button
                    key={profile.id}
                    onClick={() => handleProfileSwitch(profile.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-[11px] font-semibold rounded-xl whitespace-nowrap cursor-pointer transition-all duration-150 ${
                      isActive 
                        ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10" 
                        : "bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-400 border border-white/5"
                    }`}
                  >
                    <ProfileIcon className="w-3.5 h-3.5" />
                    {dispName}
                    <span className={`text-[9px] font-bold font-mono ml-0.5 px-1.5 py-0.15 rounded-sm ${isActive ? "bg-slate-950/20 text-slate-950" : "bg-white/5 text-slate-500"}`}>
                      AUD ${profile.finalPrice}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Live Demo Showcase Banner Button - Hidden in print */}
        {!hasLeadData && (
          <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 rounded-2xl p-4 mb-6 text-left print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="space-y-1">
              <span className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Live Demonstration Interactive Website Model
              </span>
              <h4 className="text-white text-sm font-bold tracking-tight">
                See what Clarity Space builds for the {activeProfile.id === "corporate" && (currentPath.includes("business") || currentPath.includes("static-business")) ? "Business Setup" : activeProfile.name} Tier!
              </h4>
              <p className="text-slate-400 text-[11px] font-light max-w-lg leading-relaxed">
                We programmed a high-fidelity fully responsive preview containing interactive ROI sliders, dynamic menus, checkout catalogs, and swim class reservation rosters.
              </p>
            </div>
            <button
              onClick={() => {
                window.history.pushState({}, "", `${window.location.pathname}/demo`);
                window.dispatchEvent(new PopStateEvent("popstate"));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center justify-center gap-1.5 shrink-0 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-cyan-400/20 active:scale-95 transition-all self-start sm:self-center"
            >
              <span>Launch Live Preview Site</span>
              <ExternalLink className="w-3.5 h-3.5 font-bold" />
            </button>
          </div>
        )}

        {/* Iframe Warning Notification - Triggered only inside Sandbox Frame */}
        {isIframe && (
          <div className="bg-amber-500/15 border border-amber-500/25 text-amber-200 rounded-2xl p-5 mb-5 text-left animate-fadeIn print:hidden flex gap-3">
            <CircleHelp className="w-5 h-5 text-amber-455 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Browser workspace restriction</h4>
              <p className="text-[11px] text-amber-450/90 leading-relaxed">
                Browsers prevent saving PDFs from inside sandbox frames. To print or save this quote as PDF, click the <span className="font-semibold text-white bg-slate-950 border border-white/10 px-2 py-0.5 rounded">↗ Open in new tab</span> button at the top-right of your preview header panel first, then click Save on that direct view!
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Warning Notification - Hidden in print */}
        {!hasLeadData && (
          <div className="bg-gradient-to-r from-cyan-950/30 via-slate-950/40 to-cyan-950/30 border border-cyan-800/15 rounded-2xl p-5 mb-8 print:hidden flex gap-3.5 text-left">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-200">Express Static SOW Proposal Generated</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Fill out client coordinates below. Changing the dropdown or sliders automatically updates pricing math, milestone schedules, and live wireframes. Saves down cleanly to industry A4 standards upon print, completely omitting dashboard elements.
              </p>
            </div>
          </div>
        )}

        {/* MAIN PRINTABLE WORK SHEET */}
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative print:bg-white print:border-0 print:shadow-none print:p-0">
          
          {/* Header decorative strip. Hidden in print */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 print:hidden" />

          {/* Letterhead Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/5 pb-8 print:border-slate-200">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1.5px] shrink-0">
                  <div className="h-full w-full bg-[#020617] rounded-[7px] flex items-center justify-center print:bg-white">
                    <span className="font-display font-bold text-base bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent print:text-cyan-755">C</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <h1 className="font-display font-bold text-lg sm:text-xl tracking-tight text-white print:text-slate-900 leading-none">
                    Clarity Space
                  </h1>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-500 font-mono font-medium -mt-1 scale-90 origin-left print:text-slate-600">
                    Digital Growth
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-450 print:text-slate-500 font-light max-w-xs leading-relaxed">
                Strategy-obsessed design and high-fidelity front-end engineering.
              </p>
            </div>

            <div className="mt-6 md:mt-0 text-left md:text-right space-y-1.5 md:space-y-1 font-mono text-xs text-slate-300 print:text-slate-600">
              <div className="text-slate-100 print:text-slate-800 font-bold text-sm">PROPOSAL INVOICE</div>
              <div><span className="text-slate-500 font-medium">Quote ID:</span> <span className="font-semibold text-cyan-405 print:text-slate-800">{quoteNumber}</span></div>
              <div><span className="text-slate-500 font-medium">Prepared On:</span> {quoteDate}</div>
              <div><span className="text-slate-500 font-medium">Authority:</span> Clarity Space Pty Ltd</div>
              <div><span className="text-slate-500 font-medium">Contact:</span> accounts@clarityspace.com.au</div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="my-8 text-left">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold block">
              Static Web Solutions Spec Sheet
            </span>
            <h2 className="text-3xl font-bold font-display tracking-tight text-white print:text-slate-900 mt-1">
              {activeProfile.quoteTitle}
            </h2>
            <div className="h-0.5 w-16 bg-cyan-400 mt-3" />
          </div>

          {/* Interactive / Static Recipient Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-6 rounded-2xl border border-white/5 mb-8 print:bg-slate-50 print:border-slate-200 print:text-slate-900">
            
            {/* Left side: Client input parameters */}
            <div className="space-y-4 text-left">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 print:text-slate-650 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400 print:text-slate-500" />
                Target Representative
              </div>

              <div className="space-y-3.5">
                {/* Client Name Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-semibold print:hidden flex items-center gap-1">
                    Client Full Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={`e.g. ${activeProfile.repPlaceholder}`}
                    className="w-full px-3.5 py-2 text-xs bg-[#020617] text-white rounded-lg border border-white/10 hover:border-white/20 focus:border-cyan-500 outline-none transition-all print:hidden"
                  />
                  {/* Print Version */}
                  <div className="hidden print:block text-xs">
                    <span className="text-slate-500 font-medium">Name: </span>
                    <span className="font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5">
                      {clientName || activeProfile.repPlaceholder}
                    </span>
                  </div>
                </div>

                {/* Business Name Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-semibold print:hidden flex items-center gap-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={`e.g. ${activeProfile.businessPlaceholder}`}
                    className="w-full px-3.5 py-2 text-xs bg-[#020617] text-white rounded-lg border border-white/10 hover:border-white/20 focus:border-cyan-500 outline-none transition-all print:hidden"
                  />
                  {/* Print Version */}
                  <div className="hidden print:block text-xs mt-1.5">
                    <span className="text-slate-500 font-medium">Company: </span>
                    <span className="font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5">
                      {businessName || activeProfile.businessPlaceholder}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Contact input parameters */}
            <div className="space-y-4 text-left">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 print:text-slate-650 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400 print:text-slate-500" />
                Contact Coordinates
              </div>

              <div className="space-y-3.5">
                {/* Email Address Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-semibold print:hidden flex items-center gap-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. hello@business.com"
                    className="w-full px-3.5 py-2 text-xs bg-[#020617] text-white rounded-lg border border-white/10 hover:border-white/20 focus:border-cyan-500 outline-none transition-all print:hidden"
                  />
                  {/* Print Version */}
                  <div className="hidden print:block text-xs">
                    <span className="text-slate-500 font-medium">Email: </span>
                    <span className="font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5">{email || "hello@business.com"}</span>
                  </div>
                </div>

                {/* Phone Number Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500 font-semibold print:hidden flex items-center gap-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +61 2 9123 4567"
                    className="w-full px-3.5 py-2 text-xs bg-[#020617] text-white rounded-lg border border-white/10 hover:border-white/20 focus:border-cyan-500 outline-none transition-all print:hidden"
                  />
                  {/* Print Version */}
                  <div className="hidden print:block text-xs mt-1.5">
                    <span className="text-slate-500 font-medium">Phone: </span>
                    <span className="font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5">{phone || "+61 2 9123 4567"}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ZERO-RISK GUARANTEE BANNER */}
          <div className="bg-gradient-to-r from-emerald-950/20 via-emerald-950/40 to-cyan-950/20 border border-emerald-500/20 rounded-2xl p-4.5 mb-8 text-left print:bg-emerald-50 print:border-emerald-250 print:text-slate-900 flex gap-4 items-start shadow-md">
            <div className="h-9 w-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20 print:bg-emerald-100 print:text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block print:text-emerald-800">
                🛡️ 100% Zero-Risk Draft-First Guarantee
              </span>
              <p className="text-[11.5px] text-slate-350 leading-relaxed font-light print:text-slate-800">
                You will receive and review a complete <span className="font-semibold text-white print:text-slate-900">High-Fidelity Visual Draft</span> of your bespoke layout before making any co-investment deposits. This allows you to explore the design, copy, and pages with zero obligations. You only pay your mobilization milestone invoice once you approve the draft to commence framework engineering!
              </p>
            </div>
          </div>

          {/* MAIN PACKAGE PRICE CARD */}
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-slate-950/50 border-2 border-cyan-500/20 rounded-3xl p-6 sm:p-8 mb-8 text-left shadow-xl print:bg-slate-50 print:border-slate-350 print:text-slate-900">
            {/* Discount Badge */}
            <div className="absolute right-6 top-6 print:right-4 print:top-4">
              <span className="px-3 py-1.5 text-[10px] sm:text-xs font-mono font-bold tracking-widest bg-cyan-400 text-slate-950 uppercase rounded-full shadow-inner print:border print:border-slate-350">
                {hasLeadData ? "TAILORED QUOTE" : "70% SAVINGS APPLIED"}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 print:text-slate-705 font-bold block">
                  {hasLeadData ? "Bespoke Custom Web Deliverable" : `Core Web Deliverable • Aligned with ${activeProfile.alignedPackageName} Package`}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white print:text-slate-900 font-display mt-1">
                  {hasLeadData 
                    ? `Bespoke Static Site Setup Proposal for ${businessName || "Your Business"}`
                    : `Express Static ${activeProfile.id === "corporate" && (currentPath.includes("business") || currentPath.includes("static-business")) ? "Business Setup" : activeProfile.name} Page`
                  }
                </h3>
              </div>

              {/* Grid accounting prices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5 print:border-slate-200">
                
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-slate-200">
                  <span className="text-[9px] font-mono uppercase text-slate-400 print:text-slate-500 block">Normal Price</span>
                  <span className="text-lg font-bold text-red-400 font-mono line-through print:text-red-650 font-semibold">
                    AUD ${normalBasePrice.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-slate-200">
                  <span className="text-[9px] font-mono uppercase text-slate-400 print:text-slate-500 block">Sponsor Co-Investment Discount</span>
                  <span className="text-lg font-bold text-emerald-450 font-mono print:text-emerald-700">
                    -AUD ${discountTotal.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 bg-cyan-950/50 rounded-xl border border-cyan-400/20 print:bg-white print:border-slate-350 shadow-inner">
                  <span className="text-[9px] font-mono uppercase text-cyan-400 print:text-slate-650 block font-bold">Client Final Price</span>
                  <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight print:text-slate-900 block mt-0.5">
                    AUD ${packageBasePrice.toLocaleString()}
                  </span>
                </div>

              </div>

              {hasLeadData ? (
                <div className="space-y-4 pt-1">
                  {/* Sitemap & Integrations Accordion Trigger */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition">
                    <button 
                      type="button"
                      onClick={() => setIsSitemapOpen(!isSitemapOpen)}
                      className="w-full flex items-center justify-between p-4 bg-slate-900/80 text-left cursor-pointer select-none focus:outline-none transition group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4.5 h-4.5 text-cyan-400" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                             📋 Included Project Site Map &amp; Features Plan
                          </h4>
                          <p className="text-[10px] text-slate-400 font-light mt-0.5 font-mono">
                            {dynamicPages.length} Custom Pages &amp; {dynamicFeatures.length} Core Features Included in Build (Click to Expand)
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-transform duration-250 ${isSitemapOpen ? "rotate-180 text-cyan-400" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isSitemapOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="border-t border-slate-800 bg-[#070b19]/45 p-4.5 space-y-4 overflow-hidden"
                        >
                          {/* Sitemap Deliverables */}
                          <div className="bg-slate-950/25 rounded-xl border border-white/5 p-4 space-y-3">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold block">
                              📋 Target Site Pages ({dynamicPages.length} Pages)
                            </span>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {dynamicPages.map((page: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-cyan-950/35 text-cyan-300 border border-cyan-800/20 rounded-lg text-[10px] font-mono">
                                  📄 {page}
                                </span>
                              ))}
                            </div>
                            {dynamicPages.length > 4 && (
                              <p className="text-[10px] text-cyan-400/90 font-light font-mono">
                                Includes {dynamicPages.length - 4} additional pages beyond standard template allowance: +AUD ${extraPagesPrice.toLocaleString()} (A$150 per page).
                              </p>
                            )}
                          </div>

                          {/* Feature Integrations */}
                          <div className="bg-slate-950/25 rounded-xl border border-white/5 p-4 space-y-3">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold block">
                              ⚡ Standard Functionality Integrations ({dynamicFeatures.length} Features)
                            </span>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-350 leading-relaxed font-light">
                              {dynamicFeatures.map((feature: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-450 shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            {dynamicFeatures.length > 3 && (
                              <p className="text-[10px] text-indigo-400/90 font-light font-mono">
                                Includes {dynamicFeatures.length - 3} custom standard features beyond normal allowance: +AUD ${extraFeaturesPrice.toLocaleString()} (A$200 per feature).
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Premium Addons Accordion Trigger */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition">
                    <button 
                      type="button"
                      onClick={() => setIsAddonsOpen(!isAddonsOpen)}
                      className="w-full flex items-center justify-between p-4 bg-slate-900/80 text-left cursor-pointer select-none focus:outline-none transition group"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-4.5 h-4.5 text-cyan-400" />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                             🚀 Customize Your Package (Expandable Premium Add-ons)
                          </h4>
                          <p className="text-[10px] text-slate-400 font-light mt-0.5 font-mono">
                            {selectedAddons.length} Optional Add-ons Chosen {selectedAddons.length > 0 && `(+AUD $${addonsSum.toLocaleString()})`} (Click to Expand)
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-transform duration-250 ${isAddonsOpen ? "rotate-180 text-cyan-400" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {isAddonsOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="border-t border-slate-800 bg-[#070b19]/45 p-4.5 space-y-3 overflow-hidden"
                        >
                          <h4 className="text-slate-350 text-[11px] font-semibold">
                            Add high-impact integrations. Toggles instantly save to your Firebase project workspace:
                          </h4>
                          
                          <div className="space-y-2.5">
                            {PREMIUM_ADDONS.map((addon) => {
                              const isChecked = selectedAddons.includes(addon.id);
                              const calculatedAddonPrice = Math.round(addon.price * promoDiscountFactor);
                              return (
                                <label 
                                  key={addon.id} 
                                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                                    isChecked 
                                      ? "bg-cyan-950/45 border-cyan-455 shadow-md shadow-cyan-950/50 text-white" 
                                      : "bg-slate-950/25 border-white/5 text-slate-400 hover:border-white/10 hover:bg-slate-950/40"
                                  }`}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleAddon(addon.id)}
                                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer accent-cyan-400"
                                  />
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className={`text-[12px] font-bold ${isChecked ? "text-cyan-300" : "text-slate-300"}`}>
                                        {addon.name}
                                      </span>
                                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                                        {discountPercentage > 0 && (
                                          <span className="line-through text-slate-500 text-[10px]">
                                            +AUD ${addon.price}
                                          </span>
                                        )}
                                        <span className="text-cyan-400">
                                          +AUD ${calculatedAddonPrice}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-[11.5px] text-slate-400 leading-normal font-light">
                                      {addon.desc}
                                    </p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Printable Premium Addons Table */}
                  {selectedAddons.length > 0 && (
                    <div className="hidden print:block border-t border-slate-200 pt-3 mt-4">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-slate-600 font-bold block">
                        Signed Premium Project Add-ons
                      </span>
                      <table className="w-full text-xs text-slate-800 mt-2 border-collapse">
                        <tbody>
                          {PREMIUM_ADDONS.filter(a => selectedAddons.includes(a.id)).map((addon) => {
                            const calculatedAddonPrice = Math.round(addon.price * promoDiscountFactor);
                            return (
                              <tr key={addon.id} className="border-b border-slate-100">
                                <td className="py-1.5 font-semibold">{addon.name}</td>
                                <td className="py-1.5 text-right font-mono font-bold">AUD ${calculatedAddonPrice}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              ) : (
                <>
                  <p className="text-[11px] text-slate-400 print:text-slate-500 font-light leading-relaxed">
                    {activeProfile.description} Deployed directly on edge Content Delivery Networks (Netlify/Vercel) for rapid load times with **$0 monthly hosting costs** indefinitely.
                  </p>

                  <div className="bg-cyan-950/25 border border-cyan-500/10 p-4 rounded-2xl text-[11px] text-slate-300 font-light mt-4 leading-relaxed print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                    <span className="font-bold tracking-wider text-cyan-400 print:text-slate-700 block uppercase text-[9px] mb-1 font-mono">💡 Context Behind the 70% Launch Offer</span>
                    This discount is part of our <span className="text-white font-medium print:text-slate-900">Portfolio Co-Investment Program</span>. Because we are expanding our presence in your sector, we are temporarily subsidizing our engineering hours in exchange for displaying the completed site in our public showcase and receiving an honest client testimonial upon successful launch. It operates on a fixed-scope basis with absolutely no hidden fees.
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SOW & LAYOUT SCOPE */}
          <div className="space-y-6 mb-10 text-left page-break-inside-avoid">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition">
              <button 
                type="button"
                onClick={() => setIsScopeOpen(!isScopeOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-900/80 text-left cursor-pointer select-none focus:outline-none transition group print:hidden"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4.5 h-4.5 text-cyan-400" />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                       📋 Comprehensive Included Scope &amp; Layout Previews
                    </h3>
                    <p className="text-[10px] text-slate-400 font-light mt-0.5 font-mono">
                      Interact with custom responsive layout blocks and technical specifications (Click to Expand)
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-transform duration-250 ${isScopeOpen ? "rotate-180 text-cyan-400" : ""}`} />
              </button>

              {/* Always visible header for Printing only */}
              <div className="hidden print:block border-b border-slate-200 pb-3">
                <h3 className="text-sm font-mono tracking-wider font-bold uppercase text-slate-700 flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-slate-500" />
                  Comprehensive Included Scope &amp; Layout Previews
                </h3>
              </div>

              <AnimatePresence>
                {isScopeOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="border-t border-slate-800 bg-[#070b19]/45 p-4.5 overflow-hidden print:hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      {activeProfile.scopeItems.map((item, idx) => (
                        <div key={idx} className="flex flex-col justify-between p-4 bg-slate-950/20 rounded-2xl border border-white/5 relative page-break-inside-avoid">
                          <div className="flex gap-2.5 items-start">
                            <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="font-semibold text-slate-200 block text-xs">{item.title}</span>
                              <span className="text-[11px] text-slate-400 block leading-normal font-light">{item.description}</span>
                            </div>
                          </div>
                          
                          {/* Loaded layout mock block */}
                          {item.visual}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Print-only layout container */}
              <div className="hidden print:grid grid-cols-2 gap-4 text-xs mt-4">
                {activeProfile.scopeItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col justify-between p-2 bg-white border border-slate-200 rounded-lg">
                    <div className="flex gap-2.5 items-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-900 block text-xs">{item.title}</span>
                        <span className="text-[11px] text-slate-500 block leading-normal font-light">{item.description}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* RECURRING ADD-ONS & OPTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:block print:space-y-8">
            
            {/* Custom Domain Registry Panel */}
            <div className="bg-slate-950/30 p-5 rounded-2xl border border-white/5 text-left print:bg-white print:border-0 print:p-0 print:border-b print:border-slate-200 print:pb-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400 print:text-slate-500" />
                  Custom Web URL Hosting (Optional)
                </h4>
                
                {/* Checkbox selector - Hidden in print */}
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs print:hidden">
                  <input
                    type="checkbox"
                    checked={includeDomain}
                    onChange={(e) => setIncludeDomain(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-slate-950 text-cyan-500 focus:ring-cyan-500/20 outline-none"
                  />
                  <span className="text-[11px] text-slate-300 font-semibold">Add to Proposal</span>
                </label>
              </div>

              <p className="text-[11px] text-slate-400 print:text-slate-500 leading-relaxed mb-4 font-light">
                Secure your exact local trademark handle (.com, .com.au or .net) registered directly under your corporate custodianship.
              </p>

              <div className="space-y-2 text-xs">
                <div className={`p-2.5 rounded-lg transition-all ${includeDomain ? "bg-cyan-950/20 border border-cyan-800/20 print:bg-slate-50" : "bg-white/5 opacity-60 print:opacity-100"}`}>
                  <div className="flex justify-between items-center font-semibold text-slate-200 print:text-slate-900">
                    <span className="flex items-center gap-1.5">
                      Premium Australian Domain Config
                      <span className="text-[9px] font-mono font-bold bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/20 print:bg-emerald-100 print:text-emerald-800">
                        Secured Handle
                      </span>
                    </span>
                    <div className="text-right">
                      <span className="font-mono text-cyan-400 print:text-slate-900 block font-bold">AUD $40 / year</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block leading-normal mt-0.5 font-light">Includes exact name matching, complete DNS lock, and privacy proxy filters preventing unwanted agency spam.</span>
                </div>
              </div>
            </div>

            {/* Optional Maintenance Panel */}
            <div className="bg-slate-950/30 p-5 rounded-2xl border border-white/5 text-left print:bg-white print:border-0 print:p-0">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 flex items-center gap-1.5">
                  <Layers3 className="w-4 h-4 text-cyan-400 print:text-slate-500" />
                  Ongoing Support Retainers (Optional)
                </h4>
                
                {/* Select dropdown - Hidden in print */}
                <select
                  value={includeMaintenance}
                  onChange={(e: any) => setIncludeMaintenance(e.target.value)}
                  className="text-[10px] bg-slate-900 text-slate-300 rounded-lg border border-white/10 px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer print:hidden"
                >
                  <option value="none">Exclude Extra Support</option>
                  <option value="basic">Standard Support Retainer</option>
                  <option value="managed">Fully Managed Support Partner</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-400 print:text-slate-500 leading-relaxed mb-4 font-light">
                All setups come with **30 Days of Complimentary Post-Launch Hypercare** by default. For ongoing developer availability, select an optional, contract-free retainer.
              </p>

              <div className="space-y-2 text-xs">
                <div className={`p-2.5 rounded-lg transition-all ${includeMaintenance === "basic" ? "bg-cyan-950/20 border border-cyan-800/20 print:bg-slate-50" : "bg-white/5 opacity-60 print:opacity-100"}`}>
                  <div className="flex justify-between items-center font-semibold text-slate-200 print:text-slate-900">
                    <span>Standard Support Retainer</span>
                    <span className="font-mono text-cyan-400 print:text-slate-800 font-bold">AUD $150 / mo</span>
                  </div>
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block leading-normal mt-0.5 font-light">Includes up to 1 hour of monthly text updates, image assets uploads, broken links auditing, and quarterly performance tuning.</span>
                </div>

                <div className={`p-2.5 rounded-lg transition-all ${includeMaintenance === "managed" ? "bg-cyan-950/20 border border-cyan-800/20 print:bg-slate-50" : "bg-white/5 opacity-60 print:opacity-100"}`}>
                  <div className="flex justify-between items-center font-semibold text-slate-200 print:text-slate-900">
                    <span>Fully Managed Support Partner</span>
                    <span className="font-mono text-cyan-400 print:text-slate-800 font-bold">AUD $300 / mo</span>
                  </div>
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block leading-normal mt-0.5 font-light">Includes up to 3 hours of advanced page layout tweaks, graphic integrations, content additions, and premium monthly organic SEO optimization.</span>
                </div>
              </div>
            </div>

          </div>

          {/* SPECIAL REQUESTS MANAGEMENT BOX */}
          <section id="special-requests-management" className="bg-gradient-to-r from-slate-900/40 to-cyan-950/20 border border-cyan-500/10 rounded-2xl p-5 mb-8 text-left print:hidden shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">💡 Have a Special Request or Custom Integration?</h4>
                <p className="text-xs text-slate-400 font-light leading-relaxed font-sans">
                  Enter your bespoke platform requirement (e.g., multilingual support, unique API webhooks, CRM synchronization, login portal or specific layout needs) below. The custom pricing and technical roadmap weights will adjust instantly!
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <textarea
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                placeholder="Describe your special requests... (e.g. 'I need multilingual support in English and French and need client leads pushed to HubSpot CRM')"
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-500 transition-all font-sans leading-relaxed"
              />
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <span className="text-[10px] text-slate-500 font-mono italic">
                  {specialRequest.trim().length > 3 ? "✓ Formulated dynamic scope adjustment detected." : "Type minimum 4 characters to trigger dynamic estimation."}
                </span>
                <button
                  type="button"
                  disabled={isSavingSpecialRequest}
                  onClick={() => handleSaveSpecialRequest(specialRequest)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-500/15 cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingSpecialRequest ? "Recalculating..." : specialRequestSaved ? "✓ Applied & Recalculated!" : "Apply Request & Recalculate Quote"}
                </button>
              </div>
            </div>
          </section>

          {/* DYNAMIC SUMMARIZED TOTAL RECIPES TABLE */}
          <div className="bg-slate-950/60 border border-[#1e293b]/50 rounded-2xl p-5 mb-8 text-left print:bg-slate-50 print:border-slate-300 print:text-slate-900">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 mb-3 flex items-center gap-1.5 border-b border-white/5 pb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Dynamic Budget Breakdown Summary
            </h4>

            {/* Expanded Itemized Breakdown Accordion */}
            {hasLeadData && (
              <div className="mb-4 border border-cyan-500/10 rounded-xl bg-slate-900/40 overflow-hidden pr-0 print:hidden shadow-lg">
                <button
                  type="button"
                  onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-900/60 text-left select-none outline-none group cursor-pointer"
                >
                  <span className="text-[11px] font-mono tracking-wider font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-cyan-400" />
                    {isBreakdownOpen ? "Hide Price Breakdown" : "View Itemized Price Breakdown (Partner Allocation Applied)"}
                  </span>
                  <div className="flex items-center gap-2">
                    {discountPercentage > 0 && (
                      <span className="text-[10px] bg-emerald-950/65 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/30 font-semibold font-mono">
                        Voucher Active via {promoCode}
                      </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform duration-200 ${isBreakdownOpen ? "rotate-180 text-cyan-400" : ""}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {isBreakdownOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-800/45 p-4 space-y-3 bg-[#080d1e]/40 overflow-hidden text-[11px]"
                    >
                      <table className="w-full text-left font-sans text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 text-slate-400 text-[10px] uppercase font-mono">
                            <th className="pb-2 font-medium">Itemized Deliverable Description</th>
                            <th className="pb-2 text-right font-medium">List Price</th>
                            {discountPercentage > 0 && <th className="pb-2 text-right font-medium text-emerald-400">Partner Adjustment</th>}
                            <th className="pb-2 text-right font-medium text-cyan-300">Your Co-Investment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300 font-sans">
                          {/* Base Static Build */}
                          <tr>
                            <td className="py-2.5">
                              <span className="font-semibold block text-slate-200">Core Static Digital Framework Base Build</span>
                              <span className="text-[10px] text-slate-400 block font-light mt-0.5">Includes high-performance architecture, styled modules, speed index validation.</span>
                            </td>
                            <td className="py-2.5 text-right font-mono text-slate-400">AUD ${originalBasePrice}</td>
                            {discountPercentage > 0 && (
                              <td className="py-2.5 text-right font-mono text-emerald-400">
                                -AUD ${originalBasePrice - activeBasePrice}
                              </td>
                            )}
                            <td className="py-2.5 text-right font-mono font-semibold text-white">AUD ${activeBasePrice}</td>
                          </tr>

                          {/* Extra Pages if any */}
                          {originalExtraPagesPrice > 0 && (
                            <tr>
                              <td className="py-2.5">
                                <span className="font-semibold block text-slate-200">Additional Pages Integration ({dynamicPages.length - 4} pages)</span>
                                <span className="text-[10px] text-slate-400 block font-light mt-0.5">Custom content layout templates configured beyond base 4-page scope (A$150/page).</span>
                              </td>
                              <td className="py-2.5 text-right font-mono text-slate-400">AUD ${originalExtraPagesPrice}</td>
                              {discountPercentage > 0 && (
                                <td className="py-2.5 text-right font-mono text-emerald-400">
                                  -AUD ${originalExtraPagesPrice - activeExtraPagesPrice}
                                </td>
                              )}
                              <td className="py-2.5 text-right font-mono font-semibold text-white">AUD ${activeExtraPagesPrice}</td>
                            </tr>
                          )}

                          {/* Extra Features if any */}
                          {originalExtraFeaturesPrice > 0 && (
                            <tr>
                              <td className="py-2.5">
                                <span className="font-semibold block text-slate-200">Custom Features Engineering ({dynamicFeatures.length - 3} features)</span>
                                <span className="text-[10px] text-slate-400 block font-light mt-0.5">Tailored dynamic integrations and custom APIs set beyond standard package (A$200/feature).</span>
                              </td>
                              <td className="py-2.5 text-right font-mono text-slate-400">AUD ${originalExtraFeaturesPrice}</td>
                              {discountPercentage > 0 && (
                                <td className="py-2.5 text-right font-mono text-emerald-400">
                                  -AUD ${originalExtraFeaturesPrice - activeExtraFeaturesPrice}
                                </td>
                              )}
                              <td className="py-2.5 text-right font-mono font-semibold text-white">AUD ${activeExtraFeaturesPrice}</td>
                            </tr>
                          )}

                          {/* Custom Special Requests if any */}
                          {originalSpecialRequestPrice > 0 && (
                            <tr>
                              <td className="py-2.5">
                                <span className="font-semibold block text-slate-200">Dynamic Custom Special Requests</span>
                                <span className="text-[10px] text-slate-400 block font-light mt-0.5 font-mono max-w-md truncate">"{specialRequest}"</span>
                                <div className="mt-1 text-[9px] text-cyan-400 space-y-0.5">
                                  {specialRequestData.items.map((line, lIdx) => (
                                    <span key={lIdx} className="block font-mono">• {line}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 text-right font-mono text-slate-400">AUD ${originalSpecialRequestPrice}</td>
                              {discountPercentage > 0 && (
                                <td className="py-2.5 text-right font-mono text-emerald-400">
                                  -AUD ${originalSpecialRequestPrice - activeSpecialRequestPrice}
                                </td>
                              )}
                              <td className="py-2.5 text-right font-mono font-semibold text-white">AUD ${activeSpecialRequestPrice}</td>
                            </tr>
                          )}

                          {/* Custom Premium Addons if any */}
                          {selectedAddons.length > 0 && PREMIUM_ADDONS.filter(a => selectedAddons.includes(a.id)).map((addon) => {
                            const originalAddonPrice = addon.price;
                            const activeAddonPrice = Math.round(addon.price * promoDiscountFactor);
                            return (
                              <tr key={addon.id}>
                                <td className="py-2.5">
                                  <span className="font-bold block text-slate-200">Add-on: {addon.name}</span>
                                  <span className="text-[10px] text-slate-400 block font-light mt-0.5">{addon.desc}</span>
                                </td>
                                <td className="py-2.5 text-right font-mono text-slate-400">AUD ${originalAddonPrice}</td>
                                {discountPercentage > 0 && (
                                  <td className="py-2.5 text-right font-mono text-emerald-400">
                                    -AUD ${originalAddonPrice - activeAddonPrice}
                                  </td>
                                )}
                                <td className="py-2.5 text-right font-mono font-semibold text-white">AUD ${activeAddonPrice}</td>
                              </tr>
                            );
                          })}

                          {/* Summary Totals Footer in breakdown */}
                          <tr className="border-t border-slate-700 font-bold bg-white/5">
                            <td className="p-3">Total Co-Investment Setup Total</td>
                            <td className="p-3 text-right font-mono text-slate-300">AUD ${originalSubtotal}</td>
                            {discountPercentage > 0 && (
                              <td className="p-3 text-right font-mono text-emerald-450">
                                -AUD ${originalSubtotal - packageBasePrice}
                              </td>
                            )}
                            <td className="p-3 text-right font-mono text-cyan-400">AUD ${packageBasePrice}</td>
                          </tr>
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-350">
                <span>Core Static Web Deliverable (One-off)</span>
                <span className="font-mono font-semibold text-white print:text-slate-905">AUD ${packageBasePrice.toLocaleString()}</span>
              </div>

              {includeDomain && (
                <div className="flex justify-between items-center text-slate-400">
                  <span>Custom URL Domain Handling (.com.au) (Yearly basis)</span>
                  <span className="font-mono font-semibold text-emerald-450 print:text-emerald-700">AUD $40 / yr</span>
                </div>
              )}

              {includeMaintenance !== "none" && (
                <div className="flex justify-between items-center text-slate-400">
                  <span>Elite Maintenance Retainer ({includeMaintenance === "basic" ? "Standard" : "Fully Managed"}) (Monthly basis)</span>
                  <span className="font-mono font-semibold text-emerald-450 print:text-emerald-700">
                    AUD ${includeMaintenance === "basic" ? "150" : "300"} / mo
                  </span>
                </div>
              )}

              <div className="pt-2.5 border-t border-dashed border-white/10 flex justify-between items-center font-bold text-sm text-cyan-405 print:text-slate-905">
                <span>Total Commitment Price Outline</span>
                <div className="space-y-0.5 text-right">
                  <span className="font-mono text-base block font-bold text-white print:text-slate-900">
                    AUD ${totalOneOffCost.toLocaleString()} (One-off Setup)
                  </span>
                  {(totalYearlyRecurring > 0 || totalMonthlyRecurring > 0) && (
                    <span className="text-[10px] font-mono font-medium text-slate-400 print:text-slate-500 block">
                      With {totalMonthlyRecurring > 0 && `AUD $${totalMonthlyRecurring}/mo`}{" "}
                      {totalMonthlyRecurring > 0 && totalYearlyRecurring > 0 && "and "}{" "}
                      {totalYearlyRecurring > 0 && `AUD $${totalYearlyRecurring}/yr`} recurring.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT DISBURSEMENT SCHEDULE */}
          <div className="p-6 bg-slate-950/20 border border-white/5 rounded-2xl text-left mb-8 print:bg-white print:border-slate-200 print:p-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 flex items-center gap-1.5 mb-4">
              <Calendar className="w-4.5 h-4.5 text-cyan-400 print:text-slate-550" />
              Tailored Payment Milestone Schedules
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl text-left print:bg-slate-50 print:border-slate-150">
                <span className="text-[10px] font-mono tracking-wider text-slate-450 print:text-slate-500 uppercase block">Phase 1: Mobilization</span>
                <span className="text-sm font-bold text-white print:text-slate-900 block mt-1">Deposit Due (After Draft Approval)</span>
                <span className="text-lg font-mono font-extrabold text-cyan-400 print:text-slate-800 block mt-1">AUD ${phase1Price.toLocaleString()}</span>
                <span className="text-[10px] text-slate-450 print:text-slate-500 block mt-1 leading-normal font-light">Invoiced after the initial design draft is approved, to commence full build and framework initialization.</span>
              </div>

              <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl text-left print:bg-slate-50 print:border-slate-150">
                <span className="text-[10px] font-mono tracking-wider text-slate-450 print:text-slate-500 uppercase block">Phase 2: Approval</span>
                <span className="text-sm font-bold text-white print:text-slate-900 block mt-1">40% Post-Development</span>
                <span className="text-lg font-mono font-extrabold text-cyan-400 print:text-slate-800 block mt-1">AUD ${phase2Price.toLocaleString()}</span>
                <span className="text-[10px] text-slate-450 print:text-slate-500 block mt-1 leading-normal font-light">Invoiced once custom CSS layouts, content assets, visual preview links and responsive mobile tests pass review.</span>
              </div>

              <div className="p-3.5 bg-[#020617]/90 border border-cyan-950 rounded-xl text-left print:bg-slate-50 print:border-slate-150">
                <span className="text-[10px] font-mono tracking-wider text-cyan-450 print:text-slate-650 uppercase font-semibold block">Phase 3: Launch Handover</span>
                <span className="text-sm font-bold text-white print:text-slate-900 block mt-1">10% Final Launch Balance</span>
                <span className="text-lg font-mono font-extrabold text-cyan-400 print:text-slate-800 block mt-1">AUD ${phase3Price.toLocaleString()}</span>
                <span className="text-[10px] text-slate-450 print:text-slate-500 block mt-1 leading-normal font-light">Invoiced immediately following global CDN network publication, search indexing activation and staff handbook handover.</span>
              </div>

            </div>
          </div>

          {/* MINIMUM EXTERNAL PROVIDER ACCOUNTS */}
          <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 mb-8 text-left print:bg-white print:border-slate-200 print:p-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-350 print:text-slate-800 flex items-center gap-1.5 mb-3">
              <ExternalLink className="w-4 h-4 text-cyan-400 print:text-slate-550" />
              Minimum Recommended Provider Accounts
            </h4>

            <p className="text-[11px] text-slate-400 print:text-slate-500 leading-normal mb-4 font-light">
              To guarantee absolute custody of your digital brand assets, Clarity Space deploys compiled code direkt down onto web directories secured under your personal account. Keeps you completely protected from vendor lock-ins.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              {[
                { title: "CDN Uptime Hosting", cost: "AUD $0 - $15 / month", desc: "For typical localized brand traffic levels, global CDN edge points (Vercel/Netlify) can host compiled files entirely for free." },
                { title: "Domain Handling", cost: "AUD $25 - $45 / year", desc: "Your primary web handle registered under direct corporate billing coordinates." },
                { title: "Professional Google Emails", cost: "AUD $8 - $12 / user / month", desc: "Corporate workspace suite environments handled cleanly inside secure Microsoft or Google clouds." }
              ].map((serv, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-slate-155 relative">
                  <div className="font-semibold text-slate-200 print:text-slate-900 pr-1">{serv.title}</div>
                  <div className="font-mono text-[11px] text-cyan-400 print:text-slate-700 font-bold mt-1">{serv.cost}</div>
                  <div className="text-[10px] text-slate-450 print:text-slate-500 mt-1 leading-normal font-light">{serv.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SIGNATURE SECTION FOR CLIENT AND AGENCY */}
          <div className="mt-12 pt-8 border-t border-white/5 print:border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-12">
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-550 block">Lead Creative Director Authorization</span>
              <span className="font-display italic text-lg text-cyan-400 print:text-slate-705 block mt-1 tracking-wider select-none">
                Clarity Space Design Labs
              </span>
              <div className="h-px bg-white/10 w-44 mt-6 print:bg-slate-300" />
              <span className="text-[9px] font-mono text-slate-455 mt-2 block">Clarity Space Pty Ltd Representative</span>
            </div>

            <div>
              <span className="text-[9px] font-mono uppercase text-slate-555 block">Accepted &amp; Authorized By Client</span>
              <span className="text-sm text-slate-405 print:text-slate-500 mt-3 block select-none">
                {businessName.trim() ? businessName : (activeProfile.businessPlaceholder)}
              </span>
              <div className="h-px bg-white/10 w-44 mt-6 print:bg-slate-300" />
              <span className="text-[9px] font-mono text-slate-450 mt-2 block flex items-baseline gap-1">
                Representative Signature: <span className="text-[10px] text-slate-300 print:text-slate-800 font-semibold">{clientName || activeProfile.repPlaceholder}</span>
              </span>
            </div>
          </div>
          
          {/* DIGITAL INTAKE NEXT STEP / PROPOSAL APPROVAL */}
          <div className="print:hidden bg-gradient-to-br from-slate-900 via-[#0b1329] to-[#020617] border border-cyan-850/30 rounded-2xl p-8 mb-20 relative overflow-hidden">
            {/* Ambient subtle colored glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />
            
            {showQuestionForm ? (
              <div className="relative z-10 text-left max-w-xl mx-auto space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                  Have a question about this proposal?
                </h3>
                <p className="text-xs text-slate-400">
                  Submit your question here, and I'll review and get back to you directly with answers, alternative suggestions, or clarified scope.
                </p>
                {questionSubmitted ? (
                  <div className="p-4 bg-cyan-950/40 border border-cyan-500/20 rounded-xl text-cyan-300 text-sm">
                    ✓ Your question has been sent! I'll review it and get in touch with you at <span className="font-semibold text-white">{email || "your email address"}</span> shortly.
                    <button 
                      onClick={() => { setShowQuestionForm(false); setQuestionSubmitted(false); setClientQuestion(""); }} 
                      className="block text-xs mt-3 text-cyan-400 hover:underline font-semibold"
                    >
                      Back to Approval
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Ensure they've filled out contact info */}
                    {(!clientName || !email) && (
                      <div className="grid grid-cols-2 gap-3 pb-2">
                        <div>
                          <label className="text-[10px] font-mono text-slate-500 uppercase">Your Name</label>
                          <input 
                            type="text" 
                            value={clientName} 
                            onChange={(e) => setClientName(e.target.value)} 
                            placeholder="e.g. John Doe"
                            className="w-full px-3 py-2 text-xs bg-slate-950 text-white rounded-lg border border-white/10 hover:border-white/20 focus:border-cyan-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-slate-500 uppercase">Your Email</label>
                          <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="e.g. john@example.com"
                            className="w-full px-3 py-2 text-xs bg-slate-950 text-white rounded-lg border border-white/10 hover:border-white/20 focus:border-cyan-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    )}
                    <textarea
                      value={clientQuestion}
                      onChange={(e) => setClientQuestion(e.target.value)}
                      placeholder="Type your question or feedback about the scope, features, timeline or pricing..."
                      rows={4}
                      className="w-full p-4 text-sm bg-slate-955 text-white border border-white/10 hover:border-white/20 focus:border-cyan-500 rounded-xl outline-none transition resize-none"
                    />
                    <div className="flex justify-between items-center pt-2">
                      <button 
                        onClick={() => setShowQuestionForm(false)} 
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSendQuestion}
                        disabled={!clientQuestion.trim()}
                        className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400 transition-all disabled:opacity-50"
                      >
                        Send Question
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : approvalState === 'approved' ? (
              <div className="relative z-10 text-center max-w-xl mx-auto space-y-6 py-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Proposal approved — next steps are ready.</h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    Thanks. I’ll confirm the final start details, deposit/payment stage and project timeline.
                  </p>
                </div>
                
                <div className="bg-slate-950/60 border border-slate-800/50 rounded-2xl p-6 text-left space-y-4">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Your Project Outline &amp; Actions</h4>
                  <ol className="space-y-4 relative before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-slate-800">
                    {[
                      { title: "Confirm final scope", desc: "Verifying your dynamic scope details, active integrations, and final roadmap steps." },
                      { title: "Initial design draft", desc: "Creating pristine visual directions and component templates." },
                      { title: "Approve draft & deposit/payment", desc: "Setting up secure invoicing for your starting segment and stage scheduling once draft is approved." },
                      { title: "Collect content and access", desc: "Assembling brand identity files, domain details, copy resources, and references." },
                      { title: "Review and launch", desc: "Polishing mobile layouts, running analytics checklists, and launching to live production." }
                    ].map((step, idx) => (
                      <li key={idx} className="flex gap-4 items-start relative">
                        <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-[10px] text-cyan-400 font-bold shrink-0 relative z-10 mt-0.5">{idx + 1}</span>
                        <div>
                          <p className="text-sm text-slate-200 font-semibold">{step.title}</p>
                          <p className="text-xs text-slate-400">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  {leadData?.secure_token ? (
                    <a 
                      href={`/client-intake?token=${leadData.secure_token}`} 
                      className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold rounded-xl text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/20 text-center"
                    >
                      🚀 Return to Project Onboarding Portal
                    </a>
                  ) : (
                    <a 
                      href={`/client-intake?source=proposal&industry=trades-business`} 
                      className="px-6 py-3 bg-white text-slate-950 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all text-center"
                    >
                      Complete Detailed Intake Form
                    </a>
                  )}
                  <button 
                    onClick={() => { setApprovalState('idle'); }} 
                    className="px-6 py-3 bg-slate-900 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-800 transition text-center"
                  >
                    Close &amp; Keep Reading
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                <div className="text-center">
                  <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono uppercase tracking-wider rounded-full inline-block mb-3">ACTION REQUIRED</span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">Choose your next step</h3>
                  <p className="text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
                    Not ready to approve yet? You can start with project intake or ask a question. Approval only happens after the final scope and payment stage are confirmed.
                  </p>
                </div>

                {approvalState === 'error' && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 text-rose-300 text-xs rounded-xl text-center">
                    An error occurred while approving the proposal. Please make sure you have filled out Name and Email above or try again.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {/* Card 1: Start Project Intake */}
                  <div className="bg-[#020617] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
                    <div>
                      <h4 className="font-semibold text-white mb-2 text-sm">Start Project Intake</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-6">
                        Share your business details so I can confirm the right scope, timeline and next steps.
                      </p>
                    </div>
                    <a 
                      href={`/client-intake?source=proposal&industry=trades-business`} 
                      onClick={handleStartIntake}
                      className="w-full px-4 py-3 text-center block bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-semibold transition"
                    >
                      Start Project Intake
                    </a>
                  </div>

                  {/* Card 2: Ask a Question */}
                  <div className="bg-[#020617] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition">
                    <div>
                      <h4 className="font-semibold text-white mb-2 text-sm">Ask a Question</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-6">
                        Clarify anything about the scope, pricing, timeline or deliverables before moving forward.
                      </p>
                    </div>
                    <button 
                       onClick={() => setShowQuestionForm(true)}
                      className="w-full px-4 py-3 text-center bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-semibold transition"
                    >
                      Ask a Question
                    </button>
                  </div>

                  {/* Card 3: Approve Proposal */}
                  <div className="bg-slate-900 border border-cyan-900/50 rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-800/50 transition">
                    <div>
                      <h4 className="font-semibold text-white mb-2 text-sm text-cyan-50">Approve Proposal</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-6">
                        I’m happy with the proposed direction and want to move to final confirmation.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowApprovalModal(true)}
                      className="w-full px-4 py-3 text-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-500/20"
                    >
                      Approve Proposal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Printable fine terms footer */}
          <div className="mt-10 pt-6 border-t border-white/5 font-light text-[10px] text-slate-500 leading-normal hidden print:block text-center border-slate-200">
            This digital proposal, issued by Clarity Space creative web group, is valid for 30 calendar days from the date above. Payment schedules are contractually linked to discrete stage completions rather than date thresholds.
          </div>

        </div>

      </div>

      {/* Approval Confirmation Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-sm print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative">
            <h2 className="text-xl font-bold text-white tracking-tight mb-3">Confirm proposal approval</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              By approving, you’re confirming that the proposed scope looks suitable and you want to move forward. I’ll prepare the initial design draft and confirm launch timeline before requiring the deposit.
            </p>

            <label className="flex items-start gap-3 cursor-pointer mb-8 p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition">
              <input 
                type="checkbox" 
                className="mt-1"
                checked={approvalUnderstandingChecked}
                onChange={(e) => setApprovalUnderstandingChecked(e.target.checked)}
              />
              <span className="text-sm text-slate-300 select-none">
                I understand this approval is used to prepare the final start/payment stage.
              </span>
            </label>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalUnderstandingChecked(false);
                }}
                className="px-5 py-2.5 text-slate-400 hover:text-white text-sm font-semibold transition"
              >
                Not yet
              </button>
              <button 
                onClick={handleApproveProposal}
                disabled={!approvalUnderstandingChecked || approvalState === 'submitting'}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
              >
                {approvalState === 'submitting' ? 'Confirming...' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS Print Rule Overrides */}
      <style>{`
        @media print {
          body, html {
            background-color: white !important;
            color: #0f172a !important;
          }
          /* Hide all system gradients or decorative patterns */
          .fixed, .absolute, .bg-gradient-to-tr, .indigo-800\\/20, .bg-slate-905\\/15 {
            display: none !important;
          }
          /* Re-style printable containers to be high-contrast light colors */
          .bg-slate-900\\/40, .bg-[#020617] {
            background: white !important;
            background-color: white !important;
          }
          .bg-slate-950\\/40, .bg-slate-950\\/30, .bg-slate-950\\/20, .bg-slate-950\\/50 {
            background: #f8fafc !important; /* light slate background for containers */
            border: 1px solid #e2e8f0 !important;
          }
          /* Ensure text colors are rich dark slate/charcoal for visibility */
          .text-white {
            color: #0f172a !important;
          }
          .text-slate-100 {
            color: #0f172a !important;
          }
          .text-slate-200 {
            color: #1e293b !important;
          }
          .text-slate-300 {
            color: #334155 !important;
          }
          .text-slate-450, .text-slate-500 {
            color: #475569 !important;
          }
          .text-cyan-400 {
            color: #0369a1 !important; /* Elegant deep blue tint for digital spec elements */
          }
          .text-emerald-405, .text-emerald-400 {
            color: #15803d !important; /* Rich green for discount & deposit badges */
          }
          .text-red-400 {
            color: #b91c1c !important; /* Crimson print */
          }
          /* Force page break behavior safety */
          .page-break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

    </div>
  );
}
