import React, { useState, useEffect } from "react";
import { 
  FileText, 
  ArrowLeft, 
  Printer, 
  Check, 
  Percent, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  Info,
  Layers,
  Award,
  CircleHelp,
  TrendingUp,
  User,
  Building,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  Layers3,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";
import { db, isFirebaseConfigured, withTimeout, saveToLocalFallback } from "../firebase";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useLeadTracker } from '../hooks/useLeadTracker';

export default function SwimmingSchoolQuote() {
  useLeadTracker('proposal_viewed');

  // Client details fields
  const [clientName, setClientName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [leadData, setLeadData] = useState<any>(null);
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const [approvalState, setApprovalState] = useState<'idle' | 'submitting' | 'approved' | 'error'>('idle');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [clientQuestion, setClientQuestion] = useState("");
  const [questionSubmitted, setQuestionSubmitted] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalUnderstandingChecked, setApprovalUnderstandingChecked] = useState(false);

  // Fetch lead information if leadId, intakeId, or ID exists in query string
  useEffect(() => {
    const fetchLead = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const leadId = urlParams.get('leadId') || urlParams.get('intakeId') || urlParams.get('id');
      if (leadId) {
        setIsLoadingLead(true);

        if (!isFirebaseConfigured) {
          console.warn("Firebase not configured properly. Bypassing fetch for lead.");
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
          }
        } catch (err) {
          console.warn("Error loading lead details in swimming proposal with timeout:", err);
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
        // Only update to Intake Started if currently not deeper in the pipeline
        if (leadData.status !== 'Proposal Approved' && leadData.status !== 'Project Started' && leadData.status !== 'Deposit Paid') {
          await withTimeout(updateDoc(ref, {
            status: "Intake Started",
            updated_at: serverTimestamp()
          }), 2500);
        }
      } catch (err) {
        console.warn("Could not write start state back to database (non-blocking):", err);
      }
    }
    
    window.location.href = `/client-intake?source=proposal&industry=${leadData?.industry || 'swimming-school'}${leadId ? `&lead=${leadId}` : ''}`;
  };

  const handleApproveProposal = async () => {
    setApprovalState('submitting');
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('leadId') || urlParams.get('intakeId') || urlParams.get('id');
    
    const payload = {
      contact_name: clientName || "Prospective Client",
      business_name: businessName || "Prospective Swim School",
      email: email || "unknown@email.com",
      phone: phone || "",
      status: "Proposal Approved",
      proposal_approved_at: new Date().toISOString(),
      proposal_approved_from_page: true,
      proposal_approval_confirmed: true,
      lead_type: 'project_intake',
      industry: leadData?.industry || 'swimming-school',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: `Proposal approved from swimming school page`
    };

    if (!isFirebaseConfigured) {
      console.warn("Local/Demo Mode Active: capturing swim proposal approval locally.");
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
      console.error("Database confirm swim proposal timed out. Falling back to safe local storage:", err);
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
      business_name: businessName || "Prospective Swim School",
      email: email || "unknown@email.com",
      phone: phone || "",
      status: "Question Asked",
      lead_type: 'project_intake',
      industry: leadData?.industry || 'swimming-school',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: `Question from swimming proposal: ${clientQuestion}`
    };

    if (!isFirebaseConfigured) {
      console.warn("Local/Demo Mode swim proposal question: saving locally.");
      saveToLocalFallback('intakes', payload, leadId || undefined);
      setQuestionSubmitted(true);
      return;
    }

    try {
      if (leadId && leadData) {
        const ref = doc(db, leadData.collection, leadId);
        await withTimeout(updateDoc(ref, {
          notes: `${leadData.notes || ''}\n[Question from Swimming Proposal]: ${clientQuestion}`.trim(),
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
      console.error("Database error or timeout on question. Storing fallback locally:", err);
      saveToLocalFallback('intakes', payload, leadId || undefined);
      setQuestionSubmitted(true);
    }
  };

  // Optional toggles to enrich user interaction and dynamic subtotaling
  const [includeGoogleAds, setIncludeGoogleAds] = useState<"none" | "setup" | "management" | "both">("none");
  const [includeMaintenance, setIncludeMaintenance] = useState<"none" | "basic" | "managed">("none");

  // Iframe detector for print warnings
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    setIsIframe(window.self !== window.top);
  }, []);

  // Save last viewed proposal to allow users to go back easily
  useEffect(() => {
    try {
      localStorage.setItem('clarity_recent_quote_path', window.location.pathname + window.location.search);
      localStorage.setItem('clarity_recent_quote_name', "Swimming School & Aquatics Proposal");
    } catch (e) {}
  }, []);

  // Document metadata defaults
  const quoteNumber = "CS-SWM-2026-042";
  const quoteDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
  
  // Custom print handler
  const handlePrint = () => {
    window.print();
  };

  // Safe navigation back to system dashboard
  const handleBackToWorkspace = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 bg-slate-950/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md print:hidden">
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
            <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-800/20">
              ● Official SOW Generator
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

        {/* Live Demo Showcase Banner Button - Hidden in print */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 rounded-2xl p-4 mb-6 text-left print:hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Live Demonstration Interactive Website Model
            </span>
            <h4 className="text-white text-sm font-bold tracking-tight">
              See what Clarity Space builds for the Swim Academy Scheduler Tier!
            </h4>
            <p className="text-slate-400 text-[11px] font-light max-w-lg leading-relaxed">
              We programmed a high-fidelity fully responsive preview containing interactive sports schedules, trainer assignments, facility rosters, and class registers.
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

        {/* Iframe Warning Notification - Triggered only inside Sandbox Frame */}
        {isIframe && (
          <div className="bg-amber-500/15 border border-amber-500/25 text-amber-200 rounded-2xl p-5 mb-5 text-left animate-fadeIn print:hidden flex gap-3">
            <CircleHelp className="w-5 h-5 text-amber-450 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Browser workspace restriction</h4>
              <p className="text-[11px] text-amber-450/90 leading-relaxed">
                Browsers prevent saving PDFs from inside sandbox frames. To print or save this quote as PDF, click the <span className="font-semibold text-white bg-slate-950 border border-white/10 px-2 py-0.5 rounded">↗ Open in new tab</span> button at the top-right of your preview header panel first, then click Save on that direct view!
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Warning Notification - Hidden in print */}
        <div className="bg-gradient-to-r from-cyan-950/30 via-slate-950/40 to-cyan-950/30 border border-cyan-800/15 rounded-2xl p-5 mb-8 print:hidden flex gap-3.5 text-left">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200">Print & PDF Mode Activated</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Fill out the client credentials in the input cards below. The system automatically reformats this entire estimator sheet dynamically into an enterprise-ready A4 document on print. Background grids and buttons will naturally disappear inside your downloaded PDF.
            </p>
          </div>
        </div>

        {/* MAIN PRINTABLE WORK SHEET */}
        {/* Adds print formatting borders and shadows specifically for browser print drivers */}
        <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative print:bg-white print:border-0 print:shadow-none print:p-0">
          
          {/* Header decorative strip. Hidden in print */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 print:hidden" />

          {/* Letterhead Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/5 pb-8 print:border-slate-200">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1.5px] shrink-0">
                  <div className="h-full w-full bg-[#020617] rounded-[7px] flex items-center justify-center print:bg-white">
                    <span className="font-display font-bold text-base bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent print:text-cyan-700">C</span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <h1 className="font-display font-bold text-lg sm:text-xl tracking-tight text-white print:text-slate-900 leading-none">
                    Clarity Space
                  </h1>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-500 font-mono font-medium -mt-1 scale-90 origin-left print:text-slate-650">
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
              <div><span className="text-slate-500 font-medium">Quote ID:</span> <span className="font-semibold text-cyan-400 print:text-slate-800">{quoteNumber}</span></div>
              <div><span className="text-slate-500 font-medium">Prepared On:</span> {quoteDate}</div>
              <div><span className="text-slate-500 font-medium">Authority:</span> Clarity Space Pty Ltd</div>
              <div><span className="text-slate-500 font-medium">Contact:</span> accounts@clarityspace.com.au</div>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="my-8 text-left">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold block">
              Direct Solutions Spec Sheet
            </span>
            <h2 className="text-3xl font-bold font-display tracking-tight text-white print:text-slate-900 mt-1">
              Swimming School Website Quote
            </h2>
            <div className="h-0.5 w-16 bg-cyan-400 mt-3" />
          </div>

          {/* Interactive / Static Recipient Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-6 rounded-2xl border border-white/5 mb-8 print:bg-slate-50 print:border-slate-200 print:text-slate-900">
            
            {/* Left side: Client input parameters */}
            <div className="space-y-4 text-left">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center gap-1.5">
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
                    placeholder="e.g. Rachel McKnight"
                    className="w-full px-3.5 py-2 text-xs bg-[#020617] text-white rounded-lg border border-white/10 hover:border-white/20 focus:border-cyan-500 outline-none transition-all print:hidden"
                  />
                  {/* Print Version */}
                  <div className="hidden print:block text-xs">
                    <span className="text-slate-500 font-medium">Name: </span>
                    <span className="font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5">{clientName || "________________________"}</span>
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
                    placeholder="e.g. Aquatics Swim Academy"
                    className="w-full px-3.5 py-2 text-xs bg-[#020617] text-white rounded-lg border border-white/10 hover:border-white/20 focus:border-cyan-500 outline-none transition-all print:hidden"
                  />
                  {/* Print Version */}
                  <div className="hidden print:block text-xs mt-1.5">
                    <span className="text-slate-500 font-medium">Company: </span>
                    <span className="font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5">{businessName || "________________________"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Contact input parameters */}
            <div className="space-y-4 text-left">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 print:text-slate-600 flex items-center gap-1.5">
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
                    placeholder="e.g. contact@aquaticswim.com"
                    className="w-full px-3.5 py-2 text-xs bg-[#020617] text-white rounded-lg border border-white/10 hover:border-white/20 focus:border-cyan-500 outline-none transition-all print:hidden"
                  />
                  {/* Print Version */}
                  <div className="hidden print:block text-xs">
                    <span className="text-slate-500 font-medium">Email: </span>
                    <span className="font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5">{email || "________________________"}</span>
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
                    placeholder="e.g. +852 9123 4567"
                    className="w-full px-3.5 py-2 text-xs bg-[#020617] text-white rounded-lg border border-white/10 hover:border-white/20 focus:border-cyan-500 outline-none transition-all print:hidden"
                  />
                  {/* Print Version */}
                  <div className="hidden print:block text-xs mt-1.5">
                    <span className="text-slate-500 font-medium">Phone: </span>
                    <span className="font-semibold text-slate-900 border-b border-dashed border-slate-300 pb-0.5">{phone || "________________________"}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* MAIN PACKAGE PRICE CARD */}
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-slate-950/50 border-2 border-cyan-500/20 rounded-3xl p-6 sm:p-8 mb-8 text-left shadow-xl print:bg-slate-50 print:border-slate-350 print:text-slate-900">
            {/* Dynamic decorative backdrop discount badge */}
            <div className="absolute right-6 top-6 print:right-4 print:top-4">
              <span className="px-3 py-1.5 text-[10px] sm:text-xs font-mono font-bold tracking-widest bg-cyan-400 text-slate-950 uppercase rounded-full shadow-inner animate-pulse print:animate-none print:border print:border-slate-350">
                70% SAVINGS APPLIED
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 print:text-slate-700 font-bold block">
                  Core Website Deliverable
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white print:text-slate-900 font-display mt-1">
                  Professional Swimming School Website
                </h3>
              </div>

              {/* Grid accounting prices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5 print:border-slate-200">
                
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-slate-200">
                  <span className="text-[9px] font-mono uppercase text-slate-400 print:text-slate-500 block">Normal Price</span>
                  <span className="text-lg font-bold text-red-400 font-mono line-through print:text-red-650">
                    HKD 78,000
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-slate-200">
                  <span className="text-[9px] font-mono uppercase text-slate-400 print:text-slate-500 block">70% Strategy Discount</span>
                  <span className="text-lg font-bold text-emerald-405 font-mono print:text-emerald-700">
                    -HKD 54,600
                  </span>
                </div>

                <div className="p-3 bg-cyan-950/50 rounded-xl border border-cyan-400/20 print:bg-white print:border-slate-350 shadow-inner">
                  <span className="text-[9px] font-mono uppercase text-cyan-400 print:text-slate-600 block font-bold">Client Final Price</span>
                  <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight print:text-slate-900 block mt-0.5">
                    HKD 23,400
                  </span>
                </div>

              </div>

              <p className="text-[11px] text-slate-400 print:text-slate-500 font-light leading-relaxed">
                Includes strategy consulting, modular responsive engineering, and complete testing for courses and enrolment workflows. Final price represents structured turnkey setup with absolute zero variable cost overlaps.
              </p>

              <div className="bg-cyan-950/25 border border-cyan-500/10 p-4 rounded-2xl text-[11px] text-slate-300 font-light mt-4 leading-relaxed print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                <span className="font-bold tracking-wider text-cyan-400 print:text-slate-705 block uppercase text-[9px] mb-1 font-mono">💡 Context Behind the 70% Strategy Offer</span>
                This discount is part of our <span className="text-white font-medium print:text-slate-900">Portfolio Co-Investment Program</span>. Because we are expanding our presence in your sector in Hong Kong, we are temporarily subsidizing our engineering hours in exchange for displaying the completed site in our public showcase and receiving an honest client testimonial upon successful launch. It operates on a fixed-scope basis with absolutely no hidden fees.
              </div>
            </div>
          </div>

          {/* INCLUDED FEATURES & SCOPE */}
          <div className="space-y-6 mb-10 text-left page-break-inside-avoid">
            <div className="border-b border-white/10 pb-3 print:border-slate-200">
              <h3 className="text-sm font-mono tracking-wider font-bold uppercase text-slate-300 print:text-slate-700 flex items-center gap-2">
                <Layers className="w-4.5 h-4.5 text-cyan-400 print:text-slate-500" />
                Comprehensive Included Scope & Technical Visualization
              </h3>
              <p className="text-[11px] text-slate-400 print:text-slate-500 mt-1 font-light">
                Every component is hand-crafted with no cookie-cutter templates. Below are structural previews of what we build specifically for your swim school.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {[
                { 
                  title: "Custom homepage design", 
                  desc: "Eye-catching layout custom-fit for school branding, parent trust and booking flow.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-2.5 font-sans overflow-hidden print:bg-slate-50 print:border-slate-200">
                      <div className="flex items-center gap-1 border-b border-white/5 pb-1.5 print:border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/80" />
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400/80" />
                        <span className="text-[8px] font-mono text-slate-500 ml-1.5 print:text-slate-500">aquaswim.hk/home</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[7px] font-mono text-slate-400 print:text-slate-600">
                          <span className="font-bold text-cyan-400 print:text-slate-800">🏊 AQUASWIM</span>
                          <div className="flex gap-2">
                            <span>Schedules</span>
                            <span>Pricing</span>
                            <span>Contact</span>
                          </div>
                        </div>
                        <div className="py-2.5 px-2 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 rounded-lg text-center border border-white/5 print:from-slate-100 print:to-slate-100 print:border-slate-200">
                          <div className="text-[9px] font-extrabold text-white print:text-slate-900 leading-snug">Elite Swim Training for Modern Youth</div>
                          <div className="text-[7px] text-slate-400 mt-1 max-w-xs mx-auto print:text-slate-500">Hong Kong's safe, certified, &amp; premium indoor pool training network.</div>
                          <div className="mt-1.5 text-[8px] inline-block px-2.5 py-0.5 bg-cyan-400 font-bold text-slate-950 rounded-full print:bg-cyan-700 print:text-white">Book Trial Class</div>
                        </div>
                      </div>
                    </div>
                  )
                },
                { 
                  title: "Mobile responsive website", 
                  desc: "Flawless screen presentations designed mobile-first. Perfect for parents on smartphones.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 flex gap-4 items-center justify-around font-sans print:bg-slate-50 print:border-slate-200">
                      {/* Desktop Wireframe Segment */}
                      <div className="border border-white/10 rounded px-1.5 py-1 w-1/2 scale-95 opacity-80 print:border-slate-300">
                        <div className="text-[7px] text-cyan-400 font-bold print:text-slate-800">🖥️ Desktop Spec</div>
                        <div className="flex gap-1 mt-1.5">
                          <div className="w-2/3 h-5 bg-white/5 rounded border border-white/5 print:bg-white print:border-slate-200" />
                          <div className="w-1/3 h-5 bg-cyan-400/10 rounded print:bg-cyan-50" />
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded mt-1.5 print:bg-slate-300" />
                      </div>
                      {/* Mobile Wireframe Segment */}
                      <div className="border-2 border-cyan-500/20 rounded-xl p-1.5 w-1/3 text-center bg-[#020617] print:border-slate-300 print:bg-white">
                        <div className="text-[7px] text-emerald-400 font-bold print:text-emerald-700">📱 Mobile Spec</div>
                        <div className="h-6 w-full bg-cyan-950/30 rounded border border-cyan-800/20 flex flex-col justify-center items-center mt-1 print:bg-slate-100">
                          <span className="text-[6px] font-mono text-cyan-400 print:text-slate-800 font-bold">Menu ☰</span>
                          <span className="text-[4px] text-slate-500">Tap to dial</span>
                        </div>
                        <div className="h-1.5 w-5 bg-cyan-400 rounded-full mx-auto mt-1 print:bg-cyan-700" />
                      </div>
                    </div>
                  )
                },
                { 
                  title: "Course listing section", 
                  desc: "Clear categorization of swimming classes by age limits, swimmer skill levels, or site locations.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-2 font-sans print:bg-slate-50 print:border-slate-200">
                      <div className="text-[9px] font-bold text-slate-300 print:text-slate-900">Explore Programs</div>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[7px]">
                        {[
                          { name: "Baby Splash", rate: "Ages 1-3", level: "Beginner", col: "border-cyan-500/20" },
                          { name: "Junior Stroke", rate: "Ages 4-7", level: "Intermediate", col: "border-blue-500/20" },
                          { name: "Swim Squad", rate: "Ages 8+", level: "Advanced", col: "border-purple-500/20" }
                        ].map((prg, pidx) => (
                          <div key={pidx} className={`p-1.5 bg-white/5 rounded-lg border ${prg.col} print:bg-white print:border-slate-300`}>
                            <div className="font-semibold text-white print:text-slate-900">{prg.name}</div>
                            <div className="text-[6px] text-slate-450 mt-0.5 print:text-slate-600">{prg.rate}</div>
                            <span className="inline-block mt-1 px-1 bg-cyan-950/80 text-cyan-400 text-[5px] rounded border border-cyan-800/10 print:bg-cyan-50 print:text-cyan-800">{prg.level}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                },
                { 
                  title: "Course detail pages", 
                  desc: "Comprehensive guides illustrating curriculum modules, professional coaches, hours & equipment guidelines.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 font-sans print:bg-slate-50 print:border-slate-200 text-left">
                      <div className="flex gap-2.5 items-center">
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] print:bg-slate-200">🐳</div>
                        <div>
                          <div className="text-[8px] font-bold text-white print:text-slate-950">Junior Stroke Correction Program</div>
                          <span className="text-[6px] text-cyan-400 tracking-wide font-mono uppercase print:text-slate-700">Course Code: EXP-04</span>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[7px] border-t border-white/5 pt-1.5 print:border-slate-200">
                        <div>
                          <span className="text-[6px] text-slate-500 block">Lead Coach:</span>
                          <span className="text-slate-350 print:text-slate-700 font-medium">Coach Ryan (HKASA Certified)</span>
                        </div>
                        <div>
                          <span className="text-[6px] text-slate-500 block">Class Ratio Limit:</span>
                          <span className="text-slate-350 print:text-slate-700 font-medium">Max 4 Students : 1 Coach</span>
                        </div>
                      </div>
                    </div>
                  )
                },
                { 
                  title: "Enquiry / registration form", 
                  desc: "Dynamic parent intake widgets capturing swimmer age, skill profile levels, and contact data instantly.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200 text-left">
                      <div className="text-[9px] font-bold text-white print:text-slate-950">Sign Up / Reserve Spot</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="py-1 px-1.5 bg-slate-900 border border-white/5 rounded text-[7px] text-slate-400 print:bg-white print:border-slate-200">Parent Name</div>
                        <div className="py-1 px-1.5 bg-slate-900 border border-white/5 rounded text-[7px] text-slate-400 print:bg-white print:border-slate-200">Swimmer Age</div>
                      </div>
                      <div className="py-1 px-1.5 bg-slate-900 border border-cyan-500/30 rounded text-[7px] text-cyan-300 flex justify-between items-center print:bg-white print:border-slate-200 print:text-slate-800">
                        <span>Select Swimmer Level</span>
                        <span>▼</span>
                      </div>
                      <div className="py-1 rounded bg-cyan-400 font-bold text-center text-[8px] text-slate-950 print:bg-cyan-700 print:text-white">Submit Booking Reservation</div>
                    </div>
                  )
                },
                { 
                  title: "CMS / admin editing setup", 
                  desc: "Friendly administrator view enabling school staff to modify timetables, prices and post banners.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200 text-left">
                      <div className="flex justify-between items-center bg-[#020617] p-1 border-b border-white/5 rounded print:bg-slate-100 print:border-slate-200">
                        <span className="text-[7.5px] font-mono text-emerald-400 font-semibold print:text-emerald-800">● Admin Control Panel</span>
                        <div className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[6px] rounded font-mono font-medium print:bg-white print:border print:border-slate-200">Staff Mode</div>
                      </div>
                      <div className="space-y-1 text-[7px]">
                        <div className="flex justify-between items-center p-1 bg-white/5 rounded print:bg-white print:border print:border-slate-150">
                          <span className="text-white print:text-slate-800">Toddler Basic Class (HKD 450)</span>
                          <span className="text-cyan-400 cursor-pointer print:text-slate-700">✏️ Edit Row</span>
                        </div>
                        <div className="flex justify-between items-center p-1 bg-white/5 rounded print:bg-white print:border print:border-slate-150">
                          <span className="text-white print:text-slate-800">Advanced Squad Term (HKD 950)</span>
                          <span className="text-cyan-400 cursor-pointer print:text-slate-700">✏️ Edit Row</span>
                        </div>
                      </div>
                    </div>
                  )
                },
                { 
                  title: "Email notification setup", 
                  desc: "Instantly delivers structured registration confirmation copies directly to the parents' inboxes.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 font-sans print:bg-slate-50 print:border-slate-200 text-left">
                      <div className="border border-white/10 rounded-lg p-2 space-y-1.5 print:border-slate-200">
                        <div className="flex justify-between items-center text-[7px] text-slate-400 border-b border-white/5 pb-1 print:border-slate-200 print:text-slate-600">
                          <span>Sender: booking@aquaswim.hk</span>
                          <span>Priority: Important</span>
                        </div>
                        <span className="text-[8.5px] font-extrabold text-white print:text-slate-950 block">🏊 Your Swimmer Spot is Reserved!</span>
                        <p className="text-[7px] text-slate-450 print:text-slate-500 leading-normal">Hi Rachel McMcKnight, your booking for Swimmer Program (Junior Stroke) has been locked. Lesson starts next Tuesday at 4:00 PM.</p>
                        <div className="h-0.5 w-full bg-slate-800 print:bg-slate-200" />
                        <span className="text-[6.5px] font-mono text-cyan-400 block print:text-slate-800">Generated securely by Automated Mailer API</span>
                      </div>
                    </div>
                  )
                },
                { 
                  title: "Basic SEO setup", 
                  desc: "Integrates structured schema data and regional keyword metadata to rank highly on search engines.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200 text-left">
                      <div className="text-[8px] text-[#8ab4f8] font-semibold hover:underline cursor-pointer leading-tight print:text-blue-700">
                        Swim Classes Hong Kong | Certified Swimming School | AquaSwim
                      </div>
                      <div className="text-[6.5px] text-[#81c995] font-mono leading-none print:text-emerald-700">
                        https://aquaswim.hk/hong-kong-enrolment
                      </div>
                      <p className="text-[7.5px] text-slate-400 leading-normal print:text-slate-500">
                        Reviews: ⭐⭐⭐⭐⭐ 4.9/5 · Rated by 120+ parents. Active professional swim training, water safety and competitive classes in HK. Enroll today.
                      </p>
                    </div>
                  )
                },
                { 
                  title: "Google Analytics setup", 
                  desc: "Tracks active customer conversions. Explains where parents click and how many book trial sessions.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200 text-left">
                      <div className="flex justify-between items-center text-[8.5px] text-cyan-400 border-b border-white/5 pb-1 print:border-slate-200 print:text-slate-900 font-bold">
                        <span>📊 Live Console Analytics</span>
                        <span className="text-[7px] text-emerald-400 font-mono print:text-emerald-700">● 24 Realtime Active</span>
                      </div>
                      <div className="h-8 flex items-end gap-1 pt-1">
                        {[15, 30, 48, 20, 60, 45, 90, 75, 40, 80].map((bar, bidx) => (
                          <div 
                            key={bidx} 
                            style={{ height: `${bar}%` }} 
                            className="bg-gradient-to-t from-cyan-500 to-blue-400 w-full rounded-t-sm print:from-cyan-700 print:to-cyan-700" 
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-[6px] text-slate-500">
                        <span>40m ago</span>
                        <span>Now</span>
                      </div>
                    </div>
                  )
                },
                { 
                  title: "Google Maps / WhatsApp / phone links", 
                  desc: "Instant tap-to-contact buttons enabling swift parent-to-staff scheduling dialogues.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200 text-left">
                      <div className="text-[9px] font-bold text-white print:text-slate-950">Reach Our Support Representatives</div>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[7px] font-bold">
                        <div className="p-1 px-1 w-full bg-emerald-950/80 text-emerald-400 rounded border border-emerald-800/15 flex flex-col justify-center items-center print:bg-emerald-50 print:text-emerald-700 print:border-emerald-300">
                          <span className="text-[10px] mb-0.5">💬</span>
                          WhatsApp Line
                        </div>
                        <div className="p-1 px-1 w-full bg-cyan-950/80 text-cyan-450 rounded border border-cyan-800/15 flex flex-col justify-center items-center print:bg-cyan-50 print:text-cyan-750 print:border-cyan-300">
                          <span className="text-[10px] mb-0.5">📞</span>
                          Direct Call
                        </div>
                        <div className="p-1 px-1 w-full bg-slate-900 text-slate-300 rounded border border-white/10 flex flex-col justify-center items-center print:bg-slate-100 print:border-slate-200 print:text-slate-800">
                          <span className="text-[10px] mb-0.5">📍</span>
                          Pool Location
                        </div>
                      </div>
                    </div>
                  )
                },
                { 
                  title: "Testing and launch support", 
                  desc: "Comprehensive cross-browser security checks and complete domain setup configurations.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 space-y-1.5 font-sans print:bg-slate-50 print:border-slate-200 text-left">
                      <div className="grid grid-cols-2 gap-1.5 text-[6.5px]">
                        <div className="flex items-center gap-1.5 p-1 bg-[#020617] rounded border border-white/5 print:bg-white print:border-slate-350">
                          <span className="text-emerald-400 font-bold">✔</span>
                          <span className="text-slate-300 print:text-slate-800">SSL Certificate Activated</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1 bg-[#020617] rounded border border-white/5 print:bg-white print:border-slate-350">
                          <span className="text-emerald-400 font-bold">✔</span>
                          <span className="text-slate-300 print:text-slate-800">99.9% Core Mobile Responsive</span>
                        </div>
                      </div>
                      <div className="p-1 px-2 bg-cyan-950/40 border border-cyan-900 rounded flex justify-between items-center text-[7.5px] print:bg-slate-100 print:border-slate-200">
                        <span className="text-slate-300 print:text-slate-900 font-medium">Lighthouse Core Speed Performance:</span>
                        <span className="font-mono text-emerald-405 font-extrabold print:text-emerald-700">100 / 100</span>
                      </div>
                    </div>
                  )
                },
                { 
                  title: "Basic handover", 
                  desc: "Comprehensive user handbook permitting school delegates to modify training slots independently.",
                  visual: (
                    <div className="mt-3 p-3 bg-slate-950/65 rounded-xl border border-white/5 flex gap-2.5 items-center font-sans print:bg-slate-50 print:border-slate-200 text-left">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400 text-sm print:bg-red-50 print:text-red-700">
                        📕
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[8px] font-bold text-white print:text-slate-950">Active Handover Playbook.pdf</div>
                        <span className="text-[6.5px] text-slate-450 print:text-slate-500 block leading-normal">Includes structured visual screen-record tutorials detailing course upload and timetable adjustments.</span>
                      </div>
                    </div>
                  )
                }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col justify-between p-4 bg-slate-950/20 rounded-2xl border border-white/5 relative page-break-inside-avoid print:bg-white print:border-0 print:shadow-none print:p-2">
                  <div className="flex gap-2.5 items-start">
                    <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5 print:text-emerald-600" />
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-205 print:text-slate-900 block text-xs">{item.title}</span>
                      <span className="text-[11px] text-slate-400 print:text-slate-500 block leading-normal font-light">{item.desc}</span>
                    </div>
                  </div>
                  
                  {/* Embedded Custom Feature Visualization Mockup */}
                  {item.visual}
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC SUBSECTION: OPTIONAL AD-ONS CHOSEN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:block print:space-y-8">
            
            {/* Optional Google Ads Panel */}
            <div className="bg-slate-950/30 p-5 rounded-2xl border border-white/5 text-left print:bg-white print:border-0 print:p-0 print:border-b print:border-slate-200 print:pb-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400 print:text-slate-500" />
                  Google Ads (Optional)
                </h4>
                
                {/* Visual Interactivity Control - Hidden in print */}
                <select
                  value={includeGoogleAds}
                  onChange={(e: any) => setIncludeGoogleAds(e.target.value)}
                  className="text-[10px] bg-slate-900 text-slate-300 rounded-lg border border-white/10 px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer print:hidden"
                >
                  <option value="none">Exclude from Quote</option>
                  <option value="setup">Include Setup Only</option>
                  <option value="management">Include Monthly Management Only</option>
                  <option value="both">Include Setup & Management</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-400 print:text-slate-500 leading-relaxed mb-4">
                Drive immediate student bookings. Target parents actively looking for &quot;near me&quot; swimming classes.
              </p>

              <div className="space-y-2 text-xs">
                <div className={`p-2 rounded-lg transition-all ${includeGoogleAds === "setup" || includeGoogleAds === "both" ? "bg-cyan-950/20 border border-cyan-800/20 print:bg-slate-50" : "bg-white/5 opacity-60 print:opacity-100"}`}>
                  <div className="flex justify-between items-center font-semibold text-slate-200 print:text-slate-900">
                    <span className="flex items-center gap-1.5">
                      Campaign Setup
                      <span className="text-[9px] font-mono font-bold bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/20 print:bg-emerald-100 print:text-emerald-800">
                        50% Off Promo
                      </span>
                    </span>
                    <div className="text-right">
                      <span className="font-mono text-cyan-400 print:text-slate-900 block font-bold">HKD 3,000–6,000</span>
                      <span className="font-mono text-[9px] text-slate-550 line-through block print:text-slate-500">HKD 6,000–12,000</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block leading-normal mt-0.5">Pixel implementation, keyword research, geo-targeting in Hong Kong, ad copywriting and landing page advice.</span>
                </div>

                <div className={`p-2 rounded-lg transition-all ${includeGoogleAds === "management" || includeGoogleAds === "both" ? "bg-cyan-950/20 border border-cyan-800/20 print:bg-slate-50" : "bg-white/5 opacity-60 print:opacity-100"}`}>
                  <div className="flex justify-between items-center font-semibold text-slate-200 print:text-slate-900">
                    <span className="flex items-center gap-1.5">
                      Monthly Management
                      <span className="text-[9px] font-mono font-bold bg-emerald-950/60 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/20 print:bg-emerald-100 print:text-emerald-800">
                        50% Off Promo
                      </span>
                    </span>
                    <div className="text-right">
                      <span className="font-mono text-cyan-400 print:text-slate-900 block font-bold">HKD 1,500–4,000 /mo</span>
                      <span className="font-mono text-[9px] text-slate-550 line-through block print:text-slate-500">HKD 3,000–8,000 /mo</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block leading-normal mt-0.5">Bid optimizations, weekly negative keyword pruning, and a monthly conversion report showing calls and sign-ups.</span>
                </div>
              </div>

              <div className="mt-3.5 p-2 bg-yellow-950/15 border border-yellow-700/20 rounded-lg text-[10px] text-slate-350 leading-relaxed italic print:text-slate-650 print:border-0 print:p-0 print:mt-1">
                Note: Google Ads advertising budget is paid directly by the client to Google. Recommended budget: HKD 3,000–15,000+/month.
              </div>
            </div>

            {/* Optional Maintenance Panel */}
            <div className="bg-slate-950/30 p-5 rounded-2xl border border-white/5 text-left print:bg-white print:border-0 print:p-0">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 flex items-center gap-1.5">
                  <Layers3 className="w-4 h-4 text-cyan-400 print:text-slate-500" />
                  Technical Support & Maintenance (Optional)
                </h4>
                
                {/* Visual Interactivity Control - Hidden in print */}
                <select
                  value={includeMaintenance}
                  onChange={(e: any) => setIncludeMaintenance(e.target.value)}
                  className="text-[10px] bg-slate-900 text-slate-300 rounded-lg border border-white/10 px-2 py-1 outline-none focus:border-cyan-500 cursor-pointer print:hidden"
                >
                  <option value="none">Exclude from Quote</option>
                  <option value="basic">Include Basic Support</option>
                  <option value="managed">Include Managed Support</option>
                </select>
              </div>

              <p className="text-[11px] text-slate-400 print:text-slate-500 leading-relaxed mb-4">
                Assurance that directories, timetables, and parents notification databases remain securely functional around the clock.
              </p>

              <div className="space-y-2 text-xs">
                <div className={`p-2 rounded-lg transition-all ${includeMaintenance === "basic" ? "bg-cyan-950/20 border border-cyan-800/20 print:bg-slate-50" : "bg-white/5 opacity-60 print:opacity-100"}`}>
                  <div className="flex justify-between items-center font-semibold text-slate-200 print:text-slate-900">
                    <span>Basic Support</span>
                    <span className="font-mono text-cyan-400 print:text-slate-800">HKD 800–1,500 /mo</span>
                  </div>
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block leading-normal mt-0.5">Automated framework checks, weekly databases backup integrity review, security patching and critical uptime pinging.</span>
                </div>

                <div className={`p-2 rounded-lg transition-all ${includeMaintenance === "managed" ? "bg-cyan-950/20 border border-cyan-800/20 print:bg-slate-50" : "bg-white/5 opacity-60 print:opacity-100"}`}>
                  <div className="flex justify-between items-center font-semibold text-slate-200 print:text-slate-900">
                    <span>Managed Support</span>
                    <span className="font-mono text-cyan-400 print:text-slate-800">HKD 2,000–4,000 /mo</span>
                  </div>
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block leading-normal mt-0.5">Priority SLA (under 4 hours), include up to 3 hours of custom content updates, coaching table adjustments and forms optimization.</span>
                </div>
              </div>
            </div>

          </div>

          {/* EXTERNAL SERVICES SECURED BY CLIENT */}
          <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 mb-8 text-left print:bg-white print:border-slate-200 print:p-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-350 print:text-slate-800 flex items-center gap-1.5 mb-3">
              <ExternalLink className="w-4 h-4 text-cyan-400 print:text-slate-550" />
              Required External Services (Paid directly by client to providers)
            </h4>

            <p className="text-[11px] text-slate-400 print:text-slate-500 leading-normal mb-4">
              To guarantee complete ownership of assets, Clarity Space deploys platforms directly inside your company registry. The raw subscription fees are billed directly to your corporate payment cards.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              {[
                { title: "Domain Registration", cost: "HKD 100–300 / year", desc: "Primary brand domain (e.g. .hk, .com) licensing is held by your school." },
                { title: "Dedicated Web Hosting", cost: "HKD 800–3,000 / year", desc: "High availability file storage for optimal student parent loading speeds." },
                { title: "Business GSuite/Email", cost: "HKD 50–150 / user / mo", desc: "Secure parent consultation and admin mailboxes hosted by Google Workspace." },
                { title: "Transactional SMS & Mailer", cost: "Depends on usage", desc: "Provider fees (such as Twilio/Resend) for massive enrolment message queues." },
                { title: "Credit Card Gateway API", cost: "Depends on transaction volume", desc: "Stripe/PayPal processing fees charged only when parents secure checkout bookings." },
                { title: "Optional Google Ads Ads budget", cost: "Suggested HKD 3,000–15,000+ / mo", desc: "Paid directly to advertising network to maximize course registration numbers." }
              ].map((serv, idx) => (
                <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 print:bg-white print:border-slate-150 relative">
                  <div className="font-semibold text-slate-200 print:text-slate-900 pr-1">{serv.title}</div>
                  <div className="font-mono text-[11px] text-cyan-400 print:text-slate-700 font-bold mt-1">{serv.cost}</div>
                  <div className="text-[10px] text-slate-450 print:text-slate-500 mt-1 leading-normal font-light">{serv.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PAYMENT DISBURSEMENT SCHEDULE */}
          <div className="p-6 bg-slate-950/20 border border-white/5 rounded-2xl text-left mb-8 print:bg-white print:border-slate-200 print:p-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 print:text-slate-800 flex items-center gap-1.5 mb-4">
              <Calendar className="w-4.5 h-4.5 text-cyan-400 print:text-slate-550" />
              Structured Milestone Payment Terms
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl text-left print:bg-slate-50 print:border-slate-150">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 print:text-slate-500 uppercase block">Phase 1: Commencement</span>
                <span className="text-sm font-bold text-white print:text-slate-900 block mt-1">Deposit Due (After Draft Approval)</span>
                <span className="text-lg font-mono font-extrabold text-cyan-400 print:text-slate-800 block mt-1">HKD 11,700</span>
                <span className="text-[10px] text-slate-400 print:text-slate-500 block mt-1 leading-normal">Billing triggered after initial design draft approval to commence full build.</span>
              </div>

              <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl text-left print:bg-slate-50 print:border-slate-150">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 print:text-slate-500 uppercase block">Phase 2: Preview Complete</span>
                <span className="text-sm font-bold text-white print:text-slate-900 block mt-1">40% After Development</span>
                <span className="text-lg font-mono font-extrabold text-cyan-400 print:text-slate-800 block mt-1">HKD 9,360</span>
                <span className="text-[10px] text-slate-400 print:text-slate-500 block mt-1 leading-normal">Due when course catalog listing interfaces and registration forms pass demo testing.</span>
              </div>

              <div className="p-3.5 bg-[#020617]/90 border border-cyan-950 rounded-xl text-left print:bg-slate-50 print:border-slate-150">
                <span className="text-[10px] font-mono tracking-wider text-cyan-400 print:text-slate-600 uppercase font-semibold block">Phase 3: Domain Launch</span>
                <span className="text-sm font-bold text-white print:text-slate-900 block mt-1">10% Final Launch Balance</span>
                <span className="text-lg font-mono font-extrabold text-cyan-400 print:text-slate-800 block mt-1">HKD 2,340</span>
                <span className="text-[10px] text-slate-400 print:text-slate-555 block mt-1 leading-normal">Paid immediately following domain configuration, GA4 linking, and live handover training launch.</span>
              </div>

            </div>
          </div>

          {/* SIGNATURE SECTION FOR CLIENT AND AGENCY */}
          <div className="mt-12 pt-8 border-t border-white/5 print:border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <span className="text-[9px] font-mono uppercase text-slate-500 block">Lead Creative Director Authorization</span>
              <span className="font-display italic text-lg text-cyan-450 print:text-slate-700 block mt-1 tracking-wider select-none">
                Clarity Space Design Labs
              </span>
              <div className="h-px bg-white/10 w-44 mt-6 print:bg-slate-300" />
              <span className="text-[9px] font-mono text-slate-400 mt-2 block">Clarity Space Pty Ltd Representative</span>
            </div>

            <div>
              <span className="text-[9px] font-mono uppercase text-slate-500 block">Accepted &amp; Authorized By Client</span>
              <span className="text-sm text-slate-400 print:text-slate-500 mt-3 block select-none">
                {businessName.trim() ? businessName : "Prospective Swim Academy Ltd."}
              </span>
              <div className="h-px bg-white/10 w-44 mt-6 print:bg-slate-300" />
              <span className="text-[9px] font-mono text-slate-400 mt-2 block flex items-baseline gap-1">
                Representative Signature: <span className="text-[10px] text-slate-300 print:text-slate-800 font-semibold">{clientName || "_________________"}</span>
              </span>
            </div>
          </div>
          
          {/* DIGITAL INTAKE NEXT STEP / PROPOSAL APPROVAL */}
          <div className="print:hidden bg-gradient-to-br from-slate-900 via-[#0b1329] to-[#020617] border border-cyan-850/30 rounded-2xl p-8 mb-20 mt-12 relative overflow-hidden">
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
                      className="w-full p-4 text-sm bg-slate-950 text-white border border-white/10 hover:border-white/20 focus:border-cyan-500 rounded-xl outline-none transition resize-none"
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
                    Thanks. I’ll confirm the final start details, prepare the initial design draft, and confirm the project timeline.
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
                  <a 
                    href={`/client-intake?source=proposal&industry=swimming-school`} 
                    className="px-6 py-3 bg-white text-slate-950 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all text-center"
                  >
                    Complete Detailed Intake Form
                  </a>
                  <button 
                    onClick={() => { setApprovalState('idle'); }} 
                    className="px-6 py-3 bg-slate-900 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-800 transition"
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
                      href={`/client-intake?source=proposal&industry=swimming-school`}
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

        {/* Outer bottom back links - Hidden in print */}
        <div className="mt-8 text-center print:hidden">
          <button
            onClick={handleBackToWorkspace}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            Cancel and Return to Digital Architecture Workspace
          </button>
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

      {/* Embedded print overrides to enforce beautiful A4 layout standard in Chrome / Safari / Edge */}
      <style>{`
        @media print {
          /* Enforce light background and print styles globally */
          html, body {
            background-color: white !important;
            background: white !important;
            color: #0f172a !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #clarity-space-root, .min-h-screen {
            background: white !important;
            background-color: white !important;
            color: #0f172a !important;
            min-height: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          .overflow-hidden {
            overflow: visible !important;
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
          .text-slate-400, .text-slate-450, .text-slate-500, .text-slate-550 {
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
          .relative, .grid, .space-y-4, .p-6, .mb-8 {
            page-break-inside: avoid !important;
          }
          /* Hide print-hidden classes */
          .print\\:hidden {
            display: none !important;
          }
          /* Force inputs to not display interactive border blocks on print */
          input {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            color: #0f172a !important;
          }
        }
      `}</style>
    </div>
  );
}
