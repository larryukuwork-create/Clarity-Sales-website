import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Key, Copy, Check, Send, CreditCard, FolderOpen, Calendar, HelpCircle, 
  Globe, CheckCircle, MessageSquare, Trash2, Edit3, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

interface ProjectLifecyclePanelProps {
  lead: any;
  collectionName: "intakes" | "outreachLeads";
  onUpdateLead: (id: string, updates: any) => void;
}

export default function ProjectLifecyclePanel({ lead, collectionName, onUpdateLead }: ProjectLifecyclePanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<'workflows' | 'feedback_board'>('workflows');
  
  // Real-time feedbacks list
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // Clipboard states
  const [copiedStatusUrl, setCopiedStatusUrl] = useState(false);
  const [copiedFeedbackUrl, setCopiedFeedbackUrl] = useState(false);
  const [copiedHandoverMsg, setCopiedHandoverMsg] = useState(false);
  const [copiedPreviewMsg, setCopiedPreviewMsg] = useState(false);
  const [copiedRevisionMsg, setCopiedRevisionMsg] = useState(false);
  const [copiedTestimonialMsg, setCopiedTestimonialMsg] = useState(false);

  // Form states - Deposits
  const [depositAmount, setDepositAmount] = useState(lead.deposit_amount || '$1,500');
  const [depositDueDate, setDepositDueDate] = useState(lead.deposit_due_date || '');
  const [paymentLink, setPaymentLink] = useState(lead.payment_link || '');
  const [designDraftUrl, setDesignDraftUrl] = useState(lead.design_draft_url || '');
  const [depositNotes, setDepositNotes] = useState(lead.deposit_notes || 'Deposit to officially start the full development build, after design draft is approved.');
  const [isEditingDeposit, setIsEditingDeposit] = useState(!lead.deposit_amount);

  // Form states - Links
  const [previewUrl, setPreviewUrl] = useState(lead.preview_url || '');
  const [finalSiteUrl, setFinalSiteUrl] = useState(lead.final_site_url || '');
  const [launchNotes, setLaunchNotes] = useState(lead.launch_notes || '');

  // Form states - Assets Checklist
  const [assetChecks, setAssetChecks] = useState({
    logo: false,
    copy: false,
    images: false,
    credentials: false
  });

  useEffect(() => {
    setPreviewUrl(lead.preview_url || '');
    setFinalSiteUrl(lead.final_site_url || '');
    setLaunchNotes(lead.launch_notes || '');
    setAssetChecks({
      logo: lead.build_readiness?.logo || false,
      copy: lead.build_readiness?.copy || false,
      images: lead.build_readiness?.images || false,
      credentials: lead.build_readiness?.credentials || false
    });
  }, [lead.id, lead.preview_url, lead.final_site_url, lead.launch_notes, lead.build_readiness]);

  const handleCheckChange = (field: 'logo' | 'copy' | 'images' | 'credentials', value: boolean) => {
    const updated = {
      ...assetChecks,
      [field]: value
    };
    setAssetChecks(updated);
    onUpdateLead(lead.id, {
      build_readiness: updated
    });
  };

  // Load feedbacks
  useEffect(() => {
    if (!lead.id) return;

    if (!isFirebaseConfigured) {
      // Offline fallback load from localStorage
      const offlineFeedbacksStr = localStorage.getItem('clarity_local_feedbacks') || '[]';
      const list = JSON.parse(offlineFeedbacksStr).filter((f: any) => f.project_id === lead.id);
      setFeedbacks(list);
      return;
    }

    setLoadingFeedbacks(true);
    const q = query(collection(db, "feedbacks"), where("project_id", "==", lead.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      // Sort newest first
      list.sort((a: any, b: any) => new Date(b.submitted_at || 0).getTime() - new Date(a.submitted_at || 0).getTime());
      setFeedbacks(list);
      setLoadingFeedbacks(false);
    }, (err) => {
      console.error("Error loading feedbacks in admin board:", err);
      setLoadingFeedbacks(false);
    });

    return () => unsubscribe();
  }, [lead.id]);

  // Sync state values when selected lead changes
  useEffect(() => {
    setDepositAmount(lead.deposit_amount || '$1,500');
    setDepositDueDate(lead.deposit_due_date || '');
    setPaymentLink(lead.payment_link || '');
    setDesignDraftUrl(lead.design_draft_url || '');
    setDepositNotes(lead.deposit_notes || 'Deposit to officially start the full development build, after design draft is approved.');
    setIsEditingDeposit(!lead.deposit_amount);

    setPreviewUrl(lead.preview_url || '');
    setFinalSiteUrl(lead.final_site_url || '');
    setLaunchNotes(lead.launch_notes || '');
  }, [lead]);

  // Utility Copy
  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Secure Token Generation
  const handleGenerateToken = () => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    onUpdateLead(lead.id, { secure_token: token });
  };

  const handleRevokeToken = () => {
    if (confirm("Are you sure you want to revoke this secure client token? The client status and feedback page will instantly become inaccessible.")) {
      onUpdateLead(lead.id, { secure_token: null });
    }
  };

  // Deposit Actions
  const handleRequestDeposit = () => {
    onUpdateLead(lead.id, {
      status: "Deposit Requested",
      deposit_amount: depositAmount,
      deposit_due_date: depositDueDate,
      payment_link: paymentLink,
      design_draft_url: designDraftUrl,
      deposit_notes: depositNotes,
      deposit_requested_at: new Date().toISOString()
    });
    setIsEditingDeposit(false);
  };

  const handleMarkDepositPaid = () => {
    if (confirm("Confirm deposit has been paid? This will transition the status to 'Deposit Paid' and mark project as WON.")) {
      onUpdateLead(lead.id, {
        status: "Deposit Paid",
        deposit_paid_at: new Date().toISOString(),
        project_won: true
      });
    }
  };

  // Assets Actions
  const handleMarkAssetsRequested = () => {
    onUpdateLead(lead.id, {
      status: "Assets Requested",
      assets_requested_at: new Date().toISOString()
    });
  };

  const handleMarkAssetsReceived = () => {
    onUpdateLead(lead.id, {
      status: "Assets Received",
      assets_received_at: new Date().toISOString()
    });
  };

  // Start Build Action
  const handleStartBuild = () => {
    const initialChecklist = {
      "Setup local git repository and dev branch": false,
      "Design and code responsive navigation structure": false,
      "Code landing section and core hero layout": false,
      "Integrate brand logos and color palettes from Drive": false,
      "Configure routing parameters and SEO elements": false,
      "Double-check page optimization on mobile viewports": false,
    };

    onUpdateLead(lead.id, {
      status: "Build Started",
      build_started_at: new Date().toISOString(),
      checklist: {
        ...(lead.checklist || {}),
        ...initialChecklist
      }
    });
  };

  // Send First Preview
  const handleSendFirstPreview = () => {
    if (!previewUrl) {
      alert("Please save a Preview/Staging URL first before sending the preview update.");
      return;
    }
    onUpdateLead(lead.id, {
      status: "First Preview Sent",
      first_preview_sent_at: new Date().toISOString(),
      preview_url: previewUrl
    });
  };

  // Feedbacks item status updates
  const handleUpdateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    try {
      if (isFirebaseConfigured) {
        await updateDoc(doc(db, "feedbacks", feedbackId), {
          status: newStatus,
          updated_at: new Date().toISOString()
        });
      } else {
        const offlineFeedbacksStr = localStorage.getItem('clarity_local_feedbacks') || '[]';
        const list = JSON.parse(offlineFeedbacksStr).map((f: any) => {
          if (f.id === feedbackId) {
            return { ...f, status: newStatus };
          }
          return f;
        });
        localStorage.setItem('clarity_local_feedbacks', JSON.stringify(list));
        setFeedbacks(list.filter((f: any) => f.project_id === lead.id));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update feedback status.");
    }
  };

  // Send Final Review
  const handleSendFinalReview = () => {
    if (!previewUrl) {
      alert("Please provide a staging build Preview URL first.");
      return;
    }
    onUpdateLead(lead.id, {
      status: "Final Review",
      final_review_sent_at: new Date().toISOString()
    });
  };

  // Launch Actions
  const handleMarkLaunchReady = () => {
    onUpdateLead(lead.id, {
      status: "Launch Ready",
      launch_ready_at: new Date().toISOString()
    });
  };

  const handleMarkLaunched = () => {
    if (!finalSiteUrl) {
      alert("Please provide the final production URL first.");
      return;
    }
    onUpdateLead(lead.id, {
      status: "Launched",
      launched_at: new Date().toISOString(),
      final_site_url: finalSiteUrl,
      launch_notes: launchNotes
    });
  };

  const handleMarkCompleted = () => {
    onUpdateLead(lead.id, {
      status: "Completed",
      completed_at: new Date().toISOString()
    });
  };

  const handleMarkTestimonialRequested = () => {
    onUpdateLead(lead.id, {
      status: "Testimonial Requested",
      testimonial_requested_at: new Date().toISOString()
    });
  };

  // Messages Draftings
  const statusLink = `${window.location.origin}/project-status/${lead.secure_token}`;
  const feedbackLink = `${window.location.origin}/project-feedback/${lead.secure_token}`;
  const driveLink = lead.google_drive_folder_url || "Drive folder";

  const assetHandoverMsg = `Hello ${lead.contact_name || lead.contactName || 'Client'},\n\nWe have initialized your project folder on Drive!\n\nPlease upload your files, assets, and copywriting materials using this secure link:\n${driveLink}\n\nRequired Assets Checklist:\n- Vector branding assets (Logo as SVG, EPS or print clean PNG)\n- Page Copy: Draft guidelines and section briefs\n- High-res photography: Banner heros, portfolios, team headshots\n- Configuration parameters: Domain/DNS registrars, system keys\n\nLet us know once you have saved files inside so we can start building.\n\nVerify live progress anytime:\n${statusLink}\n\nBest regards,\nClarity Space Team`;

  const previewMsg = `Hello ${lead.contact_name || lead.contactName || 'Client'},\n\nGreat news! The staging build of your website is ready to inspect!\n\nReview the initial mockups and page flows here:\n${previewUrl}\n\nPlease examine general layouts, spacings, and wordings. You can log visual/copy amendments directly on your secure Review Board:\n${feedbackLink}\n\nWe look forward to updating the build based on your feedback.\n\nBest regards,\nClarity Space Operations`;

  const finalReviewMsg = `Hello ${lead.contact_name || lead.contactName || 'Client'},\n\nAll requested revisions have been successfully coded and deployed to your live build!\n\nReview the live updates here:\n${previewUrl}\n\nIf you are completely satisfied with the branding, layouts, copy, and forms, please let us know so we can initiate domain mapping and SSL configurations.\n\nYou can view full progress here:\n${statusLink}\n\nBest regards,\nClarity Space Operations`;

  const testimonialMsg = `Hello ${lead.contact_name || lead.contactName || 'Client'},\n\nWorking with you on building ${lead.business_name || lead.businessName || 'your business website'} has been an absolute pleasure!\n\nNow that your live build is published, we would love to capture your feedback. Could you share a quick, 2-paragraph testimonial on your experience working with Clarity Space?\n\n- What was your favorite part of our collaboration?\n- How has the new website changed your client perception?\n\nFeel free to write back here or submit directly on your private status portal:\n${statusLink}\n\nThank you for trusting Clarity Space with your digital presence!\n\nBest regards,\nClarity Space Team`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col font-sans overflow-hidden">
      
      {/* Sub tabs header */}
      <div className="flex justify-between items-center bg-[#020617] border-b border-slate-800 px-4">
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => setActiveSubTab('workflows')} 
            className={`py-3 text-xs font-bold font-mono uppercase border-b-2 transition ${
              activeSubTab === 'workflows' ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Workflow Pipeline
          </button>
          <button 
            type="button"
            onClick={() => setActiveSubTab('feedback_board')} 
            className={`py-3 text-xs font-bold font-mono uppercase border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === 'feedback_board' ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Review Tickets ({feedbacks.length})
          </button>
        </div>
        <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono tracking-tight shrink-0 uppercase">
          Client Flow Panel
        </span>
      </div>

      <div className="p-5 space-y-6">
        
        {/* TAB 1: WORKFLOW OPERATIONS */}
        {activeSubTab === 'workflows' && (
          <div className="space-y-6">
            
            {/* 1. Secure link management (First trigger) */}
            <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-cyan-500" /> Secure Client Pages
                </h4>
                {lead.secure_token && (
                  <button 
                    type="button"
                    onClick={handleRevokeToken} 
                    className="text-[9px] hover:text-red-400 text-slate-500 transition border border-dashed border-slate-800 px-1.5 py-0.5 rounded font-mono uppercase"
                  >
                    Revoke Link
                  </button>
                )}
              </div>

              {!lead.secure_token ? (
                <div className="space-y-2 py-1">
                  <p className="text-xs text-slate-400">Generate a unique random access token for client pages. No password required for the customer.</p>
                  <button 
                    type="button"
                    onClick={handleGenerateToken} 
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded-xl hover:text-white transition text-xs font-bold"
                  >
                    Activate Token-Based Access
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs shrink-0 select-none">
                  <div className="bg-cyan-950/20 border border-cyan-900/40 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-slate-300 leading-none">
                      <span className="font-mono text-[10px] font-bold text-cyan-400">SECURE OPERATIONS PORTAL (CLIENT VIEW)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-light">
                      This is exactly what the client sees. They use this portal to track project status, access links, and submit feedback.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                       <Link 
                          to={`/project-status/${lead.secure_token}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white flex justify-center items-center gap-2 rounded-xl text-xs font-bold transition shadow-md shadow-cyan-900/30 text-center"
                       >
                         Launch Portal <Eye className="w-3.5 h-3.5"/>
                       </Link>
                       <div className="flex-1 flex gap-2 bg-[#020617] border border-slate-700 hover:border-slate-600 transition p-2 rounded-xl text-slate-300 cursor-pointer text-[10px] font-mono items-center" onClick={() => copyToClipboard(statusLink, setCopiedStatusUrl)}>
                         <span className="truncate flex-1">{statusLink}</span>
                         <span className={copiedStatusUrl ? "text-cyan-400 font-bold shrink-0" : "text-slate-500 font-bold shrink-0"}>{copiedStatusUrl ? 'Copied' : 'Copy'}</span>
                       </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-slate-450 mb-1 leading-none">
                       <span className="font-mono text-[10px]">TWEAK REVISIONS FEEDBACK (ADVANCED):</span>
                       <a href={feedbackLink} target="_blank" rel="noreferrer" className="text-cyan-450 hover:underline flex items-center gap-0.5 font-mono text-[9px]">Launch Panel <Eye className="w-3 h-3"/></a>
                    </div>
                    <div className="flex gap-2 bg-[#020617] border border-slate-850 p-2 rounded-xl text-slate-350 cursor-pointer text-[11px] font-mono" onClick={() => copyToClipboard(feedbackLink, setCopiedFeedbackUrl)}>
                      <span className="truncate flex-1">{feedbackLink}</span>
                      <span className="text-cyan-500 font-bold shrink-0">{copiedFeedbackUrl ? 'Copied' : 'Copy'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. SPECIFIC LIFE STATUS FLOW CONTROLLERS */}
            
            {/* STAGE A: Assets Received -> DEPOSIT & DRAFT CONTROLS */}
            {lead.status === "Assets Received" && (
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-4 animate-feedIn">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                  <CreditCard className="w-4.5 h-4.5 text-amber-500" />
                  <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-amber-500">Send Draft & Request Deposit Workflow</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Deposit Amount Due</label>
                    <input 
                      type="text" 
                      value={depositAmount} 
                      onChange={e => setDepositAmount(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-850 text-white rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Due Date</label>
                    <input 
                      type="date" 
                      value={depositDueDate} 
                      onChange={e => setDepositDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-850 text-white rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Design Draft Target URL (Figma, Framer, Vercel preview, etc.)</label>
                  <input 
                    type="url" 
                    placeholder="https://..." 
                    value={designDraftUrl} 
                    onChange={e => setDesignDraftUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-850 text-white rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Client Invoice Payment Link (Stripe checkout, etc.)</label>
                  <input 
                    type="url" 
                    placeholder="https://buy.stripe.com/..." 
                    value={paymentLink} 
                    onChange={e => setPaymentLink(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-850 text-white rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Invoice Message / Notes</label>
                  <textarea 
                    value={depositNotes} 
                    onChange={e => setDepositNotes(e.target.value)}
                    className="w-full h-15 p-2 text-xs bg-slate-900 border border-slate-850 text-slate-305 rounded-lg resize-none"
                  />
                </div>

                <button 
                  type="button"
                  onClick={handleRequestDeposit} 
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-90 text-slate-950 font-bold rounded-xl text-xs flex justify-center items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Request Deposit
                </button>
              </div>
            )}

            {/* STAGE B: Deposit Requested -> WAIT DEPOSIT */}
            {lead.status === "Deposit Requested" && (
              <div className="bg-slate-955 p-4 border border-slate-800 rounded-2xl space-y-4 animate-feedIn font-sans">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <CreditCard className="w-4.5 h-4.5" />
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase">FUNDS REQUIRED DEPOSIT</h4>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsEditingDeposit(!isEditingDeposit)} 
                    className="text-[9px] hover:text-cyan-400 text-slate-500 transition uppercase border border-slate-800 px-1.5 py-0.5 rounded"
                  >
                    {isEditingDeposit ? 'Cancel Edit' : 'Edit Parameters'}
                  </button>
                </div>

                {isEditingDeposit ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        value={depositAmount} 
                        onChange={e => setDepositAmount(e.target.value)}
                        className="px-2 py-1 text-xs bg-slate-900 border border-slate-850 rounded text-slate-300"
                        placeholder="Amount"
                      />
                      <input 
                        type="date" 
                        value={depositDueDate} 
                        onChange={e => setDepositDueDate(e.target.value)}
                        className="px-2 py-1 text-xs bg-slate-900 border border-slate-850 rounded text-slate-300"
                      />
                    </div>
                    <input 
                      type="url" 
                      value={designDraftUrl} 
                      onChange={e => setDesignDraftUrl(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-850 rounded text-slate-300"
                      placeholder="Design Draft Preview URL"
                    />
                    <input 
                      type="url" 
                      value={paymentLink} 
                      onChange={e => setPaymentLink(e.target.value)}
                      className="w-full px-2 py-1 text-xs bg-slate-900 border border-slate-850 rounded text-slate-300"
                      placeholder="Payment URL"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        onUpdateLead(lead.id, {
                          deposit_amount: depositAmount,
                          deposit_due_date: depositDueDate,
                          payment_link: paymentLink,
                          design_draft_url: designDraftUrl,
                          deposit_notes: depositNotes
                        });
                        setIsEditingDeposit(false);
                      }} 
                      className="px-2.5 py-1 bg-slate-800 rounded font-bold text-xs"
                    >
                      Save Parameters
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-[#020617] rounded-xl border border-slate-850/80 space-y-2 text-xs text-slate-350">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">Invoice Amount:</span> 
                      <span className="font-semibold text-slate-205">{depositAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-mono">Due Date:</span> 
                      <span className="font-semibold text-slate-205">{depositDueDate || "None"}</span>
                    </div>
                    {designDraftUrl && (
                      <div className="flex justify-between truncate">
                        <span className="text-slate-500 font-mono mr-2">Draft:</span> 
                        <a href={designDraftUrl} target="_blank" rel="noreferrer" className="text-cyan-455 hover:underline truncate max-w-[200px]">{designDraftUrl}</a>
                      </div>
                    )}
                    {paymentLink && (
                      <div className="flex justify-between truncate">
                        <span className="text-slate-500 font-mono mr-2">Link:</span> 
                        <a href={paymentLink} target="_blank" rel="noreferrer" className="text-cyan-455 hover:underline truncate max-w-[200px]">{paymentLink}</a>
                      </div>
                    )}
                    {lead.design_draft_approved ? (
                      <div className="flex justify-between items-center bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 p-2 rounded mt-2 text-[10px]">
                        <span className="font-mono font-bold tracking-wider">✓ DRAFT APPROVED</span>
                        <span className="text-slate-400">({lead.design_draft_approved_at || "Date Unknown"})</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-slate-900 p-2 rounded mt-2 text-[10px] text-slate-400">
                        <span className="font-mono">Draft Approval:</span>
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold uppercase tracking-wider">Pending</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={handleMarkDepositPaid} 
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex justify-center items-center gap-1.5"
                  >
                    ✓ Confirm Deposit Paid
                  </button>
                </div>
              </div>
            )}

            {/* STAGE C: Assets Requested / Proposal Approved -> ASSET HANDOVER CONTROLS */}
            {(lead.status === "Proposal Approved" || lead.status === "Assets Requested") && (
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-4 animate-feedIn font-sans">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <FolderOpen className="w-4.5 h-4.5" />
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Asset Handover Matrix</h4>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-indigo-950/40 text-indigo-400 border border-indigo-900/40 rounded">
                    {lead.status === "Deposit Paid" ? "Initial Setup" : "Awaiting Deposit"}
                  </span>
                </div>

                {!lead.google_drive_folder_url ? (
                  <p className="text-xs text-slate-400 mb-2">Configure client Drive directories before creating outreach copy scripts.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-indigo-950/15 border border-indigo-900/35 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                        <span className="text-slate-400">STANDARD OUTREACH TEXT:</span>
                        <button 
                          type="button"
                          onClick={() => copyToClipboard(assetHandoverMsg, setCopiedHandoverMsg)} 
                          className="text-cyan-400 hover:underline hover:text-cyan-300 font-bold uppercase"
                        >
                          {copiedHandoverMsg ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="text-[10px] text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-32 border-t border-slate-900 pt-2 shrink-0">
                        {assetHandoverMsg}
                      </pre>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={handleMarkAssetsRequested} 
                        className="flex-1 py-1.5 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl hover:text-white transition text-xs font-semibold"
                      >
                        Mark Assets Requested
                      </button>
                      <button 
                        type="button"
                        onClick={handleMarkAssetsReceived} 
                        className="flex-1 py-1.5 bg-emerald-950 border border-emerald-900/50 text-emerald-300 rounded-xl hover:text-white hover:bg-emerald-900/60 transition text-xs font-bold"
                      >
                        Mark Assets Received
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STAGE D: Deposit Paid -> BUILD INITIATOR */}
            {lead.status === "Deposit Paid" && (
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-4 animate-feedIn font-sans">
                <div className="flex items-center gap-1.5 text-cyan-400 border-b border-slate-850 pb-2">
                  <Globe className="w-4.5 h-4.5" />
                  <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Start Build Workflow</h4>
                </div>

                <div className="p-3 bg-[#020617] rounded-xl border border-slate-850 text-xs space-y-2 select-none">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500 mb-1 leading-none">Build Readiness Requirements Check:</p>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input 
                      type="checkbox" 
                      checked={assetChecks.logo}
                      onChange={e => handleCheckChange('logo', e.target.checked)}
                      className="rounded border-slate-850 bg-slate-900 text-cyan-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Branding files, Logos compiled</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input 
                      type="checkbox" 
                      checked={assetChecks.copy}
                      onChange={e => handleCheckChange('copy', e.target.checked)}
                      className="rounded border-slate-850 bg-slate-900 text-cyan-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Project copywriting / brief received</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input 
                      type="checkbox" 
                      checked={assetChecks.credentials}
                      onChange={e => handleCheckChange('credentials', e.target.checked)}
                      className="rounded border-slate-850 bg-slate-900 text-cyan-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Domain / register credentials confirmed</span>
                  </label>

                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-450">
                    <p>Drive status: {lead.google_drive_folder_url ? <span className="text-emerald-400 font-bold">Connected</span> : <span className="text-amber-400 font-bold">Missing</span>}</p>
                    <p className="mt-0.5">Deposit: {lead.deposit_paid_at ? <span className="text-emerald-400 font-bold">Paid</span> : <span className="text-amber-400 font-bold">Awaiting Payment</span>}</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleStartBuild} 
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex justify-center items-center gap-1.5 hover:scale-[1.01] transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> Start Build & Initialize Checklist
                </button>
              </div>
            )}

            {/* STAGE E: Build Started or after -> STAGING & LIVE PATHS MANAGER */}
            {(lead.status === "Build Started" || lead.status === "First Preview Sent" || lead.status === "Client Review" || lead.status === "Revisions" || lead.status === "Final Review" || lead.status === "Launch Ready" || lead.status === "Launched" || lead.status === "Completed" || lead.status === "Testimonial Requested") && (
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-4 animate-feedIn font-sans">
                <div className="flex items-center gap-1.5 text-cyan-400 border-b border-slate-850 pb-2">
                  <Globe className="w-4.5 h-4.5 text-cyan-500" />
                  <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Staging & Production Links</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Staging/Preview deployment URL</label>
                    <input 
                      type="url" 
                      placeholder="https://staging.site.com" 
                      value={previewUrl} 
                      onChange={e => setPreviewUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-850 text-white rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Production Release URL</label>
                    <input 
                      type="url" 
                      placeholder="https://clientdomain.com" 
                      value={finalSiteUrl} 
                      onChange={e => setFinalSiteUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-850 text-white rounded-lg outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => {
                    onUpdateLead(lead.id, { preview_url: previewUrl, final_site_url: finalSiteUrl });
                    alert("Urls saved successfully.");
                  }} 
                  className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-xl hover:text-white text-slate-350 text-xs font-bold"
                >
                  Save URL Links
                </button>

                {/* Send First Build Staging Preview action */}
                {lead.status === "Build Started" && (
                  <div className="pt-3 border-t border-slate-850 space-y-3">
                    <p className="text-xs text-slate-400 leading-normal">Ready to share the initial layout staging build with client?</p>
                    {!previewUrl && (
                      <div className="bg-amber-955/20 border border-amber-900/35 p-3 rounded-xl text-xs text-amber-400 space-y-1">
                        <span className="font-mono tracking-wider font-bold block uppercase text-[10px]">💡 Note: Staging URL Required</span>
                        <p className="font-light leading-normal text-slate-350">You must enter a "Staging/Preview deployment URL" above and click "Save URL Links" to enable sharing the layout preview with your client.</p>
                      </div>
                    )}
                    <button 
                      type="button"
                      onClick={handleSendFirstPreview} 
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1.5"
                    >
                      🚀 Send First Preview mockups
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STAGE F: First Preview Sent -> REVIEW DRAFT SCRIPTS */}
            {lead.status === "First Preview Sent" && (
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-3 animate-feedIn font-sans">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <div className="flex items-center gap-1.5 text-purple-400">
                    <MessageSquare className="w-4.5 h-4.5" />
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase">PREVIEW OUTREACH BODY</h4>
                  </div>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(previewMsg, setCopiedPreviewMsg)} 
                    className="text-[10px] text-cyan-405 hover:underline font-bold uppercase leading-none"
                  >
                    {copiedPreviewMsg ? 'Copied' : 'Copy Email'}
                  </button>
                </div>
                <pre className="text-[10px] text-slate-450 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-32 border-t border-slate-900 pt-2 shrink-0">
                  {previewMsg}
                </pre>
              </div>
            )}

            {/* STAGE G: Client Review or Revisions -> CONTROL MATRIX & COPY UPDATE */}
            {(lead.status === "Client Review" || lead.status === "Revisions") && (
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-4 animate-feedIn font-sans">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <MessageSquare className="w-4.5 h-4.5" />
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Revision Actions</h4>
                  </div>
                  <span className="text-[10px] border border-cyan-800/40 bg-cyan-950/20 px-2.0 py-0.5 rounded font-mono uppercase font-bold text-cyan-400 leading-none">
                    {lead.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  {lead.status === "Client Review" && (
                    <button 
                      type="button"
                      onClick={() => onUpdateLead(lead.id, { status: "Revisions" })} 
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl hover:text-white transition text-xs font-bold"
                    >
                      Mark Start Work (Revisions)
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={handleSendFinalReview} 
                    className="flex-1 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:opacity-90 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    Send Final Review
                  </button>
                </div>
              </div>
            )}

            {/* STAGE H: Final Review -> DRAFT CLOSINGS */}
            {lead.status === "Final Review" && (
              <div className="bg-slate-954 p-4 border border-slate-800 rounded-2xl space-y-4 animate-feedIn font-sans">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-4.5 h-4.5" />
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Final Review Outreach</h4>
                  </div>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(finalReviewMsg, setCopiedRevisionMsg)} 
                    className="text-[10px] text-cyan-405 font-bold uppercase hover:underline leading-none"
                  >
                    {copiedRevisionMsg ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-[10px] text-slate-450 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-32 border-t border-slate-900 pt-2 shrink-0">
                  {finalReviewMsg}
                </pre>

                <button 
                  type="button"
                  onClick={handleMarkLaunchReady} 
                  className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold rounded-xl text-xs uppercase font-mono tracking-wider"
                >
                  ✓ Mark Launch Ready (Configure DNS/SSL)
                </button>
              </div>
            )}

            {/* STAGE I: Launch Ready -> DEPLOY CONTROLS */}
            {lead.status === "Launch Ready" && (
              <div className="bg-slate-955 p-4 border border-slate-805 rounded-2xl space-y-4 animate-feedIn font-sans">
                <div className="flex items-center gap-1.5 text-yellow-500 border-b border-slate-850 pb-2">
                  <Globe className="w-4.5 h-4.5" />
                  <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Launch configurations setup</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Production Site URL *</label>
                    <input 
                      type="url" 
                      placeholder="https://www.companydomain.com"
                      value={finalSiteUrl} 
                      onChange={e => setFinalSiteUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-850 text-white rounded-lg outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">DNS / Launch Notes</label>
                    <input 
                      type="text" 
                      placeholder="Nameservers mapped to Cloudflare, backup activated." 
                      value={launchNotes} 
                      onChange={e => setLaunchNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-850 text-white rounded-lg outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleMarkLaunched} 
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs rounded-xl uppercase tracking-wider font-mono hover:opacity-90 transition-all"
                >
                  🚀 GO-LIVE (Mark Active and Launched)
                </button>
              </div>
            )}

            {/* STAGE J: Launched -> COMPLETION */}
            {lead.status === "Launched" && (
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl space-y-3 animate-feedIn font-sans">
                <div className="flex items-center gap-1.5 text-emerald-405 border-b border-slate-850 pb-2">
                  <CheckCircle className="w-4.5 h-4.5" />
                  <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Launch Executed Successfully</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Website is globally discoverable. Hand over static templates, backup files and code records prior to completion.</p>
                <button 
                  type="button"
                  onClick={handleMarkCompleted} 
                  className="w-full py-2 bg-slate-900 border border-slate-800 rounded-xl hover:text-white hover:bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  ✓ Mark Project Completed & Archived
                </button>
              </div>
            )}

            {/* STAGE K: Completed / Testimonial -> REVIEW LOG COPY */}
            {(lead.status === "Completed" || lead.status === "Testimonial Requested") && (
              <div className="bg-slate-952 p-4 border border-slate-800 rounded-2xl space-y-4 animate-feedIn font-sans">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <MessageSquare className="w-4.5 h-4.5" />
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase">Testimonial Campaign</h4>
                  </div>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(testimonialMsg, setCopiedTestimonialMsg)} 
                    className="text-[10px] text-cyan-405 font-bold uppercase hover:underline leading-none"
                  >
                    {copiedTestimonialMsg ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-[10px] text-slate-450 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-32 border-t border-slate-900 pt-2 shrink-0">
                  {testimonialMsg}
                </pre>

                {lead.status === "Completed" && (
                  <button 
                    type="button"
                    onClick={handleMarkTestimonialRequested} 
                    className="w-full py-2 bg-cyan-950 border border-cyan-800/40 text-cyan-400 text-xs font-bold rounded-xl hover:bg-cyan-900 transition-all uppercase font-mono"
                  >
                    Mark testimonial Requested
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: CLIENT REVISION TICKETS BOARD */}
        {activeSubTab === 'feedback_board' && (
          <div className="space-y-4 font-sans max-h-120 overflow-y-auto pr-1">
            
            {loadingFeedbacks ? (
              <p className="text-xs text-slate-500 font-mono py-4">Polling real-time CRM tickets...</p>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-10 bg-slate-950 border border-slate-850 rounded-2xl space-y-1">
                <MessageSquare className="w-6 h-6 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-400 font-semibold uppercase">No Revision Tickets Yet</p>
                <p className="text-[10px] text-slate-500">Provide the client feedback board URL above to enable client submissions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((f) => (
                  <div key={f.id} className="p-4 border border-slate-800 rounded-2xl bg-[#020617] space-y-3 relative">
                    
                    {/* Urgency Badge */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold font-mono border ${
                            f.priority === 'High' ? 'bg-rose-950/40 text-rose-450 border-rose-900/40' : 
                            f.priority === 'Medium' ? 'bg-amber-950/40 text-amber-450 border-amber-900/40' : 
                            'bg-slate-900 text-slate-400 border-slate-850'
                          }`}>
                            {f.priority || 'Medium'} priority
                          </span>
                          <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900/30 px-1.5 py-0.5 rounded font-mono">
                            {f.page_section}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">Submitted: {new Date(f.submitted_at || Date.now()).toLocaleDateString()}</p>
                      </div>

                      {/* Admin feedback action dropdown */}
                      <select
                        value={f.status || 'New'}
                        onChange={(e) => handleUpdateFeedbackStatus(f.id, e.target.value)}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[10px] rounded px-2 py-1 outline-none font-bold uppercase font-mono cursor-pointer"
                      >
                        <option value="New">New</option>
                        <option value="Accepted">Accepted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Deferred">Deferred</option>
                        <option value="Out of Scope">Out of Scope</option>
                      </select>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
                      <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{f.message}</p>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-mono">
                      <p>Type: <span className="text-slate-400 font-bold">{f.feedback_type}</span></p>
                      {f.reference_link && (
                        <p>Link: <a href={f.reference_link} target="_blank" rel="noreferrer" className="text-cyan-455 hover:underline truncate max-w-[150px] inline-block align-bottom">{f.reference_link}</a></p>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
