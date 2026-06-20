import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, User, Mail, Link as LinkIcon, MapPin, CheckCircle, 
  ChevronRight, ChevronLeft, Send, Loader2, Info, Clock, Globe,
  ShieldCheck, CreditCard, FolderOpen, FileText, Sparkles, Plus, Trash,
  PenTool, CheckSquare, Upload, Activity, Code, Settings, MessageSquare, AlertCircle, ArrowRight, Copy, ArrowLeft,
  Lock, ExternalLink
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, getDocs, query, where, addDoc as addDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured, withTimeout, saveToLocalFallback, updateLocalFallback, getLocalFallbackSubmissions } from '../firebase';
import { useLeadTracker } from '../hooks/useLeadTracker';
import { calculateQuote, packages as appPackages, isAddonIncludedInPackage } from '../config/pricing';

export default function ClientIntake() {
  useLeadTracker('intake_started');

  const [searchParams] = useSearchParams();
  const [activeStep, setActiveStep] = useState<'welcome' | 'configure' | 'proposal' | 'deposit' | 'assets' | 'development' | 'launch' | 'success'>('welcome');
  
  useEffect(() => {
    if (activeStep) {
      try {
        localStorage.setItem('clarity_last_viewed_step', activeStep);
      } catch (e) {}
    }
  }, [activeStep]);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  
  // Loaded Project info
  const [projectData, setProjectData] = useState<any>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [errorProject, setErrorProject] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  // Local storage recent detection
  const [recentToken, setRecentToken] = useState<string | null>(null);
  const [recentName, setRecentName] = useState<string | null>(null);

  // Promo Code / Discount
  const [promoCode, setPromoCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const handlePromoCodeChange = (val: string) => {
    setPromoCode(val);
    const code = val.toUpperCase().trim();
    if (code.includes('50')) {
      setDiscountPercentage(50);
    } else if (code.includes('60')) {
      setDiscountPercentage(60);
    } else {
      setDiscountPercentage(0);
    }
  };

  // Digital Signature State
  const [signeeName, setSigneeName] = useState('');
  const [signatureDate, setSignatureDate] = useState(new Date().toLocaleDateString());

  // Save & Resume / Dropzone additionals
  const [copiedResume, setCopiedResume] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string, size: number, type: string }[]>([]);

  // Payments Gateway Simulation
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('bank');
  const [copiedBsb, setCopiedBsb] = useState(false);
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);

  // Load Privacy & Terms Modals
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Initial Form Data State for Fresh Onboarding
  const [formData, setFormData] = useState(() => {
    return {
      business_name: searchParams.get('companyName') || searchParams.get('business_name') || '',
      contact_name: searchParams.get('clientName') || searchParams.get('contact_name') || '',
      email: searchParams.get('clientEmail') || searchParams.get('email') || '',
      phone: searchParams.get('phone') || '',
      location: searchParams.get('location') || 'Australia',
      industry: searchParams.get('industry') || '',
      website_url: searchParams.get('websiteUrl') || searchParams.get('website_url') || '',
      selected_goals: [] as string[],
      main_outcome: '',
      selected_package: 'small_business_website',
      selected_pages: ['Home', 'About', 'Services', 'Contact'] as string[],
      selected_addons: [] as string[],
      budget_range: 'A$3,500–A$4,500',
      timeline: '2–4 weeks',
      decision_status: 'Ready to start after final scope',
      notes: '',
      current_online_presence: '',
      target_audience: '',
      reference_websites: '',
      // Asset parameters
      brand_colors_primary: '#0ea5e9',
      brand_colors_secondary: '#10b981',
      brand_colors_accent: '#6366f1',
      brand_typography_headings: 'Space Grotesk',
      brand_typography_body: 'Inter',
      brand_tone_of_voice: 'Professional, objective, clean corporate',
      design_mood: 'Minimalist Modern High Contrast',
      branding_readiness_logo: 'need help',
      branding_readiness_colors: 'yes',
      content_readiness_copy: 'no',
      content_readiness_photos: 'no',
      domain_name: '',
      domain_registrar: '',
      domain_dns_setup_status: 'Awaiting Setup',
      hosting_staging_platform: 'Clarity Cloud Managed',
      external_analytics_id: '',
      estimated_start_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      target_launch_date: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString().split('T')[0],
    };
  });

  // Load check on mount
  useEffect(() => {
    const cachedToken = localStorage.getItem('clarity_recent_project_token');
    const cachedName = localStorage.getItem('clarity_recent_project_name');
    if (cachedToken) {
      setRecentToken(cachedToken);
    }
    if (cachedName) {
      setRecentName(cachedName);
    }

    // Auto-load token from search parameters if present
    const paramToken = searchParams.get('token') || searchParams.get('secure_token') || searchParams.get('id');
    if (paramToken) {
      handleLoadProjectByToken(paramToken);
    }
  }, []);

  // Sync state transitions based on project status loaded
  useEffect(() => {
    if (projectData) {
      // Pre-fill formData if the user decides to go back and edit
      setFormData(prev => ({
        ...prev,
        business_name: projectData.business_name || prev.business_name,
        contact_name: projectData.contact_name || prev.contact_name,
        email: projectData.email || prev.email,
        phone: projectData.phone || prev.phone,
        notes: projectData.special_request || projectData.notes || prev.notes,
        selected_package: projectData.selected_package || prev.selected_package,
        selected_pages: projectData.selected_pages || prev.selected_pages,
        selected_addons: projectData.selected_addons || prev.selected_addons,
      }));

      const status = projectData.status || '';
      const requestedStep = searchParams.get('step');
      const validSteps = ['welcome', 'configure', 'proposal', 'deposit', 'assets', 'development', 'launch'];
      if (requestedStep && validSteps.includes(requestedStep)) {
        setActiveStep(requestedStep as any);
      } else if (status === 'Review & Send Quote' || status === 'Proposal Approved') {
        setActiveStep('proposal');
      } else if (status === 'Assets Requested') {
        setActiveStep('assets');
      } else if (status === 'Assets Received' || status === 'Design Draft Ready' || status === 'Deposit Requested' || status === 'Deposit Paid' || status === 'Design Draft Approved' || status === 'Design Approved') {
        setActiveStep('deposit');
      } else if (status === 'Build Started' || status === 'First Preview Sent') {
        setActiveStep('development');
      } else if (status === 'Client Review' || status === 'Revisions' || status === 'Final Review' || status === 'Launch Ready' || status === 'Launched' || status === 'Completed' || status === 'Testimonial Requested') {
        setActiveStep('launch');
      } else {
        setActiveStep('proposal');
      }

      // Sync local signature
      if (projectData.signature_name) {
        setSigneeName(projectData.signature_name);
      }
    }
  }, [projectData]);

  // Safe update project helper
  const handleUpdateProjectRemote = async (updates: any) => {
    if (!projectData) return;
    const sanitizedUpdates = {
      ...updates,
      updated_at: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString()
    };

    try {
      if (!isFirebaseConfigured) {
        updateLocalFallback(projectData.id, sanitizedUpdates);
        setProjectData((prev: any) => ({ ...prev, ...sanitizedUpdates }));
        return;
      }
      const ref = doc(db, projectData.collection || 'intakes', projectData.id);
      await withTimeout(updateDoc(ref, sanitizedUpdates), 4000);
      setProjectData((prev: any) => ({ ...prev, ...sanitizedUpdates }));
    } catch (e) {
      console.warn("Firebase update failed, updating local copy", e);
      updateLocalFallback(projectData.id, sanitizedUpdates);
      setProjectData((prev: any) => ({ ...prev, ...sanitizedUpdates }));
    }
  };

  // Input Handlers
  const fillFormValue = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleFormArray = (key: 'selected_goals' | 'selected_pages' | 'selected_addons', item: string) => {
    setFormData(prev => {
      const current = prev[key] || [];
      if (current.includes(item)) {
        return { ...prev, [key]: current.filter(i => i !== item) };
      }
      return { ...prev, [key]: [...current, item] };
    });
  };

  // Safe token loader
  const handleLoadProjectByToken = async (tokenToLoad: string) => {
    if (!tokenToLoad.trim()) return;
    setIsLoadingProject(true);
    setErrorProject('');

    try {
      if (!isFirebaseConfigured) {
        const localItems = getLocalFallbackSubmissions();
        const match = localItems.find(item => item.data?.secure_token === tokenToLoad.trim());
        if (match) {
          setProjectData({ id: match.id, collection: match.collection, ...match.data });
          localStorage.setItem('clarity_recent_project_token', tokenToLoad.trim());
          localStorage.setItem('clarity_recent_project_name', match.data.business_name || 'Your Project');
        } else {
          setErrorProject('Reference token not found in offline safety cache.');
        }
        setIsLoadingProject(false);
        return;
      }

      // Online Firestore query search
      const intakesQuery = query(collection(db, "intakes"), where("secure_token", "==", tokenToLoad.trim()));
      const intakesSnap = await getDocs(intakesQuery);

      if (!intakesSnap.empty) {
        const d = intakesSnap.docs[0];
        setProjectData({ id: d.id, collection: 'intakes', ...d.data() });
        localStorage.setItem('clarity_recent_project_token', tokenToLoad.trim());
        localStorage.setItem('clarity_recent_project_name', d.data().business_name || 'Your Project');
      } else {
        const outreachQuery = query(collection(db, "outreachLeads"), where("secure_token", "==", tokenToLoad.trim()));
        const outreachSnap = await getDocs(outreachQuery);
        if (!outreachSnap.empty) {
          const d = outreachSnap.docs[0];
          setProjectData({ id: d.id, collection: 'outreachLeads', ...d.data() });
          localStorage.setItem('clarity_recent_project_token', tokenToLoad.trim());
          localStorage.setItem('clarity_recent_project_name', d.data().business_name || 'Your Project');
        } else {
          setErrorProject('Token not recognized. Please audit spelling/syntax.');
        }
      }
    } catch (e: any) {
      console.error(e);
      setErrorProject('Connectivity error. Unable to load project.');
    } finally {
      setIsLoadingProject(false);
    }
  };

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
    // CRM Integration
    if ((text.includes("crm") || text.includes("salesforce") || text.includes("hubspot") || text.includes("api") || text.includes("webhook") || text.includes("zapier")) && !text.includes("payment") && !text.includes("stripe")) {
      cost += 300;
      items.push("Advanced Form & CRM Workflow Sync (A$300)");
    }
    // Accounts / dashboards
    if (text.includes("portal") || text.includes("member") || text.includes("login") || text.includes("database") || text.includes("interactive map")) {
      cost += 355;
      items.push("Client Dashboard & Custom Information Views (A$355)");
    }
    // Max cap the surcharge to avoid crazy numbers
    cost = Math.min(cost, 800);
    return { cost, items };
  };

  // Instant calculation helper for package pricing
  const calculateDerivedQuote = (bypassPromo = false) => {
    // Map current selected page names to valid count or names if needed
    const { total } = calculateQuote(
      formData.selected_package,
      formData.selected_pages.length,
      formData.selected_addons
    );
    
    // specialReqCost can still be added
    const specialReqCost = calculateSpecialRequestSurcharge(formData.notes).cost;
    const derived = total + specialReqCost;
    
    if (discountPercentage > 0 && !bypassPromo) {
      return Math.round(derived * (1 - discountPercentage / 100));
    }
    return derived;
  };

  // Automate Milestone 1 Initiation: Instantly Generate Project Document on Sign up
  const handleCreateNewProject = async () => {
    if (!formData.business_name || !formData.contact_name || !formData.email) {
      setErrorText("Missing core identifiers. Business Name, Contact Person, and Email are mandatory.");
      return;
    }
    setErrorText('');
    setSubmitting(true);

    const generatedSecureToken = projectData?.secure_token || 'cl-' + Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 6);
    const estimate = calculateDerivedQuote();
    const originalEstimate = calculateDerivedQuote(true);

    const projectPayload = {
      ...formData,
      special_request: formData.notes, // Bind both to maintain dual compatibility
      status: 'Review & Send Quote', // Starts at Milestone 1 state
      secure_token: generatedSecureToken,
      suggested_package: `Automated Custom Proposal Package (Est. A$${estimate})`,
      budget_range: `A$${estimate}`,
      estimated_quote_range: `A$${estimate}`,
      original_quote_range: `A$${originalEstimate}`,
      deposit_amount: `A$${Math.round(estimate * 0.5)}`, // Auto compute deposit amount
      promo_code: promoCode.trim().toUpperCase(),
      discount_percentage: discountPercentage,
      scope_approved: false,
      updated_at: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
    };

    try {
      if (projectData?.id) {
         // UPDATE existing document
         if (!isFirebaseConfigured) {
           updateLocalFallback(projectData.id, projectPayload);
         } else {
           const ref = doc(db, projectData.collection || 'intakes', projectData.id);
           await withTimeout(updateDoc(ref, projectPayload), 5000);
         }
         
         setProjectData((prev: any) => ({ ...prev, ...projectPayload }));
         setActiveStep('success');
      } else {
         // CREATE new document
         const initialProjectPayload = {
           ...projectPayload,
           created_at: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
         };

         if (!isFirebaseConfigured) {
           const docId = saveToLocalFallback('intakes', initialProjectPayload);
           setProjectData({ id: docId, collection: 'intakes', ...initialProjectPayload });
           localStorage.setItem('clarity_recent_project_token', generatedSecureToken);
           localStorage.setItem('clarity_recent_project_name', formData.business_name);
           setRecentToken(generatedSecureToken);
           setRecentName(formData.business_name);
           window.location.href = `/static-business-quote?id=${docId}`;
         } else {
           const docRef = await withTimeout(addDoc(collection(db, "intakes"), initialProjectPayload), 5000);
           setProjectData({ id: docRef.id, collection: 'intakes', ...initialProjectPayload });
           localStorage.setItem('clarity_recent_project_token', generatedSecureToken);
           localStorage.setItem('clarity_recent_project_name', formData.business_name);
           setRecentToken(generatedSecureToken);
           setRecentName(formData.business_name);

           // Optional silent api dispatch
           fetch("/api/send-email", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
               name: formData.contact_name,
               email: formData.email,
               phone: formData.phone || "Not specified",
               company: formData.business_name,
               message: `Automated intake onboarding created for token ${generatedSecureToken}.`
             })
           }).catch(e => console.log("Silent notify bypass"));

           window.location.href = `/static-business-quote?id=${docRef.id}`;
         }
      }
    } catch (err: any) {
      console.warn("Database error creating client intake. Falling back to local cache", err);
      // Fallback
      if (projectData?.id) {
         updateLocalFallback(projectData.id, projectPayload);
         setProjectData((prev: any) => ({ ...prev, ...projectPayload }));
         setActiveStep('success');
      } else {
         const initialProjectPayload = { ...projectPayload, created_at: new Date().toISOString() };
         const docId = saveToLocalFallback('intakes', initialProjectPayload);
         setProjectData({ id: docId, collection: 'intakes', ...initialProjectPayload });
         localStorage.setItem('clarity_recent_project_token', generatedSecureToken);
         localStorage.setItem('clarity_recent_project_name', formData.business_name);
         setActiveStep('success');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Automate Milestone 2 Transition: Digital Sign-off Proposal
  const handleApproveProposalSignature = async () => {
    if (!signeeName.trim()) {
      setErrorText("Signature Name cannot be blank.");
      return;
    }
    setErrorText("");
    setSubmitting(true);

    try {
      await handleUpdateProjectRemote({
        signature_name: signeeName,
        signature_date: new Date().toLocaleDateString(),
        scope_approved: true,
        status: 'Assets Requested'
      });
      setActiveStep('assets');
    } catch (e) {
      setErrorText("Intermittent network disconnection. Retrying locally...");
    } finally {
      setSubmitting(false);
    }
  };

  // Automate Design Draft Approval (Client must approve draft before unlocking deposit payment)
  const handleApproveDesignDraft = async () => {
    setSubmitting(true);
    setErrorText("");
    try {
      await handleUpdateProjectRemote({
        design_draft_approved: true,
        design_draft_approved_at: new Date().toLocaleDateString(),
        status: 'Design Draft Approved'
      });
    } catch (e) {
      setErrorText("Intermittent network disconnection. Retrying locally...");
    } finally {
      setSubmitting(false);
    }
  };

  // Automate Deposit Settlement (Simulate mock payment & instantly transition to Step 4)
  const handleProcessDepositSimulated = async () => {
    setIsProcessingPayment(true);
    setErrorText("");

    setTimeout(async () => {
      try {
        await handleUpdateProjectRemote({
          deposit_secured: true,
          deposit_paid_amount: projectData?.deposit_amount || 'A$1,500.00',
          deposit_paid_at: new Date().toISOString(),
          status: 'Deposit Paid' // Shift status to next milestone
        });
        setPaymentSuccess(true);
        setIsProcessingPayment(false);
      } catch (err) {
        setErrorText("Critical gateway error during checkout simulation.");
        setIsProcessingPayment(false);
      }
    }, 2000);
  };

  // Automate Asset Submission & Development kick-off
  const handleSubmitAssetBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorText('');

    try {
      await handleUpdateProjectRemote({
        status: 'Assets Received', // Shifting status to wait for Design Draft
        assets_transferred_at: new Date().toISOString()
      });
      setActiveStep('deposit'); // Advance to Draft & Deposit step
    } catch (e) {
      setErrorText("Network delays detected. Please wait.");
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger Instant Live Website Launch Confetti
  const handleTriggerWebsiteLiveLaunch = async () => {
    setSubmitting(true);
    try {
      await handleUpdateProjectRemote({
        status: 'Launched', // Milestone 5 Complete!
        deployed_live_at: new Date().toISOString()
      });
      setActiveStep('launch');
    } catch (e) {
      console.warn(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans mt-16 pb-20 selection:bg-cyan-500/20 selection:text-cyan-400">
      
      {/* Decorative Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[5%] right-[5%] w-[40%] h-[40%] rounded-full bg-cyan-950/20 blur-[130px]" />
        <div className="absolute bottom-[5%] left-[5%] w-[40%] h-[40%] rounded-full bg-indigo-950/20 blur-[140px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10 pt-4">
        
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors font-mono uppercase tracking-wider mb-2">
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </Link>

        {/* Onboarding top wizard process path tracker */}
        {projectData && (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-800/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-400" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">PROJECT WORKSPACE</h4>
                  <Link
                    to={`/project-status/${projectData.secure_token}`}
                    className="text-[9px] font-mono font-black uppercase text-cyan-400 bg-cyan-950/60 border border-cyan-900/40 px-2 py-0.5 rounded-lg hover:bg-cyan-900/30 hover:border-cyan-500 transition-all flex items-center gap-1 cursor-pointer select-none"
                    title="Switch to detailed Client Portal Hub"
                  >
                    <span>Client Portal</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
                <p className="text-sm font-semibold text-white mt-0.5">{projectData.business_name || 'Interactive Session'}</p>
              </div>
            </div>

            {/* Stepped milestones synced live with client database status */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'Configure', step: 'proposal', active: activeStep === 'proposal' },
                { label: 'Assets', step: 'assets', active: activeStep === 'assets' },
                { label: 'Draft & Deposit', step: 'deposit', active: activeStep === 'deposit' },
                { label: 'Build Assembly', step: 'development', active: activeStep === 'development' },
                { label: 'Go-Live Launch', step: 'launch', active: activeStep === 'launch' || projectData.status === 'Launched' }
              ].map((milestone, idx) => {
                const isSelected = activeStep === milestone.step || (milestone.step === 'launch' && activeStep === 'launch');
                return (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono tracking-wide border uppercase select-none transition-all ${
                      isSelected 
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-md shadow-cyan-500/10' 
                        : 'bg-slate-950 text-slate-500 border-slate-900'
                    }`}>
                      {idx + 1}. {milestone.label}
                    </span>
                    {idx < 4 && <ChevronRight className="w-3 h-3 text-slate-700 hidden sm:inline" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save & Resume Link Copy Widget */}
        {projectData && projectData.secure_token && (
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden animate-fadeIn text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-1.5 text-left max-w-lg relative z-10">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 text-[10px] font-mono tracking-wider uppercase rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                Multi-Device Resume Enabled
              </span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-1">
                <span>📱 Save &amp; Resume Link</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Starting on mobile? Copy this secure magic link to seamlessly resume your intake checklist and contract session on your desktop or another browser at any time.
              </p>
            </div>
            <div className="w-full md:w-auto md:min-w-[280px] space-y-1.5 relative z-10">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-3 py-2 rounded-xl relative select-all w-full">
                <span className="text-[10px] font-mono text-cyan-300 font-bold truncate flex-1 min-w-0">
                  {`${window.location.origin}/client-intake?token=${projectData.secure_token}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/client-intake?token=${projectData.secure_token}`);
                    setCopiedResume(true);
                    setTimeout(() => setCopiedResume(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg text-[9px] font-black tracking-wider uppercase bg-slate-900 border border-slate-800 hover:bg-cyan-500 hover:text-slate-950 transition cursor-pointer select-none text-cyan-400 font-mono flex items-center gap-1 shrink-0"
                >
                  {copiedResume ? (
                    <>Copied ✓</>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
           {/* =======================================================
            PATH A: WELCOME / RETRIEVE PROJECT
            ======================================================= */}
        {activeStep === 'welcome' && (
          <div className="py-12 space-y-8 animate-fadeIn mt-6 max-w-4xl mx-auto">
            
            <div className="text-center space-y-3">
              <span className="px-3 py-1 border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
                Website Inquiry System
              </span>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight font-display">
                Get a Custom Website Quote
              </h1>
              <p className="text-slate-400 max-w-xl mx-auto font-light text-sm sm:text-base leading-relaxed">
                Tell us about your business, select a basic package, and we’ll review your details to provide a simplified website plan, price guidelines, and next steps quickly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              
              {/* Box A1: Start Website Request */}
              <div className="bg-slate-900 border border-slate-805 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-slate-700/80 transition relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-350" />
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Start a Website Request</h3>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-light">
                      Fill out our friendly 2-minute form to let us know what kind of website you need, your budget, and business details.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveStep('configure')}
                  className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Start Request Form <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Box A2: Continue My Project */}
              <div className="bg-slate-900 border border-slate-805 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-slate-700/80 transition relative overflow-hidden">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-950/45 border border-indigo-900/30 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">Continue My Project</h3>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-light">
                      Already filled out the form? Enter your secure tracking code below to check status, upload photos, or approve plans.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider uppercase text-slate-500">Secure Tracking Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="e.g. cl-g92j5b..."
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white font-mono outline-none"
                      />
                      <button
                        onClick={() => handleLoadProjectByToken(tokenInput)}
                        disabled={isLoadingProject}
                        className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer text-center"
                      >
                        {isLoadingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Load'}
                      </button>
                    </div>
                  </div>
                  {errorProject && <p className="text-[11px] text-red-400 font-medium">{errorProject}</p>}
                </div>
              </div>

            </div>

            {/* Quick Resume detected block */}
            {recentToken && (
              <div className="max-w-md mx-auto p-4 bg-[#0a1122]/80 border border-cyan-800/30 rounded-2xl flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                  <div className="text-left">
                    <span className="block text-[10px] font-mono uppercase text-slate-500">Active Inquiry Cached</span>
                    <span className="text-xs font-semibold text-white leading-normal truncate block max-w-[200px]">{recentName || 'Active Session'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleLoadProjectByToken(recentToken)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 xs:text-xs text-[10px] uppercase font-mono font-bold rounded-xl hover:opacity-90 transition cursor-pointer shrink-0 animate-pulse"
                >
                  Resume <ArrowRight className="w-3 h-3 inline ml-1" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =======================================================
            PATH B: CONFIGURE SCOPE & INTERACTIVE ESTIMATOR
            ======================================================= */}
        {activeStep === 'configure' && (
          <div className="py-6 space-y-8 animate-fadeIn text-left max-w-4xl mx-auto font-sans">
            <div>
              <button 
                onClick={() => setActiveStep('welcome')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-550 hover:text-cyan-400 font-mono uppercase transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Go Back
              </button>
              <h2 className="text-3xl font-black text-white mt-4 tracking-tight">Website Enquiry Form</h2>
              <p className="text-slate-400 text-xs sm:text-sm font-light mt-1">
                Tell us about your business and website needs. We’ll review your details and send back a simple website plan, price and next steps.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
                
                {/* Section 1: Business Details */}
                <div className="space-y-4 text-left">
                  <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest block border-b border-slate-800 pb-2">1. Contact &amp; Business Information</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-500">Business Name *</label>
                      <input 
                        type="text" 
                        value={formData.business_name} 
                        onChange={(e) => fillFormValue('business_name', e.target.value)}
                        placeholder="Your company, store, or brand name"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-500">Contact Partner Name *</label>
                      <input 
                        type="text" 
                        value={formData.contact_name} 
                        onChange={(e) => fillFormValue('contact_name', e.target.value)}
                        placeholder="e.g. David Miller"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-500">Email Address *</label>
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => fillFormValue('email', e.target.value)}
                        placeholder="hello@yourbrand.com"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1.5 font-sans">
                      <label className="text-[10px] font-mono uppercase text-slate-500">Phone Number *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.phone} 
                        onChange={(e) => fillFormValue('phone', e.target.value)}
                        placeholder="e.g. +61 400 123 456"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-500">Current website URL (Optional)</label>
                      <input 
                        type="text" 
                        value={formData.website_url || ''} 
                        onChange={(e) => fillFormValue('website_url', e.target.value)}
                        placeholder="e.g. https://mycurrentsite.com"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-500">Business / Industry Type *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.industry} 
                        onChange={(e) => fillFormValue('industry', e.target.value)}
                        placeholder="e.g. Local trade business, Legal consulting, Gym"
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Website Preferred Level */}
                <div className="space-y-4 pt-4 text-left">
                  <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest block border-b border-slate-850 pb-2">
                    2. Select Your Preferred Website Level
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        id: 'landing_page',
                        name: 'Starter Website',
                        price: 'from A$1,500',
                        desc: 'Perfect for single marketing campaigns, new offers, or testing a business idea.'
                      },
                      {
                        id: 'small_business_website',
                        name: 'Business Website',
                        price: 'from A$3,500',
                        desc: 'Ideal for local services, trades, consultants, and established small businesses.'
                      },
                      {
                        id: 'growth_website_client_workflow',
                        name: 'Growth Website',
                        price: 'from A$5,500+',
                        desc: 'For businesses that want a stronger online presence, booking support, and smooth client follow-up.'
                      }
                    ].map(pkg => {
                      const isSelected = formData.selected_package === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => {
                            fillFormValue('selected_package', pkg.id);
                            // Pre-fill pages array according to package defaults to keep backend logic seamless
                            if (pkg.id === 'landing_page') {
                              fillFormValue('selected_pages', ['Home']);
                            } else if (pkg.id === 'small_business_website') {
                              fillFormValue('selected_pages', ['Home', 'About', 'Services', 'Contact']);
                            } else {
                              fillFormValue('selected_pages', ['Home', 'About', 'Services', 'Contact', 'Blog', 'Booking']);
                            }
                          }}
                          className={`p-5 text-left rounded-2xl border text-xs cursor-pointer select-none transition-all flex flex-col justify-between space-y-3 ${
                            isSelected 
                              ? 'bg-cyan-950/25 border-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
                              : 'bg-slate-950/50 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <div>
                            <span className={`text-base font-bold block ${isSelected ? 'text-cyan-400' : 'text-white'}`}>
                              {pkg.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-0.5 uppercase tracking-wide">
                              {pkg.price}
                            </span>
                          </div>
                          
                          <p className="text-[11px] leading-relaxed text-slate-400 font-light">
                            {pkg.desc}
                          </p>
                          
                          <div className="flex items-center gap-1.5 pt-2">
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-400/20' : 'border-slate-700'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                            </div>
                            <span className={`text-[10px] uppercase font-mono font-bold tracking-wider ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                              {isSelected ? '✓ Selected' : 'Choose Level'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                         {/* Section 3: Budget and Timeline */}
                <div className="space-y-4 pt-4 text-left">
                  <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest block border-b border-slate-850 pb-2">
                    3. Budget &amp; Timeline
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono uppercase text-slate-500">Proposed Budget Range *</label>
                      <select 
                        value={formData.budget_range}
                        onChange={(e) => fillFormValue('budget_range', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-xs text-white outline-none transition-all font-sans"
                      >
                        <option value="A$1,500–A$2,500">A$1,500 – A$2,500 (Starter website)</option>
                        <option value="A$3,500–A$4,500">A$3,500 – A$4,500 (Standard Business Website)</option>
                        <option value="A$4,500–A$6,500">A$4,500 – A$6,500 (Expanded Business Hub)</option>
                        <option value="A$6,500–A$10,000">A$6,500 – A$10,000 (Growth/Custom Business Workflow)</option>
                        <option value="A$10,000+">A$10,000+ (Custom bespoke platform integration)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono uppercase text-slate-500">Desired Timeline *</label>
                      <select 
                        value={formData.timeline}
                        onChange={(e) => fillFormValue('timeline', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-xs text-white outline-none transition-all font-sans"
                      >
                        <option value="Under 2 weeks">Urgent (Under 2 weeks)</option>
                        <option value="2–4 weeks">Standard (2–4 weeks)</option>
                        <option value="1–2 months">Flexible (1–2 months)</option>
                        <option value="No rush">Bespoke phase (No rush)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Specific Project Details */}
                <div className="space-y-4 pt-4 text-left">
                  <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest block border-b border-slate-850 pb-2">
                    4. Specific Project Requirements
                  </span>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono uppercase text-slate-500 block">Current Online Presence / Socials</label>
                      <input 
                        type="text"
                        value={formData.current_online_presence} 
                        onChange={(e) => fillFormValue('current_online_presence', e.target.value)}
                        placeholder="Current website domain, Instagram handle, Facebook page, etc."
                        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-xs text-slate-200 outline-none transition-all font-sans"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-mono uppercase text-slate-500 block">Who is your ideal target audience?</label>
                        <textarea 
                          value={formData.target_audience} 
                          onChange={(e) => fillFormValue('target_audience', e.target.value)}
                          placeholder="e.g. Local homeowners, corporate clients in Sydney, etc."
                          className="w-full h-24 bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-cyan-500/10 transition-all font-sans leading-relaxed resize-none"
                        />
                      </div>
                      
                      <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-mono uppercase text-slate-500 block">Any reference websites you like?</label>
                        <textarea 
                          value={formData.reference_websites} 
                          onChange={(e) => fillFormValue('reference_websites', e.target.value)}
                          placeholder="Links to competitors or websites with a style you admire."
                          className="w-full h-24 bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-cyan-500/10 transition-all font-sans leading-relaxed resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono uppercase text-slate-500 block">General Notes &amp; Core Requirements</label>
                      <textarea 
                        value={formData.notes} 
                        onChange={(e) => fillFormValue('notes', e.target.value)}
                        placeholder="Tell us what this website should focus on, specific pages you need, or special interactive features."
                        className="w-full h-28 bg-slate-950 border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:ring-1 focus:ring-cyan-500/10 transition-all font-sans leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Promo Code area */}
                <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-800/50">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-mono uppercase text-slate-500">Voucher / Referral Code (Optional)</span>
                    <input 
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        if (e.target.value.trim().toUpperCase() === "CLARITY10") {
                          setDiscountPercentage(10);
                        } else {
                          setDiscountPercentage(0);
                        }
                      }}
                      placeholder="Enter promo code"
                      className="bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-1.5 text-[10px] text-white font-mono uppercase outline-none w-36"
                    />
                  </div>
                  
                  {discountPercentage > 0 && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                      ✓ CLARITY10 Code Applied (-10% Savings)
                    </span>
                  )}
                </div>

              </div>

              {errorText && (
                <div className="p-3.5 bg-red-950/20 border border-red-500/10 text-red-300 text-xs rounded-xl font-medium text-left">
                  {errorText}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveStep('welcome')}
                  className="px-6 py-3 bg-slate-950 border border-slate-850 hover:border-slate-750 text-slate-400 hover:text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer select-none"
                >
                  Cancel &amp; Home
                </button>
                
                <button
                  type="button"
                  onClick={handleCreateNewProject}
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-md shadow-cyan-500/15 flex items-center justify-center gap-2 cursor-pointer select-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                    </>
                  ) : (
                    'Submit Website Request'
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =======================================================
            PATH C: MILESTONE 1 (AUTO-GENERATED DIGITAL PROPOSAL)
            ======================================================= */}
        {activeStep === 'proposal' && projectData && (
          <div className="py-6 space-y-8 animate-fadeIn text-left max-w-3xl mx-auto">
            <div className="space-y-2">
              <span className="px-3 py-1 border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
                Milestone 1 — Automated Contract Proposal
              </span>
              <h2 className="text-3xl font-black text-white mt-4">Review &amp; Sign Scope Agreement</h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <p className="text-slate-400 text-xs sm:text-sm font-light">Your contract agreement is generated instantly based on configuration parameters. Inspect terms and sign digitally below.</p>
                {(!projectData.status || projectData.status === 'Review & Send Quote' || projectData.status === 'Proposal Approved') && (
                  <button 
                    onClick={() => setActiveStep('configure')}
                    className="shrink-0 px-4 py-2 border border-slate-700 hover:border-cyan-500 hover:text-cyan-400 text-slate-300 text-xs font-mono uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-2"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Edit Scope
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">CLARITY SPACE DIGITAL PROPOSAL</h3>
                  <p className="text-slate-500 text-xs font-mono mt-1">No. {projectData.secure_token || 'TEMP-M1'}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl leading-tight font-mono text-right text-xs">
                  <p className="text-slate-500">Proposed Fee:</p>
                  <p className="text-white font-bold text-base mt-0.5">{projectData.budget_range || 'A$1,950'}</p>
                </div>
              </div>

              {/* Scope Parameters breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">1. Proposed Deliverables &amp; Inclusions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/70 border border-slate-850 rounded-2xl text-xs space-y-2">
                    <span className="font-semibold text-white block">Proposed Navigation Map</span>
                    <div className="flex flex-wrap gap-1">
                      {((projectData.selected_pages || []).length > 0 ? projectData.selected_pages : ['Home', 'AboutUs', 'Services', 'Contact']).map((p: string, idx: number) => (
                        <span key={idx} className="bg-slate-900 px-2 py-1 rounded text-slate-300 font-mono text-[10px]">📄 {p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950/70 border border-slate-850 rounded-2xl text-xs space-y-2">
                    <span className="font-semibold text-white block">Workflow Addons &amp; Modules</span>
                    <div className="flex flex-wrap gap-1">
                      {((projectData.selected_addons || []).length > 0 ? projectData.selected_addons : ['advanced_quote_form', 'email_notification_automation']).map((f: string, idx: number) => {
                         const feat = Object.values(appPackages).flatMap(p => p.inclusions || []).includes(f) 
                          ? f.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                          : f.replace(/_/g, ' '); 
                         // To make sure we show it right, it's a bit hard to map `f` to name exactly here if it's not selected, but let's just show it.
                         return <span key={idx} className="bg-slate-900 px-2 py-1 rounded text-cyan-300 font-mono text-[10px] capitalize">⚡ {feat.replace(/_/g, ' ')}</span>
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Clauses */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">2. Standard Contractual Obligations</h4>
                <div className="bg-slate-950 border border-slate-855 rounded-2xl p-4 max-h-48 overflow-y-auto text-xs text-slate-400 font-light space-y-3 leading-relaxed custom-scrollbar">
                  <p><strong className="text-slate-200">2.1 Phasing:</strong> Build assembly is locked into our operational sprints immediately upon approval of the signed design contract and first phase deposit settlement (deposit equivalent to 50% or flat rate lock shown in Milestone 2).</p>
                  <p><strong className="text-slate-200">2.2 Revision Caps:</strong> Revision loops are capped at two comprehensive visual reviews. Tweaks may be registered dynamically via Staging Clipboard logs as outlined in Milestone 4.</p>
                  <p><strong className="text-slate-200">2.3 Intellectual Property:</strong> Complete trademark licenses are handed over entirely following the final launching steps, and settlement of outstanding invoices.</p>
                  <p><strong className="text-slate-200">2.4 Compliance:</strong> David / Clarity Space guarantees adherence to Australian secure web directives &amp; ADA contrast benchmarks during build implementation.</p>
                </div>
              </div>

              {/* Signature Terminal */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">3. Digital Sign-off Authorization</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Signee Contact Person Name *</label>
                    <input 
                      type="text"
                      value={signeeName}
                      onChange={(e) => setSigneeName(e.target.value)}
                      placeholder="Type your full name to sign"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Approval Date</label>
                    <input 
                      type="text"
                      value={signatureDate}
                      disabled
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-slate-500 font-mono select-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 text-cyan-300 text-xs rounded-xl font-light">
                  📝 Digitally approving this contract acts as a commercial sign-off, which immediately triggers booking deposit options.
                </div>

                {errorText && (
                  <p className="text-red-400 text-xs font-semibold">{errorText}</p>
                )}

                <button
                  type="button"
                  onClick={handleApproveProposalSignature}
                  disabled={submitting}
                  className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-md hover:shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '✍️ Approve &amp; Sign Scope Agreement'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =======================================================
            PATH D: MILESTONE 2 (SECURE BOOKING DEPOSIT SIMULATION)
            ======================================================= */}
        {activeStep === 'deposit' && projectData && (
          <div className="py-6 space-y-8 animate-fadeIn text-left max-w-2xl mx-auto">
            {projectData.status === 'Assets Received' ? (
              <>
                <div className="space-y-2">
                  <span className="px-3 py-1 border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
                    Milestone 2 — Design Draft & Deposit
                  </span>
                  <h2 className="text-3xl font-black text-white mt-4">Drafting in Progress</h2>
                  <p className="text-slate-400 text-xs sm:text-sm font-light mt-1">We have received your assets. Our team is currently preparing your initial design draft.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden text-center">
                  <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-wider">Creating Initial Design Draft</h3>
                  <p className="text-slate-400 text-xs font-light max-w-md mx-auto leading-relaxed">
                    Check back soon. Once the design draft is ready for your review, you'll be able to approve it and proceed with the kickoff deposit to initiate the full build assembly.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <span className="px-3 py-1 border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
                    Milestone 2 — Design Draft &amp; Deposit
                  </span>
                  <h2 className="text-3xl font-black text-white mt-4">Review Design Draft &amp; Pay Deposit</h2>
                  <p className="text-slate-400 text-xs sm:text-sm font-light mt-1">First, review and approve your initial custom design draft mockup below. Once you are 100% happy and approve the mockups, the secure kickoff payment instructions will unlock to initiate the full build assembly.</p>
                </div>

                {/* STEP 1: REVIEW AND APPROVE DESIGN DRAFT */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold border border-cyan-500/20">
                      1
                    </span>
                    <h3 className="text-sm font-mono uppercase text-white font-bold tracking-wider">Design Draft Inscription Review</h3>
                  </div>

                  {projectData.design_draft_url ? (
                    <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                      <div className="text-left space-y-1">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">Draft Mockup Ready</span>
                        <p className="text-xs text-slate-300 font-light leading-relaxed">
                          Your visual layout mockup is completely compiled and ready for review.
                        </p>
                      </div>
                      <a href={projectData.design_draft_url} target="_blank" rel="noreferrer" className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition">
                        Open Design Draft Screen
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-left space-y-1.5 animate-fadeIn">
                      <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider block font-bold">Awaiting Live Render Link</span>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        David is busy compiling your high-resolution responsive design draft. The approval controls and initial kickoff deposit will unlock as soon as your custom visual drafts are compiled and presented here.
                      </p>
                    </div>
                  )}

                  {projectData.design_draft_approved ? (
                    <div className="p-4 bg-emerald-950/30 border border-emerald-900/30 text-emerald-400 text-xs rounded-2xl space-y-1.5 font-bold animate-fadeIn text-center flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div className="text-left font-sans">
                        <span className="block text-white font-bold text-sm">Design Draft Approved!</span>
                        <span className="block text-slate-400 text-[11px] font-light mt-0.5 font-sans">Approved via secure signature on {projectData.design_draft_approved_at || new Date().toLocaleDateString()}. Milestone payment is unlocked below.</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApproveDesignDraft}
                      disabled={submitting || !projectData.design_draft_url}
                      className={`w-full py-3.5 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        !projectData.design_draft_url 
                          ? 'bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed shadow-none' 
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-cyan-500/25'
                      }`}
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : !projectData.design_draft_url ? (
                        'Awaiting Design Link to Approve'
                      ) : (
                        '✍️ Approve & sign-off design mockups'
                      )}
                    </button>
                  )}
                </div>

                {/* STEP 2: MILESTONE DEPOSIT PAYMENT */}
                <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all duration-305 ${!projectData.design_draft_approved ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono text-xs font-bold border border-cyan-500/20">
                      2
                    </span>
                    <h3 className="text-sm font-mono uppercase text-white font-bold tracking-wider flex items-center gap-2">
                      <span>Milestone Kickoff Deposit</span>
                      {!projectData.design_draft_approved && (
                        <span className="text-[9px] bg-slate-950 border border-slate-800 text-slate-500 px-2 py-0.5 rounded uppercase tracking-widest">Locked</span>
                      )}
                    </h3>
                  </div>

                  {!projectData.design_draft_approved ? (
                    <div className="text-center py-6 space-y-3">
                      <Lock className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                      <h4 className="text-white text-sm font-bold">Secure Billing Address Locked</h4>
                      <p className="text-slate-505 text-xs font-light max-w-sm mx-auto leading-relaxed">
                        We believe in absolute client confidence. Invoicing coordinates and EFT bank accounts do not expose until you formally open, review and approve your draft mockup above.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2 text-center">
                        <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-cyan-500/20">
                          <Building className="w-8 h-8 text-cyan-400 animate-bounce" />
                        </div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Design Approved &amp; Deposit Due</h3>
                        <p className="text-slate-400 text-xs font-light max-w-md mx-auto leading-relaxed">
                          By settling this kickoff deposit directly via electronic funds transfer (EFT) or credit card (if a link is provided), you formally register development slots for the live coding phase.
                        </p>
                      </div>

                      {/* Deposit Invoice Details */}
                      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 text-left max-w-sm mx-auto space-y-3 text-xs font-mono">
                        <div className="flex justify-between border-b border-slate-850 pb-2">
                          <span className="text-slate-500">Invoice Ref:</span>
                          <span className="text-slate-300">#DEP-{projectData.secure_token?.substring(3, 8) || 'M2'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Contract Scope:</span>
                          <span className="text-slate-300">Kickoff Deposit</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-850 pb-2">
                          <span className="text-slate-500">Approved Fee:</span>
                          <span className="text-slate-300">{projectData.budget_range || 'A$1,950'}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-1">
                          <span className="text-cyan-400 font-sans">Payment Due:</span>
                          <span className="text-white font-bold">{projectData.deposit_amount || 'A$1,500.00'}</span>
                        </div>
                      </div>

                      {/* Secure Payment Link Panel */}
                      {projectData.payment_link && (
                        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 max-w-sm mx-auto space-y-4 text-center animate-fadeIn">
                          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold border-b border-slate-800/60 pb-1.5 select-none">
                            Credit Card
                          </span>
                          <a href={projectData.payment_link} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm transition shadow-lg w-full">
                             Pay Securely Online
                             <CreditCard className="w-4 h-4 ml-1" />
                          </a>
                        </div>
                      )}

                      {/* Bank EFT Instructions Panel */}
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 max-w-sm mx-auto space-y-3 text-left animate-fadeIn">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold border-b border-slate-800/60 pb-1.5 select-none">
                          EFT Deposit Instructions
                        </span>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">Bank Name:</span>
                            <strong className="text-white font-medium">Commonwealth Bank (CBA)</strong>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">Account Name:</span>
                            <strong className="text-white font-medium">Clarity Space Agency</strong>
                          </div>

                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">BSB Number:</span>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-white font-mono font-semibold">082-356</strong>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText("082-356");
                                  setCopiedBsb(true);
                                  setTimeout(() => setCopiedBsb(false), 2000);
                                }}
                                className="p-1 hover:bg-slate-900 border border-slate-800 rounded transition text-slate-400 hover:text-cyan-400 cursor-pointer flex items-center justify-center"
                                title="Copy BSB"
                              >
                                {copiedBsb ? (
                                  <span className="text-[9px] font-bold text-emerald-400">Copied</span>
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">Account Number:</span>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-white font-mono font-semibold">445141498</strong>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText("445141498");
                                  setCopiedAccountNumber(true);
                                  setTimeout(() => setCopiedAccountNumber(false), 2000);
                                }}
                                className="p-1 hover:bg-slate-900 border border-slate-800 rounded transition text-slate-400 hover:text-cyan-400 cursor-pointer flex items-center justify-center"
                                title="Copy Account Number"
                              >
                                {copiedAccountNumber ? (
                                  <span className="text-[9px] font-bold text-emerald-400 font-mono">Copied</span>
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-400">Reference:</span>
                            <strong className="text-cyan-400 font-mono">
                              Clarity-{projectData.secure_token?.substring(3, 8).toUpperCase() || 'DEP'}
                            </strong>
                          </div>
                        </div>

                        {/* EFT Processing clearance warning */}
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                            <Clock className="w-3.5 h-3.5" />
                            <span>EFT Clearance Notice</span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-light">
                            Bank transfers (Electronic Funds Transfer) typically require <strong>1 to 2 business days</strong> to clear. If you require <strong>immediate kickoff and visual drafting</strong>, please email a PDF payment confirmation receipt using the support chat or David directly.
                          </p>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-snug pt-2 border-t border-slate-800/60 font-light italic">
                          * Settle via bank transfer, then click confirmation below to notify project engineers.
                        </p>
                      </div>

                      {/* Payment Processing States */}
                      {isProcessingPayment && (
                        <div className="p-4 bg-[#0a1122]/60 border border-cyan-800/25 rounded-2xl space-y-3">
                          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
                          <p className="text-xs text-cyan-400 font-mono tracking-wider animate-pulse font-bold text-center">Verifying EFT settlement references...</p>
                        </div>
                      )}

                      {(paymentSuccess || projectData.status === 'Deposit Paid') ? (
                        <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-xs rounded-2xl space-y-1.5 font-bold animate-fadeIn text-center">
                          <p className="flex items-center justify-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" /> DEPOSIT CONFIRMED!</p>
                          <p className="text-slate-400 text-[11px] font-light">Your initial design draft has been approved and your deposit is cleared. Waiting for our engineers to finalize the build framework.</p>
                        </div>
                      ) : (
                        <div>
                          {errorText && (
                            <p className="text-red-400 text-xs font-semibold text-center mt-2">{errorText}</p>
                          )}

                          {!isProcessingPayment && (
                            <button
                              type="button"
                              onClick={handleProcessDepositSimulated}
                              className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer w-full max-w-sm mx-auto"
                            >
                              🏦 Confirm Bank EFT Sent
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* =======================================================
            PATH E: MILESTONE 3 (ASSETS & BRAND CHECKLIST SCREEN)
            ======================================================= */}
        {activeStep === 'assets' && projectData && (
          <div className="py-6 space-y-8 animate-fadeIn text-left max-w-3xl mx-auto">
            <div className="space-y-2">
              <span className="px-3 py-1 border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
                Milestone 3 — Creative Ingestion Checklists
              </span>
              <h2 className="text-3xl font-black text-white mt-4">Brand Asset &amp; Content Handover</h2>
              <p className="text-slate-400 text-xs sm:text-sm font-light mt-1">Specify brand directories, visual settings, custom copy or website urls. On completion David initiates visual coding.</p>
            </div>

            <form onSubmit={handleSubmitAssetBlueprint} className="space-y-6">
              
              {/* Part 1: Visual Settings */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 space-y-5">
                <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest block border-b border-slate-800 pb-1.5">1. Visual Branding Preferences</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Primary Color Theme</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={projectData.brand_colors_primary || '#0ea5e9'} 
                        onChange={(e) => handleUpdateProjectRemote({ brand_colors_primary: e.target.value })}
                        className="w-10 h-10 p-0 bg-transparent border border-slate-800 rounded cursor-pointer shrink-0"
                      />
                      <input 
                        type="text" 
                        value={projectData.brand_colors_primary || '#0ea5e9'} 
                        onChange={(e) => handleUpdateProjectRemote({ brand_colors_primary: e.target.value })}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-xs text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Secondary Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={projectData.brand_colors_secondary || '#10b981'} 
                        onChange={(e) => handleUpdateProjectRemote({ brand_colors_secondary: e.target.value })}
                        className="w-10 h-10 p-0 bg-transparent border border-slate-800 rounded cursor-pointer shrink-0"
                      />
                      <input 
                        type="text" 
                        value={projectData.brand_colors_secondary || '#10b981'} 
                        onChange={(e) => handleUpdateProjectRemote({ brand_colors_secondary: e.target.value })}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-xs text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Accent Highlight</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={projectData.brand_colors_accent || '#6366f1'} 
                        onChange={(e) => handleUpdateProjectRemote({ brand_colors_accent: e.target.value })}
                        className="w-10 h-10 p-0 bg-transparent border border-slate-800 rounded cursor-pointer shrink-0"
                      />
                      <input 
                        type="text" 
                        value={projectData.brand_colors_accent || '#6366f1'} 
                        onChange={(e) => handleUpdateProjectRemote({ brand_colors_accent: e.target.value })}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 text-xs text-white font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Display Headings Font Face</label>
                    <input 
                      type="text" 
                      value={projectData.brand_typography_headings || 'Space Grotesk'} 
                      onChange={(e) => handleUpdateProjectRemote({ brand_typography_headings: e.target.value })}
                      placeholder="e.g. Montserrat, Playfair Display"
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-500">Design Theme &amp; Decor Mood</label>
                    <input 
                      type="text" 
                      value={projectData.design_mood || 'Minimalist dark cosmic slate'} 
                      onChange={(e) => handleUpdateProjectRemote({ design_mood: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Part 2: Logo and Copy references */}
              <div className="bg-slate-900 border border-slate-855 rounded-3xl p-6 space-y-5">
                <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest block border-b border-slate-800 pb-1.5">2. Content &amp; Media Handover Documents</span>

                <div className="space-y-3">
                  {[
                    { key: 'branding_readiness_logo', label: 'Company Brand Logo Available?', desc: 'SVG vector format handles high-resolution scaling best' },
                    { key: 'content_readiness_copy', label: 'Copywriting / Page Texts and Service Outline?', desc: 'pasted details or draft Google Doc works fine' },
                    { key: 'domain_status', label: 'Domain Name and Credentials Active?', desc: 'Custom address e.g. yourbusiness.com.au registered' },
                  ].map(asset => {
                    const activeVal = projectData[asset.key] || 'no';
                    return (
                      <div key={asset.key} className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-semibold text-white block">{asset.label}</span>
                          <span className="text-[10px] text-slate-550 block mt-0.5 leading-snug">{asset.desc}</span>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          {['yes', 'no', 'need help'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleUpdateProjectRemote({ [asset.key]: opt })}
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold font-mono uppercase cursor-pointer select-none transition-all ${
                                activeVal === opt
                                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Visual Media Drag and Drop Zone with Alerts/Warnings */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-mono uppercase text-slate-500 block">Direct Logo &amp; Asset File Uploader</label>
                  
                  <div 
                    className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/40 rounded-2xl p-6 text-center space-y-3 transition-colors duration-200 cursor-pointer relative group"
                    onClick={() => document.getElementById('dropzone-file-input')?.click()}
                  >
                    <input 
                      type="file" 
                      id="dropzone-file-input" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files) {
                          const filesArray = Array.from(e.target.files) as File[];
                          const newUploaded: typeof uploadedFiles = [];
                          let tooLargeCount = 0;
                          let invalidTypeCount = 0;

                          // Allowed extensions: svg, png, jpg, jpeg, pdf, zip
                          const allowedExtensions = ['svg', 'png', 'jpg', 'jpeg', 'pdf', 'zip'];

                          filesArray.forEach(file => {
                            const ext = file.name.split('.').pop()?.toLowerCase() || '';
                            const sizeInMb = file.size / (1024 * 1024);
                            
                            if (sizeInMb > 50) {
                              tooLargeCount++;
                            } else if (!allowedExtensions.includes(ext)) {
                              invalidTypeCount++;
                            } else {
                              newUploaded.push({
                                name: file.name,
                                size: file.size,
                                type: file.type || ext.toUpperCase()
                              });
                            }
                          });

                          if (tooLargeCount > 0) {
                            alert(`⚠️ File size safety breach: ${tooLargeCount} file(s) exceed the 50MB maximum restriction.`);
                          }
                          if (invalidTypeCount > 0) {
                            alert(`⚠️ Unsupported format detected: ${invalidTypeCount} file(s) do not match approved SVG, PNG, JPG, PDF, or ZIP guidelines.`);
                          }

                          if (newUploaded.length > 0) {
                            setUploadedFiles(prev => [...prev, ...newUploaded]);
                          }
                        }
                      }}
                    />
                    
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center mx-auto group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-all">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-cyan-400" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-200">
                        Drag &amp; drop files here, or <span className="text-cyan-400 underline">browse your device</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono leading-normal">
                        Approved types: <strong className="text-slate-400">SVG, PNG, JPG, PDF, ZIP</strong> (Max <strong className="text-slate-400">50MB</strong> per file)
                      </p>
                    </div>

                    {/* Notice on limits */}
                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-amber-500 font-mono bg-amber-500/5 py-1 px-3.5 border border-amber-500/10 rounded-lg w-fit mx-auto">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Warning: Larger file folders must be linked below. Do not exceed 50MB limit.</span>
                    </div>
                  </div>

                  {/* List Uploaded Files visually */}
                  {uploadedFiles.length > 0 && (
                    <div className="p-3 bg-slate-950/80 border border-slate-850/60 rounded-xl space-y-2 max-h-40 overflow-y-auto animate-fadeIn">
                      <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Files Ready For Ingestion ({uploadedFiles.length})</span>
                      <div className="space-y-1.5">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-3 text-xs bg-slate-900 p-2 rounded-lg border border-slate-850">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              <span className="text-slate-200 truncate font-mono text-[11px]">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-slate-500 font-mono">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                                }}
                                className="text-slate-500 hover:text-red-400 p-1 cursor-pointer transition flex items-center justify-center"
                                title="Remove File"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-slate-500">Google Drive, Dropbox or Figma reference files link</label>
                  <input 
                    type="url" 
                    value={projectData.website_url || ''} 
                    onChange={(e) => handleUpdateProjectRemote({ website_url: e.target.value })}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Part 3: Deploy & Trigger build */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 space-y-4">
                <span className="text-[10px] font-mono text-cyan-400 font-black uppercase tracking-widest block border-b border-slate-800 pb-1.5">3. Submit & Request Draft</span>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Submitting these assets immediately initiates your design phase. We'll begin creating your initial visual draft for you to review and approve before paying the deposit and starting the full build.
                </p>

                {errorText && (
                  <p className="text-red-400 text-xs font-semibold">{errorText}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '📤 Submit Brand Blueprints & Request Design Draft'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* =======================================================
            PATH F: MILESTONE 4 (ACTIVE DEVELOPMENT BUILD BOARDS)
            ======================================================= */}
        {activeStep === 'development' && projectData && (
          <div className="py-6 space-y-8 animate-fadeIn text-left max-w-3xl mx-auto">
            <div className="space-y-2">
              <span className="px-3 py-1 border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
                Milestone 4 — Website Build Progress
              </span>
              <h2 className="text-3xl font-black text-white mt-4">Website Build Progress</h2>
              <p className="text-slate-400 text-xs sm:text-sm font-light mt-1">David is actively building your responsive layout. Review layout design and build updates below in real-time.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              
              {/* Build simulator terminal */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Simulated Server Build Output */}
                <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 sm:p-5 font-mono text-[11px] text-slate-350 space-y-2 select-all shadow-inner relative overflow-hidden">
                  <div className="absolute top-2 right-3 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Assembly active</span>
                  </div>
                  <h4 className="text-[10px] text-cyan-455 font-black uppercase tracking-wider mb-2 select-none">Clarity Build Terminal Output:</h4>
                  <p className="opacity-60">[18:54:12] Init system compilation workspace...</p>
                  <p className="opacity-80 text-cyan-400">[18:54:13] Loading asset palette... Primary: {projectData.brand_colors_primary || '#0ea5e9'} Accent: {projectData.brand_colors_accent || '#6366f1'}</p>
                  <p className="opacity-95 text-indigo-400">[18:54:15] Building target pages: {((projectData.selected_pages || []).join(", ") || "Home, About, Services, Contact")}</p>
                  <p className="text-emerald-400 font-bold">[18:54:18] CSS Module Tailwind injected - compilation SUCCESS (342ms)</p>
                  <p className="text-white">[18:54:21] Generating responsive staging routing subdomain... Live</p>
                </div>

                {/* Staging Preview mock card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wide block">Staging Preview Sandbox</span>
                  
                  <div className="bg-[#020617] border border-slate-850 rounded-2xl p-8 text-center space-y-4 border-dashed relative">
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[9px] font-mono text-slate-400 uppercase select-none">
                      <Code className="w-3 h-3 text-cyan-400" /> Staging Mock
                    </div>

                    <div className="space-y-1 mx-auto max-w-sm pt-4">
                      <h4 className="text-xl font-bold text-white tracking-tight">{projectData.business_name || 'Your Business Website'}</h4>
                      <p className="text-xs text-slate-455">Theme Aesthetic: {projectData.design_mood || 'Minimalist Modern'}</p>
                      <p className="text-xs text-slate-400 italic">"Welcome to our new premier platform. Let's make something amazing."</p>
                    </div>

                    <div className="flex justify-center gap-2 max-w-xs mx-auto text-[10px] pt-4">
                      {((projectData.selected_pages || []).slice(0, 4)).map((p: string) => (
                        <span key={p} className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Operations Control Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-black block">Active Actions</span>

                <div className="space-y-2 text-xs font-light">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Invoices Set: Complete</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Deposit Cleared: Complete</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                    <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Build Assembly: Assembly Active</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 text-indigo-300 text-xs rounded-xl font-light leading-relaxed">
                  David has locked in your launch timeline. Click button to access staging reviews and open feedback clipboard revisions!
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateProjectRemote({ status: 'Client Review' });
                    setActiveStep('launch');
                  }}
                  className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  👉 Go to Staging &amp; Revisions <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =======================================================
            PATH G: MILESTONE 5 (STAGING REVIEW & CONFERENCE CHAT & GO-LIVE)
            ======================================================= */}
        {activeStep === 'launch' && projectData && (
          <div className="py-6 space-y-8 animate-fadeIn text-left max-w-3xl mx-auto">
            <div className="space-y-2 border-b border-slate-800/60 pb-4">
              <span className="px-3 py-1 border border-cyan-800/40 bg-cyan-950/20 text-cyan-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
                Milestone 5 — Client Sign-off &amp; Interactive Launch
              </span>
              <h2 className="text-3xl font-black text-white mt-4">Staging Board &amp; Revisions Clipboard</h2>
              <p className="text-slate-400 text-xs sm:text-sm font-light mt-1">Review live layouts, direct modifications, and request visual fixes directly. Click deploy when satisfied to launch!</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              <div className="lg:col-span-2 space-y-6">
                
                {/* Staging Links parameters */}
                <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 space-y-4 text-xs font-light">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wide block">Staging Server Details</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/70 border border-slate-850 rounded-2xl space-y-1">
                      <span className="text-slate-500 block text-[10px] font-mono uppercase">Staging URL subdomain:</span>
                      <a href={`https://staging.clarity.space/${projectData.secure_token}`} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-mono font-medium flex items-center gap-1.5 pt-1">
                        <span>staging.clarity.space/{projectData.secure_token?.substring(0,6)}...</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="p-4 bg-slate-950/70 border border-slate-850 rounded-2xl space-y-1">
                      <span className="text-slate-500 block text-[10px] font-mono uppercase">Production URL target:</span>
                      <span className="text-white font-mono font-medium block pt-1">{projectData.domain_name || 'yourbusiness.com.au'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Publish Go-Live launching operations card */}
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 space-y-4 text-left">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-black block">Publish Operations</span>
                  
                  {projectData.status === 'Launched' ? (
                    <div className="space-y-4 text-center">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                        <Sparkles className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">PROJECT LAUNCHED LIVE!</h4>
                        <p className="text-xs text-slate-400 font-light leading-relaxed">
                          Your nameservers are fully delegated. SSL Certificates are registered. Static build assets deployed.
                        </p>
                      </div>
                      <a 
                        href={`/project-status/${projectData.secure_token}`}
                        className="block w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition hover:opacity-90 text-center"
                      >
                        Open Status Hub
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Ready to make your design available globally? Confirm your satisfaction to delegate nameservers instantly!
                      </p>

                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 text-emerald-430 text-[11px] rounded-xl font-light flex gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Confirming launch automatically triggers production esbuild bundles and registers secure host SSL certificates.</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleTriggerWebsiteLiveLaunch}
                        disabled={submitting}
                        className="w-full py-4 bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider font-mono hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-md animate-pulse"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '🚀 Deploy Website Live!'}
                      </button>
                    </div>
                  )}

                  {projectData.secure_token && (
                    <div className="p-3 bg-slate-950/80 border border-slate-850 rounded-2xl text-left space-y-1.5 leading-normal">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">Your Client Portal Secure Token</span>
                      <div className="flex items-center justify-between gap-1.5 bg-[#020617] px-2.5 py-1.5 rounded-xl border border-slate-900 select-all font-mono text-[11px] text-cyan-300 font-bold">
                        <span>{projectData.secure_token}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(projectData.secure_token || "");
                            setCopiedBsb(true);
                            setTimeout(() => setCopiedBsb(false), 2000);
                          }}
                          className="px-2 py-0.5 rounded text-[9px] bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 font-black tracking-wider uppercase border border-slate-850 cursor-pointer transition text-cyan-400 font-mono"
                        >
                          {copiedBsb ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal font-light italic">
                        * Save this token code. Check back here or enter it alongside your email (<strong>{projectData.email || 'your email'}</strong>) in the client login page to access your live directories.
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Token: Connected</span>
                    <span>Firestore Real-time</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =======================================================
            PATH H: SUCCESS / ENQUIRY RECEIVED CONFIRMATION
            ======================================================= */}
        {activeStep === 'success' && (
          <div className="py-12 space-y-8 animate-fadeIn max-w-2xl mx-auto text-center font-sans">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8" />
            </div>
            
            <div className="space-y-3">
              <span className="px-3 py-1 border border-emerald-800/40 bg-emerald-950/20 text-emerald-400 text-[10px] font-mono tracking-widest uppercase rounded-full">
                Enquiry Received
              </span>
              <h2 className="text-3xl font-black text-white tracking-tight">Website request submitted!</h2>
              <p className="text-slate-350 font-light text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                Thanks — your website request has been received. I’ll review your business and send back a simple website plan, price and next steps.
              </p>
            </div>

            {projectData && projectData.secure_token && (
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-black block">Your Project Secure Token</span>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  Use this private tracking code to check status or resume your project from any device:
                </p>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl">
                  <span className="text-xs font-mono text-white font-bold select-all truncate flex-1 md:min-w-0">
                    {projectData.secure_token}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(projectData.secure_token || '');
                      setCopiedResume(true);
                      setTimeout(() => setCopiedResume(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[9px] font-mono uppercase bg-slate-900 border border-slate-800 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition cursor-pointer"
                  >
                    {copiedResume ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
              <button
                type="button"
                onClick={() => {
                  if (projectData && projectData.secure_token) {
                    setActiveStep('assets');
                  } else {
                    setActiveStep('welcome');
                  }
                }}
                className="p-5 bg-gradient-to-br from-slate-900 to-[#121c38] border border-slate-800 rounded-2xl text-left cursor-pointer transition hover:border-slate-700/80 hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center mb-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-tight">Upload logo/content</h4>
                <p className="text-[10px] text-slate-500 font-light mt-1">Provide logos, images, text drafts, and branding preferences now.</p>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep('welcome')}
                className="p-5 bg-gradient-to-br from-slate-900 to-[#121c38] border border-slate-800 rounded-2xl text-left cursor-pointer transition hover:border-slate-700/80 hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-800/30 flex items-center justify-center mb-2">
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-tight">Add details later</h4>
                <p className="text-[10px] text-slate-500 font-light mt-1">Check back anytime or close this window. We've saved your details.</p>
              </button>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setActiveStep('welcome')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        )}

      </div>

      {/* PRIVACY MODAL */}
      <AnimatePresence>
        {showPrivacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1329] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-left"
            >
              <h3 className="text-lg font-bold text-white uppercase">Privacy Framework</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Your credentials, copy details and brand templates are strictly insulated within dedicated Firebase cloud instances and never sold, transmitted or parsed for general advertisement vectors.
              </p>
              <button onClick={() => setShowPrivacy(false)} className="w-full py-2.5 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase cursor-pointer">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TERMS MODAL */}
      <AnimatePresence>
        {showTerms && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1329] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-left"
            >
              <h3 className="text-lg font-bold text-white uppercase">Onboarding Terms</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Digital signature verifies scopes calculated in initial parameter grids. Obligation commences synchronously following payment confirmation of design staging deposits.
              </p>
              <button onClick={() => setShowTerms(false)} className="w-full py-2.5 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase cursor-pointer">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
