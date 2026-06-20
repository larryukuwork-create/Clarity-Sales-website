import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured, getLocalFallbackSubmissions, handleFirestoreError, OperationType } from '../firebase';
import { 
  CheckCircle, Clock, FileText, Globe, MessageSquare, AlertCircle, 
  ExternalLink, ArrowRight, ShieldCheck, CreditCard, FolderOpen, Flame, ChevronLeft,
  Calendar, Palette, Layers, Info, CheckSquare, Settings, Activity, Save, RefreshCw, List, Plus, Trash, Lock
} from 'lucide-react';
import { generateInternalChecklist } from '../lib/automations';

export default function ProjectStatus() {
  const { secureToken } = useParams<{ secureToken: string }>();
  const [project, setProject] = useState<any>(null);
  const [hasLoggedInitialView, setHasLoggedInitialView] = useState(false);
  const [collectionName, setCollectionName] = useState<'intakes' | 'outreachLeads' | null>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blueprintTab, setBlueprintTab] = useState<'identity' | 'network' | 'timeline' | 'configure' | 'activity'>('identity');
  const [editForm, setEditForm] = useState<any>(null);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [newPageInput, setNewPageInput] = useState("");

  // Interactive Proposal & Direct EFT Bank Transfer payment states
  const [proposalSignedCheckbox, setProposalSignedCheckbox] = useState(false);
  const [proposalSignature, setProposalSignature] = useState("");
  const [paymentReferenceInput, setPaymentReferenceInput] = useState("");
  const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] = useState(false);
  const [globalBankSettings, setGlobalBankSettings] = useState<any>(null);
  const [copiedBsb, setCopiedBsb] = useState(false);
  const [copiedAccountNumber, setCopiedAccountNumber] = useState(false);

  const navigate = useNavigate();

  // Client Portal Search & Self-Retrieval Access States
  const [accessMode, setAccessMode] = useState<'email' | 'token'>('email');
  const [accessEmailInput, setAccessEmailInput] = useState('');
  const [accessTokenInput, setAccessTokenInput] = useState('');
  const [accessSearching, setAccessSearching] = useState(false);
  const [accessSearched, setAccessSearched] = useState(false);
  const [accessResults, setAccessResults] = useState<any[]>([]);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [copiedResultTokenId, setCopiedResultTokenId] = useState<string | null>(null);

  const handleAccessSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAccessSearching(true);
    setAccessError(null);
    setAccessSearched(true);
    setAccessResults([]);

    try {
      const emailQueryStr = accessEmailInput.trim().toLowerCase();
      const tokenQueryStr = accessTokenInput.trim();

      if (!isFirebaseConfigured) {
        // Fallback search from local storage mock base
        const localItems = getLocalFallbackSubmissions();
        const matches = localItems.filter(item => {
          if (accessMode === 'email') {
            return item.data?.email?.trim().toLowerCase() === emailQueryStr;
          } else {
            return item.data?.secure_token === tokenQueryStr;
          }
        });
        const mapped = matches.map(m => ({
          id: m.id,
          business_name: m.data?.business_name,
          secure_token: m.data?.secure_token,
          status: m.data?.status || 'Active'
        }));
        setAccessResults(mapped);
      } else {
        // Firebase Firestore search
        const results: any[] = [];
        
        if (accessMode === 'email') {
          if (!emailQueryStr) {
            setAccessError("Please enter your email address to search.");
            setAccessSearching(false);
            return;
          }
          // Query both intakes and outreachLeads
          const intakesQ = query(collection(db, "intakes"), where("email", "==", emailQueryStr));
          const intakesSnap = await getDocs(intakesQ);
          intakesSnap.forEach(d => {
            results.push({ id: d.id, ...d.data(), source: 'intakes' });
          });

          const outreachQ = query(collection(db, "outreachLeads"), where("email", "==", emailQueryStr));
          const outreachSnap = await getDocs(outreachQ);
          outreachSnap.forEach(d => {
            results.push({ id: d.id, ...d.data(), source: 'outreachLeads' });
          });
        } else {
          if (!tokenQueryStr) {
            setAccessError("Please enter your secure token to search.");
            setAccessSearching(false);
            return;
          }
          const intakesQ = query(collection(db, "intakes"), where("secure_token", "==", tokenQueryStr));
          const intakesSnap = await getDocs(intakesQ);
          intakesSnap.forEach(d => {
            results.push({ id: d.id, ...d.data(), source: 'intakes' });
          });

          const outreachQ = query(collection(db, "outreachLeads"), where("secure_token", "==", tokenQueryStr));
          const outreachSnap = await getDocs(outreachQ);
          outreachSnap.forEach(d => {
            results.push({ id: d.id, ...d.data(), source: 'outreachLeads' });
          });
        }

        // De-duplicate by secure_token to avoid double listings
        const uniqueMap = new Map();
        results.forEach(r => {
          if (r.secure_token) {
            uniqueMap.set(r.secure_token, r);
          }
        });
        const mappedArray = Array.from(uniqueMap.values()).map(r => ({
          id: r.id,
          business_name: r.business_name || r.businessName || "Your Build Concept",
          secure_token: r.secure_token,
          status: r.status || 'Active'
        }));

        setAccessResults(mappedArray);
      }
    } catch (err: any) {
      console.error(err);
      setAccessError("Connection lost or authentication slow. Please check credentials or contact David.");
    } finally {
      setAccessSearching(false);
    }
  };

  // Load global agencySettings from Firestore or local storage fallback
  useEffect(() => {
    if (!isFirebaseConfigured) {
      try {
        const saved = localStorage.getItem("clarity_default_bank_details");
        if (saved) {
          setGlobalBankSettings(JSON.parse(saved));
        }
      } catch (e) {
        // ignore
      }
      return;
    }
    const docRef = doc(db, "agencySettings", "global");
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setGlobalBankSettings(snap.data());
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "agencySettings/global");
    });
    return () => unsub();
  }, []);

  // Log portal view once on mount or when project becomes active
  useEffect(() => {
    if (project && !hasLoggedInitialView) {
      setHasLoggedInitialView(true);
      const logMessage = "Client accessed Secure Operations Portal. Web session sync completed matching secure token.";
      
      const newLog = {
        timestamp: new Date().toISOString(),
        message: logMessage,
        user: 'Client'
      };

      const updatedActivityLog = [
        ...(project.activity_log || []),
        newLog
      ];

      if (isFirebaseConfigured && collectionName) {
        import('firebase/firestore').then(async ({ updateDoc: updateFbDoc, doc: fbDoc, serverTimestamp: ts }) => {
          try {
            await updateFbDoc(fbDoc(db, collectionName, project.id), {
              activity_log: updatedActivityLog,
              updated_at: ts()
            });
          } catch(e) {
            console.warn("Could not log portal view to cloud:", e);
          }
        });
      } else {
        // Offline local update
        try {
          const localItemsStr = localStorage.getItem('clarity_local_submissions') || '[]';
          const localItems = JSON.parse(localItemsStr);
          const index = localItems.findIndex((item: any) => item.id === project.id);
          if (index !== -1) {
            localItems[index].data = {
              ...localItems[index].data,
              activity_log: updatedActivityLog,
              updated_at: new Date().toISOString()
            };
            localStorage.setItem('clarity_local_submissions', JSON.stringify(localItems));
          }
        } catch(e) {}
      }

      setProject((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          activity_log: updatedActivityLog
        };
      });
    }
  }, [project, collectionName, hasLoggedInitialView]);

  const updateFormValue = (key: string, value: any) => {
    setEditForm((prev: any) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  };

  const toggleFormArrayValue = (key: 'selected_goals' | 'selected_pages' | 'selected_features', item: string) => {
    setEditForm((prev: any) => {
      if (!prev) return prev;
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      if (current.includes(item)) {
        return { ...prev, [key]: current.filter((i: string) => i !== item) };
      }
      return { ...prev, [key]: [...current, item] };
    });
  };

  const handleApproveProposal = async () => {
    if (!project || !proposalSignedCheckbox || !proposalSignature.trim()) return;
    try {
      await updateProjectData({
        status: 'Deposit Requested',
        proposal_approved: true,
        proposal_approved_at: new Date().toISOString(),
        client_signature: proposalSignature.trim()
      }, [
        `Proposal signed and approved by client with signature "${proposalSignature.trim()}"`,
        `Project status progressed to "Deposit Requested"`
      ]);
      setSaveMessage({ type: 'success', text: 'Proposal successfully approved and signed! Awaiting initial deposit.' });
    } catch (err) {
      console.error(err);
      setSaveMessage({ type: 'error', text: 'Failed to approve proposal. Please try again.' });
    }
  };

  const handleConfirmPayment = async () => {
    if (!project) return;
    try {
      await updateProjectData({
        status: 'Assets Requested',
        deposit_paid_at: new Date().toISOString(),
        deposit_payment_reference: paymentReferenceInput.trim() || 'Direct Bank EFT'
      }, [
        `Client confirmed deposit payment was sent offline (Ref: "${paymentReferenceInput.trim() || 'EFT Bank Transfer'}").`,
        `Project status updated to "Deposit Paid" and progressed to "Assets Requested".`
      ]);
      setPaymentReferenceInput("");
      setIsConfirmPaymentOpen(false);
      setSaveMessage({ type: 'success', text: 'Thank you! Payment received confirmation logged. You can now access your customized assets handover folder in Google Drive below.' });
    } catch (err) {
      console.error(err);
      setSaveMessage({ type: 'error', text: 'Failed to log offline payment. Please try again.' });
    }
  };

  useEffect(() => {
    if (project) {
      setEditForm({
        business_name: project.business_name || project.businessName || '',
        contact_name: project.contact_name || project.contactName || '',
        email: project.email || project.clientEmail || '',
        phone: project.phone || '',
        location: project.location || '',
        industry: project.industry || '',
        website_url: project.website_url || project.websiteUrl || '',
        
        selected_goals: Array.isArray(project.selected_goals) ? [...project.selected_goals] : 
                        typeof project.selected_goals === 'string' ? (project.selected_goals ? project.selected_goals.split(',').map((g: any) => g.trim()) : []) : [],
        
        selected_pages: Array.isArray(project.selected_pages) ? [...project.selected_pages] : 
                        typeof project.selected_pages === 'string' ? (project.selected_pages ? project.selected_pages.split(',').map((g: any) => g.trim()) : []) : [],
        
        selected_features: Array.isArray(project.selected_features) ? [...project.selected_features] : 
                           typeof project.selected_features === 'string' ? (project.selected_features ? project.selected_features.split(',').map((g: any) => g.trim()) : []) : [],
        
        main_outcome: project.main_outcome || '',
        
        branding_readiness_logo: project.branding_readiness_logo || '',
        branding_readiness_colors: project.branding_readiness_colors || '',
        content_readiness_copy: project.content_readiness_copy || '',
        content_readiness_photos: project.content_readiness_photos || '',
        domain_status: project.domain_status || '',
        hosting_status: project.hosting_status || '',
        business_email_status: project.business_email_status || '',
        
        budget_range: project.budget_range || '',
        timeline: project.timeline || '',
        decision_status: project.decision_status || '',
        notes: project.notes || '',

        // Additional creative specs
        brand_colors_primary: project.brand_colors_primary || '',
        brand_colors_secondary: project.brand_colors_secondary || '',
        brand_colors_accent: project.brand_colors_accent || '',
        typography_style: project.typography_style || project.brand_typography_headings || '',
        brand_typography_body: project.brand_typography_body || '',
        brand_tone_of_voice: project.brand_tone_of_voice || '',
        design_mood: project.design_mood || project.brand_design_mood || '',

        // Additional network configs
        domain_name: project.domain_name || '',
        domain_registrar: project.domain_registrar || '',
        domain_dns_setup_status: project.domain_dns_setup_status || '',
        hosting_staging_platform: project.hosting_staging_platform || '',
        external_analytics_id: project.external_analytics_id || '',

        // Additional timelines
        estimated_start_date: project.estimated_start_date || '',
        target_launch_date: project.target_launch_date || project.estimated_launch_date || ''
      });
    }
  }, [project, blueprintTab]);

  const updateProjectData = async (fieldsToUpdate: any, logMessages: string[]) => {
    try {
      const newLogs = logMessages.map(msg => ({
        timestamp: new Date().toISOString(),
        message: msg,
        user: 'Client'
      }));

      const updatedActivityLog = [
        ...(project.activity_log || []),
        ...newLogs
      ];

      if (isFirebaseConfigured && collectionName) {
        const { updateDoc: updateFbDoc, doc: fbDoc, serverTimestamp: ts } = await import('firebase/firestore');
        await updateFbDoc(fbDoc(db, collectionName, project.id), {
          ...fieldsToUpdate,
          activity_log: updatedActivityLog,
          updated_at: ts()
        });

        // Add feedback system message of change
        const { addDoc: addFbDoc } = await import('firebase/firestore');
        for (const msg of logMessages) {
          await addFbDoc(collection(db, "feedbacks"), {
            project_id: project.id,
            project_collection: collectionName,
            business_name: project.business_name || project.businessName || "Your Business",
            contact_name: project.contact_name || project.contactName || "Client",
            feedback_type: "System Configuration Log",
            message: `🛠️ [Audit Log] ${msg}`,
            submitted_by: "system",
            submitted_at: new Date().toISOString(),
            status: "New",
            created_at: ts(),
            updated_at: ts()
          });
        }
      } else {
        // Local fallback storage
        const localItemsStr = localStorage.getItem('clarity_local_submissions') || '[]';
        const localItems = JSON.parse(localItemsStr);
        const index = localItems.findIndex((item: any) => item.id === project.id || (item.data && item.data.secure_token === secureToken));
        if (index !== -1) {
          localItems[index].data = {
            ...localItems[index].data,
            ...fieldsToUpdate,
            activity_log: updatedActivityLog,
            updated_at: new Date().toISOString()
          };
          localStorage.setItem('clarity_local_submissions', JSON.stringify(localItems));
        }

        // feedback logs fallback
        const existingStr = localStorage.getItem('clarity_local_feedbacks') || '[]';
        const existing = JSON.parse(existingStr);
        for (const msg of logMessages) {
          existing.push({
            id: Math.random().toString(36).substring(2, 9),
            project_id: project.id,
            project_collection: collectionName,
            business_name: project.business_name || project.businessName || "Your Business",
            contact_name: project.contact_name || project.contactName || "Client",
            feedback_type: "System Configuration Log",
            message: `🛠️ [Audit Log] ${msg}`,
            submitted_by: "system",
            submitted_at: new Date().toISOString(),
            status: "New"
          });
        }
        localStorage.setItem('clarity_local_feedbacks', JSON.stringify(existing));
      }

      setProject((prev: any) => ({
        ...prev,
        ...fieldsToUpdate,
        activity_log: updatedActivityLog
      }));

    } catch (err) {
      console.error("Failed to commit project updates:", err);
      throw err;
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !editForm) return;

    setIsSavingConfig(true);
    setSaveMessage(null);
    const logs: string[] = [];
    const updatePayload: any = {};

     const simpleFields = [
      { key: 'business_name', label: 'Business Name' },
      { key: 'contact_name', label: 'Contact Name' },
      { key: 'email', label: 'Contact Email' },
      { key: 'phone', label: 'Contact Phone' },
      { key: 'location', label: 'Location' },
      { key: 'industry', label: 'Industry' },
      { key: 'website_url', label: 'Website URL' },
      { key: 'main_outcome', label: 'Main Outcome' },
      { key: 'branding_readiness_logo', label: 'Brand Logo Status' },
      { key: 'branding_readiness_colors', label: 'Brand Colors Status' },
      { key: 'content_readiness_copy', label: 'Website Copy Status' },
      { key: 'content_readiness_photos', label: 'Website Photos Status' },
      { key: 'domain_status', label: 'Domain Registration Status' },
      { key: 'hosting_status', label: 'Hosting Setup Status' },
      { key: 'business_email_status', label: 'Business Email Status' },
      { key: 'budget_range', label: 'Budget Range' },
      { key: 'timeline', label: 'Project Timeline' },
      { key: 'decision_status', label: 'Decision Status' },
      { key: 'notes', label: 'Client Notes' },
      
      // Creative & Identity
      { key: 'brand_colors_primary', label: 'Primary Brand Color' },
      { key: 'brand_colors_secondary', label: 'Secondary Brand Color' },
      { key: 'brand_colors_accent', label: 'Accent Brand Color' },
      { key: 'typography_style', label: 'Display Headings Font' },
      { key: 'brand_typography_body', label: 'Body Paragraphs Font' },
      { key: 'brand_tone_of_voice', label: 'Brand Tone of Voice' },
      { key: 'design_mood', label: 'Design Theme Aesthetic' },

      // Domains & Networks
      { key: 'domain_name', label: 'Custom Domain Name' },
      { key: 'domain_registrar', label: 'Custom Domain Registrar' },
      { key: 'domain_dns_setup_status', label: 'DNS Delegation Status' },
      { key: 'hosting_staging_platform', label: 'Web Hosting Platform' },
      { key: 'external_analytics_id', label: 'Google Analytics Tracking ID' },

      // Timelines & Schedules
      { key: 'estimated_start_date', label: 'Estimated Start Date' },
      { key: 'target_launch_date', label: 'Target Launch Publication Date' }
    ];

    for (const f of simpleFields) {
      const prevVal = String(project[f.key] || '');
      const newVal = String(editForm[f.key] || '');
      if (prevVal !== newVal) {
        updatePayload[f.key] = newVal;
        logs.push(`${f.label} changed from "${prevVal || 'None'}" to "${newVal || 'None'}"`);
      }
    }

    // Selected goals
    const prevGoals = Array.isArray(project.selected_goals) ? project.selected_goals : [];
    const prevGoalsStr = prevGoals.join(', ');
    const newGoalsStr = (editForm.selected_goals || []).join(', ');
    if (prevGoalsStr !== newGoalsStr) {
      updatePayload.selected_goals = editForm.selected_goals;
      logs.push(`Project goals changed from [${prevGoalsStr || 'None'}] to [${newGoalsStr || 'None'}]`);
    }

    // Selected pages
    const prevPages = Array.isArray(project.selected_pages) ? project.selected_pages : [];
    const prevPagesStr = prevPages.join(', ');
    const newPagesStr = (editForm.selected_pages || []).join(', ');
    if (prevPagesStr !== newPagesStr) {
      updatePayload.selected_pages = editForm.selected_pages;
      logs.push(`Pages needed changed from [${prevPagesStr || 'None'}] to [${newPagesStr || 'None'}]`);
    }

    // Selected features
    const prevFeatures = Array.isArray(project.selected_features) ? project.selected_features : [];
    const prevFeaturesStr = prevFeatures.join(', ');
    const newFeaturesStr = (editForm.selected_features || []).join(', ');
    if (prevFeaturesStr !== newFeaturesStr) {
      updatePayload.selected_features = editForm.selected_features;
      logs.push(`Features list changed from [${prevFeaturesStr || 'None'}] to [${newFeaturesStr || 'None'}]`);
    }

    if (logs.length === 0) {
      setSaveMessage({ type: 'info', text: 'No changes detected.' });
      setIsSavingConfig(false);
      return;
    }

    try {
      await updateProjectData(updatePayload, logs);
      setSaveMessage({ type: 'success', text: 'Configuration saved. Total updates logged: ' + logs.length });
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Error backing up configuration choices.' });
    } finally {
      setIsSavingConfig(false);
    }
  };

  useEffect(() => {
    if (!secureToken) {
      setError("Invalid or missing reference token.");
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    async function findAndSubscribe() {
      try {
        if (!isFirebaseConfigured) {
          // Local fallback mode
          const localItems = getLocalFallbackSubmissions();
          const match = localItems.find(item => item.data?.secure_token === secureToken);
          
          if (match) {
            setProject({ id: match.id, ...match.data });
            setCollectionName(match.collection as 'intakes' | 'outreachLeads');
            
            // local feedback polling
            const loadLocalFeedbacks = () => {
              const localFStr = localStorage.getItem('clarity_local_feedbacks') || '[]';
              const localF = JSON.parse(localFStr).filter((f: any) => f.project_id === match.id);
              setFeedbacks(localF.sort((a: any, b: any) => new Date(b.created_at || b.submitted_at || 0).getTime() - new Date(a.created_at || a.submitted_at || 0).getTime()));
            };
            loadLocalFeedbacks();
            fallbackInterval = setInterval(loadLocalFeedbacks, 2000);
          } else {
            setError("Project reference not found in offline database cache.");
          }
          setLoading(false);
          return;
        }

        let docId = "";
        let finalColl = "";

        // 1. Search in intakes
        const intakesQuery = query(collection(db, "intakes"), where("secure_token", "==", secureToken));
        const intakesSnap = await getDocs(intakesQuery);
        
        if (!intakesSnap.empty) {
          docId = intakesSnap.docs[0].id;
          finalColl = "intakes";
        } else {
          // 2. Search in outreachLeads
          const outreachQuery = query(collection(db, "outreachLeads"), where("secure_token", "==", secureToken));
          const outreachSnap = await getDocs(outreachQuery);
          if (!outreachSnap.empty) {
            docId = outreachSnap.docs[0].id;
            finalColl = "outreachLeads";
          }
        }

        if (docId && finalColl) {
          setCollectionName(finalColl as 'intakes' | 'outreachLeads');
          unsubscribe = onSnapshot(doc(db, finalColl, docId), (snapshot) => {
            if (snapshot.exists()) {
              setProject({ id: snapshot.id, ...snapshot.data() });
            }
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, `${finalColl}/${docId}`);
          });

          // Subscribe to feedbacks
          const feedbackQuery = query(collection(db, "feedbacks"), where("project_id", "==", docId));
          const feedbackUnsub = onSnapshot(feedbackQuery, (fSnap) => {
            const list = fSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
            list.sort((a, b) => {
              const timeA = a.created_at?.seconds 
                ? a.created_at.seconds * 1000 
                : a.submitted_at 
                  ? new Date(a.submitted_at).getTime() 
                  : 0;
              const timeB = b.created_at?.seconds 
                ? b.created_at.seconds * 1000 
                : b.submitted_at 
                  ? new Date(b.submitted_at).getTime() 
                  : 0;
              return timeB - timeA;
            });
            setFeedbacks(list);
          }, (err) => {
            handleFirestoreError(err, OperationType.GET, "feedbacks");
          });
          
          // Override the original unsubscribe to clean up both
          const originalUnsub = unsubscribe;
          unsubscribe = () => {
            originalUnsub();
            feedbackUnsub();
          };
          
          setLoading(false);
        } else {
          setError("Project path not found. Please verify the URL with Clarity Space support.");
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error finding client project project-status:", err);
        setError("Unable to sync project details. Please reload.");
        setLoading(false);
      }
    }

    findAndSubscribe();

    return () => {
      if (unsubscribe) unsubscribe();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [secureToken]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !project) return;
    
    setSubmittingMessage(true);

    const feedbackData = {
      project_id: project.id,
      project_collection: collectionName,
      business_name: project.business_name || project.businessName || "Your Business",
      contact_name: project.contact_name || project.contactName || "Client",
      feedback_type: "General Question",
      message: messageInput.trim(),
      status: "New",
      submitted_at: new Date().toISOString()
    };

    try {
      if (isFirebaseConfigured) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { addDoc: addFbDoc, serverTimestamp: ts } = await import('firebase/firestore');
        await addFbDoc(collection(db, "feedbacks"), {
          ...feedbackData,
          created_at: ts(),
          updated_at: ts()
        });
      } else {
        const existingStr = localStorage.getItem('clarity_local_feedbacks') || '[]';
        const existing = JSON.parse(existingStr);
        existing.push({ id: Math.random().toString(36).substring(2, 9), ...feedbackData });
        localStorage.setItem('clarity_local_feedbacks', JSON.stringify(existing));
      }
      setMessageInput("");
    } catch (e) {
      console.warn("Failed to submit comment:", e);
    } finally {
      setSubmittingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-center items-center p-6">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-mono text-sm">Aligning secure workspace status...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl select-none pointer-events-none" />

        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-6 relative z-10 shadow-xl shadow-black/40">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-cyan-950/40 border border-cyan-800/40 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">Client Portal Access</h2>
            <p className="text-slate-400 text-xs font-light max-w-xs mx-auto leading-relaxed">
              Retrieve and unlock your active build workspace, interactive proposals, and direct invoice schedules.
            </p>
          </div>

          {/* Tab selectors */}
          <div className="flex bg-slate-950 border border-slate-850 p-1.5 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setAccessMode('email');
                setAccessError(null);
                setAccessSearched(false);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                accessMode === 'email'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ✉️ Email Address
            </button>
            <button
              type="button"
              onClick={() => {
                setAccessMode('token');
                setAccessError(null);
                setAccessSearched(false);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                accessMode === 'token'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔑 Secure Token
            </button>
          </div>

          {/* Access form queries */}
          <form onSubmit={handleAccessSearch} className="space-y-4">
            {accessMode === 'email' ? (
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Your Registered Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. hello@company.com"
                  value={accessEmailInput}
                  onChange={(e) => setAccessEmailInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white font-medium outline-none placeholder-slate-700"
                />
              </div>
            ) : (
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Your Unique Token Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cl-g92j5b"
                  value={accessTokenInput}
                  onChange={(e) => setAccessTokenInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl px-3.5 py-3 text-xs sm:text-sm text-white font-mono outline-none placeholder-slate-700"
                />
              </div>
            )}

            {accessError && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/30 text-rose-300 text-[11px] rounded-xl font-medium text-left">
                ⚠️ {accessError}
              </div>
            )}

            <button
              type="submit"
              disabled={accessSearching}
              className="w-full py-3 bg-slate-950 hover:bg-slate-850 text-cyan-400 border border-slate-800 hover:border-cyan-500/20 rounded-xl text-xs uppercase tracking-widest font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {accessSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Scanning Records...</span>
                </>
              ) : (
                <span>Scan Project Registry</span>
              )}
            </button>
          </form>

          {/* Results display */}
          {accessSearched && (
            <div className="pt-2 border-t border-slate-800 space-y-3 animation-fadeIn text-left">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Matching Projects ({accessResults.length})
              </h4>

              {accessResults.length > 0 ? (
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {accessResults.map((res) => {
                    const statusText = res.status || 'Proposal Sent';
                    const isPaid = statusText.includes('Paid') || statusText.includes('Build') || statusText.includes('Asset') || statusText.includes('Review') || statusText.includes('Launch') || statusText.includes('Complete');
                    
                    return (
                      <div key={res.secure_token} className="p-4 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-2xl space-y-3 transition-all">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h5 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{res.business_name}</h5>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">
                              Portal Reference ID
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase tracking-wider shrink-0 ${
                            isPaid
                              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30'
                              : 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/30'
                          }`}>
                            {statusText}
                          </span>
                        </div>

                        {/* Token display row & Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-900">
                          <div className="flex items-center gap-1.5 justify-between bg-[#020617] px-2.5 py-1.5 rounded-lg border border-slate-900 shrink-1">
                            <span className="font-mono text-[10px] text-cyan-300 font-semibold truncate select-all">{res.secure_token}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(res.secure_token);
                                setCopiedResultTokenId(res.secure_token);
                                setTimeout(() => setCopiedResultTokenId(null), 2000);
                              }}
                              className="text-[9px] font-mono uppercase tracking-wider text-cyan-500 hover:text-cyan-400 hover:bg-slate-900 p-1 rounded transition border border-slate-905 shrink-0 cursor-pointer"
                              title="Copy code to clipboard"
                            >
                              {copiedResultTokenId === res.secure_token ? "Copied!" : "Copy"}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              // Reset state and navigate
                              setError(null);
                              setProject(null);
                              setLoading(true);
                              navigate(`/project-status/${res.secure_token}`);
                            }}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10.5px] font-black uppercase tracking-wider py-1.5 px-3.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition shrink-0 shadow-sm"
                          >
                            <span>Enter Portal</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl text-center space-y-1.5">
                  <p className="text-xs text-slate-400 font-medium font-sans">No matching workspaces localized.</p>
                  <p className="text-[10px] text-slate-500 leading-normal font-light">
                    Ensure spelling is correct (e.g. <strong>{accessEmailInput || 'your active email'}</strong>) or contact David at david@clarity.space to retrieve credentials.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-between items-center text-xs text-slate-500">
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600 select-none">Client Security Zone</span>
            <Link to="/" className="text-[11px] font-semibold text-slate-400 hover:text-cyan-400 transition cursor-pointer flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extracted values
  const businessName = project.business_name || project.businessName || "Your Business";
  const contactName = project.contact_name || project.contactName || "Client partner";
  const currentStatus = project.status || "Proposal Approved";
  const currentPackage = project.suggested_package || project.suggestedPackage || "Professional Custom Website";
  
  // Last Updated calculations
  const updatedDate = project.updated_at
    ? (project.updated_at.seconds ? new Date(project.updated_at.seconds * 1000) : new Date(project.updated_at))
    : new Date();

  // Status mapping to client stages
  const statusStages = [
    { key: 'Proposal Sent', index: 1 },
    { key: 'Proposal Approved', index: 1 },
    { key: 'Deposit Requested', index: 1 },
    { key: 'Deposit Paid', index: 2 },
    { key: 'Assets Requested', index: 2 },
    { key: 'Assets Received', index: 2 },
    { key: 'Build Started', index: 3 },
    { key: 'First Preview Sent', index: 3 },
    { key: 'Client Review', index: 4 },
    { key: 'Revisions', index: 4 },
    { key: 'Final Review', index: 4 },
    { key: 'Launch Ready', index: 5 },
    { key: 'Launched', index: 5 },
    { key: 'Completed', index: 5 },
    { key: 'Testimonial Requested', index: 5 }
  ];

  const currentStageIndex = statusStages.find(s => s.key === currentStatus)?.index || 1;

  // Calming display mapping for titles and copy descriptions
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Proposal Sent':
        return {
          title: 'Review Project Proposal',
          desc: 'Your customized statement of work and project scope proposal is ready for review. Accept and sign-off below to unlock billing.',
          color: 'text-indigo-400 border-indigo-900/50 bg-indigo-950/20 animate-pulse'
        };
      case 'Proposal Approved':
        return {
          title: 'Agreement Approved',
          desc: 'Your proposal agreement has been finalized. We are preparing invoice metadata and folder frameworks.',
          color: 'text-cyan-400 border-cyan-900/50 bg-cyan-950/20'
        };
      case 'Deposit Requested':
        return {
          title: 'Awaiting Initial Deposit',
          desc: 'Your project setup is queued. Please complete the initial deposit shown below to secure your start date.',
          color: 'text-amber-400 border-amber-900/50 bg-amber-950/20 animate-pulse'
        };
      case 'Deposit Paid':
        return {
          title: 'Initial Payment Confirmed',
          desc: 'Deposit receipt is processed successfully! We are initializing developer workspaces and secure storage directories.',
          color: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20'
        };
      case 'Assets Requested':
        return {
          title: 'Workspace Directory Set Up',
          desc: 'We require brand directories, asset content, or credential inputs to begin development work.',
          color: 'text-cyan-400 border-cyan-900/50 bg-cyan-950/20'
        };
      case 'Assets Received':
        return {
          title: 'All Asset Directories Saved',
          desc: 'All materials compiled and archived successfully in Drive! Development starting soon.',
          color: 'text-indigo-400 border-indigo-900/50 bg-indigo-950/20'
        };
      case 'Build Started':
        return {
          title: 'Active Code & Development',
          desc: 'Core architecture and responsive styles are in active development. Standby for staging rollout updates.',
          color: 'text-cyan-400 border-cyan-900/50 bg-cyan-950/20 animate-pulse'
        };
      case 'First Preview Sent':
        return {
          title: 'Staging Preview Available',
          desc: 'Your project preview is live! Choose the staging workspace below to review design and draft notes.',
          color: 'text-purple-400 border-purple-900/50 bg-purple-950/20'
        };
      case 'Client Review':
        return {
          title: 'Under Client Review',
          desc: 'Viewing live styling and page details. Please log any visual tweaks or text changes in the feedback board.',
          color: 'text-[#22d3ee] border-cyan-900/50 bg-cyan-950/20'
        };
      case 'Revisions':
        return {
          title: 'Revisions Underway',
          desc: 'Admin team is updating layouts and adjusting copy blocks as requested. A revised preview will trigger shortly.',
          color: 'text-amber-400 border-amber-900/50 bg-amber-950/20 animate-pulse'
        };
      case 'Final Review':
        return {
          title: 'Final Version Sign-off',
          desc: 'All revisions complete. Inspect the live final layout prior to launching secure nameserver registers.',
          color: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20'
        };
      case 'Launch Ready':
        return {
          title: 'Launch Configuration In Progress',
          desc: 'Deploying DNS registers, compiling static bundles, and activating SSL certification.',
          color: 'text-yellow-405 border-yellow-90c/50 bg-yellow-950/20 animate-pulse'
        };
      case 'Launched':
        return {
          title: 'Website Published Real-time',
          desc: 'Congratulations! Your custom build is actively deployed, registered, and accessible globally.',
          color: 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20 font-bold'
        };
      case 'Completed':
        return {
          title: 'Project Closed Successfully',
          desc: 'Handover complete and all workspace dependencies archived. Enjoy your shiny brand new digital asset!',
          color: 'text-slate-300 border-slate-800 bg-slate-900'
        };
      case 'Testimonial Requested':
        return {
          title: 'Review and Legacy Feedbacks',
          desc: 'Build complete! We would love to capture your insights or standard testimonials regarding our collaboration.',
          color: 'text-cyan-300 border-cyan-900/50 bg-cyan-950/20'
        };
      default:
        return {
          title: currentStatus,
          desc: 'Sync active. Standby for status updates.',
          color: 'text-slate-300 border-slate-800 bg-slate-900'
        };
    }
  };

  const currentDisplay = getStatusDisplay(currentStatus);

  // Active status stages milestones definition
  const milestones = [
    { title: "Proposal Approved", label: "Proposal", num: 1 },
    { title: "Deposit / Assets Sent", label: "Initial Setup", num: 2 },
    { title: "Development Build", label: "Development", num: 3 },
    { title: "Client Review & Feedback", label: "Tweaks & Changes", num: 4 },
    { title: "Site Launch", label: "Launch & Go-Live", num: 5 }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-400">
      
      {/* Top reassuring banner */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-white transition-colors duration-150 flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none">
              <ChevronLeft className="w-4 h-4 text-cyan-400" />
              <span>Back to Home</span>
            </Link>
            <span className="text-slate-800 font-mono text-xs hidden sm:inline">|</span>
            <span className="font-mono text-[9px] tracking-widest text-cyan-450 font-black border border-cyan-500/10 bg-cyan-950/10 px-2 py-0.5 rounded uppercase hidden sm:inline select-none">
              Secure Operations Portal
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>Token Status: Connected</span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12 animate-fadeIn">
        
        {/* Onboarding Wizard Sync Alert */}
        <div className="bg-[#030712]/90 border border-cyan-800/50 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl select-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full filter blur-2xl"></div>
          <div className="space-y-1 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.2 py-0.5 rounded-md bg-cyan-950/50 border border-cyan-800/30 text-[10px] font-mono text-cyan-400 font-extrabold uppercase tracking-wider">
              ⚡ LIVE WORKSPACE SYNC
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Interactive Step-by-Step Onboarding Available</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans font-light max-w-xl">
              This Client Portal is synchronized in real-time with your digital onboarding workspace. If you are completing initial milestones (approving your website plan, confirming deposit payments, or uploading brand assets), we recommend using our step-by-step wizard.
            </p>
          </div>
          <Link
            to={`/client-intake?token=${secureToken}`}
            className="w-full md:w-auto px-5 py-3.5 bg-cyan-500 hover:bg-cyan-455 text-slate-950 font-black rounded-2xl text-[11px] uppercase tracking-wider transition-all shadow-md hover:shadow-cyan-500/10 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 z-10"
          >
            <span>Open Project Wizard</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>
        </div>

        {/* Main greeting header card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-cyan-500 font-mono text-xs font-semibold uppercase tracking-wider">PROJECT STATUS HUB</p>
              <h1 className="text-3xl font-black text-white mt-1 tracking-tight select-none">{businessName}</h1>
              <p className="text-slate-400 text-sm mt-1">Hello {contactName}, view current project milestones, assets checklists, staging reviews, and financial workflows safely.</p>
            </div>
            <div className="shrink-0">
              <span className={`px-4 py-2 border rounded-2xl text-xs font-bold font-mono uppercase inline-block text-center ${currentDisplay.color}`}>
                {currentDisplay.title}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl mt-4">
            <p className="text-slate-200 text-sm leading-relaxed">{currentDisplay.desc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-2 border-t border-slate-850">
            <p>Project Type: <span className="text-slate-300 font-medium">{currentPackage}</span></p>
            <p className="hidden sm:inline-block text-slate-700 font-light">•</p>
            <p>Sync Engine: <span className="text-slate-300 font-mono font-medium">Firestore Real-time</span></p>
            <p className="hidden sm:inline-block text-slate-700 font-light">•</p>
            <p>Last Activity: <span className="text-slate-300 font-mono">{updatedDate.toLocaleDateString()} {updatedDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
          </div>
        </div>

        {/* Dynamic SOW / Interactive Quote Dashboard Card */}
        <div className="bg-gradient-to-br from-cyan-950/20 via-[#0a1224] to-slate-900 border border-cyan-500/25 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-[80px] -z-10"></div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[9px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest bg-cyan-950/50 border border-cyan-800/30 px-2.5 py-1 rounded-md">
                Interactive Estimate &amp; Website Plan
              </span>
              <h3 className="font-bold text-white text-lg sm:text-xl mt-2 tracking-tight">Your Website Estimate &amp; Plan</h3>
              <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                View your website estimate and timeline, and complete your digital approval signature.
              </p>
            </div>
            {project.status === 'Proposal Approved' || project.scope_approved ? (
              <span className="px-3 py-1 bg-emerald-950/50 text-emerald-405 border border-emerald-900/40 text-[10px] font-mono font-bold uppercase rounded-xl flex items-center gap-1.5 shadow-sm">
                ✓ Approved
              </span>
            ) : (
              <span className="px-3 py-1 bg-cyan-950/50 text-cyan-450 border border-cyan-900/40 text-[10px] font-mono font-bold uppercase rounded-xl flex items-center gap-1.5 animate-pulse">
                Awaiting Signature
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between pt-3 border-t border-slate-800/60 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Est. Quote Price</span>
              <span className="text-lg font-bold text-cyan-300 font-mono">
                {project.budget_range || 'Calculating...'}
              </span>
            </div>

            <a 
              href={`/static-business-quote?id=${project.id}`} 
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-350 hover:to-blue-450 text-slate-950 font-black rounded-xl text-xs transition duration-200 cursor-pointer shadow-lg shadow-cyan-500/10 flex items-center gap-1.5 self-start"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Design Quote &amp; Proposal</span>
            </a>
          </div>
        </div>

        {/* Interactive Proposal Section & Sign-Off */}
        {project.proposal_text && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full filter blur-[80px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full filter blur-[80px] -z-10"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest bg-cyan-950/50 border border-cyan-800/30 px-2.5 py-1 rounded-md">
                  Active Project Proposal & SOW
                </span>
                <h3 className="font-bold text-white text-xl mt-2 tracking-tight">Statement of Work Agreement</h3>
              </div>
              {project.proposal_approved ? (
                <span className="px-3 py-1 bg-emerald-950/50 text-emerald-400 border border-emerald-900/40 text-xs font-semibold font-mono uppercase rounded-xl flex items-center gap-1.5 shadow-sm">
                  <CheckSquare className="w-4 h-4 text-emerald-400" /> Signed & Approved
                </span>
              ) : (
                <span className="px-3 py-1 bg-indigo-950/50 text-indigo-455 border border-indigo-900/40 text-xs font-semibold font-mono uppercase rounded-xl animate-pulse flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" /> Awaiting Your Sign-off
                </span>
              )}
            </div>

            <div className="p-5 bg-slate-955/90 border border-slate-850/80 rounded-2xl max-h-[350px] overflow-y-auto text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans select-text shadow-inner">
              {project.proposal_text}
            </div>

            {/* If not approved yet, render the approval action form */}
            {!project.proposal_approved ? (
              <div className="p-5 bg-slate-950/40 border border-cyan-500/10 rounded-2xl space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl font-light font-sans">
                  Please review the statement of work above, check the approval box and type your authorized name to instantly seal this agreement. This will transition your project status to billing phase to secure your developer queue position.
                </p>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-[9.5px] uppercase font-mono text-slate-500 font-bold tracking-wider">Accept Terms</label>
                    <label className="flex items-center gap-3 bg-[#020617]/55 border border-slate-850 hover:border-slate-800 p-3 rounded-xl cursor-pointer select-none transition">
                      <input 
                        type="checkbox" 
                        checked={proposalSignedCheckbox}
                        onChange={(e) => setProposalSignedCheckbox(e.target.checked)}
                        className="rounded border-slate-805 bg-slate-950 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-light font-sans">I agree to the specified scope, deliverables, and payment milestones.</span>
                    </label>
                  </div>
                  <div className="w-full md:w-64 space-y-2">
                    <label className="text-[9.5px] uppercase font-mono text-slate-500 font-bold tracking-wider">Authorized Signature Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. your full name"
                      value={proposalSignature}
                      onChange={(e) => setProposalSignature(e.target.value)}
                      className="w-full bg-[#020617] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 rounded-xl p-2.5 outline-none text-xs text-white placeholder-slate-600 font-medium"
                    />
                  </div>
                  <button
                    onClick={handleApproveProposal}
                    disabled={!proposalSignedCheckbox || !proposalSignature.trim()}
                    className="w-full md:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs transition duration-200 cursor-pointer shadow-lg shadow-cyan-950/20 shrink-0 flex items-center justify-center gap-1.5"
                  >
                     Approve & Proceed
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-white flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Agreement Legally Sealed</p>
                  <p className="text-[10.5px] text-slate-400 font-mono">Signee: <strong className="text-emerald-300 font-bold">{project.client_signature}</strong> | Stamp: {new Date(project.proposal_approved_at).toLocaleString()}</p>
                </div>
                <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-900/40 self-start sm:self-auto shadow-sm">
                  🔒 DEFI LOCK SECURE
                </span>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Timeline Component */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" /> Project Milestones
          </h3>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              {/* Desktop connected status bar line */}
              <div className="absolute left-[15px] top-[14px] bottom-[14px] md:left-[14px] md:right-[14px] md:top-[14px] md:bottom-auto h-auto md:h-1 bg-slate-800 z-0 w-0.5 md:w-auto flex-1">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500" 
                  style={{ width: `${Math.min(100, Math.max(0, (currentStageIndex - 1) * 25))}%` }}
                ></div>
              </div>

              {milestones.map((m) => {
                const isActive = m.num === currentStageIndex;
                const isCompleted = m.num < currentStageIndex;
                
                return (
                  <div key={m.num} className="flex md:flex-col items-center gap-4 md:text-center z-10 relative w-full md:w-auto">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono border-2 text-xs font-bold transition-all duration-300 ${
                      isCompleted ? "bg-cyan-500 border-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/10" : 
                      isActive ? "bg-slate-900 border-cyan-400 text-cyan-400 font-black animate-pulse shadow-lg shadow-cyan-400/20" : 
                      "bg-slate-950 border-slate-800 text-slate-500"
                    }`}>
                      {isCompleted ? "✓" : m.num}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${isActive ? "text-cyan-400" : isCompleted ? "text-slate-300" : "text-slate-400"}`}>
                        {m.label}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono tracking-tight mt-0.5 hidden md:block">
                        {m.title}
                      </p>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* Dynamic Project Specs & Launch Matrix */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" /> Project Specifications & Blueprint
            </h3>
            
            {/* Spec Tabs */}
            <div className="flex flex-wrap gap-1 bg-slate-955 border border-slate-805 p-1 rounded-xl font-mono text-[10px] font-bold max-w-full">
              {[
                { id: 'identity', label: '🎨 Identity & Brand', icon: Palette },
                { id: 'network', label: '🌐 Domains & Network', icon: Globe },
                { id: 'timeline', label: '📅 Schedule & Budget', icon: Calendar },
                { id: 'configure', label: '⚙️ Configure Intake', icon: Settings },
                { id: 'activity', label: '📝 Audit Log', icon: Activity }
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setBlueprintTab(t.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      blueprintTab === t.id 
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
            {blueprintTab === 'identity' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800/60 pb-3">
                  <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-450">Creative Identity & Scope Map</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Design standards, copy direction, and content layout configurations mapped to your brief.</p>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Brand Palette dots */}
                  <div className="p-4 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-3">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Visual Palette Specs</span>
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-1">
                        <div 
                          className="w-10 h-10 rounded-full border border-slate-850 shadow-inner flex items-center justify-center relative group" 
                          style={{ backgroundColor: project.brand_colors_primary || '#0ea5e9' }}
                          title={`Primary: ${project.brand_colors_primary || '#0ea5e9'}`}
                        />
                        <div 
                          className="w-10 h-10 rounded-full border border-slate-850 shadow-inner" 
                          style={{ backgroundColor: project.brand_colors_secondary || '#6366f1' }}
                          title={`Secondary: ${project.brand_colors_secondary || '#6366f1'}`}
                        />
                        <div 
                          className="w-10 h-10 rounded-full border border-slate-850 shadow-inner" 
                          style={{ backgroundColor: project.brand_colors_accent || project.brand_colors_dark || '#10b981' }}
                          title={`Accent: ${project.brand_colors_accent || project.brand_colors_dark || '#10b981'}`}
                        />
                      </div>
                      <div className="text-[10px] font-mono leading-tight">
                        <p className="text-slate-300 font-bold">Primary: {project.brand_colors_primary || '#0ea5e9'}</p>
                        <p className="text-slate-450 font-light">Accent: {project.brand_colors_accent || 'Default'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Typography Pairings */}
                  <div className="p-4 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Typography Stack</span>
                    <div className="space-y-1 text-xs font-light">
                      <p className="text-slate-300">
                        Display Headings: <span className="font-semibold text-white">{project.typography_style || project.brand_typography_headings || 'Outfit / Inter'}</span>
                      </p>
                      <p className="text-slate-400">
                        Body / Paragraphs: <span className="text-slate-300">{project.brand_typography_body || 'Inter (Sans-serif)'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Brand Guidelines & Tone */}
                  <div className="p-4 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Brand Tone of Voice</span>
                    <p className="text-xs text-slate-300 italic font-light leading-relaxed">
                      "{project.brand_tone_of_voice || 'Modern, clean, supportive and objective brand voice.'}"
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-2">
                  {/* Scope Pages Target */}
                  <div className="p-4 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Proposed Target Navigation Pages</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(project.pages_to_build || project.scope_target_pages || "Home, About, Services, Contact").split(",").map((p: string, idx: number) => (
                        <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-xl">
                          📄 {p.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Design Mood Context */}
                  <div className="p-4 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Design Aesthetic & Creative Direction</span>
                    <p className="text-xs text-slate-300 font-light leading-relaxed">
                      Theme Vibes: <span className="font-bold text-cyan-400">{project.design_mood || project.brand_design_mood || 'Clean Corporate / Ultra-polished'}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 font-light">
                      Built using optimized CSS grids, custom hover variables, and fluid negative space margins automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {blueprintTab === 'network' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800/60 pb-3">
                  <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-455">Network registers & DNS delegators</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Custom domain nameservers, registrars, analytics tags, and web hosting platforms.</p>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Domain Name */}
                  <div className="p-4 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Preferred Site Domain</span>
                    <p className="text-sm font-semibold font-mono text-white select-all">{project.domain_name || 'Not yet configured'}</p>
                    {project.domain_registrar && (
                      <p className="text-[11px] text-slate-500 font-mono">Registrar partner: <span className="text-slate-300 font-semibold">{project.domain_registrar}</span></p>
                    )}
                  </div>

                  {/* DNS Status */}
                  <div className="p-4 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Nameservers & Routing</span>
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                      <p className="text-[11px] text-slate-300 font-bold uppercase font-mono">{project.domain_dns_setup_status || 'Awaiting Delegation'}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal pt-1 font-light">
                      SSL certifications apply within 24 hours of nameserver updates globally.
                    </p>
                  </div>

                  {/* Hosting and Analytics */}
                  <div className="p-4 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wider">SEO & Tag Integrators</span>
                    <div className="space-y-1.5 text-xs font-light">
                      <p className="text-slate-400">Hosting: <span className="font-semibold text-slate-200">{project.hosting_staging_platform || 'Vercel / Cloud Run'}</span></p>
                      <p className="text-slate-400 font-mono">Meas-ID: <span className="font-mono text-cyan-400 font-bold">{project.external_analytics_id || 'G-XXXXXXXXXX'}</span></p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl text-xs space-y-2">
                  <h5 className="font-bold text-white flex items-center gap-1"><Info className="w-3.5 h-3.5 text-cyan-400" /> DNS Domain Delegation Instructions</h5>
                  <p className="text-slate-300 font-light leading-relaxed">
                    To connect your custom domain, log into your registrar account (like Namecheap or GoDaddy) and add standard <span className="font-mono text-white font-bold bg-[#020617] px-1.5 py-0.5 rounded border border-slate-850 text-[10.5px]">CNAME</span> or <span className="font-mono text-white font-bold bg-[#020617] px-1.5 py-0.5 rounded border border-slate-850 text-[10.5px]">A</span> records pointing to our staging clusters, or choose "Custom Nameservers" and delegate fully as discussed under operations channels.
                  </p>
                </div>
              </div>
            )}

            {blueprintTab === 'timeline' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800/60 pb-3">
                  <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-455">Project Timelines & Launch roadmaps</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Estimated start dates, draft preview milestones and launch release checklists.</p>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Kickoff */}
                  <div className="p-4 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Estimated Project Kickoff</span>
                    <p className="text-sm font-semibold font-mono text-white">{project.estimated_start_date || 'Awaiting Assets Setup'}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">Subject to initial payment receipt and assets handover completion.</p>
                  </div>

                  {/* Target Launch */}
                  <div className="p-4 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Target Publication Date</span>
                    <p className="text-sm font-semibold font-mono text-emerald-400">{project.target_launch_date || project.estimated_launch_date || 'TBD (~3-4 weeks)'}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">Includes live testing and responsiveness revisions.</p>
                  </div>

                  {/* Operational checklist completed count */}
                  <div className="p-4 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase tracking-wider">Administrative Checklist</span>
                    <div className="flex items-center gap-2 pt-1">
                      <CheckSquare className="w-5 h-5 text-cyan-400 shrink-0" />
                      <div className="leading-tight">
                        <p className="text-xs font-bold text-white">Execution Metrics</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {(() => {
                            const listItems = generateInternalChecklist(project.selected_features || project.selectedFeatures || []);
                            const completedCount = listItems.filter(item => project.checklist?.[item]).length;
                            return `${completedCount} of ${listItems.length} tasks completed`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Active Project Execution Checklist */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                        <List className="w-4 h-4 text-cyan-400" />
                        Live Milestone Execution Checklist
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-light">
                        Transparency is our craft. Monitor real-time progress of active development phases and operations.
                      </p>
                    </div>
                    {(() => {
                      const listItems = generateInternalChecklist(project.selected_features || project.selectedFeatures || []);
                      const completedCount = listItems.filter(item => project.checklist?.[item]).length;
                      const percentage = listItems.length ? Math.round((completedCount / listItems.length) * 100) : 0;
                      return (
                        <div className="flex items-center gap-3 self-stretch sm:self-auto bg-[#020617] border border-slate-805 px-3 py-1.5 rounded-xl">
                          <span className="text-[10px] font-mono font-semibold text-slate-350">{percentage}% COMPLETE</span>
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="bg-cyan-450 h-full rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {(() => {
                    const listItems = generateInternalChecklist(project.selected_features || project.selectedFeatures || []);
                    if (listItems.length === 0) {
                      return (
                        <p className="text-xs text-slate-400 italic py-2 text-center select-none">
                          Initializing project tracking. Staging environment parameters will load shortly.
                        </p>
                      );
                    }
                    return (
                      <div className="grid sm:grid-cols-2 gap-3 pt-1">
                        {listItems.map((item) => {
                          const isDone = project.checklist?.[item] || false;
                          const com = project.checklistComments?.[item] || "";
                          const due = project.checklistDueDates?.[item] || "";
                          return (
                            <div 
                              key={item} 
                              className={`p-3 rounded-xl border transition ${
                                isDone 
                                  ? "bg-slate-950/20 border-slate-850/40 text-slate-400" 
                                  : "bg-[#020617]/50 border-slate-850 text-slate-200"
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className="mt-0.5 shrink-0">
                                  {isDone ? (
                                    <div className="w-4 h-4 rounded bg-emerald-950 border border-emerald-800/80 flex items-center justify-center">
                                      <span className="text-[9px] font-bold text-emerald-400">✓</span>
                                    </div>
                                  ) : (
                                    <div className="w-4 h-4 rounded bg-slate-900 border border-slate-800 flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 bg-cyan-450 rounded-full animate-ping ring-2 ring-cyan-950"></div>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1 w-full min-w-0">
                                  <span className={`text-[12px] font-medium block leading-snug ${isDone ? "line-through text-slate-500 font-normal" : "text-white"}`}>
                                    {item}
                                  </span>
                                  
                                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[9px] font-mono">
                                    <span className={`font-semibold ${isDone ? "text-emerald-505" : "text-cyan-455"}`}>
                                      {isDone ? "Completed" : "In Production"}
                                    </span>
                                    {due && (
                                      <span className="text-slate-400 flex items-center gap-1">
                                        <Calendar className="w-2.5 h-2.5 text-cyan-400" /> Due: <strong className="text-slate-300 font-medium">{due}</strong>
                                      </span>
                                    )}
                                  </div>

                                  {com && (
                                    <div className="mt-1 bg-slate-950 border-l border-slate-800 pl-2 py-0.5 mt-1.5">
                                      <p className="text-[10px] italic text-slate-400 leading-snug">
                                        “{com}”
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {project.launch_notes && (
                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-2">
                    <span className="text-[12px] font-mono font-bold tracking-wider uppercase text-cyan-400 block">Launch Instructions & Release Context</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-light">{project.launch_notes}</p>
                  </div>
                )}
              </div>
            )}

            {blueprintTab === 'configure' && editForm && (
              <form onSubmit={handleSaveConfig} className="space-y-6 animate-fadeIn text-slate-300">
                <div className="border-b border-slate-800/60 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-455">Intake configuration & specs management</h4>
                    <p className="text-xs text-slate-405 mt-0.5">Reflect, modify and update any choices made during your original client intake.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/10 disabled:opacity-50"
                  >
                    {isSavingConfig ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin animate-infinite" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{isSavingConfig ? "Saving..." : "Save Settings"}</span>
                  </button>
                </div>

                {saveMessage && (
                  <div className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                    saveMessage.type === 'success' ? 'bg-emerald-950/20 border border-emerald-900/40 text-emerald-300' :
                    saveMessage.type === 'error' ? 'bg-rose-950/20 border border-rose-900/40 text-rose-300' :
                    'bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-350'
                  }`}>
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{saveMessage.text}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Section 1: Business Details */}
                  <div className="p-5 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-4">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block border-b border-slate-800/50 pb-1">🏢 Business Profile Details</span>
                    
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Business / Corporate Name</label>
                        <input
                          type="text"
                          value={editForm.business_name || ""}
                          onChange={(e) => updateFormValue('business_name', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none font-mono text-white transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Primary Contact Person</label>
                        <input
                          type="text"
                          value={editForm.contact_name || ""}
                          onChange={(e) => updateFormValue('contact_name', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none font-mono text-white transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Contact Email</label>
                          <input
                            type="email"
                            value={editForm.email || ""}
                            onChange={(e) => updateFormValue('email', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none font-mono text-white transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Contact Phone</label>
                          <input
                            type="text"
                            value={editForm.phone || ""}
                            onChange={(e) => updateFormValue('phone', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none font-mono text-white transition-all"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Operating Industry</label>
                          <input
                            type="text"
                            value={editForm.industry || ""}
                            onChange={(e) => updateFormValue('industry', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none font-mono text-white transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Location Base</label>
                          <input
                            type="text"
                            value={editForm.location || ""}
                            onChange={(e) => updateFormValue('location', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none font-mono text-white transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Existing Web URL</label>
                        <input
                          type="text"
                          value={editForm.website_url || ""}
                          onChange={(e) => updateFormValue('website_url', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none font-mono text-white transition-all"
                          placeholder="e.g. facebook link, old domain"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Creative & Identity Specs */}
                  <div className="p-5 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-4">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block border-b border-slate-800/50 pb-1">🎨 Creative Identity Specs</span>
                    
                    <div className="space-y-3 text-xs">
                      {/* Primary Color Picker */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Primary Color</label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={editForm.brand_colors_primary?.startsWith('#') && editForm.brand_colors_primary?.length === 7 ? editForm.brand_colors_primary : "#0ea5e9"}
                              onChange={(e) => updateFormValue('brand_colors_primary', e.target.value)}
                              className="w-9 h-9 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={editForm.brand_colors_primary || ""}
                              onChange={(e) => updateFormValue('brand_colors_primary', e.target.value)}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 text-[11px] font-mono text-white outline-none focus:border-cyan-500"
                              placeholder="#0ea5e9"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Secondary Color</label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={editForm.brand_colors_secondary?.startsWith('#') && editForm.brand_colors_secondary?.length === 7 ? editForm.brand_colors_secondary : "#6366f1"}
                              onChange={(e) => updateFormValue('brand_colors_secondary', e.target.value)}
                              className="w-9 h-9 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={editForm.brand_colors_secondary || ""}
                              onChange={(e) => updateFormValue('brand_colors_secondary', e.target.value)}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 text-[11px] font-mono text-white outline-none focus:border-cyan-500"
                              placeholder="#6366f1"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Accent Color</label>
                          <div className="flex gap-1.5">
                            <input
                              type="color"
                              value={editForm.brand_colors_accent?.startsWith('#') && editForm.brand_colors_accent?.length === 7 ? editForm.brand_colors_accent : "#10b981"}
                              onChange={(e) => updateFormValue('brand_colors_accent', e.target.value)}
                              className="w-9 h-9 p-0 bg-transparent border border-slate-800 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={editForm.brand_colors_accent || ""}
                              onChange={(e) => updateFormValue('brand_colors_accent', e.target.value)}
                              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 text-[11px] font-mono text-white outline-none focus:border-cyan-500"
                              placeholder="#10b981"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Typography Pairings */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Display Font Headings</label>
                          <input
                            type="text"
                            value={editForm.typography_style || ""}
                            onChange={(e) => updateFormValue('typography_style', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white"
                            placeholder="e.g. Space Grotesk / Inter"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Body Font Stack</label>
                          <input
                            type="text"
                            value={editForm.brand_typography_body || ""}
                            onChange={(e) => updateFormValue('brand_typography_body', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white"
                            placeholder="e.g. Inter (Sans-serif)"
                          />
                        </div>
                      </div>

                      {/* Brand Design Aesthetic */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Design Aesthetic & Theme Vibe</label>
                        <input
                          type="text"
                          value={editForm.design_mood || ""}
                          onChange={(e) => updateFormValue('design_mood', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white text-xs"
                          placeholder="e.g. Clean Corporate, Minimalist, Cyber-Tech Dark"
                        />
                      </div>

                      {/* Brand Tone of Voice */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Brand Tone of Voice</label>
                        <input
                          type="text"
                          value={editForm.brand_tone_of_voice || ""}
                          onChange={(e) => updateFormValue('brand_tone_of_voice', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none text-xs font-light text-white"
                          placeholder="e.g. Supportive, bold, premium, direct and objective"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Domains & Network Setup */}
                  <div className="p-5 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-4">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block border-b border-slate-800/50 pb-1">🌐 Domains & Network Configs</span>
                    
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Custom Domain Base url</label>
                          <input
                            type="text"
                            value={editForm.domain_name || ""}
                            onChange={(e) => updateFormValue('domain_name', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white text-xs"
                            placeholder="e.g. yourbusiness.com.au"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Domain Registrar Partner</label>
                          <input
                            type="text"
                            value={editForm.domain_registrar || ""}
                            onChange={(e) => updateFormValue('domain_registrar', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white text-xs"
                            placeholder="e.g. GoDaddy, Namecheap"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">DNS Resolution Setup Status</label>
                          <select
                            value={editForm.domain_dns_setup_status || ""}
                            onChange={(e) => updateFormValue('domain_dns_setup_status', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white text-xs cursor-pointer"
                          >
                            <option value="">Awaiting Setup</option>
                            <option value="Awaiting Delegation">Awaiting Delegation</option>
                            <option value="Fully Delegated & Secure">Fully Delegated & Secure</option>
                            <option value="Proxy DNS Routing Active">Proxy DNS Routing Active</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Web Hosting Target Platform</label>
                          <input
                            type="text"
                            value={editForm.hosting_staging_platform || ""}
                            onChange={(e) => updateFormValue('hosting_staging_platform', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white text-xs"
                            placeholder="e.g. Cloud Run, Vercel, Hostinger"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-mono text-slate-500">Google Analytics Tracking ID (Tag-ID)</label>
                        <input
                          type="text"
                          value={editForm.external_analytics_id || ""}
                          onChange={(e) => updateFormValue('external_analytics_id', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white text-xs"
                          placeholder="e.g. G-H27J9W24B9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Project Timelines & Schedule */}
                  <div className="p-5 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-4">
                    <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider block border-b border-slate-800/50 pb-1">📅 Schedule Milestones</span>
                    
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Estimated Project Kickoff</label>
                          <input
                            type="text"
                            value={editForm.estimated_start_date || ""}
                            onChange={(e) => updateFormValue('estimated_start_date', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white text-xs"
                            placeholder="e.g. 2026-06-25, Upon Signup"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Target Publication Launch</label>
                          <input
                            type="text"
                            value={editForm.target_launch_date || ""}
                            onChange={(e) => updateFormValue('target_launch_date', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white text-xs"
                            placeholder="e.g. Mid-July, TBD (~3 weeks)"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Timeline Expectation</label>
                          <input
                            type="text"
                            value={editForm.timeline || ""}
                            onChange={(e) => updateFormValue('timeline', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white text-xs"
                            placeholder="e.g. 2-3 weeks"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-mono text-slate-500">Decision Making Status</label>
                          <input
                            type="text"
                            value={editForm.decision_status || ""}
                            onChange={(e) => updateFormValue('decision_status', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 outline-none font-mono text-white text-xs"
                            placeholder="e.g. Ready to begin, Comparing quotes"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Brand Asset Readiness Checklist */}
                  <div className="p-5 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-4 md:col-span-2">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block border-b border-slate-800/50 pb-1">📂 Client Administrative & Asset Readiness Checklist</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                      {[
                        { key: 'branding_readiness_logo', label: 'Company Brand Logo Available?' },
                        { key: 'branding_readiness_colors', label: 'Brand Palette Colors Picked?' },
                        { key: 'content_readiness_copy', label: 'Website Copy/Writings Written?' },
                        { key: 'content_readiness_photos', label: 'Photos & High-res Imagery Ready?' },
                        { key: 'domain_status', label: 'Custom Domain Ownership Registered?' },
                        { key: 'hosting_status', label: 'Hosting Environment Preferences?' },
                        { key: 'business_email_status', label: 'Professional Emails Active?' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between gap-1.5 p-2 bg-slate-950/70 border border-slate-900 rounded-xl">
                          <span className="text-[11px] text-slate-350 font-medium leading-normal">{item.label}</span>
                          <div className="flex gap-1 shrink-0">
                            {['yes', 'no', 'need help'].map((opt) => {
                              const active = editForm[item.key] === opt;
                              return (
                                <button
                                  type="button"
                                  key={opt}
                                  onClick={() => updateFormValue(item.key, opt)}
                                  className={`px-2 py-1 text-[9px] font-bold rounded capitalize border transition-all cursor-pointer ${
                                    active 
                                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/10' 
                                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-350'
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Scope Selection Accordion Section */}
                <div className="p-5 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-4">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block border-b border-slate-800/50 pb-1">📊 Project Scope & Functional Addons</span>

                  <div className="space-y-5">
                    
                    {/* Website Goals */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Configure Website Strategic Goals</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {[
                          "New Website", "Website Redesign", "Landing Page", "Online Store / Shop",
                          "Booking / Schedule", "Inquiry Forms", "Inventory Management", "Custom System Apps"
                        ].map(goal => {
                          const isChecked = editForm.selected_goals?.includes(goal);
                          return (
                            <button
                              type="button"
                              key={goal}
                              onClick={() => toggleFormArrayValue('selected_goals', goal)}
                              className={`p-2.5 rounded-lg border text-left text-[11px] font-medium transition-all cursor-pointer ${
                                isChecked 
                                  ? 'bg-cyan-950/20 border-cyan-500 text-cyan-300' 
                                  : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                              }`}
                            >
                              <span className="block truncate">{goal}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pages needed / list builder */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono text-slate-405 font-bold tracking-wider">Custom Pages To Build</label>
                      <div className="flex flex-wrap gap-2 p-3 bg-slate-955 border border-slate-855 rounded-xl min-h-[46px]">
                        {(editForm.selected_pages || []).length === 0 ? (
                          <span className="text-slate-600 text-xs italic">No pages specified yet. Add pages below.</span>
                        ) : (
                          editForm.selected_pages.map((p: string, idx: number) => (
                            <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-fadeIn">
                              📄 {p}
                              <button
                                type="button"
                                onClick={() => toggleFormArrayValue('selected_pages', p)}
                                className="text-slate-500 hover:text-rose-400 text-xs font-black cursor-pointer ml-0.5"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                      
                      <div className="flex gap-2 max-w-sm">
                        <input
                          type="text"
                          placeholder="e.g. Services Outline, FAQ, Blog"
                          value={newPageInput}
                          onChange={(e) => setNewPageInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs outline-none text-white font-mono"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = newPageInput.trim();
                              if (trimmed && !editForm.selected_pages?.includes(trimmed)) {
                                toggleFormArrayValue('selected_pages', trimmed);
                                setNewPageInput("");
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = newPageInput.trim();
                            if (trimmed && !editForm.selected_pages?.includes(trimmed)) {
                              toggleFormArrayValue('selected_pages', trimmed);
                              setNewPageInput("");
                            }
                          }}
                          className="px-3 bg-cyan-700 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Operational Website Features & Integration Items</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        {[
                          "Contact form", "Booking form", "Registration form", "Email notifications",
                          "Instagram/social feed", "Google Maps", "WhatsApp / phone links", "Payment link", 
                          "Admin editing area", "PDF quote/proposal generation", "Google Analytics", 
                          "Basic SEO setup", "Image/gallery section", "Testimonials", "Mobile-first design"
                        ].map((feat) => {
                          const isChecked = editForm.selected_features?.includes(feat);
                          return (
                            <label
                              key={feat}
                              className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                                isChecked 
                                  ? 'bg-cyan-950/15 border-cyan-800/80 text-cyan-300' 
                                  : 'bg-slate-955 border-slate-850 text-slate-400 hover:border-slate-800'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFormArrayValue('selected_features', feat)}
                                className="accent-cyan-500 shrink-0 select-none cursor-pointer"
                              />
                              <span className="text-[11px] leading-none truncate">{feat}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Main outcome */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">Main Intended Project Output / Core Ambition</label>
                      <textarea
                        rows={2}
                        value={editForm.main_outcome || ""}
                        onChange={(e) => updateFormValue('main_outcome', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl p-3 outline-none text-xs text-white resize-none"
                        placeholder="E.g., Grow customer conversions, provide a clean custom listing directory, etc."
                      />
                    </div>

                  </div>
                </div>

                {/* Section 4: Budget & Proposal References */}
                <div className="p-5 bg-[#020617]/50 border border-slate-850 rounded-2xl space-y-4">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block border-b border-slate-800/50 pb-1">💰 Project Budgets & Execution Schedule</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-slate-500">Budget Range Preference</label>
                      <select
                        value={editForm.budget_range || ""}
                        onChange={(e) => updateFormValue('budget_range', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none font-mono text-white select-none cursor-pointer"
                      >
                        <option value="">Choose Budget Option</option>
                        <option value="Under A$1,500">Under A$1,550</option>
                        <option value="A$1,500–A$3,500">A$1,500–A$3,500</option>
                        <option value="A$3,500–A$6,500">A$3,500–A$6,500</option>
                        <option value="A$6,500–A$10,000">A$6,500–A$10,000</option>
                        <option value="A$10,000+">A$10,000+</option>
                        <option value="Not sure yet">Not sure yet</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-slate-500">Expected Timeline</label>
                      <input
                        type="text"
                        value={editForm.timeline || ""}
                        onChange={(e) => updateFormValue('timeline', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none font-mono text-white"
                        placeholder="e.g. 2-3 weeks, ASAP, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-slate-500">Decision Status</label>
                      <input
                        type="text"
                        value={editForm.decision_status || ""}
                        onChange={(e) => updateFormValue('decision_status', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2.5 outline-none font-mono text-white"
                        placeholder="e.g. Ready to start, comparing options, etc."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-mono text-slate-500">Custom Intake Notes & Explanatory References</label>
                      <textarea
                        rows={3}
                        value={editForm.notes || ""}
                        onChange={(e) => updateFormValue('notes', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-cyan-500 rounded-xl p-3 outline-none text-xs text-white"
                        placeholder="Any additional instructions or explanations go here..."
                      />
                    </div>
                  </div>
                </div>

                {/* bottom action submission bar */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingConfig}
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-2xl text-xs transition duration-200 cursor-pointer shadow-lg shadow-cyan-500/10"
                  >
                    {isSavingConfig ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSavingConfig ? "Saving Config..." : "Save Configuration Choices"}</span>
                  </button>
                </div>

              </form>
            )}

            {blueprintTab === 'activity' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-800/60 pb-3 flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-455">Project audit timeline & configuration trails</h4>
                    <p className="text-xs text-slate-405 mt-0.5">Chronological ledger recording all design configurations, specifications changes and action logs.</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 bg-[#020617] px-2.5 py-1 rounded border border-slate-850">
                    🔒 AUDIT ACTIVE
                  </span>
                </div>

                <div className="relative border-l border-slate-805 ml-3.5 pl-6 space-y-6 py-2">
                  {(() => {
                    const sortedLogs = [
                      ...(project.activity_log || [])
                    ].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                    // Guarantee at least one setup log
                    if (sortedLogs.length === 0) {
                      const createdStr = project.created_at
                        ? (project.created_at.seconds ? new Date(project.created_at.seconds * 1000).toISOString() : new Date(project.created_at).toISOString())
                        : new Date().toISOString();
                      sortedLogs.push({
                        timestamp: createdStr,
                        message: "Project metadata partition initialized and Client Intake completed.",
                        user: "System Instantiation"
                      });
                    }

                    return sortedLogs.map((log: any, idx: number) => {
                      const date = new Date(log.timestamp);
                      return (
                        <div key={idx} className="relative group">
                          {/* Circle node connector */}
                          <div className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-500 group-hover:bg-cyan-400 transition" />
                          
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 block mb-0.5">
                              {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className="bg-[#020617]/40 border border-slate-830 p-3 rounded-xl space-y-1">
                              <p className="text-xs text-slate-350 leading-relaxed font-light">{log.message}</p>
                              {log.user && (
                                <div className="flex gap-1 items-center pt-1">
                                  <span className="px-1 text-[8.5px] font-mono bg-slate-900 text-slate-500 rounded border border-slate-800">
                                    Author: {log.user}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Layout Sub-grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Financial Card & Asset Card */}
          <div className="space-y-8">
            
            {/* Financial Invoice Status Block */}
            {project.deposit_amount && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  Initial Invoice & Payment Setup
                </h4>
                
                <div className="p-4 bg-[#020617] rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Required Milestone Payment:</span>
                    <span className="text-sm font-bold text-white font-mono">{project.deposit_amount}</span>
                  </div>
                  
                  {project.deposit_due_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Due Date Reference:</span>
                      <span className="text-xs font-mono text-slate-300">{project.deposit_due_date}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/85">
                    <span className="text-xs text-slate-400">Invoice Status:</span>
                    {project.deposit_paid_at ? (
                      <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900/60 rounded-full text-[10px] font-mono tracking-wide font-black uppercase">
                        PAID & CONFIRMED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-amber-955/70 text-amber-400 border border-amber-900/60 rounded-full text-[10px] font-mono tracking-wide font-black uppercase animate-pulse">
                        AWAITING DEPOSIT
                      </span>
                    )}
                  </div>

                  {project.deposit_payment_reference && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-900 text-[10px] font-mono">
                      <span className="text-slate-500">Receipt Ref:</span>
                      <span className="text-slate-300 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800/40">{project.deposit_payment_reference}</span>
                    </div>
                  )}
                </div>

                {!project.deposit_paid_at ? (
                  !project.design_draft_approved ? (
                    <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-4 font-sans select-none my-2">
                      <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
                        <Lock className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono">Invoice Locked Until Design Approved</h4>
                        <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                          In accordance with our <strong>Zero Upfront Risk Guarantee</strong>, the initial kickoff deposit is only due after you have reviewed and formally approved your custom design draft.
                        </p>
                      </div>
                      <Link 
                        to={`/client-intake?token=${project.secure_token || secureToken}`} 
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black rounded-xl text-[11px] uppercase tracking-wider transition w-full shadow-lg shadow-cyan-500/10 cursor-pointer"
                      >
                        Review Draft in Intake Wizard &rarr;
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-1">
                    {/* Bank Transfer details if available or default */}
                    <div className="p-4 bg-slate-955/65 border border-slate-800/60 rounded-2xl space-y-3">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                        <span>DIRECT BANK TRANSFER</span>
                        <span className="text-slate-500 font-light font-sans tracking-normal capitalize">EFT Payment</span>
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-[11px]">Bank Name:</span>
                          <span className="text-white font-medium">{project.bank_name || globalBankSettings?.bank_name || "Commonwealth Bank (CBA)"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-[11px]">Account Name:</span>
                          <span className="text-white font-medium">{project.bank_account_name || globalBankSettings?.bank_account_name || "Clarity Space Agency"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-[11px]">BSB Number:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-white font-mono font-semibold">{project.bank_bsb || globalBankSettings?.bank_bsb || "082-356"}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(project.bank_bsb || globalBankSettings?.bank_bsb || "082-356");
                                setCopiedBsb(true);
                                setTimeout(() => setCopiedBsb(false), 2000);
                              }}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border transition ${
                                copiedBsb 
                                  ? "bg-emerald-950 text-emerald-400 border-emerald-900/50" 
                                  : "text-cyan-400 hover:text-cyan-300 border-slate-800 hover:bg-slate-900"
                              }`}
                            >
                              {copiedBsb ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-[11px]">Account Number:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-white font-mono font-semibold">{project.bank_account_number || globalBankSettings?.bank_account_number || "445141498"}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(project.bank_account_number || globalBankSettings?.bank_account_number || "445141498");
                                setCopiedAccountNumber(true);
                                setTimeout(() => setCopiedAccountNumber(false), 2000);
                              }}
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border transition ${
                                copiedAccountNumber 
                                  ? "bg-emerald-950 text-emerald-400 border-emerald-900/50" 
                                  : "text-cyan-400 hover:text-cyan-300 border-slate-800 hover:bg-slate-900"
                              }`}
                            >
                              {copiedAccountNumber ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>
                        {(project.bank_payid || globalBankSettings?.bank_payid) && (
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-[11px]">PayID Instant:</span>
                            <span className="text-cyan-300 font-mono font-medium">{project.bank_payid || globalBankSettings?.bank_payid}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 italic bg-slate-950 p-2 rounded-xl mt-1 select-none font-medium leading-normal border border-slate-900">
                          {project.bank_instructions || globalBankSettings?.bank_instructions || "Please enter this reference in the payment description: Clarity-" + (project.id ? project.id.slice(-4).toUpperCase() : "SOW")}
                        </div>
                      </div>

                      {/* Confirm EFT payment submitted form layout */}
                      {!isConfirmPaymentOpen ? (
                        <button
                          type="button"
                          onClick={() => setIsConfirmPaymentOpen(true)}
                          className="w-full py-2 bg-slate-950 hover:bg-slate-900 text-cyan-400 border border-slate-800 hover:border-cyan-500/25 rounded-xl text-xs font-semibold select-none cursor-pointer transition shadow-sm mt-2"
                        >
                          Confirm Offline Payment Sent
                        </button>
                      ) : (
                        <div className="bg-[#020617] border border-slate-850 p-3 rounded-xl space-y-3 mt-2 animate-fadeIn">
                          <div className="space-y-1">
                            <label className="text-[9.5px] uppercase font-mono text-slate-500 font-bold block">Enter Payment Reference / Receipt ID</label>
                            <input 
                              type="text" 
                              placeholder="e.g. CBA120392 or your company name"
                              value={paymentReferenceInput}
                              onChange={(e) => setPaymentReferenceInput(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 text-xs text-white outline-none placeholder-slate-700"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                      setPaymentReferenceInput("");
                                      setIsConfirmPaymentOpen(false);
                              }}
                              className="px-3 py-1.5 bg-slate-950 rounded-lg text-[10.5px] font-semibold text-slate-500 hover:text-slate-350 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirmPayment}
                              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-[10.5px] font-black cursor-pointer shadow shadow-cyan-950/20"
                            >
                              Confirm EFT Sent
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  )
                ) : (
                  <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl text-xs mt-2 text-emerald-450 font-medium">
                    🎉 This payment milestone is finalized. Thank you for your support!
                  </div>
                )}

                {project.deposit_notes && (
                  <p className="text-[11px] text-slate-500 leading-normal italic px-1 font-light">
                    * Note: {project.deposit_notes}
                  </p>
                )}
              </div>
            )}

            {/* Asset Directories Checklist */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-450 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                Asset Handover & Collection
              </h4>
              <p className="text-xs text-slate-405 leading-relaxed">
                Logos, brand images, domain access and copy files will be archived securely in your drive directory tree.
              </p>

              {project.google_drive_folder_url ? (
                <div className="space-y-3 pt-1">
                  <a 
                    href={project.google_drive_folder_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold text-xs rounded-2xl text-center hover:text-white transition"
                  >
                    Open Google Drive Folder <ExternalLink className="w-4 h-4" />
                  </a>

                  {/* Render checklist sub-directories */}
                  <div className="p-3 bg-[#020617] border border-slate-800 rounded-2xl text-[11px] space-y-2 text-slate-400 font-mono">
                    <p className="font-semibold text-slate-350 shrink-0 uppercase tracking-widest text-[9px] mb-1 text-slate-500">Workspace folders mapped:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-emerald-500">✓</span> <span>01 Intake</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-emerald-500">✓</span> <span>02 Brand Assets</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-emerald-500">✓</span> <span>03 Website Content</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-emerald-500">✓</span> <span>04 Proposal</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#020617] border border-slate-850 rounded-2xl text-center space-y-1">
                  <Clock className="w-5 h-5 text-slate-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">Preparing Custom Handover Directory</p>
                  <p className="text-[10px] text-slate-500 font-light">Standby as secure GCP disk partitions initialize.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Deployment Workspace, Revision Feedback & Admin Message */}
          <div className="space-y-8">
            
            {/* Deploy Preview & Final Site urls */}
            {(project.preview_url || project.staging_url || project.final_site_url) && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Live Workspaces & Playgrounds
                </h4>

                <div className="space-y-3">
                  {project.preview_url && (
                    <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-450 uppercase font-bold tracking-wider font-mono">Active Staging Build</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                      <p className="text-xs text-slate-300">Live staging render is open for continuous peer-review.</p>
                      <a 
                        href={project.preview_url.startsWith('http') ? project.preview_url : `https://${project.preview_url}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/40 text-cyan-400 hover:text-white rounded-xl text-xs transition font-semibold mt-2"
                      >
                        Launch Staging Review <ExternalLink className="w-4.5 h-4.5" />
                      </a>
                    </div>
                  )}

                  {project.final_site_url && (
                    <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-450 uppercase font-bold tracking-wider font-mono">Production Release URL</span>
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      </div>
                      <a 
                        href={project.final_site_url.startsWith('http') ? project.final_site_url : `https://${project.final_site_url}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1 select-all font-mono truncate"
                      >
                        {project.final_site_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Link to Client Feedback Form if in Review */}
            {(currentStatus === 'First Preview Sent' || currentStatus === 'Client Review' || currentStatus === 'Revisions' || currentStatus === 'Final Review') && (
              <div className="bg-gradient-to-r from-indigo-950/30 to-purple-950/30 border border-indigo-900/40 rounded-3xl p-6 space-y-4">
                <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-purple-400 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4" />
                  Structured Visual Feedback Form
                </h4>
                <p className="text-xs text-slate-300 leading-normal font-light">
                  If you have specific layout tweaks, spacing issues, bug reports, or heavy text replacements, you can launch our advanced graphical feedback panel here.
                </p>
                <Link 
                  to={`/project-feedback/${secureToken}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-slate-950 font-bold rounded-2xl text-xs hover:opacity-90 transition-all shadow-lg shadow-indigo-500/10"
                >
                  Open Advanced Feedback Panel <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* General Project Discussion (Messages & Comments) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
              <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                Project Discussion
              </h4>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {feedbacks.length === 0 ? (
                  <p className="text-xs text-slate-500 font-light text-center py-4 italic border border-dashed border-slate-800 rounded-xl">
                    No active messages or tickets. Feel free to ask a question below!
                  </p>
                ) : (
                  feedbacks.map(f => (
                    <div key={f.id} className="bg-[#020617] border border-slate-800 p-3 rounded-2xl relative">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-slate-400">
                          {f.submitted_by === 'admin' ? 'Support / Developer' : (f.contact_name || f.business_name || 'Client')}
                        </span>
                        <span className="text-[9px] text-slate-600 font-mono">
                          {f.created_at?.seconds 
                              ? new Date(f.created_at.seconds * 1000).toLocaleDateString()
                              : f.submitted_at ? new Date(f.submitted_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{f.message}</p>
                      
                      {f.admin_response && (
                        <div className="mt-2.5 p-2.5 bg-cyan-950/20 border border-cyan-800/35 rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold text-cyan-400 font-mono uppercase">
                            <span>Developer Reply</span>
                            {f.admin_responded_at && (
                              <span className="text-slate-500 font-normal normal-case">
                                {new Date(f.admin_responded_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-normal font-light whitespace-pre-wrap">{f.admin_response}</p>
                        </div>
                      )}
                      
                      {f.status === 'Accepted' || f.status === 'In Progress' || f.status === 'Done' ? (
                        <div className="mt-2 pt-2 border-t border-slate-800/50 flex justify-end">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                            f.status === 'Done' ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50' :
                            f.status === 'In Progress' ? 'bg-amber-950/30 text-amber-400 border border-amber-900/50' :
                            'bg-indigo-950/30 text-indigo-400 border border-indigo-900/50'
                          }`}>
                            {f.status}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="pt-2 relative">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a question, update, or feedback..."
                  disabled={submittingMessage}
                  className="w-full bg-[#020617] border border-slate-700 focus:border-cyan-500 outline-none rounded-xl text-xs text-slate-200 p-3 pb-10 resize-none h-24 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={submittingMessage || !messageInput.trim()}
                  className="absolute bottom-2 right-2 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold rounded-lg transition disabled:opacity-50 flex items-center gap-1 shadow-md"
                >
                  {submittingMessage ? 'Sending...' : 'Send'} <ArrowRight className="w-3 h-3" />
                </button>
              </form>
            </div>

            {/* Calming operations support notice */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 font-sans">
              <h5 className="text-xs font-semibold text-slate-200">Continuous Integration Assurance</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                Our deployments utilize standard Git hooks, automated CDN caching layers and mobile viewport checks automatically, keeping code clean, lightning-fast and search engine compatible.
              </p>
              <p className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-850">
                Support Node ID: {project.id}
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
