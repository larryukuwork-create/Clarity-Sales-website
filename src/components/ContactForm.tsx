import React, { useState } from "react";
import { 
  Mail, 
  MessageSquare,
  HelpCircle,
  Send,
  Loader2,
  CheckCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Language, Currency } from "../translations";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured, withTimeout, saveToLocalFallback } from "../firebase";

interface ContactFormProps {
  packageSelection: string;
  addonsList: string[];
  calculatedPrice: string;
  onClearSelection: () => void;
  language: Language;
  currency: Currency;
}

export default function ContactForm({
  packageSelection,
  addonsList,
  calculatedPrice,
  onClearSelection,
  language,
  currency,
}: ContactFormProps) {
  const [questionSenderName, setQuestionSenderName] = useState("");
  const [questionBusinessName, setQuestionBusinessName] = useState("");
  const [questionEmail, setQuestionEmail] = useState("");
  const [questionWebsiteUrl, setQuestionWebsiteUrl] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [questionSuccess, setQuestionSuccess] = useState(false);
  const [questionSaveMethod, setQuestionSaveMethod] = useState<'firebase' | 'local'>('firebase');

  // Determine if this section is inside a private proposal page or public
  const isProposalPage = window.location.pathname !== '/' && 
    window.location.pathname !== '/services' && 
    !window.location.pathname.startsWith('/packages') && 
    !window.location.pathname.startsWith('/work') && 
    !window.location.pathname.startsWith('/free-website-check') &&
    !window.location.pathname.startsWith('/contact');

  const getIntakeUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('lead') || urlParams.get('leadId') || urlParams.get('id');
    const campaignId = urlParams.get('campaign') || urlParams.get('campaignId') || urlParams.get('utm_campaign');
    const industrySlug = urlParams.get('industry');

    const params = new URLSearchParams();
    
    // Set source
    if (isProposalPage || urlParams.get('source') === 'proposal') {
      params.set('source', 'proposal');
      if (industrySlug) {
        params.set('industry', industrySlug);
      } else if (window.location.pathname.includes('swimming')) {
        params.set('industry', 'swimming-school');
      } else {
        params.set('industry', 'trades-business');
      }
    } else {
      params.set('source', 'homepage_quote');
    }

    if (leadId) params.set('lead', leadId);
    if (campaignId) params.set('campaign', campaignId);
    if (packageSelection) params.set('package', packageSelection);
    if (calculatedPrice) params.set('price', calculatedPrice);

    return `/client-intake?${params.toString()}`;
  };

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !questionSenderName.trim() || !questionEmail.trim()) {
      return;
    }
    setQuestionSubmitting(true);
    setQuestionSaveMethod('firebase');
    
    const urlParams = new URLSearchParams(window.location.search);
    const leadId = urlParams.get('lead') || urlParams.get('leadId') || urlParams.get('id');
    const campaignId = urlParams.get('campaign') || urlParams.get('campaignId') || urlParams.get('utm_campaign');
    
    const payload = {
      lead_type: 'project_question',
      source: 'homepage_question',
      source_page: 'homepage_question',
      status: 'Question Asked',
      question_text: questionText,
      business_name: questionBusinessName || null,
      contact_name: questionSenderName,
      email: questionEmail,
      website_url: questionWebsiteUrl || null,
      lead_id: leadId || null,
      campaign_id: campaignId || null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };

    const trackingPayload = {
      lead_id: leadId || null,
      campaign_id: campaignId || null,
      event_type: 'question_submitted',
      source: 'homepage_question',
      page_path: window.location.pathname,
      created_at: serverTimestamp()
    };

    const handleSuccessState = () => {
      setQuestionSuccess(true);
      setQuestionText("");
      setQuestionSenderName("");
      setQuestionBusinessName("");
      setQuestionEmail("");
      setQuestionWebsiteUrl("");
      setTimeout(() => setQuestionSuccess(false), 9000);
    };

    if (!isFirebaseConfigured) {
      console.warn("Firebase is unconfigured. Capturing question in Local Storage Fallback.");
      saveToLocalFallback('intakes', payload);
      saveToLocalFallback('trackingEvents', trackingPayload);
      setQuestionSaveMethod('local');
      handleSuccessState();
      setQuestionSubmitting(false);
      return;
    }

    try {
      await withTimeout(addDoc(collection(db, "intakes"), payload), 4500);
      try {
        await addDoc(collection(db, "trackingEvents"), trackingPayload);
      } catch (trackErr) {
        console.warn("Failed tracking event creation:", trackErr);
      }
      setQuestionSaveMethod('firebase');
      handleSuccessState();
    } catch (err: any) {
      console.error("Firebase write timed out or errored for question:", err);
      saveToLocalFallback('intakes', payload);
      saveToLocalFallback('trackingEvents', trackingPayload);
      setQuestionSaveMethod('local');
      handleSuccessState();
    } finally {
      setQuestionSubmitting(false);
    }
  };

  const primaryTargetUrl = getIntakeUrl();
  const primaryCtaText = isProposalPage ? "Start Project Intake" : "Get a Website Quote";

  return (
    <section 
      id="contact" 
      className="py-20 bg-transparent border-t border-white/5 text-left relative overflow-hidden"
    >
      <div className="absolute top-[25%] left-[-10%] w-[45%] h-[45%] rounded-full bg-cyan-950/10 blur-[130px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
        
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* Primary Card - Visual Dominator */}
          <div className="md:col-span-7 flex flex-col justify-between p-6 sm:p-10 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent blur-xl rounded-full"></div>
            
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#22d3ee] font-semibold">
                Direct Track
              </span>
              <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight leading-none">
                Start with a clear website quote
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Tell me about your business, current website and what you need built. I’ll review your details and recommend the simplest path forward.
              </p>
              
              {packageSelection && (
                <div className="p-3 bg-cyan-950/20 border border-cyan-800/20 rounded-xl flex justify-between items-center text-[11px] mt-2">
                  <span className="text-slate-300 font-medium truncate flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
                    Preset Active: {packageSelection} ({calculatedPrice})
                  </span>
                  <button 
                    onClick={onClearSelection}
                    className="text-[10px] text-[#22d3ee] hover:text-white underline font-medium shrink-0 ml-1.5 cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <a 
                href={primaryTargetUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 active:scale-95 cursor-pointer group"
              >
                {primaryCtaText}
                <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-1" />
              </a>
              
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Share your business goals, budget and timeline. I’ll review your details and send a clear recommendation, scope and next steps.
              </p>
            </div>
          </div>

          {/* Secondary Card - Ask a project question first */}
          <div className="md:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-slate-900 border border-white/5 relative overflow-hidden">
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#22d3ee]/60 font-semibold">
                Instant Follow-up
              </span>
              <h4 className="text-xl font-bold text-white tracking-tight">
                Ask a project question first
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed font-light">
                Not ready for a full quote yet? Send a quick project question and I’ll reply with a clear next step.
              </p>

              {questionSuccess ? (
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs flex flex-col gap-3 max-w-full">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-450" />
                    <span>Question Received!</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-light leading-normal">
                    Thanks — your question has been received. I’ll review it and reply with the next best step.
                  </p>
                  
                  <div className="border-t border-emerald-950/40 pt-3 mt-1">
                    <p className="text-[11px] text-emerald-300/80 mb-2 font-medium">Ready to start?</p>
                    <a 
                      href={primaryTargetUrl}
                      className="block text-center w-full py-2 bg-emerald-900/40 hover:bg-emerald-800/60 transition text-emerald-300 font-bold rounded-lg border border-emerald-700/50"
                    >
                      Complete the Intake Form
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendQuestion} className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Name <span className="text-[#22d3ee]">*</span></label>
                      <input 
                        type="text"
                        required
                        value={questionSenderName}
                        onChange={(e) => setQuestionSenderName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full p-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-xs outline-none focus:border-cyan-500/50 transition font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Business</label>
                      <input 
                        type="text"
                        value={questionBusinessName}
                        onChange={(e) => setQuestionBusinessName(e.target.value)}
                        placeholder="Company"
                        className="w-full p-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-xs outline-none focus:border-cyan-500/50 transition font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Email <span className="text-[#22d3ee]">*</span></label>
                    <input 
                      type="email"
                      required
                      value={questionEmail}
                      onChange={(e) => setQuestionEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full p-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-xs outline-none focus:border-cyan-500/50 transition font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Current Website (Optional)</label>
                    <input 
                      type="url"
                      value={questionWebsiteUrl}
                      onChange={(e) => setQuestionWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full p-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-xs outline-none focus:border-cyan-500/50 transition font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Question <span className="text-[#22d3ee]">*</span></label>
                    <textarea 
                      rows={3}
                      required
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Your question about your project..."
                      className="w-full p-2.5 bg-slate-950 text-white border border-white/10 rounded-xl text-xs outline-none focus:border-cyan-500/50 transition resize-none font-sans"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={questionSubmitting || !questionText.trim() || !questionSenderName.trim() || !questionEmail.trim()}
                    className="w-full py-2.5 px-4 bg-[#22d3ee] text-slate-950 text-xs font-bold rounded-xl hover:bg-cyan-300 disabled:opacity-40 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/5 hover:shadow-cyan-400/10"
                  >
                    {questionSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Send Project Question
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Footer Reassurance Info Block */}
        <div className="mt-12 text-center bg-transparent relative space-y-2">
          <p className="text-xs text-slate-400 font-medium leading-normal max-w-lg mx-auto">
            All requests are reviewed by Clarity Space and followed up within 24 hours.
          </p>
          <p className="text-[11px] text-slate-550 font-light leading-normal max-w-xl mx-auto">
            Your details are used only to review your request, prepare a recommendation and contact you about your enquiry.
          </p>
        </div>

      </div>
    </section>
  );
}
