import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured, getLocalFallbackSubmissions } from '../firebase';
import { 
  CheckCircle, MessageSquare, AlertCircle, ArrowLeft, Send, 
  HelpCircle, Eye, RefreshCw, Flame, Loader2
} from 'lucide-react';

export default function ProjectFeedback() {
  const { secureToken } = useParams<{ secureToken: string }>();
  
  // Project / Lead tracking states
  const [project, setProject] = useState<any>(null);
  const [collectionName, setCollectionName] = useState<'intakes' | 'outreachLeads' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [overallFeeling, setOverallFeeling] = useState('Loved it');
  const [pageSection, setPageSection] = useState('Homepage');
  const [feedbackType, setFeedbackType] = useState('Visual Design');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [referenceLink, setReferenceLink] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!secureToken) {
      setError("Invalid or missing reference token.");
      setLoading(false);
      return;
    }

    async function findProject() {
      try {
        if (!isFirebaseConfigured) {
          // Local fallback mode
          const localItems = getLocalFallbackSubmissions();
          const match = localItems.find(item => item.data?.secure_token === secureToken);
          
          if (match) {
            setProject({ id: match.id, ...match.data });
            setCollectionName(match.collection as 'intakes' | 'outreachLeads');
          } else {
            setError("Project reference not found in offline database cache.");
          }
          setLoading(false);
          return;
        }

        // 1. Search in intakes
        const intakesQuery = query(collection(db, "intakes"), where("secure_token", "==", secureToken));
        const intakesSnap = await getDocs(intakesQuery);
        
        if (!intakesSnap.empty) {
          const docId = intakesSnap.docs[0].id;
          setProject({ id: docId, ...intakesSnap.docs[0].data() });
          setCollectionName("intakes");
          setLoading(false);
          return;
        }

        // 2. Search in outreachLeads
        const outreachQuery = query(collection(db, "outreachLeads"), where("secure_token", "==", secureToken));
        const outreachSnap = await getDocs(outreachQuery);

        if (!outreachSnap.empty) {
          const docId = outreachSnap.docs[0].id;
          setProject({ id: docId, ...outreachSnap.docs[0].data() });
          setCollectionName("outreachLeads");
          setLoading(false);
          return;
        }

        setError("Project path not found. Please verify the URL with Clarity Space support.");
        setLoading(false);
      } catch (err: any) {
        console.error("Error finding client project project-feedback:", err);
        setError("Unable to sync project details. Please reload.");
        setLoading(false);
      }
    }

    findProject();
  }, [secureToken]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Please describe your feedback details before submitting.");
      return;
    }

    setIsSubmitting(true);

    const feedbackData = {
      project_id: project.id,
      project_collection: collectionName,
      business_name: project.business_name || project.businessName || "Your Business",
      contact_name: project.contact_name || project.contactName || "Client",
      overall_feeling: overallFeeling,
      page_section: pageSection,
      feedback_type: feedbackType,
      message: message.trim(),
      priority: priority,
      reference_link: referenceLink.trim(),
      status: "New", // New, Accepted, In Progress, Done, Deferred, Out of Scope
      submitted_at: new Date().toISOString()
    };

    try {
      if (isFirebaseConfigured) {
        // 1. Save to feedbacks root collection
        await addDoc(collection(db, "feedbacks"), {
          ...feedbackData,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });

        // 2. Update lead status to 'Client Review'
        const docRef = doc(db, collectionName!, project.id);
        await updateDoc(docRef, {
          status: 'Client Review',
          feedback_submitted_at: new Date().toISOString(),
          updated_at: serverTimestamp()
        });
      } else {
        // Offline mode backup storage to localStorage
        const existingFeedbacksStr = localStorage.getItem('clarity_local_feedbacks') || '[]';
        const existingFeedbacks = JSON.parse(existingFeedbacksStr);
        existingFeedbacks.push({
          id: Math.random().toString(36).substring(2, 9),
          ...feedbackData
        });
        localStorage.setItem('clarity_local_feedbacks', JSON.stringify(existingFeedbacks));

        // Update local lead status
        const localItems = getLocalFallbackSubmissions();
        const updatedItems = localItems.map(item => {
          if (item.id === project.id) {
            return {
              ...item,
              data: {
                ...item.data,
                status: 'Client Review',
                feedback_submitted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            };
          }
          return item;
        });
        localStorage.setItem('clarityspace_local_intakes', JSON.stringify(updatedItems));
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-center items-center p-6">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-mono text-sm">Aligning secure feedback console...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-center items-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold tracking-tight">Access Token Invalid</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {error || "We could not find a corresponding project reference node."}
          </p>
          <div className="pt-2">
            <Link to="/" className="px-6 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition block">
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const businessName = project.business_name || project.businessName || "Your Business";

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-400">
      
      {/* Top Banner */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={`/project-status/${secureToken}`} className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4 text-cyan-500" />
            <span>Back to Milestones</span>
          </Link>
          <span className="font-mono text-[9px] tracking-widest text-cyan-500 font-black border border-cyan-500/30 bg-cyan-950/20 px-2 py-0.5 rounded">
            FEEDBACK HUB
          </span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8 animate-fadeIn">
        
        {/* Success Page overlay */}
        {submitSuccess ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-center animate-feedIn">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-450">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Review Feedback Logged</h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                Thank you! Your revision ticket has been transmitted to our operations workspace backlog.
                The project status has synced to <span className="text-cyan-400 font-semibold font-mono">Under Review</span>. Our developers will integrate updates onto your staging build shortly!
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Link to={`/project-status/${secureToken}`} className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition">
                Return to Status Deck
              </Link>
              <button onClick={() => setSubmitSuccess(false)} className="px-6 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 rounded-xl text-xs font-semibold hover:text-white transition">
                Log Another Tweaks Ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Header copy */}
            <div className="space-y-1">
              <p className="text-xs font-mono text-cyan-500 uppercase tracking-widest">STAGING BUILD REVISIONS</p>
              <h2 className="text-3xl font-black text-white tracking-tight">{businessName} Revisions Panel</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Log specific tweaks, bug reports, visual layouts modifications, or copywriting replacements. Your comments sync real-time straight to our local developer board.
              </p>
            </div>

            {/* Main Form container */}
            <form onSubmit={handleSubmitFeedback} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
              
              {/* Question 1: Overall feeling */}
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  How are you feeling overall with the current staging build?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Loved it", emoji: "😍" },
                    { label: "Needs some tweaks", emoji: "🎨" },
                    { label: "Not what I expected", emoji: "🤔" }
                  ].map((f) => (
                    <button
                      type="button"
                      key={f.label}
                      onClick={() => setOverallFeeling(f.label)}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        overallFeeling === f.label 
                          ? "bg-cyan-950/40 border-cyan-500/60 text-cyan-400 shadow-md shadow-cyan-500/10" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-xl select-none">{f.emoji}</span>
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row: Page section & Feedback type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Target Page / Component Section
                  </label>
                  <select
                    value={pageSection}
                    onChange={(e) => setPageSection(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-800 focus:border-cyan-500 outline-none text-slate-200 text-xs rounded-xl px-4 py-3 select-all cursor-pointer"
                  >
                    <option value="Homepage">Homepage</option>
                    <option value="Services">Services Page</option>
                    <option value="Contact">Contact & CRM Forms</option>
                    <option value="Navigation">Navigation / Mobile Menu</option>
                    <option value="Footer">Footer & Legal</option>
                    <option value="Other">Other Section</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Feedback Classification
                  </label>
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-800 focus:border-cyan-500 outline-none text-slate-200 text-xs rounded-xl px-4 py-3 select-all cursor-pointer"
                  >
                    <option value="Visual Design">Visual Design (spacing, fonts, colors)</option>
                    <option value="Copy/Text">Copy/Text (typos, adjustments)</option>
                    <option value="Functionality">Functionality (actions, buttons)</option>
                    <option value="Bug">Technical issue / Bug</option>
                    <option value="Other">Other Request</option>
                  </select>
                </div>

              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Describe the requested adjustments *
                </label>
                <p className="text-[10px] text-slate-500 mt-0.5">Please be as specific as possible (e.g. "On the hero section, replace the third line with standard copy...")</p>
                <textarea
                  required
                  placeholder="e.g. Change the main call to action text on the banner..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-32 bg-[#020617] border border-slate-804 focus:border-cyan-500 outline-none text-slate-200 text-xs rounded-xl p-4 leading-normal resize-none font-sans"
                />
              </div>

              {/* Row: Priority & Reference Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Task Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Low", "Medium", "High"].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`py-2 px-3 rounded-xl border text-xs text-center font-semibold cursor-pointer transition-all ${
                          priority === p 
                            ? p === 'High' 
                              ? "bg-rose-950/30 border-rose-500/65 text-rose-400" 
                              : p === 'Medium' 
                                ? "bg-amber-950/30 border-amber-500/65 text-amber-400"
                                : "bg-cyan-950/30 border-cyan-500/65 text-cyan-400"
                            : "bg-[#020617] border-slate-800 text-slate-550 hover:border-slate-750"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Link/Reference Screenshot URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="e.g. https://imgur.com/image-id or screenshot folder"
                    value={referenceLink}
                    onChange={(e) => setReferenceLink(e.target.value)}
                    className="w-full bg-[#020617] border border-slate-800 focus:border-cyan-500 outline-none text-slate-200 text-xs rounded-xl px-4 py-3 select-all"
                  />
                </div>

              </div>

              {/* Form Actions */}
              <div className="border-t border-slate-850 pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl text-xs hover:scale-[1.01] transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Revisions Ticket...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Revision Ticket
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Reassuring footer panel */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl text-center text-xs text-slate-450 leading-relaxed font-light">
              This panel uses modern digital workspace security. If you have immediate questions, don't hesitate to write to us. Your changes sync in less than 2 seconds!
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
