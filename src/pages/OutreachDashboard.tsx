import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  Plus,
  Send,
  CheckCircle,
  Clock,
  XCircle,
  BarChart,
  FileText,
  Settings,
  Link as LinkIcon,
  Edit3,
  LogOut,
  Mail,
  ChevronLeft,
  ChevronRight,
  Folder,
  ArrowRight,
  Calendar,
  MessageSquare,
  Share2,
  ExternalLink,
  Sparkles,
  Sliders,
  Search,
  CheckSquare,
  Copy,
  FolderOpen,
  Loader2,
  CreditCard,
} from "lucide-react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  setDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import {
  db,
  isFirebaseConfigured,
  getLocalFallbackSubmissions,
  saveToLocalFallback,
  updateLocalFallback,
  withTimeout,
} from "../firebase";

import DriveIntegration from "../components/DriveIntegration";
import LeadWorkspace from "../components/LeadWorkspace";
import ProjectLifecyclePanel from "../components/ProjectLifecyclePanel";
import FirebaseHealthPanel from "../components/FirebaseHealthPanel";
import { createGoogleSheet } from "../lib/workspace";
import {
  getNextActionInfo,
  getAutoFollowUpDate,
  detectMissingAssets,
  generateInternalChecklist,
  calculatePriorityScore,
  generateWebsiteCheckReport,
  buildClientMessage,
} from "../lib/automations";

interface InteractiveStatusStepperProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  collectionName: "intakes" | "outreachLeads";
}

function InteractiveStatusStepper({
  currentStatus,
  onStatusChange,
  collectionName,
}: InteractiveStatusStepperProps) {
  const steps =
    collectionName === "intakes"
      ? [
          "New Intake",
          "Proposal Sent",
          "Proposal Approved",
          "Deposit Requested",
          "Deposit Paid",
          "Assets Requested",
          "Build Started",
          "First Preview Sent",
          "Client Review",
          "Launched",
          "Completed",
        ]
      : [
          "New lead",
          "Researching",
          "Sent outreach",
          "Replied",
          "Proposal Sent",
          "Proposal Approved",
          "Deposit Paid",
          "Build Started",
          "Launched",
          "Completed",
        ];

  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="bg-[#020617]/90 border border-slate-800/80 rounded-2xl p-4 md:p-5 my-4 space-y-4 shadow-sm shadow-black/40">
      <div className="flex justify-between items-center pb-2">
        <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-slate-400">
          Interactive Project Stepper
        </span>
        <span className="text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-0.5 rounded-full font-bold">
          Current status: {currentStatus || "N/A"}
        </span>
      </div>
      {/* Scrollable milestone bar for comfortable access */}
      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-850">
        <div className="flex items-center min-w-[850px] relative px-2">
          {steps.map((step, idx) => {
            const isActive = step === currentStatus;
            const isCompleted = currentIndex !== -1 && idx < currentIndex;

            return (
              <React.Fragment key={step}>
                {/* Connecting line */}
                {idx > 0 && (
                  <div
                    className={`flex-grow h-[2px] transition-all duration-300 ${isCompleted ? "bg-cyan-500" : "bg-slate-800"}`}
                  />
                )}

                {/* Node */}
                <button
                  type="button"
                  onClick={() => onStatusChange(step)}
                  className="relative flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[9px] font-bold border transition-all duration-150 ${
                      isActive
                        ? "bg-cyan-500 text-slate-950 border-cyan-400 ring-4 ring-cyan-500/10 scale-105 shadow-md shadow-cyan-500/10"
                        : isCompleted
                          ? "bg-slate-900 text-cyan-400 border-cyan-500/40 hover:bg-slate-850"
                          : "bg-[#020617] text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-[9px] mt-1.5 font-semibold font-sans absolute top-8 whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? "text-white font-extrabold scale-105"
                        : "text-slate-400 group-hover:text-white"
                    }`}
                  >
                    {step}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <div className="h-4"></div> {/* spacer for label heights */}
      <p className="text-[10px] text-slate-500 italic select-none">
        Tip: Click on any step above to instantly advance or revert this
        project’s lifecycle tracking status.
      </p>
    </div>
  );
}

interface AestheticInternalChecklistProps {
  lead: any;
  collectionName: "intakes" | "outreachLeads";
  onToggleItem: (
    leadId: string,
    item: string,
    col: "intakes" | "outreachLeads",
  ) => void;
  onUpdateLead: (
    leadId: string,
    updates: any,
    col: "intakes" | "outreachLeads",
  ) => void;
}

function AestheticInternalChecklist({
  lead,
  collectionName,
  onToggleItem,
  onUpdateLead,
}: AestheticInternalChecklistProps) {
  const items = generateInternalChecklist(lead.selected_features || []);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [successSync, setSuccessSync] = useState(false);
  const [syncTarget, setSyncTarget] = useState<"Asana" | "Trello" | "Jira">(
    "Asana",
  );

  const comments = lead.checklistComments || {};
  const dueDates = lead.checklistDueDates || {};

  const handleUpdate = (item: string, commentVal: string, dateVal: string) => {
    const updatedComments = { ...comments, [item]: commentVal };
    const updatedDates = { ...dueDates, [item]: dateVal };
    onUpdateLead(
      lead.id,
      {
        checklistComments: updatedComments,
        checklistDueDates: updatedDates,
      },
      collectionName,
    );
  };

  const triggerExternalSync = (target: "Asana" | "Trello" | "Jira" | "Client Portal") => {
    setSyncTarget(target);
    setSuccessSync(true);
    setTimeout(() => setSuccessSync(false), 4000);
  };

  return (
    <div className="bg-[#020617] rounded-xl p-5 border border-slate-800/85">
      <div className="flex justify-between items-start gap-4 mb-4 pb-2 border-b border-slate-850">
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-cyan-400 font-extrabold" />
            Internal Project Checklist
          </h4>
          <p className="text-[10px] text-slate-500 font-light mt-0.5">
            Customize due dates, tasks and log action comments.
          </p>
        </div>
        <div className="relative group shrink-0">
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10px] font-mono rounded text-slate-300 transition hover:bg-slate-850 hover:text-cyan-400 cursor-pointer"
          >
            <Share2 className="w-3 h-3 text-cyan-400" /> Sync Project Hub{" "}
            <ChevronRight className="w-2.5 h-2.5 rotate-90" />
          </button>
          <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-[#070f21] border border-slate-800 py-1.5 rounded shadow-xl z-20 w-44">
            <button
              type="button"
              onClick={() => triggerExternalSync("Asana")}
              className="w-full text-left px-3 py-1.5 text-[10px] text-slate-300 hover:bg-slate-900 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-rose-400" /> Sync to Asana
              Workspace
            </button>
            <button
              type="button"
              onClick={() => triggerExternalSync("Trello")}
              className="w-full text-left px-3 py-1.5 text-[10px] text-slate-300 hover:bg-slate-900 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-cyan-400" /> Export to
              Trello Board
            </button>
            <button
              type="button"
              onClick={() => triggerExternalSync("Jira")}
              className="w-full text-left px-3 py-1.5 text-[10px] text-slate-300 hover:bg-slate-900 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3 text-indigo-400" /> Push to Jira
              Project
            </button>
            <button
              type="button"
              onClick={() => triggerExternalSync("Client Portal")}
              className="w-full text-left px-3 py-1.5 text-[10px] text-slate-300 hover:bg-slate-900 border-t border-slate-800/60 mt-1 pt-1.5 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3 h-3 text-emerald-400" /> Share with Portal
            </button>
          </div>
        </div>
      </div>

      {successSync && (
        <div className="mb-4 p-2.5 bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in zoom-in duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-bounce shrink-0" />
          {syncTarget === "Client Portal" ? (
            <span>
              Workspace status, <strong>{items.length} checklist items</strong>, comments, and milestones synchronized directly with the <strong>Client Portal Hub</strong>!
            </span>
          ) : (
            <span>
              Workspace status, <strong>{items.length} checklist items</strong>{" "}
              and timeline properties exported into client's new{" "}
              <strong>{syncTarget}</strong> board!
            </span>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-[11px] text-slate-500 italic py-2 text-center select-none">
          No custom features or pages selected. Update client preferences to
          generate internal task checklist.
        </p>
      ) : (
        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
          {items.map((item) => {
            const isChecked = lead.checklist?.[item] || false;
            const com = comments[item] || "";
            const due = dueDates[item] || "";
            const isExpanded = expandedItem === item;

            return (
              <div
                key={item}
                className="border border-slate-900 rounded-lg bg-[#01040f] p-2 hover:border-slate-800 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none flex-grow">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        onToggleItem(lead.id, item, collectionName)
                      }
                      className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                    />
                    <span
                      className={`font-medium ${isChecked ? "line-through text-slate-500" : ""}`}
                    >
                      {item}
                    </span>
                  </label>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setExpandedItem(isExpanded ? null : item)}
                      className={`p-1 rounded text-[10px] flex items-center gap-0.5 border transition cursor-pointer ${
                        isExpanded || com || due
                          ? "bg-cyan-950/30 border-cyan-805 text-cyan-400 font-semibold"
                          : "bg-slate-900 border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                      title="Adjust Due Date & Comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {due && <Calendar className="w-3 h-3 text-cyan-400" />}
                    </button>
                  </div>
                </div>

                {/* Due / Comment summary if collapsed but they exist */}
                {!isExpanded && (due || com) && (
                  <div className="pl-6 mt-1 flex flex-wrap gap-2 text-[9px] font-medium font-sans text-slate-400 select-none">
                    {due && (
                      <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-cyan-300 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" /> Due: {due}
                      </span>
                    )}
                    {com && (
                      <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded italic max-w-[150px] truncate">
                        “{com}”
                      </span>
                    )}
                  </div>
                )}

                {/* Expanded configuration card */}
                {isExpanded && (
                  <div className="mt-2 pl-6 pt-2 border-t border-slate-900/80 grid grid-cols-1 gap-2 animate-feedIn">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                        Set Completion Due Date
                      </span>
                      <input
                        type="date"
                        value={due}
                        onChange={(e) =>
                          handleUpdate(item, com, e.target.value)
                        }
                        className="px-2.5 py-1 text-slate-300 bg-[#020617] border border-slate-800 rounded outline-none focus:border-cyan-500 text-[10.5px] w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                        Internal Progress Comment / Log
                      </span>
                      <input
                        type="text"
                        placeholder="e.g., Awaiting logo assets..."
                        value={com}
                        onChange={(e) =>
                          handleUpdate(item, e.target.value, due)
                        }
                        className="px-2.5 py-1 text-slate-350 placeholder-slate-650 bg-[#020617] border border-slate-800 rounded outline-none focus:border-cyan-500 text-[10.5px] w-full text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface StageGuide {
  description: string;
  checklist: string[];
}

const STAGE_GUIDES: Record<string, StageGuide> = {
  "New Intake": {
    description:
      "New potential inbound contact submitted through the client form. Verify business profile.",
    checklist: [
      "Review submission details (business name, primary contact details)",
      "Examine requested features, goals, and visual mood direction",
      "Verify if provided website URL or socials context is active",
    ],
  },
  "New lead": {
    description:
      "New outbound lead detected or sourced manually. Check industry viability.",
    checklist: [
      "Research company profile and primary decision maker name",
      "List out visible design gaps, sluggish load speeds, or mobile rendering bugs",
      "Draft customized pitch strategy based on their industry benchmarks",
    ],
  },
  Researching: {
    description:
      "Analyzing the lead's current online presence in-depth to formulate high-impact proposals.",
    checklist: [
      "Generate personalized preview demo links if possible",
      "Calculate potential load time savings & Lighthouse report improvements",
      "Draft tailored outreach copy highlighting exact visual improvements",
    ],
  },
  "Sent outreach": {
    description:
      "First contact has been initiated via outbound channels (Email/LinkedIn). Observe replies.",
    checklist: [
      "Submit personalized message template to lead",
      "Verify next follow-up target date is automatically scheduled",
      "Mark communication as recorded in administrative activity logs",
    ],
  },
  "Follow-up 1": {
    description:
      "First gentle nudge sent after 3-5 days of initial outreach silence.",
    checklist: [
      "Check if recipient has read or opened emails (if tracking configured)",
      "Send the 'Follow-up 1' reminder message template",
      "Set a reminder status to re-evaluate in another 48-72 hours",
    ],
  },
  "Follow-up 2": {
    description:
      "Second and final touchpoint nudge before placing lead in passive archive pool.",
    checklist: [
      "Review previous touchpoint messages and refine copy personalization",
      "Transmit the secondary follow-up template with key client success stories",
      "Prepare to flag as 'Closed' or 'Lost' if unresolved within 7 days",
    ],
  },
  Interested: {
    description:
      "Lead showed constructive interest! Set up discovery & project outline.",
    checklist: [
      "Respond to initial queries in an enthusiastic, brief response email",
      "Propose booking link or schedule a specific discovery brief video call",
      "Open internal planning notes workspace to capture project parameters",
    ],
  },
  "Intake Started": {
    description:
      "Client is active in filling out the interactive Client Intake form.",
    checklist: [
      "Invite contact to their private branding and features intake portal",
      "Provide quick assistance if client asks about platform configurations",
      "Monitor incoming intake answers and save layout parameters",
    ],
  },
  "Question Asked": {
    description:
      "Client has logged administrative or feature-related questions in portal.",
    checklist: [
      "Draft comprehensive answers explaining platform solutions",
      "Formulate solution roadmap (Hosting, Custom domains, Integrations)",
      "Post answers back into client's secure interactive forum portal",
    ],
  },
  Replied: {
    description:
      "Response sent back to client's outstanding question thread. Awaiting confirmation.",
    checklist: [
      "Verify client received clarification notification",
      "Highlight potential timeline impact of feature changes",
      "Summarize next steps needed to unlock statement of work",
    ],
  },
  "Proposal Sent": {
    description:
      "Full draft blueprint and project proposal generated and transmitted.",
    checklist: [
      "Establish exact pricing tiers, milestones and delivery schedule",
      "Send custom statement of work / interactive proposal link",
      "Prepare Stripe integration invoice parameters",
    ],
  },
  "Proposal Approved": {
    description:
      "Client clicked to agree to statement of work terms. Confirm deposit.",
    checklist: [
      "Verify client has signed off on the technical features list",
      "Align on exact target delivery expectations and responsibilities",
      "Transition workspace to billing mode",
    ],
  },
  "Deposit Requested": {
    description:
      "Invoice or initial retainer deposit checkout link transmitted to primary partner.",
    checklist: [
      "Configure Stripe custom pricing tier item",
      "Send billing email notification with secure Stripe payment link",
      "Check transaction status on your Stripe dashboard",
    ],
  },
  "Deposit Paid": {
    description:
      "Retainer transaction confirmed. Lock in timeline and prepare assets.",
    checklist: [
      "Verify receipt of full retainer deposit funds inside Stripe dashboard",
      "Create client work folders on Google Drive / local storage",
      "Send official kickoff welcome packet with assets secure folder link",
    ],
  },
  "Assets Requested": {
    description:
      "Awaiting logo, copy assets, fonts, and photo materials handover folder.",
    checklist: [
      "Confirm Client Portal link has drive access token configured",
      "Check Drive folder uploads for logo files (vector SVG format preferred)",
      "Remind client to upload layout copy, content sections and imagery",
    ],
  },
  "Assets Received": {
    description:
      "Project materials uploaded by client. Review structure & quality.",
    checklist: [
      "Validate dimensions, colors, and format of provided logo materials",
      "Verify raw copy guidelines are ready for import",
      "Approve asset folder and cue development layout build",
    ],
  },
  "Build Started": {
    description:
      "Workspace initialized. Active styling, component code and API bindings.",
    checklist: [
      "Spin up local workspace staging branch/repository",
      "Code main responsive layouts, typography themes, and color variables",
      "Implement client-specific feature pages, forms, and custom components",
    ],
  },
  "First Preview Sent": {
    description:
      "Staging build published to the web. Client link dispatched for check.",
    checklist: [
      "Run local lighthouse reports to optimize speed & responsiveness",
      "Publish live preview staging URL and save to Project properties",
      "Send review invitation and link to Interactive Revision Feedback board",
    ],
  },
  "Client Review": {
    description:
      "Client inspecting staging build. Awaiting feedback submissions.",
    checklist: [
      "Review real-time feedback submissions loaded in Projects tab",
      "Check responsive spacing and typography flow across standard layouts",
      "Help client clarify complex visual revision requests if required",
    ],
  },
  Revisions: {
    description:
      "Implementing structural modifications, content refinements, and visual tweaks.",
    checklist: [
      "Acknowledge new ticket logs inside the Interactive Revisions List",
      "Apply specific styling changes, spelling fixes, or component edits in code",
      "Republish latest project builds and update completion status on tickets",
    ],
  },
  "Final Review": {
    description:
      "Revisions fully resolved. Pre-flight QA and sign-off verification.",
    checklist: [
      "Verify all interactive feedback tickets are resolved",
      "Test responsive form submissions and API integrations one final time",
      "Ask client for official final launch sign-off approval statement",
    ],
  },
  "Launch Ready": {
    description:
      "Staging sandbox certified. Initiating infrastructure configs.",
    checklist: [
      "Collect production custom domain registrars (GoDaddy, Namecheap etc)",
      "Configure cloud web-servers and SSL certificates mapping",
      "Schedule live deployment date time with client coordinator",
    ],
  },
  Launched: {
    description:
      "System live! Production domain routed. Verify active services.",
    checklist: [
      "Check production URL in a fresh private window/device",
      "Double-verify form submissions route correctly to persistent database",
      "Submit sitemap to search engines for priority indexation",
    ],
  },
  Completed: {
    description: "Post-launch checks done. Handover documentation delivered.",
    checklist: [
      "Transmit standard client documentation packet and backend login keys",
      "Conclude active workspace billing cycle",
      "Set secondary check-in status calendar alert for 30-day follow-up",
    ],
  },
  "Testimonial Requested": {
    description:
      "Customer experience review invited to build social proof metrics.",
    checklist: [
      "Send customized customer experience questionnaire template",
      "Check if client shared thoughts on your private status portal",
      "Publish high-quality testimonial quotes onto public company portfolio",
    ],
  },
  Closed: {
    description:
      "Project concludes or lead categorized into inactive pipeline pools.",
    checklist: [
      "Archive local assets folder into cool-storage directory",
      "Revoke staging build preview link access tokens",
      "Complete final administrative billing logs",
    ],
  },
  Lost: {
    description:
      "Lead identified as cold or lost. Save feedback for future analytics.",
    checklist: [
      "Log failure reason (budget, timing, match)",
      "Mark as inactive outbound pipeline target",
      "Schedule passive review check-in in 6 months",
    ],
  },
  "Do not contact": {
    description: "Opted out. Never contact or follow up.",
    checklist: [
      "Remove from all outgoing marketing or newsletter lists",
      "Mark with high-priority suppression criteria",
      "Clear active reminder dates or follow-up schedules",
    ],
  },
};

export default function OutreachDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("board");
  const [rawIntakes, setRawIntakes] = useState<any[]>([]);
  const [rawLeads, setRawLeads] = useState<any[]>([]);
  const [firebaseError, setFirebaseError] = useState(false);
  const [localSubmissions, setLocalSubmissions] = useState<any[]>([]);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
  const [needsAttentionFilter, setNeedsAttentionFilter] = useState<
    | "all"
    | "due"
    | "overdue"
    | "admin"
    | "client"
    | "payment"
    | "assets"
    | "feedback"
  >("all");

  const [guidedFocusIndex, setGuidedFocusIndex] = useState(0);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [focusFilterMode, setFocusFilterMode] = useState<"pending" | "all">("pending");

  // Default payment bank transfer settings
  const [bankSettings, setBankSettings] = useState(() => {
    const saved = localStorage.getItem("clarity_default_bank_details");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      bank_name: "Commonwealth Bank (CBA)",
      bank_account_name: "Clarity Space Agency",
      bank_bsb: "082-356",
      bank_account_number: "445141498",
      bank_payid: "",
      bank_instructions:
        "Please include your company name or invoice reference in transfer remarks so we can reconcile payment instantly.",
    };
  });

  const handleSaveBankSettings = async (updated: any) => {
    setBankSettings(updated);
    localStorage.setItem(
      "clarity_default_bank_details",
      JSON.stringify(updated),
    );

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, "agencySettings", "global"), {
          bank_name: updated.bank_name || "",
          bank_account_name: updated.bank_account_name || "",
          bank_bsb: updated.bank_bsb || "",
          bank_account_number: updated.bank_account_number || "",
          bank_payid: updated.bank_payid || "",
          bank_instructions: updated.bank_instructions || "",
        });
      } catch (err) {
        console.error("Failed to save bank settings to Firestore:", err);
      }
    }

    setToastMessage("Default bank settings saved successfully!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Listen to Firestore bank settings on start
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const docRef = doc(db, "agencySettings", "global");
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setBankSettings((prev: any) => ({
            ...prev,
            ...data,
          }));
        }
      },
      (err) => {
        console.error("Firestore loading bank settings failed:", err);
      },
    );
    return () => unsub();
  }, []);

  // Load and refresh local cached items automatically
  useEffect(() => {
    const fetchLocals = () => {
      setLocalSubmissions(getLocalFallbackSubmissions());
    };
    fetchLocals();
    const interval = setInterval(fetchLocals, 4000);
    return () => clearInterval(interval);
  }, []);

  // Compute merged intakes dynamically
  const intakes = React.useMemo(() => {
    const locals = localSubmissions
      .filter((item) => item.collection === "intakes")
      .map((item) => ({
        id: item.id,
        isOfflineFallback: true,
        ...item.data,
      }));
    const localIds = new Set(locals.map((l) => l.id));
    return [...locals, ...rawIntakes.filter((i) => !localIds.has(i.id))];
  }, [rawIntakes, localSubmissions]);

  // Compute merged leads dynamically
  const leads = React.useMemo(() => {
    const locals = localSubmissions
      .filter((item) => item.collection === "outreachLeads")
      .map((item) => ({
        id: item.id,
        isOfflineFallback: true,
        ...item.data,
      }));
    const localIds = new Set(locals.map((l) => l.id));
    return [...locals, ...rawLeads.filter((l) => !localIds.has(l.id))];
  }, [rawLeads, localSubmissions]);

  const attentionItems = React.useMemo(() => {
    const merged = [
      ...intakes.map((item) => ({
        ...item,
        sourceType: "intake",
        businessName: item.business_name || "Unnamed Business",
        contactName: item.contact_name || "Client partner",
      })),
      ...leads.map((item) => ({
        ...item,
        sourceType: "lead",
        businessName:
          item.businessName || item.business_name || "Unnamed Business",
        contactName:
          item.contactName || item.contact_name || "Prospect partner",
      })),
    ];

    const today = new Date().toISOString().split("T")[0];

    return merged.map((item) => {
      const actionInfo = getNextActionInfo(item.status, item);
      const priority = calculatePriorityScore(item);
      return {
        ...item,
        actionInfo,
        priority,
        isDueToday: actionInfo.dueDate === today,
        isOverdue: actionInfo.dueDate && actionInfo.dueDate < today,
      };
    });
  }, [intakes, leads]);

  const filteredAttentionItems = React.useMemo(() => {
    return attentionItems.filter((item) => {
      if (
        item.status === "Completed" ||
        item.status === "Lost" ||
        item.status?.includes("Do not contact")
      )
        return false;

      switch (needsAttentionFilter) {
        case "due":
          return item.isDueToday;
        case "overdue":
          return item.isOverdue;
        case "admin":
          return item.actionInfo.waitingOn === "Admin";
        case "client":
          return item.actionInfo.waitingOn === "Client";
        case "payment":
          return item.actionInfo.waitingOn === "Payment";
        case "assets":
          return item.actionInfo.waitingOn === "Assets";
        case "feedback":
          return item.actionInfo.waitingOn === "Feedback";
        case "all":
        default:
          return item.actionInfo.waitingOn !== "None";
      }
    });
  }, [attentionItems, needsAttentionFilter]);

  const focusDeckItems = React.useMemo(() => {
    const candidates = attentionItems.filter((item) => {
      if (
        item.status === "Completed" ||
        item.status === "Lost" ||
        item.status?.toLowerCase().includes("do not contact")
      ) {
        return false;
      }
      if (focusFilterMode === "pending") {
        return item.actionInfo && item.actionInfo.waitingOn !== "None";
      }
      return true;
    });

    return [...candidates].sort((a, b) => {
      const scoreA = a.priority?.score ?? 0;
      const scoreB = b.priority?.score ?? 0;
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }
      return (a.businessName || "").localeCompare(b.businessName || "");
    });
  }, [attentionItems, focusFilterMode]);

  const generateWeeklySummary = () => {
    const totalWonValue = [...intakes, ...leads]
      .filter(isWonProject)
      .reduce(
        (sum, item) =>
          sum +
          parsePotentialValue(
            item.estimated_quote_range || item.budget_range || item.budget,
          ),
        0,
      );

    const totalPipelineValue = [...intakes, ...leads]
      .filter(
        (item) =>
          !isWonProject(item) &&
          item.status !== "Lost" &&
          !item.status?.includes("Do not contact"),
      )
      .reduce(
        (sum, item) =>
          sum +
          parsePotentialValue(
            item.estimated_quote_range || item.budget_range || item.budget,
          ),
        0,
      );

    const totalSent = leads.filter(
      (l) => l.status !== "New lead" && l.status !== "Researching",
    ).length;
    const totalReplies = leads.filter(
      (l) =>
        l.status === "Replied" ||
        isWonProject(l) ||
        l.status === "Lost" ||
        l.status === "Proposal Sent" ||
        l.status === "Do Not Contact",
    ).length;
    const totalWonOutbound = leads.filter(isWonProject).length;

    const sentToReplyRate =
      totalSent > 0
        ? ((totalReplies / totalSent) * 100).toFixed(1) + "%"
        : "0%";
    const replyToWonRate =
      totalReplies > 0
        ? ((totalWonOutbound / totalReplies) * 100).toFixed(1) + "%"
        : "0%";

    const todayChar = new Date().toISOString().split("T")[0];
    const overdueFollowUps = [...intakes, ...leads].filter(
      (item) =>
        item.next_follow_up_at &&
        item.next_follow_up_at < todayChar &&
        item.status !== "Completed" &&
        item.status !== "Lost" &&
        !item.status?.includes("Do not contact"),
    ).length;

    const totalPendingAssets = intakes.filter(
      (item) => detectMissingAssets(item).length > 0 && isWonProject(item),
    ).length;

    return `CLARITY SPACE WEEKLY ADMINISTRATIVE REPORT
Generated at: ${new Date().toISOString().replace("T", " ").substring(0, 19)} UTC

1. PIPELINE METRICS
---------------------------------------
• Total Prospective Pipeline Value: $${totalPipelineValue.toLocaleString()} AUD
• Total Secured (Won Project) Value: $${totalWonValue.toLocaleString()} AUD
• Active Inbound Questionnaire submissions: ${intakes.length}
• Total Outbound Tracked contacts: ${leads.length}

2. OUTBOUND CAMPAIGN CONVERSION RATES
---------------------------------------
• Initial Pitch Messages Delivered: ${totalSent}
• Client Responses Received (Replies): ${totalReplies} (Pitch-to-Reply: ${sentToReplyRate})
• Contracts Converted (Won Outbound): ${totalWonOutbound} (Reply-to-Won: ${replyToWonRate})

3. ATTENTION TRIGGERS & BOTTLENECKS
---------------------------------------
• Overdue Follow-ups Scheduled: ${overdueFollowUps}
• Projects Blocked on Handover/Assets: ${totalPendingAssets}
• Exclusion (Do Not Contact) entries: ${intakes.filter((i) => i.status?.toLowerCase().includes("do not contact")).length + leads.filter((l) => l.status?.toLowerCase().includes("do not contact")).length}

---------------------------------------
Prepared by Clarity CRM Operations Assistant.`;
  };

  // Handle single client synchronization
  const handleSyncLocalToFirebase = async (localItem: any) => {
    if (!isFirebaseConfigured) return;
    try {
      const collectionName = localItem.collection;
      let dataToSync = { ...localItem.data };

      // Clean temporary keys
      delete dataToSync.offlineMode;
      delete dataToSync.isOfflineFallback;
      delete dataToSync.id;

      // Upgrade times to Firestore serverTimestamp
      dataToSync.created_at = serverTimestamp();
      dataToSync.updated_at = serverTimestamp();
      if (dataToSync.createdAt) dataToSync.createdAt = serverTimestamp();

      await addDoc(collection(db, collectionName), dataToSync);

      // Remove successfully synced item
      const existing = getLocalFallbackSubmissions();
      const filtered = existing.filter((item) => item.id !== localItem.id);
      localStorage.setItem(
        "clarityspace_local_intakes",
        JSON.stringify(filtered),
      );
      setLocalSubmissions(filtered);
    } catch (err) {
      console.error("Single item synchronization failed:", err);
    }
  };

  // Sync all locally held entries
  const handleSyncAllLocals = async () => {
    if (!isFirebaseConfigured || localSubmissions.length === 0) return;
    setIsSyncingAll(true);
    try {
      for (const item of localSubmissions) {
        await handleSyncLocalToFirebase(item);
      }
    } catch (e) {
      console.error("Batched sync failed:", e);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Selected details
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isGenerativeModalOpen, setIsGenerativeModalOpen] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState("");

  // Proj Control Hub States
  const [projControlSearchQuery, setProjControlSearchQuery] = useState("");
  const [projControlFilterTab, setProjControlFilterTab] = useState<
    "all" | "intakes" | "leads" | "active" | "completed"
  >("all");
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [controlHubTab, setControlHubTab] = useState<
    "portal" | "scope" | "schedule" | "finances" | "discussion"
  >("portal");
  const [activeFeedbacks, setActiveFeedbacks] = useState<any[]>([]);
  const [replyTexts, setReplyTexts] = useState<{
    [feedbackId: string]: string;
  }>({});
  const [isSendingReply, setIsSendingReply] = useState<{
    [feedbackId: string]: boolean;
  }>({});
  const [directMessageText, setDirectMessageText] = useState("");
  const [isSendingDirect, setIsSendingDirect] = useState(false);

  // Subscribes feedbacks in real time for Project Control Hub
  useEffect(() => {
    if (!selectedLead || !selectedLead.id) {
      setActiveFeedbacks([]);
      return;
    }

    if (!isFirebaseConfigured) {
      try {
        const offlineFeedbacksStr =
          localStorage.getItem("clarity_local_feedbacks") || "[]";
        const list = JSON.parse(offlineFeedbacksStr).filter(
          (f: any) => f.project_id === selectedLead.id,
        );
        setActiveFeedbacks(list);
      } catch (err) {
        console.error("Local feedback parse failed: ", err);
      }
      return;
    }

    const q = query(
      collection(db, "feedbacks"),
      where("project_id", "==", selectedLead.id),
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as any[];
        list.sort(
          (a, b) =>
            new Date(b.submitted_at || 0).getTime() -
            new Date(a.submitted_at || 0).getTime(),
        );
        setActiveFeedbacks(list);
      },
      (err) => {
        console.error("Error loading feedbacks in Project status hub: ", err);
      },
    );

    return () => unsubscribe();
  }, [selectedLead?.id]);

  const handleUpdateFeedbackStatusInControlCenter = async (
    feedbackId: string,
    newStatus: string,
  ) => {
    try {
      if (isFirebaseConfigured) {
        await updateDoc(doc(db, "feedbacks", feedbackId), {
          status: newStatus,
          updated_at: new Date().toISOString(),
        });
      } else {
        const offlineFeedbacksStr =
          localStorage.getItem("clarity_local_feedbacks") || "[]";
        const list = JSON.parse(offlineFeedbacksStr).map((f: any) => {
          if (f.id === feedbackId) {
            return { ...f, status: newStatus };
          }
          return f;
        });
        localStorage.setItem("clarity_local_feedbacks", JSON.stringify(list));
        if (selectedLead) {
          setActiveFeedbacks(
            list.filter((f: any) => f.project_id === selectedLead.id),
          );
        }
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update feedback status.");
    }
  };

  const handleSendFeedbackResponse = async (
    feedbackId: string,
    originalFeedback: any,
  ) => {
    const text = replyTexts[feedbackId]?.trim();
    if (!text) return;

    setIsSendingReply((prev) => ({ ...prev, [feedbackId]: true }));

    try {
      if (isFirebaseConfigured) {
        // 1. Update original ticket with admin reply and auto-set status to resolved
        await updateDoc(doc(db, "feedbacks", feedbackId), {
          admin_response: text,
          admin_responded_at: new Date().toISOString(),
          status: "Resolved",
          updated_at: new Date().toISOString(),
        });

        // 2. Add an audit log / comment in feedbacks stream as well, so clients see it in chronological chat updates
        await addDoc(collection(db, "feedbacks"), {
          project_id: originalFeedback.project_id,
          project_collection: originalFeedback.project_collection || "intakes",
          business_name: originalFeedback.business_name || "Business",
          contact_name: "Support / Developer",
          feedback_type: "Reply",
          message: `💬 Reply to "${originalFeedback.feedback_type || originalFeedback.overall_feeling || "Review"}" ticket:\n"${text}"`,
          feedback_text: `💬 Reply to "${originalFeedback.feedback_type || originalFeedback.overall_feeling || "Review"}" ticket:\n"${text}"`,
          submitted_by: "admin",
          submitted_at: new Date().toISOString(),
          status: "Resolved",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        const offlineFeedbacksStr =
          localStorage.getItem("clarity_local_feedbacks") || "[]";
        const list = JSON.parse(offlineFeedbacksStr);

        // Update original feedback entry
        const updatedList = list.map((f: any) => {
          if (f.id === feedbackId) {
            return {
              ...f,
              admin_response: text,
              admin_responded_at: new Date().toISOString(),
              status: "Resolved",
            };
          }
          return f;
        });

        // Add companion chat message for the dialog/feed
        updatedList.push({
          id: "fb_reply_" + Date.now(),
          project_id: originalFeedback.project_id,
          project_collection: originalFeedback.project_collection || "intakes",
          business_name: originalFeedback.business_name || "Business",
          contact_name: "Support / Developer",
          feedback_type: "Reply",
          message: `💬 Reply to "${originalFeedback.feedback_type || originalFeedback.overall_feeling || "Review"}" ticket:\n"${text}"`,
          feedback_text: `💬 Reply to "${originalFeedback.feedback_type || originalFeedback.overall_feeling || "Review"}" ticket:\n"${text}"`,
          submitted_by: "admin",
          submitted_at: new Date().toISOString(),
          status: "Resolved",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        localStorage.setItem(
          "clarity_local_feedbacks",
          JSON.stringify(updatedList),
        );

        if (selectedLead) {
          setActiveFeedbacks(
            updatedList.filter((f: any) => f.project_id === selectedLead.id),
          );
        }
      }

      // Clear state response text input
      setReplyTexts((prev) => ({ ...prev, [feedbackId]: "" }));
    } catch (e) {
      console.error("Error responding to feedback ticket: ", e);
      alert("Connectivity issue. Reply could not be transmitted.");
    } finally {
      setIsSendingReply((prev) => ({ ...prev, [feedbackId]: false }));
    }
  };

  // Add Lead Modal & Fields States
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLeadBusiness, setNewLeadBusiness] = useState("");
  const [newLeadContact, setNewLeadContact] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadIndustry, setNewLeadIndustry] = useState("trades-business");
  const [newLeadPackage, setNewLeadPackage] = useState("Starter Website");
  const [newLeadNotes, setNewLeadNotes] = useState("");
  const [newLeadFirstContact, setNewLeadFirstContact] = useState("");
  const [newLeadFollowUp1, setNewLeadFollowUp1] = useState("");
  const [newLeadFollowUp2, setNewLeadFollowUp2] = useState("");
  const [newLeadNextFollowUp, setNewLeadNextFollowUp] = useState("");

  const [newLeadCampaign, setNewLeadCampaign] = useState(
    "Swimming School Outreach Test",
  );
  const [newLeadRating, setNewLeadRating] = useState("Cold");
  const [newLeadIssue, setNewLeadIssue] = useState("");
  const [newLeadWebsite, setNewLeadWebsite] = useState("");
  const [newLeadBudget, setNewLeadBudget] = useState("");
  const [newLeadTimeline, setNewLeadTimeline] = useState("");

  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [aiPasteText, setAiPasteText] = useState("");
  const [showIntakeTemplate, setShowIntakeTemplate] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  const [campaignChecklist, setCampaignChecklist] = useState<
    Record<number, boolean>
  >({});
  const [qaChecklist, setQaChecklist] = useState<Record<number, boolean>>({});

  const toggleCampaignChecklist = (idx: number) =>
    setCampaignChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }));
  const toggleQaChecklist = (idx: number) =>
    setQaChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }));

  // New persistent launch and safety checklists
  const [securityChecklist, setSecurityChecklist] = useState<
    Record<number, boolean>
  >(() => {
    try {
      const saved = localStorage.getItem("clarity_security_checklist");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [qaReadyChecklist, setQaReadyChecklist] = useState<
    Record<number, boolean>
  >(() => {
    try {
      const saved = localStorage.getItem("clarity_qa_ready_checklist");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [campaignReadyChecklist, setCampaignReadyChecklist] = useState<
    Record<number, boolean>
  >(() => {
    try {
      const saved = localStorage.getItem("clarity_campaign_ready_checklist");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleSecurityCheck = (idx: number) => {
    const updated = { ...securityChecklist, [idx]: !securityChecklist[idx] };
    setSecurityChecklist(updated);
    localStorage.setItem("clarity_security_checklist", JSON.stringify(updated));
  };

  const toggleQaReadyCheck = (idx: number) => {
    const updated = { ...qaReadyChecklist, [idx]: !qaReadyChecklist[idx] };
    setQaReadyChecklist(updated);
    localStorage.setItem("clarity_qa_ready_checklist", JSON.stringify(updated));
  };

  const toggleCampaignReadyCheck = (idx: number) => {
    const updated = {
      ...campaignReadyChecklist,
      [idx]: !campaignReadyChecklist[idx],
    };
    setCampaignReadyChecklist(updated);
    localStorage.setItem(
      "clarity_campaign_ready_checklist",
      JSON.stringify(updated),
    );
  };

  const CHECKLIST_ITEMS = [
    "Scope confirmed",
    "Deposit/payment requested",
    "Deposit/payment received",
    "Logo received",
    "Website content received",
    "Images/photos received",
    "Domain/hosting access confirmed",
    "Google Analytics / tracking confirmed",
    "First draft built",
    "Review link sent",
    "Client changes applied",
    "Website launched",
    "Testimonial requested",
  ];

  const getMissingContent = (lead: any) => {
    const missing = [];
    if (!lead) return [];

    if (
      lead.branding_readiness_logo === "no" ||
      lead.branding_readiness_logo === "need help"
    ) {
      missing.push({ item: "Logo helper", label: "Needs logo help" });
    }
    if (
      lead.content_readiness_copy === "no" ||
      lead.content_readiness_copy === "need help"
    ) {
      missing.push({ item: "Copy helper", label: "Needs copywriting help" });
    }
    if (
      lead.content_readiness_photos === "no" ||
      lead.content_readiness_photos === "need help"
    ) {
      missing.push({ item: "Photos helper", label: "Needs photos/images" });
    }
    if (lead.domain_status === "no" || lead.domain_status === "need help") {
      missing.push({ item: "Domain integration", label: "Needs domain setup" });
    }
    if (lead.hosting_status === "no" || lead.hosting_status === "need help") {
      missing.push({
        item: "Hosting integration",
        label: "Needs hosting setup",
      });
    }
    if (
      lead.business_email_status === "no" ||
      lead.business_email_status === "need help"
    ) {
      missing.push({
        item: "Business email setup",
        label: "Needs business email setup",
      });
    }
    return missing;
  };

  const PIPELINE_STATUSES = [
    "New Intake",
    "New lead",
    "Researching",
    "Sent outreach",
    "Follow-up 1",
    "Follow-up 2",
    "Interested",
    "Intake Started",
    "Question Asked",
    "Replied",
    "Proposal Sent",
    "Proposal Approved",
    "Deposit Requested",
    "Deposit Paid",
    "Assets Requested",
    "Assets Received",
    "Build Started",
    "First Preview Sent",
    "Client Review",
    "Revisions",
    "Final Review",
    "Launch Ready",
    "Launched",
    "Completed",
    "Testimonial Requested",
    "Closed",
    "Lost",
    "Do not contact",
  ];

  const isWonProject = (item: any) => {
    if (!item) return false;
    if (item.project_won === true) return true;
    const wonStatuses = [
      "Deposit Paid",
      "Assets Requested",
      "Assets Received",
      "Active Build",
      "Build Started",
      "First Preview Sent",
      "Client Review",
      "Revisions",
      "Final Review",
      "Launch Ready",
      "Launched",
      "Completed",
      "Testimonial Requested",
      "Won",
    ];
    return wonStatuses.includes(item.status);
  };

  // Protect route
  useEffect(() => {
    if (sessionStorage.getItem("clarity_admin_auth") !== "true") {
      navigate("/admin-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("clarity_admin_auth");
    navigate("/admin-login");
  };

  // Setup Firestore listener for Intakes
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const q = query(collection(db, "intakes"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        let results: any[] = [];
        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
        setRawIntakes(results);
      },
      (err) => {
        console.error("Firestore intakes listener failed:", err);
        setFirebaseError(true);
      },
    );
    return () => unsub();
  }, []);

  // Set up Firestore listener for OutreachLeads
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const q = query(
      collection(db, "outreachLeads"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        let results: any[] = [];
        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
        setRawLeads(results);
      },
      (err) => {
        console.error("Firestore outreachLeads listener failed:", err);
        setFirebaseError(true);
      },
    );
    return () => unsub();
  }, []);

  const copyAILeadProfilerPrompt = () => {
    try {
      const prompt = `[TASK INSTRUCTIONS]
You are a web consulting analyst. I am going to paste information, a URL, or the raw text of a local business website. 
Analyze the website and extract the following details into EXACTLY this format. Use "N/A" if cannot be determined. Do not include any other markdown or pleasantries.

Business Name: [The name of the business]
Contact Name: [The name of the owner or main contact if found]
Contact Email: [Email address if found]
Phone Number: [Phone number if found]
Website URL: [Website URL if found]
Industry: [Must be one of: trades-business, swimming-school, cafe-restaurant, cleaners, beauty, health, tutors, pets, accommodation, general-business]
Suggested Package: [Starter Website, Custom Portal, or E-Commerce Suite]
Budget Range: [Estimated budget range, e.g., $1,500 - $3,000, $3,000 - $5,050]
Timeline: [timeline expectations, e.g., 2 Weeks, 4 Weeks, 1-2 Months]
Lead Quality: [Cold or Warm (Cold if generic, Warm if specific buying signal found)]
Issue/Opportunity: [One specific, highly critical issue with their current site. E.g. "Mobile layout is broken", "No online booking", "Takes 10 seconds to load"]
Initial Prospect Notes: [A quick 1-2 sentence summary of their current situation, what platform they use (e.g. Wix/Wordpress) if obvious, and why we should reach out]`;

      navigator.clipboard.writeText(prompt);
      alert(
        "AI Lead Profiler Prompt copied! Paste this into ChatGPT/Gemini, then paste the website text there.",
      );
    } catch (err) {
      console.error(err);
      alert("Failed to copy prompt");
    }
  };

  const parseAndApplyContext = (text: string) => {
    if (!text || !text.trim()) {
      alert("No text found to parse. Please paste your AI generated text context into the input area.");
      return;
    }

    const getValue = (label: string) => {
      const regex = new RegExp(`${label}:\\s*(.*)`, "i");
      const match = text.match(regex);
      return match && match[1] && match[1].trim() !== "N/A" ? match[1].trim() : "";
    };

    const biz = getValue("Business Name");
    if (biz) setNewLeadBusiness(biz);

    const contact = getValue("Contact Name");
    if (contact) setNewLeadContact(contact);

    const email = getValue("Contact Email");
    if (email) setNewLeadEmail(email);

    const phone = getValue("Phone Number");
    if (phone) setNewLeadPhone(phone);

    const website = getValue("Website URL") || getValue("Website");
    if (website) setNewLeadWebsite(website);

    const industry = getValue("Industry");
    if (industry) {
      const validOptions = [
        "trades-business",
        "swimming-school",
        "cafe-restaurant",
        "cleaners",
        "beauty",
        "health",
        "tutors",
        "pets",
        "accommodation",
        "general-business",
      ];
      const matched = validOptions.find(
        (o) =>
          industry.toLowerCase().includes(o) ||
          o.includes(industry.toLowerCase().replace(" ", "-")),
      );
      if (matched) setNewLeadIndustry(matched);
    }

    const suggestedPkg = getValue("Suggested Package");
    if (suggestedPkg) {
      setNewLeadPackage(suggestedPkg);
    }

    const budget = getValue("Budget Range") || getValue("Budget");
    if (budget) {
      setNewLeadBudget(budget);
    }

    const timeline = getValue("Timeline");
    if (timeline) {
      setNewLeadTimeline(timeline);
    }

    const quality = getValue("Lead Quality");
    if (quality) {
      if (quality.toLowerCase().includes("warm")) {
        setNewLeadRating("Warm");
      } else if (quality.toLowerCase().includes("cold")) {
        setNewLeadRating("Cold");
      } else if (quality.toLowerCase().includes("high")) {
        setNewLeadRating("High potential");
      }
    }

    const issue = getValue("Issue/Opportunity");
    if (issue) setNewLeadIssue(issue);

    const notes = getValue("Initial Prospect Notes");
    if (notes) setNewLeadNotes(notes);

    alert(
      biz
        ? `Successfully parsed and populated details for "${biz}"!`
        : "Parsed, but no Business Name was detected. Please check the structure of your pasted content.",
    );
  };

  const handlePasteProfilerContext = async () => {
    try {
      const text = await navigator.clipboard.readText();
      parseAndApplyContext(text);
    } catch (err) {
      console.error(err);
      alert(
        "Could not access clipboard due to browser/iframe restrictions. Please paste your text directly into the 'Manual AI Paste Area' below.",
      );
    }
  };

  // Create genuinely customized outreach lead with metrics
  const handleSaveNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadBusiness.trim()) {
      alert("Business Name is required");
      return;
    }

    // Auto-suggest package based on industry if generic selected
    let suggestedPkg = newLeadPackage;
    if (suggestedPkg === "Starter Website") {
      if (
        newLeadIndustry === "cafe-restaurant" ||
        newLeadIndustry === "swimming-school"
      ) {
        suggestedPkg = "Booking / Portal Website";
      }
    }

    const secureToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const leadData = {
      businessName: newLeadBusiness,
      contactName: newLeadContact,
      email: newLeadEmail,
      phone: newLeadPhone,
      website_url: newLeadWebsite,
      industry: newLeadIndustry,
      suggestedPackage: suggestedPkg,
      campaign_name: newLeadCampaign,
      campaign_id: newLeadCampaign.toLowerCase().replace(/ /g, "-"),
      lead_source: "outbound_manual",
      lead_quality: newLeadRating,
      website_issue_opportunity: newLeadIssue,
      status: "New lead",
      notes: newLeadNotes,
      budget_range: newLeadBudget,
      timeline: newLeadTimeline,
      first_contacted_at: newLeadFirstContact,
      follow_up_1_at: newLeadFollowUp1,
      follow_up_2_at: newLeadFollowUp2,
      next_follow_up_at: newLeadNextFollowUp,
      secure_token: secureToken,
    };

    try {
      if (isFirebaseConfigured) {
        // Try Firebase with a quick 3s timeout
        await withTimeout(
          addDoc(collection(db, "outreachLeads"), {
            ...leadData,
            createdAt: serverTimestamp(),
          }),
          3000,
        );
        setToastMessage("Outbound lead added successfully to cloud.");
      } else {
        // Direct local fallback save
        saveToLocalFallback("outreachLeads", leadData);
        setLocalSubmissions(getLocalFallbackSubmissions());
        setToastMessage("Outbound lead saved offline.");
      }

      // Reset fields
      setNewLeadBusiness("");
      setNewLeadContact("");
      setNewLeadEmail("");
      setNewLeadPhone("");
      setNewLeadWebsite("");
      setNewLeadBudget("");
      setNewLeadTimeline("");
      setNewLeadNotes("");
      setNewLeadFirstContact("");
      setNewLeadFollowUp1("");
      setNewLeadFollowUp2("");
      setNewLeadNextFollowUp("");
      setNewLeadRating("Warm");
      setNewLeadIssue("");
      setIsAddLeadModalOpen(false);

      setTimeout(() => setToastMessage(""), 3000);
    } catch (err) {
      console.warn(
        "Firebase outreach leads integration delayed or fails, saving to local caching:",
        err,
      );
      // Fallback save is extremely useful
      saveToLocalFallback("outreachLeads", leadData);
      setLocalSubmissions(getLocalFallbackSubmissions());

      // Reset fields anyway
      setNewLeadBusiness("");
      setNewLeadContact("");
      setNewLeadEmail("");
      setNewLeadPhone("");
      setNewLeadWebsite("");
      setNewLeadBudget("");
      setNewLeadTimeline("");
      setNewLeadNotes("");
      setNewLeadFirstContact("");
      setNewLeadFollowUp1("");
      setNewLeadFollowUp2("");
      setNewLeadNextFollowUp("");
      setNewLeadRating("Warm");
      setNewLeadIssue("");
      setIsAddLeadModalOpen(false);

      setToastMessage("Saved to local offline cache (Database Sync Pending).");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const updateLeadData = async (
    leadId: string,
    updates: any,
    collectionName: "intakes" | "outreachLeads",
  ) => {
    try {
      let finalUpdates = { ...updates };
      if (updates.status) {
        const autoDate = getAutoFollowUpDate(updates.status);
        if (autoDate && !updates.next_follow_up_at) {
          finalUpdates.next_follow_up_at = autoDate;
        }
      }

      if (leadId.startsWith("local_")) {
        updateLocalFallback(leadId, finalUpdates);
        setLocalSubmissions(getLocalFallbackSubmissions());
      } else {
        await updateDoc(doc(db, collectionName, leadId), {
          ...finalUpdates,
          updated_at: serverTimestamp(),
        });
      }
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, ...finalUpdates });
      }
    } catch (e) {
      console.error("Error updating lead data:", e);
      const isGoogleUpdate = Object.keys(updates).some(
        (key) => key.startsWith("google_") || key.startsWith("proposal_"),
      );
      if (isGoogleUpdate) {
        alert("Google file was created, but Firebase record was not updated.");
      }
    }
  };

  const updateLeadStatus = async (
    id: string,
    newStatus: string,
    collectionName: "intakes" | "outreachLeads",
  ) => {
    try {
      const autoDate = getAutoFollowUpDate(newStatus);
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (autoDate) {
        updates.next_follow_up_at = autoDate;
      }

      if (id.startsWith("local_")) {
        updateLocalFallback(id, updates);
        setLocalSubmissions(getLocalFallbackSubmissions());
      } else {
        await updateDoc(doc(db, collectionName, id), {
          ...updates,
          updated_at: serverTimestamp(),
        });
      }
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, ...updates });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleChecklistItem = async (
    leadId: string,
    item: string,
    collectionName: "intakes" | "outreachLeads",
  ) => {
    try {
      const currentChecklist = selectedLead?.checklist || {};
      const updatedChecklist = {
        ...currentChecklist,
        [item]: !currentChecklist[item],
      };
      if (leadId.startsWith("local_")) {
        updateLocalFallback(leadId, { checklist: updatedChecklist });
        setLocalSubmissions(getLocalFallbackSubmissions());
      } else {
        await updateDoc(doc(db, collectionName, leadId), {
          checklist: updatedChecklist,
          updated_at: serverTimestamp(),
        });
      }
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, checklist: updatedChecklist });
      }
    } catch (e) {
      console.error("Error updating checklist item:", e);
    }
  };

  const toggleStageChecklistItem = async (
    leadId: string,
    status: string,
    item: string,
    collectionName: "intakes" | "outreachLeads",
  ) => {
    try {
      const currentStepChecklists = selectedLead?.step_checklists || {};
      const stageList = currentStepChecklists[status] || {};
      const updatedStageList = {
        ...stageList,
        [item]: !stageList[item],
      };
      const updatedStepChecklists = {
        ...currentStepChecklists,
        [status]: updatedStageList,
      };

      const updates: any = {
        step_checklists: updatedStepChecklists,
        updated_at: new Date().toISOString(),
      };

      if (leadId.startsWith("local_")) {
        updateLocalFallback(leadId, updates);
        setLocalSubmissions(getLocalFallbackSubmissions());
      } else {
        await updateDoc(doc(db, collectionName, leadId), {
          step_checklists: updatedStepChecklists,
          updated_at: serverTimestamp(),
        });
      }

      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, ...updates });
      }
    } catch (e) {
      console.error("Error updating stage checklist item:", e);
    }
  };

  const updateLeadTrackingDate = async (
    leadId: string,
    field: string,
    val: string,
    collectionName: "intakes" | "outreachLeads",
  ) => {
    try {
      if (leadId.startsWith("local_")) {
        updateLocalFallback(leadId, { [field]: val });
        setLocalSubmissions(getLocalFallbackSubmissions());
      } else {
        await updateDoc(doc(db, collectionName, leadId), {
          [field]: val,
          updated_at: serverTimestamp(),
        });
      }
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead({ ...selectedLead, [field]: val });
      }
    } catch (e) {
      console.error(`Error updating tracking date ${field}:`, e);
    }
  };

  const [isExporting, setIsExporting] = useState(false);
  const handleExportToSheets = async () => {
    setIsExporting(true);
    try {
      const campaignLeads = leads;
      let csvContent =
        "Business Name,Website URL,Contact Name,Email,Phone,Industry,Lead Quality,Campaign Name,Status,Next Follow-up\n";

      campaignLeads.forEach((lead) => {
        const row = [
          lead.businessName || "",
          lead.website_url || "",
          lead.contactName || "",
          lead.email || "",
          lead.phone || "",
          lead.industry || "",
          lead.lead_quality || "",
          lead.campaign_name || "",
          lead.status || "",
          lead.next_follow_up_at || "",
        ]
          .map((v) => `"${(v || "").replace(/"/g, '""')}"`)
          .join(",");
        csvContent += row + "\n";
      });

      const sheetId = await createGoogleSheet(
        "Outbound Campaign Export",
        csvContent,
      );
      alert(`Exported successfully! Find the Google Sheet in your Drive.`);
      window.open(
        `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
        "_blank",
      );
    } catch (err) {
      console.error("Export error:", err);
      alert(
        "Failed to export to Google Sheets. Ensure you are authenticated in the Drive tab.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePostponeFollowUp = async (
    e: React.MouseEvent,
    leadId: string,
    days: number,
  ) => {
    e.stopPropagation();
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const futureStr = futureDate.toISOString().split("T")[0];
      if (leadId.startsWith("local_")) {
        updateLocalFallback(leadId, { next_follow_up_at: futureStr });
        setLocalSubmissions(getLocalFallbackSubmissions());
      } else {
        await updateDoc(doc(db, "outreachLeads", leadId), {
          next_follow_up_at: futureStr,
          updated_at: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Error postponing follow up:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage("Copied to clipboard!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const generatePrivateLink = (
    lead: any,
    type: "demo" | "proposal" | "intake",
  ) => {
    const origin = window.location.origin;
    const baseObj = {
      demo: "/demo",
      proposal:
        lead.industry === "swimming-school"
          ? "/swimming-school-quote"
          : "/business-quote",
      intake: "/client-intake",
    };
    const url = new URL(baseObj[type], origin);
    url.searchParams.set("lead", lead.id);
    if (lead.campaign_id) url.searchParams.set("campaign", lead.campaign_id);
    if (type === "intake" && lead.industry)
      url.searchParams.set("industry", lead.industry);
    return url.toString();
  };

  const generateEmailDraft = (lead: any) => {
    setIsGenerativeModalOpen(true);
    let subject = `Web system architecture for ${lead.businessName || lead.business_name || "your business"}`;

    const issueText = lead.website_issue_opportunity
      ? `noticing that ${lead.website_issue_opportunity}`
      : `noticing [insert specific problem related to ${lead.industry || "your industry"}]`;

    let draft = `Hi ${lead.contactName || lead.contact_name || "there"},\n\nI was reviewing your online presence and wanted to reach out, particularly ${issueText}.\n\nI run Clarity Space, a specialised web consultancy. I’ve put together a specific structure showing how we solve this for ${lead.industry || "businesses like yours"} here: ${generatePrivateLink(lead, "demo")}\n\nWe're currently taking on founding clients at special rates and I'd be happy to do a free quick review of your current setup.\n\nNo pressure, but if you're looking to upgrade your digital footprint, I’d love to have a brief chat.\n\nBest,\nDavid\nClarity Space\n\nNo worries if this is not relevant — reply 'no thanks' and I won't follow up.`;

    // Auto-prompt style quote summary logic if it's an intake request
    if (lead.lead_type === "project_intake" || lead.selected_goals) {
      subject = `Quote Proposal: ${lead.business_name} x Clarity Space`;
      const combined = (
        (lead.selected_goals || []).join(" ") +
        " " +
        (lead.selected_features || []).join(" ")
      ).toLowerCase();
      const isEcommerce =
        combined.includes("e-commerce") ||
        combined.includes("store") ||
        combined.includes("product sales") ||
        combined.includes("payment checkout");

      let sections = `Included pages: ${lead.selected_pages?.join(", ")}\nFunctionality: ${lead.selected_features?.join(", ")}`;
      if (isEcommerce) {
        sections += `\n\nCommerce Features Included:\n- Product catalogue setup\n- Cart and payment checkout integration\n- Shipping / pickup options\n- Store policies setup\n- Launch checklist & testing`;
      }

      draft = `Hi ${lead.contact_name},\n\nThanks for submitting your project intake for ${lead.business_name}.\n\nBased on your requested scope (aiming to ${lead.main_outcome || "improve your business"}), our recommended path is the ${lead.industry ? lead.industry + " " : ""}Solution framework.\n\n${sections}\n\nGiven your timeline of ${lead.timeline} and budget range of ${lead.budget_range}, we are well positioned to execute this. Before I draw up the final contract, I have one question: [Insert Question].\n\nSpeak soon,\nDavid`;
    }

    setGeneratedDraft(`Subject: ${subject}\n\n${draft}`);
  };

  const copyAIPrompt = (lead: any, type: "data" | "proposal" | "outreach") => {
    try {
      const dataStr = `[CLIENT METADATA CONTEXT]
Business Name: ${lead.businessName || lead.business_name || "N/A"}
Contact Name: ${lead.contactName || lead.contact_name || "N/A"}
Contact Email: ${lead.email || "N/A"}
Website: ${lead.website_url || "N/A"}
Industry: ${lead.industry || "N/A"}
Lead Quality: ${lead.lead_quality || lead.admin_lead_quality || "N/A"}
Budget: ${lead.budget_range || "N/A"}
Timeline: ${lead.timeline || "N/A"}
Objective: ${lead.main_outcome || "N/A"}
Goals: ${(lead.selected_goals || []).join(", ") || "N/A"}
Features Requested: ${(lead.selected_features || []).join(", ") || "N/A"}
Pages: ${(lead.selected_pages || []).join(", ") || "N/A"}
Admin Internal Notes: ${lead.admin_internal_notes || "N/A"}
Client Notes: ${lead.notes || "N/A"}
Issue/Opportunity: ${lead.website_issue_opportunity || "N/A"}
`;

      let finalPrompt = dataStr;

      if (type === "proposal") {
        finalPrompt += `
[TASK INSTRUCTIONS]
Act as an expert web consultant and agency director (named David at Clarity Space). Based on the client details above, generate a highly compelling and professional Project Proposal outline. The proposal should include:
1. An Executive Summary addressing their specific objectives (${lead.main_outcome || "business growth"}).
2. Our Proposed Solution Framework aligning with their features/pages and industry.
3. Recommended Scope of Work mapping features to business outcomes.
4. An Investment Strategy that accommodates their budget of ${lead.budget_range || "flexible pricing"}.
5. Timeline expectations matching ${lead.timeline || "standard delivery"}.

Tone: Authoritative, empathetic, clear, and highly consultative. Focus on ROI and solving their specific problem.`;
      } else if (type === "outreach") {
        finalPrompt += `
[TASK INSTRUCTIONS]
Act as an expert web consultant and agency director (named David at Clarity Space). Based on the client details above, generate a high-converting Cold Outreach Email Sequence (Initial email + 2 Follow-ups).

Requirements:
1. Acknowledge their specific issue/opportunity: "${lead.website_issue_opportunity || "their website's digital footprint"}".
2. Position our expertise gently and offer a free, no-obligation audit or custom strategy related to their industry (${lead.industry || "their sector"}).
3. Keep emails concise, structured for readability, and hyper-personalized.
4. Provide a clear, low-friction Call to Action (e.g., replying for the audit or jumping on a 10 min call).

Tone: Conversational, professional, non-pushy, but value-driven.`;
      } else {
        finalPrompt += `
[TASK INSTRUCTIONS]
Use the information above to assist me with generating content, proposals, or communications for this project. Wait for my next command.`;
      }

      navigator.clipboard.writeText(finalPrompt);
      alert(
        `AI Prompt (${type.toUpperCase()}) Copied to Clipboard! Paste to ChatGPT/Gemini.`,
      );
    } catch (err) {
      console.error(err);
      alert("Failed to copy AI prompt");
    }
  };

  // Compute combined projects
  const combinedProjects = [
    ...intakes.map((p) => ({
      ...p,
      _collectionName: "intakes" as const,
      businessName:
        p.business_name || p.businessName || "Unnamed Inbound Business",
      contactName: p.contact_name || p.contactName || "Inbound Client",
    })),
    ...leads.map((p) => ({
      ...p,
      _collectionName: "outreachLeads" as const,
      businessName:
        p.businessName || p.business_name || "Unnamed Outbound Prospect",
      contactName: p.contactName || p.contact_name || "Outbound Prospect",
    })),
  ];

  // Filter combined list
  const filteredProjs = combinedProjects.filter((p) => {
    const matchesSearch =
      p.businessName
        .toLowerCase()
        .includes(projControlSearchQuery.toLowerCase()) ||
      p.contactName
        .toLowerCase()
        .includes(projControlSearchQuery.toLowerCase()) ||
      (p.email || "")
        .toLowerCase()
        .includes(projControlSearchQuery.toLowerCase()) ||
      (p.status || "")
        .toLowerCase()
        .includes(projControlSearchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (projControlFilterTab === "intakes")
      return p._collectionName === "intakes";
    if (projControlFilterTab === "leads")
      return p._collectionName === "outreachLeads";
    if (projControlFilterTab === "active") {
      return (
        p.status &&
        p.status !== "Completed" &&
        p.status !== "Closed" &&
        p.status !== "Lost" &&
        !p.status?.toLowerCase().includes("do not contact")
      );
    }
    if (projControlFilterTab === "completed") {
      return (
        p.status === "Completed" ||
        p.status === "Closed" ||
        p.status === "Launched"
      );
    }
    return true;
  });

  // Calculate status progress index
  const getStatusProgressPercent = (statusStr: string) => {
    const cleaned = (statusStr || "").toLowerCase();
    if (cleaned.includes("new") || cleaned.includes("lead")) return 10;
    if (cleaned.includes("review") || cleaned.includes("quote")) return 22;
    if (cleaned.includes("requested") && cleaned.includes("deposit")) return 35;
    if (cleaned.includes("paid") || cleaned.includes("won")) return 50;
    if (cleaned.includes("assets")) return 62;
    if (cleaned.includes("started") || cleaned.includes("build")) return 74;
    if (cleaned.includes("preview")) return 85;
    if (cleaned.includes("final") || cleaned.includes("launch ready"))
      return 94;
    if (cleaned.includes("launched") || cleaned.includes("complete"))
      return 100;
    return 10;
  };

  const getOutreachEmailForItem = (item: any) => {
    if (!item) return { subject: "", body: "" };

    const isOutreachLeadStatus = [
      "New lead",
      "Researching",
      "Sent outreach",
      "Follow-up 1",
      "Follow-up 2",
      "Interested"
    ].includes(item.status);

    const clientName = item.contactName || "Client partner";
    const busName = item.businessName || "your business";
    const origin = window.location.origin;

    if (isOutreachLeadStatus) {
      let subject = `Proposal and design ideas for ${busName}`;
      let body = `Hi ${clientName},\n\n`;

      if (item.status === "Follow-up 1") {
        subject = `Quick follow up — design draft for ${busName}`;
        body += `I wanted to send a quick follow-up to see if you had a chance to look over the initial ideas and digital concepts we pulled together for ${busName}.\n\n`;
      } else if (item.status === "Follow-up 2") {
        subject = `Last touchpoint — options for ${busName}`;
        body += `This is our final check-in regarding the website updates. Since you are busy executing, we just wanted to leave this option with you.\n\n`;
      } else {
        body += `I was checking out your online presence and noticed several key design and responsiveness opportunities for ${busName} that could really help lift your local customer conversions.\n\n`;
      }

      if (item.website_issue_opportunity) {
        body += `Specifically, we analyzed that ${item.website_issue_opportunity}.\n\n`;
      }

      body += `We mapped out a tailored launch checklist and staging workspace here:\n${origin}/project-status/${item.secure_token || "portal"}\n\n`;
      body += `Would you be open to a swift 5-minute chat to look over the options we scoped out for you?\n\nWarm regards,\nClarity Space Operations`;

      return { subject, body };
    }

    let templateId: string | null = null;
    let subject = `Update on your ${busName} project`;

    switch (item.status) {
      case "New Intake":
      case "Intake Started":
        templateId = "intake_received";
        subject = `Intake received — Clarity Space Agency`;
        break;
      case "Proposal Sent":
        templateId = "proposal_ready";
        subject = `Your customised project proposal for ${busName}`;
        break;
      case "Question Asked":
        templateId = "question_reply";
        subject = `Response to request — Clarity Space`;
        break;
      case "Proposal Approved":
        templateId = "proposal_approved";
        subject = `Agreement approved! Kickoff planning`;
        break;
      case "Deposit Requested":
        templateId = "deposit_request";
        subject = `Milestone deposit invoice for ${busName}`;
        break;
      case "Deposit Paid":
        templateId = "asset_handover_request";
        subject = `Retainer payment verified! Setting up Drive`;
        break;
      case "Assets Requested":
        templateId = "missing_asset_reminder";
        subject = `Action Required: Assets and folder handover for ${busName}`;
        break;
      case "Assets Received":
      case "Build Started":
        templateId = "build_started";
        subject = `Build commenced on ${busName} project!`;
        break;
      case "First Preview Sent":
        templateId = "first_preview_ready";
        subject = `Your live staging proof for ${busName} is ready!`;
        break;
      case "Client Review":
        templateId = "feedback_reminder";
        subject = `Client Review — checking revisions for ${busName}`;
        break;
      case "Final Review":
        templateId = "final_review_ready";
        subject = `Pre-launch final adjustments checklist for ${busName}`;
        break;
      case "Launch Ready":
        templateId = "launch_ready";
        subject = `Production deployment authorized — ${busName}`;
        break;
      case "Launched":
        templateId = "site_launched";
        subject = `Congratulations! ${busName} is now LIVE globally!`;
        break;
      case "Completed":
        templateId = "handover_message";
        subject = `Project completion & archive files for ${busName}`;
        break;
      case "Testimonial Requested":
        templateId = "testimonial_request";
        subject = `Feedback & testimonial request — Clarity Space`;
        break;
    }

    let body = "";
    if (templateId) {
      body = buildClientMessage(templateId, item, origin);
    } else {
      body = `Hi ${clientName},\n\nWe wanted to share a status update for the ${busName} project.\n\nPlease log in here to view details and action items:\n${origin}/project-status/${item.secure_token || "portal"}\n\nWarm regards,\nClarity Space Team`;
    }

    return { subject, body };
  };

  // Locate currently selected project
  const curProject = selectedLead
    ? combinedProjects.find((p) => p.id === selectedLead.id) || selectedLead
    : null;
  const curColl = curProject
    ? intakes.some((i) => i.id === curProject.id)
      ? "intakes"
      : "outreachLeads"
    : "intakes";

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 md:w-72 border-r border-slate-800 bg-slate-950 p-6 flex flex-col justify-between hidden md:flex">
        <div className="flex flex-col h-full">
          <div className="mb-6 shrink-0">
            <h2 className="text-xl font-black text-white tracking-tight">
              Project Intake Centre
            </h2>
            <div className="mt-2.5">
              {!isFirebaseConfigured ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-mono font-bold bg-amber-955/20 text-amber-500 border border-amber-900/40 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Local/Demo Mode
                </span>
              ) : firebaseError ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-mono font-bold bg-rose-955/20 text-rose-455 border border-rose-900/40 select-none animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Firebase Error
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] uppercase font-mono font-bold bg-emerald-955/20 text-emerald-400 border border-emerald-900/40 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-pulse" />
                  Firebase Connected
                </span>
              )}
            </div>
          </div>
          <nav className="space-y-1.5 shrink-0 overflow-y-auto custom-scrollbar pr-1 max-h-[30vh]">
            <button
              onClick={() => setActiveTab("board")}
              className={`w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === "board" ? "bg-cyan-950/40 text-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
            >
              <BarChart className="w-4 h-4" /> Operations Dash
            </button>
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === "pipeline" ? "bg-cyan-950/40 text-cyan-400 border-l-2 border-cyan-500" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
            >
              <FolderOpen className="w-4 h-4" /> Pipeline Board
            </button>
            <button
              onClick={() => setActiveTab("intakes")}
              className={`w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === "intakes" ? "bg-cyan-950/40 text-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
            >
              <FileText className="w-4 h-4" /> Inbound Intakes
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === "leads" ? "bg-cyan-950/40 text-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
            >
              <Users className="w-4 h-4" /> Outbound Leads
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === "settings" ? "bg-cyan-950/40 text-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
            >
              <LinkIcon className="w-4 h-4" /> Industry Links
            </button>
            <button
              onClick={() => setActiveTab("assets")}
              className={`w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === "assets" ? "bg-cyan-950/40 text-cyan-400" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
            >
              <Folder className="w-4 h-4" /> Drive & Assets
            </button>
            <button
              onClick={() => setActiveTab("readiness")}
              className={`w-full flex items-center justify-start gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === "readiness" ? "bg-cyan-950/40 text-cyan-400 font-bold border-r-2 border-cyan-500" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}
            >
              <Sliders className="w-4 h-4 text-cyan-400" /> Project Control Hub
            </button>
          </nav>

          {/* Active Operations Queue in Sidebar */}
          <div className="mt-8 flex flex-col space-y-3 overflow-hidden -mx-2 px-2 flex-grow border-t border-slate-800 pt-6">
            <div className="space-y-1 pb-1 shrink-0">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Operations Queue
              </h3>
            </div>

            {/* Quick sub filters */}
            <div className="flex flex-wrap gap-1 bg-[#020617]/40 p-1 rounded-lg border border-slate-850/80 text-[8px] font-bold font-mono shrink-0">
              {[
                { key: "all", label: "All" },
                { key: "intakes", label: "In" },
                { key: "leads", label: "Out" },
                { key: "active", label: "Act" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setProjControlFilterTab(tab.key as any)}
                  className={`flex-1 text-center py-1 rounded transition-all cursor-pointer ${
                    projControlFilterTab === tab.key
                      ? "bg-cyan-500 text-slate-950 font-black"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Combined list display scroll */}
            <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {filteredProjs.length === 0 ? (
                <div className="text-center py-6 font-mono text-[9px] text-slate-500 italic">
                  No projects.
                </div>
              ) : (
                filteredProjs.map((proj) => {
                  const isActive = selectedLead && selectedLead.id === proj.id;
                  const progress = getStatusProgressPercent(proj.status);
                  return (
                    <div
                      key={proj.id}
                      onClick={() => {
                        setSelectedLead(proj);
                        setActiveTab("readiness");
                        if (proj._collectionName === "intakes")
                          setProjControlFilterTab("intakes");
                        else setProjControlFilterTab("leads");
                      }}
                      className={`p-2.5 rounded-xl border transition-all duration-150 cursor-pointer text-left select-none space-y-1.5 ${
                        isActive
                          ? "bg-cyan-950/20 border-cyan-500 shadow-sm shadow-cyan-950/20"
                          : "bg-[#020617]/50 border-slate-850 hover:border-slate-805 hover:bg-[#020617]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] font-semibold text-white tracking-tight leading-snug line-clamp-1 flex-1">
                          {proj.businessName}
                        </span>
                        <span
                          className={`text-[7px] font-mono uppercase font-black tracking-widest px-1 py-0.5 rounded shrink-0
                        ${proj._collectionName === "intakes" ? "bg-cyan-950/60 border border-cyan-900/40 text-cyan-405" : "bg-indigo-950/60 border border-indigo-900/40 text-indigo-305"}`}
                        >
                          {proj._collectionName === "intakes" ? "Inb" : "Out"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[8px] text-slate-450 font-mono">
                        <span className="truncate max-w-[90px] font-sans">
                          {proj.contactName}
                        </span>
                        <span
                          className={`px-1 rounded font-black uppercase py-0.5 border ${
                            (proj.status || "")
                              .toLowerCase()
                              .includes("paid") ||
                            (proj.status || "").toLowerCase().includes("won")
                              ? "bg-emerald-950/50 border-emerald-900/40 text-emerald-400"
                              : "bg-slate-950/50 border-slate-850 text-slate-400"
                          }`}
                        >
                          {proj.status || "Draft"}
                        </span>
                      </div>

                      <div className="w-full bg-slate-950 rounded-full h-0.5 overflow-hidden mt-1">
                        <div
                          className={`h-full transition-all duration-300 ${
                            progress === 100 ? "bg-emerald-500" : "bg-cyan-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* Search query input */}
            <div className="relative shrink-0 mt-2">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={projControlSearchQuery}
                onChange={(e) => setProjControlSearchQuery(e.target.value)}
                className="w-full bg-[#020617] text-[10px] text-white placeholder-slate-600 rounded-lg pl-8 pr-3 py-2 border border-slate-800 outline-none focus:border-cyan-500 transition-all font-sans"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4 pt-4 border-t border-slate-800 mt-4 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Homepage
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-[99] bg-emerald-950 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Mobile Header (fallback) */}
        <div className="md:hidden p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-slate-500 hover:text-cyan-400 mr-1">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-lg font-black text-white tracking-tight">
              Intake Centre
            </h2>
          </div>
          <button onClick={handleLogout} className="text-slate-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
          <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 flex gap-3 text-sm">
            <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-amber-200/80 font-light leading-relaxed">
              <span className="font-semibold text-amber-500 block mb-1">
                Safety & Compliance Reminder
              </span>
              Use this dashboard for low-volume personalised outreach only.
              Manually review every generated message before sending. Always
              respect opt-outs and NEVER contact businesses again if they assign
              a Do Not Contact status.
            </p>
          </div>

          {localSubmissions.length > 0 && (
            <div className="bg-gradient-to-r from-amber-950/45 to-orange-950/20 border border-amber-900/40 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-amber-400 flex items-center gap-2 text-sm sm:text-base">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    Pending Local Fallback Submissions (
                    {localSubmissions.length})
                  </h4>
                  <p className="text-amber-200/65 text-xs font-light mt-0.5">
                    These leads were captured locally during slow responses or
                    unconfigured periods.
                  </p>
                </div>
                {isFirebaseConfigured && (
                  <button
                    onClick={handleSyncAllLocals}
                    disabled={isSyncingAll}
                    className="self-start sm:self-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-1.5 rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {isSyncingAll ? "Syncing..." : "Sync All to Firebase"}
                  </button>
                )}
              </div>
              <div className="bg-slate-950/70 border border-slate-900 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-900">
                {localSubmissions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium text-slate-200">
                        {item.data.business_name ||
                          item.data.businessName ||
                          "Unnamed Business"}{" "}
                        —{" "}
                        <span className="text-slate-400">
                          {item.data.contact_name ||
                            item.data.contactName ||
                            "No contact info"}
                        </span>
                      </p>
                      <p className="text-slate-500 font-mono text-[10px]">
                        ID: {item.id} | Type: {item.collection} (
                        {item.data.industry || "any"})
                      </p>
                    </div>
                    {isFirebaseConfigured ? (
                      <button
                        onClick={() => handleSyncLocalToFirebase(item)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-medium border border-amber-900/45 px-2.5 py-1 rounded"
                      >
                        Sync Record
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        Demo Mode Offline
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === "board" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    Metrics & Operations
                  </h1>
                  <p className="text-slate-400 text-sm">
                    Overview of current pipeline volume.
                  </p>
                </div>
                <button
                  onClick={() => setIsWeeklySummaryOpen(true)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition duration-200 shadow-lg shadow-cyan-950/20 flex items-center gap-2 cursor-pointer self-stretch sm:self-auto justify-center"
                >
                  <FileText className="w-4 h-4" /> Weekly CRM Summary Report
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl -z-0"></div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-mono mb-2 font-bold relative z-10">
                    Total Pipeline Intakes
                  </p>
                  <p className="text-4xl font-light text-white relative z-10">
                    {intakes.length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -z-0"></div>
                  <p className="text-slate-400 text-[11px] uppercase tracking-widest font-mono mb-2 font-bold relative z-10">
                    Outbound Tracked
                  </p>
                  <p className="text-4xl font-light text-white relative z-10">
                    {leads.length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-950/30 to-emerald-950/10 border border-emerald-900/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <p className="text-emerald-500/80 text-[11px] uppercase tracking-widest font-mono mb-2 font-bold relative z-10">
                    Total Won Projects
                  </p>
                  <p className="text-4xl font-semibold text-emerald-400 relative z-10">
                    {intakes.filter(isWonProject).length +
                      leads.filter(isWonProject).length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-rose-950/30 to-rose-950/10 border border-rose-900/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  <p className="text-rose-500/80 text-[11px] uppercase tracking-widest font-mono mb-2 font-bold relative z-10">
                    Total DNC List
                  </p>
                  <p className="text-4xl font-light text-rose-400 relative z-10">
                    {intakes.filter((i) =>
                      i.status?.toLowerCase().includes("do not contact"),
                    ).length +
                      leads.filter((l) =>
                        l.status?.toLowerCase().includes("do not contact"),
                      ).length}
                  </p>
                </div>
              </div>

              {/* Daily Guided Focus Deck - Step-by-Step CRM Companion */}
              <div className="bg-slate-900 border-2 border-cyan-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-0"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-0"></div>
                
                <div className="relative z-10 space-y-6">
                  {/* Header metadata row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-505"></span>
                        </span>
                        <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5 uppercase font-mono">
                          <Sparkles className="w-4 h-4 text-cyan-400" /> Daily Guided Focus Plan
                        </h3>
                      </div>
                      <p className="text-slate-400 text-xs">
                        Tackle one high-priority lead or customer checkpoint at a time to keep your operations flawless and non-overwhelming.
                      </p>
                    </div>

                    {/* Filter controls inside Focus mode */}
                    <div className="flex items-center gap-2 bg-[#020617] p-1 rounded-xl border border-slate-800 self-start md:self-center">
                      <button
                        onClick={() => {
                          setFocusFilterMode("pending");
                          setGuidedFocusIndex(0);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          focusFilterMode === "pending"
                            ? "bg-cyan-500 text-slate-950 font-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        ⚡ Pending Action ({attentionItems.filter(i => i.actionInfo?.waitingOn !== "None" && i.status !== "Completed" && i.status !== "Lost" && !i.status?.toLowerCase().includes("do not contact")).length})
                      </button>
                      <button
                        onClick={() => {
                          setFocusFilterMode("all");
                          setGuidedFocusIndex(0);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          focusFilterMode === "all"
                            ? "bg-cyan-500 text-slate-950 font-black"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Browse All Active ({attentionItems.filter(i => i.status !== "Completed" && i.status !== "Lost" && !i.status?.toLowerCase().includes("do not contact")).length})
                      </button>
                    </div>
                  </div>

                  {focusDeckItems.length === 0 ? (
                    <div className="py-12 text-center bg-[#020617]/40 rounded-2xl border border-slate-850/60 p-6 space-y-3">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wide font-mono">Inbox Zero Achieved!</h4>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          You have zero outstanding operational bottlenecks. Your outbox is clear, all feedback is resolved, and checklists are active. Great job!
                        </p>
                      </div>
                    </div>
                  ) : (() => {
                    const deckLen = focusDeckItems.length;
                    const safeIdx = Math.min(Math.max(0, guidedFocusIndex), deckLen - 1);
                    const item = focusDeckItems[safeIdx];
                    
                    const curStatus = item.status || "New Intake";
                    const guide = STAGE_GUIDES[curStatus] || {
                      description: "Review metadata and confirm next standard milestones with your client partner.",
                      checklist: [
                        "Confirm contact info matching records",
                        "Align target delivery schedule with active milestones",
                      ]
                    };

                    const currentStepChecklists = item.step_checklists || {};
                    const completedForThisStage = currentStepChecklists[curStatus] || {};
                    const totalSteps = guide.checklist.length;
                    const completedStepsCount = guide.checklist.filter(
                      (step) => completedForThisStage[step],
                    ).length;
                    
                    const isStageFullyComplete = completedStepsCount === totalSteps;
                    const curIdx = PIPELINE_STATUSES.indexOf(curStatus);
                    const nextStatus =
                      curIdx >= 0 && curIdx < PIPELINE_STATUSES.length - 1
                        ? PIPELINE_STATUSES[curIdx + 1]
                        : null;

                    // Message generating
                    const email = getOutreachEmailForItem(item);
                    const mailtoUrl = email.body 
                      ? `mailto:${item.email || ""}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`
                      : "#";

                    return (
                      <div className="space-y-6">
                        {/* Pagination indicator row */}
                        <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                          <span className="bg-[#020617] border border-slate-800 px-3 py-1 rounded-full text-slate-400">
                            Partner Card <strong className="text-cyan-405">{safeIdx + 1}</strong> of <strong className="text-cyan-405">{deckLen}</strong>
                          </span>
                          
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <button
                              disabled={safeIdx === 0}
                              onClick={() => {
                                setGuidedFocusIndex(safeIdx - 1);
                                setCopiedItemId(null);
                              }}
                              className={`p-1.5 rounded-lg border border-slate-800 bg-[#020617] text-slate-450 transition ${
                                safeIdx === 0 ? "opacity-35 cursor-not-allowed" : "hover:text-white hover:border-slate-700 active:scale-95 cursor-pointer"
                              }`}
                              title="Previous task partner"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              disabled={safeIdx === deckLen - 1}
                              onClick={() => {
                                setGuidedFocusIndex(safeIdx + 1);
                                setCopiedItemId(null);
                              }}
                              className={`p-1.5 rounded-lg border border-slate-800 bg-[#020617] text-slate-450 transition ${
                                safeIdx === deckLen - 1 ? "opacity-35 cursor-not-allowed" : "hover:text-white hover:border-slate-700 active:scale-95 cursor-pointer"
                              }`}
                              title="Next task partner"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Interactive Main Split Area */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Left Details block (5 cols) */}
                          <div className="lg:col-span-5 bg-[#020617]/50 rounded-2xl border border-slate-850 p-5 space-y-4">
                            <div className="space-y-2">
                              <span className="text-[9px] font-bold font-mono tracking-wider bg-slate-900 border border-slate-800/80 px-2.5 py-1 rounded-full text-slate-400 uppercase">
                                {item.sourceType === "intake" ? "💼 Intake Project Client" : "🚀 Campaign Prospect Target"}
                              </span>
                              
                              <h4 className="text-xl font-bold text-white tracking-tight">
                                {item.businessName}
                              </h4>
                              
                              <div className="space-y-1 text-xs">
                                <p className="text-slate-400 font-sans">
                                  Primary Partner: <span className="text-white font-semibold">{item.contactName}</span>
                                </p>
                                <p className="text-slate-400 font-mono text-[11px] truncate">
                                  Email: <span className="text-slate-300">{item.email || "No registered email"}</span>
                                </p>
                                {item.phone && (
                                  <p className="text-slate-400 font-mono">
                                    Phone: <span className="text-slate-300">{item.phone}</span>
                                  </p>
                                )}
                                {item.suggested_package && (
                                  <p className="text-slate-400 font-sans mt-2">
                                    Configured Tier: <span className="text-cyan-405 font-bold">{item.suggested_package}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Priority and current target indicators */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-850/60">
                              <span className="text-[10px] font-mono bg-[#030712] border border-cyan-900/60 text-cyan-405 px-2.5 py-1 rounded-lg uppercase font-bold">
                                {curStatus}
                              </span>
                              
                              <span className={`text-[10px] font-mono border px-2.5 py-1 rounded-lg font-bold uppercase ${item.priority?.colorClass}`}>
                                {item.priority?.label} (Score: {item.priority?.score})
                              </span>
                              
                              {item.actionInfo?.dueDate && (
                                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border font-bold ${
                                  item.isOverdue ? "bg-rose-950/20 text-rose-455 border-rose-900/40" : "bg-slate-900/40 text-slate-400 border-slate-800"
                                }`}>
                                  Target: {item.actionInfo.dueDate}
                                </span>
                              )}
                            </div>

                            {/* Situation Context Notes */}
                            {(item.website_issue_opportunity || item.notes) && (
                              <div className="pt-3 border-t border-slate-850/60 space-y-1.5">
                                <span className="text-[9px] uppercase font-mono tracking-wider text-slate-500 font-black block">Context Overview</span>
                                {item.website_issue_opportunity && (
                                  <p className="text-[11px] text-amber-405 bg-amber-955/10 border border-amber-900/35 p-2 rounded-lg italic">
                                    ⚠️ {item.website_issue_opportunity}
                                  </p>
                                )}
                                {item.notes && (
                                  <p className="text-[11px] text-slate-300 font-light bg-[#020617] border border-slate-850 p-2.5 rounded-lg leading-relaxed max-h-[82px] overflow-y-auto custom-scrollbar">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Quick Link workspace helper */}
                            <div className="pt-2">
                              <button
                                onClick={() => {
                                  setSelectedLead(item);
                                  setActiveTab("readiness");
                                  setProjControlFilterTab(item.sourceType === "intake" ? "intakes" : "leads");
                                }}
                                className="w-full inline-flex items-center justify-center gap-1 bg-[#020617] hover:bg-slate-950 border border-slate-800/85 hover:border-slate-700 py-2 rounded-xl text-xs text-white transition font-medium cursor-pointer"
                              >
                                View Comprehensive Workspace <ArrowRight className="w-3.5 h-3.5 text-cyan-405" />
                              </button>
                            </div>
                          </div>

                          {/* Right Guidance and Action block (7 cols) */}
                          <div className="lg:col-span-7 space-y-5">
                            {/* Simple description of current milestone */}
                            <div className="bg-[#020617]/30 border border-slate-850 p-4 rounded-2xl space-y-1">
                              <span className="text-[9px] font-black uppercase font-mono tracking-wider text-slate-450 block">Operational Stage Objective</span>
                              <p className="text-xs text-slate-300 font-light leading-relaxed">
                                {guide.description}
                              </p>
                            </div>

                            {/* Active Action Gates Checklist */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-mono text-[10px] font-black uppercase text-cyan-405 tracking-wider">Milestone Verification Checklist</span>
                                <span className="text-slate-500 font-mono text-[10px]">
                                  {completedStepsCount} of {totalSteps} verified
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2">
                                {guide.checklist.map((step, idx) => {
                                  const isComp = !!completedForThisStage[step];
                                  return (
                                    <label
                                      key={idx}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        toggleStageChecklistItem(
                                          item.id,
                                          curStatus,
                                          step,
                                          item.sourceType === "intake" ? "intakes" : "outreachLeads"
                                        );
                                      }}
                                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#020617]/60 border border-slate-850/60 hover:border-slate-800 hover:bg-[#020617]/90 transition cursor-pointer select-none group"
                                    >
                                      <div
                                        className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition shrink-0 ${
                                          isComp
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-transparent text-slate-950"
                                            : "border-slate-700 bg-[#020617] group-hover:border-cyan-500"
                                        }`}
                                      >
                                        {isComp && (
                                          <svg
                                            className="w-2.5 h-2.5 stroke-[3] stroke-current"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                      <span className={`text-[11px] font-sans transition ${isComp ? "text-slate-500 font-light line-through" : "text-slate-300"}`}>
                                        {step}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Outreach Message box */}
                            {email.body && (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-mono text-[10px] font-black uppercase text-cyan-405 tracking-wider">Outreach Message Blueprint</span>
                                  <span className="text-slate-550 text-[9px] italic">Includes personal context fields</span>
                                </div>
                                <div className="p-3 bg-[#020617] border border-slate-850 rounded-xl relative">
                                  <div className="text-[10px] text-slate-450 font-mono mb-2 border-b border-slate-900 pb-1.5 flex justify-between">
                                    <span>Subject: <strong className="text-slate-200">{email.subject}</strong></span>
                                  </div>
                                  <p className="text-[11px] text-slate-300 font-light font-mono leading-relaxed max-h-[140px] overflow-y-auto custom-scrollbar whitespace-pre-wrap select-text pr-1">
                                    {email.body}
                                  </p>
                                  
                                  {/* Action buttons inside communication block */}
                                  <div className="mt-3 pt-2.5 border-t border-slate-900 flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(email.body);
                                        setCopiedItemId(item.id);
                                        setTimeout(() => {
                                          setCopiedItemId(null);
                                        }, 3000);
                                      }}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                                        copiedItemId === item.id
                                          ? "bg-emerald-500 text-slate-950 font-black"
                                          : "bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white"
                                      }`}
                                    >
                                      {copiedItemId === item.id ? "✓ Message Copied" : "📋 Copy Email Text"}
                                    </button>
                                    
                                    <a
                                      href={mailtoUrl}
                                      className="px-3 py-1.5 bg-cyan-950/60 border border-cyan-800/60 hover:bg-cyan-550/15 hover:border-cyan-500 text-cyan-400 font-bold text-[10px] font-mono rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                      <Mail className="w-3.5 h-3.5" /> Dispatch with Mail client <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Easy Core Action Move status */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 font-mono">
                              {nextStatus ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await updateLeadStatus(
                                      item.id,
                                      nextStatus,
                                      item.sourceType === "intake" ? "intakes" : "outreachLeads"
                                    );
                                    // if it's the last card, decrease page count
                                    if (safeIdx === deckLen - 1 && safeIdx > 0) {
                                      setGuidedFocusIndex(safeIdx - 1);
                                    }
                                    setCopiedItemId(null);
                                  }}
                                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                                >
                                  <span>🌟 MARK STAGE COMPLETE: MOVE TO &quot;{nextStatus}&quot;</span>
                                  <ArrowRight className="w-4 h-4 shrink-0 text-slate-950" />
                                </button>
                              ) : (
                                <div className="w-full py-2 text-center text-xs font-mono text-slate-500 italic border border-slate-800 rounded-xl bg-[#020617]/50">
                                  ✓ This partner has successfully reached the final stage of operations.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Needs Attention Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-cyan-400" />
                      Needs Attention Terminal
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5 tracking-wide">
                      Suggested pipeline actions prepared automatically based on
                      target follow-up deadlines and active bottlenecks.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-800/80 pb-4">
                  {[
                    {
                      key: "all",
                      label: "All Active Gaps",
                      count: attentionItems.filter(
                        (i) => i.actionInfo.waitingOn !== "None",
                      ).length,
                    },
                    {
                      key: "due",
                      label: "Due Today",
                      count: attentionItems.filter(
                        (i) =>
                          i.isDueToday && i.actionInfo.waitingOn !== "None",
                      ).length,
                    },
                    {
                      key: "overdue",
                      label: "Overdue",
                      count: attentionItems.filter(
                        (i) => i.isOverdue && i.actionInfo.waitingOn !== "None",
                      ).length,
                      ping: true,
                    },
                    {
                      key: "admin",
                      label: "Waiting on Me",
                      count: attentionItems.filter(
                        (i) => i.actionInfo.waitingOn === "Admin",
                      ).length,
                    },
                    {
                      key: "client",
                      label: "Awaiting Client",
                      count: attentionItems.filter(
                        (i) => i.actionInfo.waitingOn === "Client",
                      ).length,
                    },
                    {
                      key: "payment",
                      label: "Awaiting Deposit",
                      count: attentionItems.filter(
                        (i) => i.actionInfo.waitingOn === "Payment",
                      ).length,
                    },
                    {
                      key: "assets",
                      label: "Awaiting Assets",
                      count: attentionItems.filter(
                        (i) => i.actionInfo.waitingOn === "Assets",
                      ).length,
                    },
                    {
                      key: "feedback",
                      label: "Awaiting Feedback",
                      count: attentionItems.filter(
                        (i) => i.actionInfo.waitingOn === "Feedback",
                      ).length,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setNeedsAttentionFilter(tab.key as any)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer
                          ${needsAttentionFilter === tab.key ? "bg-cyan-500 text-slate-950 border-cyan-500 font-bold" : "bg-[#020617] hover:bg-slate-800 text-slate-450 border-slate-800/80"}`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono leading-none ${needsAttentionFilter === tab.key ? "bg-slate-950 text-white" : "bg-[#020617] text-slate-500 border border-slate-800/40"}`}
                      >
                        {tab.count}
                      </span>
                      {tab.ping && tab.count > 0 && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-455 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {filteredAttentionItems.length === 0 ? (
                    <div className="text-center py-6 bg-[#020617]/45 border border-slate-850/50 rounded-2xl">
                      <p className="text-xs font-mono text-slate-500 italic">
                        No tasks flagged in this operational priority filter.
                      </p>
                    </div>
                  ) : (
                    filteredAttentionItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-[#020617]/40 border border-slate-850 hover:border-slate-750/80 rounded-2xl transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 w-full sm:max-w-[70%]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-white tracking-tight">
                              {item.businessName}
                            </span>
                            <span className="text-[10px] font-mono bg-[#020617] border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                              {item.sourceType === "intake"
                                ? "Client Intake"
                                : "Outreach Prospect"}
                            </span>
                            <span className="text-[10px] font-mono bg-cyan-950 border border-cyan-900 text-cyan-405 px-2 py-0.5 rounded font-bold uppercase">
                              {item.status}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase border px-2 py-0.5 rounded font-semibold ${item.priority.colorClass}`}
                            >
                              {item.priority.label} (Score:{" "}
                              {item.priority.score})
                            </span>
                          </div>

                          <div className="flex items-start gap-1 pb-0.5">
                            <span className="text-cyan-400 shrink-0 text-xs font-semibold">
                              ⚡ Action:
                            </span>
                            <p className="text-xs text-slate-205 font-medium leading-relaxed">
                              {item.actionInfo.action} —{" "}
                              <span className="text-slate-400 font-light">
                                {item.actionInfo.reason}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 self-end sm:self-center">
                          <div className="text-right hidden md:block">
                            <p className="text-[10px] font-mono uppercase text-slate-505 font-medium">
                              Suggested Target
                            </p>
                            <p
                              className={`text-xs font-mono font-semibold ${item.isOverdue ? "text-rose-450 animate-pulse" : "text-slate-350"}`}
                            >
                              {item.actionInfo.dueDate || "Unscheduled"}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedLead(item);
                              setActiveTab("readiness");
                              setProjControlFilterTab(
                                item.sourceType === "intake"
                                  ? "intakes"
                                  : "leads",
                              );
                            }}
                            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition duration-150 flex items-center gap-1 shadow shadow-cyan-950/20 cursor-pointer"
                          >
                            Open Workspace{" "}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {isWeeklySummaryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        Weekly CRM Operations Digest
                      </h3>
                      <button
                        onClick={() => setIsWeeklySummaryOpen(false)}
                        className="px-2.5 py-1 text-slate-400 hover:text-white bg-[#020617] border border-slate-800 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      This administrative dashboard report compiles active
                      prospective streams, total won project deposits, outreach
                      campaign reply metrics, outstanding tasks, and missing
                      asset directories.
                    </p>

                    <div className="bg-[#020617] border border-slate-850 p-4 rounded-2xl max-h-96 overflow-y-auto">
                      <pre className="text-xs font-mono text-cyan-300 leading-relaxed whitespace-pre-wrap select-all">
                        {generateWeeklySummary()}
                      </pre>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            generateWeeklySummary(),
                          );
                          alert(
                            "Administrative report copied to clipboard successfully!",
                          );
                        }}
                        className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition duration-150 flex justify-center items-center gap-2 cursor-pointer"
                      >
                        Copy Digest to Clipboard
                      </button>
                      <button
                        onClick={() => setIsWeeklySummaryOpen(false)}
                        className="px-6 py-2.5 bg-[#020617] hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NEW CAMPAIGN SUMMARY */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-6">
                <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-cyan-400" />
                    Campaign Performance: {newLeadCampaign}
                  </h3>
                  <span className="text-[10px] text-slate-500 uppercase font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    Active Tracking
                  </span>
                </div>

                {(() => {
                  const campaignLeads = leads.filter(
                    (l) => l.campaign_name === newLeadCampaign,
                  );
                  const total = campaignLeads.length;
                  const sent = campaignLeads.filter(
                    (l) => l.status !== "New lead",
                  ).length;
                  const demoViews = campaignLeads.filter(
                    (l) => l.demo_viewed_at,
                  ).length;
                  const proposalViews = campaignLeads.filter(
                    (l) => l.proposal_viewed_at,
                  ).length;
                  const intakeSubmissions = campaignLeads.filter(
                    (l) => l.intake_submitted_at,
                  ).length;
                  const replies = campaignLeads.filter(
                    (l) =>
                      l.status === "Replied" ||
                      isWonProject(l) ||
                      l.status === "Lost" ||
                      l.status === "Proposal Sent" ||
                      l.status === "Do Not Contact",
                  ).length;
                  const proposals = campaignLeads.filter(
                    (l) => l.status === "Proposal Sent" || isWonProject(l),
                  ).length;
                  const won = campaignLeads.filter(isWonProject).length;
                  const lost = campaignLeads.filter(
                    (l) => l.status === "Lost" || l.status === "Do Not Contact",
                  ).length;

                  const calcRate = (num: number, den: number) =>
                    den > 0 ? ((num / den) * 100).toFixed(1) + "%" : "0%";

                  return (
                    <div className="p-0">
                      <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-800/60 border-b border-slate-800/60">
                        <div className="p-4 bg-slate-900">
                          <p className="text-[10px] font-mono uppercase text-slate-500 mb-1">
                            Total Prospects
                          </p>
                          <p className="text-2xl font-light text-white">
                            {total}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-900">
                          <p className="text-[10px] font-mono uppercase text-slate-500 mb-1">
                            Emails Sent
                          </p>
                          <p className="text-2xl font-light text-white">
                            {sent}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-900">
                          <p className="text-[10px] font-mono uppercase text-cyan-500 mb-1">
                            Demo Views
                          </p>
                          <p className="text-2xl font-light text-cyan-300">
                            {demoViews}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1">
                            Rate: {calcRate(demoViews, sent)}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-900">
                          <p className="text-[10px] font-mono uppercase text-cyan-500 mb-1">
                            Intake Submits
                          </p>
                          <p className="text-2xl font-light text-cyan-300">
                            {intakeSubmissions}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1">
                            Conv: {calcRate(intakeSubmissions, demoViews)}
                          </p>
                        </div>
                        <div className="p-4 bg-emerald-950/20">
                          <p className="text-[10px] font-mono uppercase text-emerald-500 mb-1">
                            Won
                          </p>
                          <p className="text-2xl font-light text-emerald-400">
                            {won}
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 mt-1">
                            Rate: {calcRate(won, total)}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#020617]">
                        <div>
                          <p className="text-[10px] uppercase text-slate-500 mb-1">
                            Proposal Views
                          </p>
                          <p className="text-lg text-white font-mono">
                            {proposalViews}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-slate-500 mb-1">
                            Replies
                          </p>
                          <p className="text-lg text-white font-mono">
                            {replies}{" "}
                            <span className="text-[9px] text-slate-500 ml-1">
                              ({calcRate(replies, sent)})
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-slate-500 mb-1">
                            Proposals Sent
                          </p>
                          <p className="text-lg text-white font-mono">
                            {proposals}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-slate-500 mb-1">
                            Lost / Opt Out
                          </p>
                          <p className="text-lg text-slate-400 font-mono">
                            {lost}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* OUTREACH CHECKLIST */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-500" />
                    Initial Campaign Checklist ({newLeadCampaign})
                  </h3>
                  <div className="space-y-2">
                    {[
                      "Add 30 swimming school prospects",
                      "Review each website manually",
                      "Add one website issue/opportunity note",
                      "Send only 5 personalised emails first",
                      "Wait 3 days",
                      "Follow up",
                      "Review demo views, replies and intake submissions",
                      "Adjust email wording",
                      "Send next 10",
                      "Repeat",
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={campaignChecklist[idx] || false}
                          onChange={() => toggleCampaignChecklist(idx)}
                          className="rounded border-slate-700 bg-slate-950 text-cyan-500 cursor-pointer"
                        />
                        <span
                          className={`text-sm font-light ${campaignChecklist[idx] ? "text-slate-500 line-through" : "text-slate-300"}`}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-500" />
                    QA Test Mode Checklist
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {[
                      "Add test outbound lead",
                      "Copy demo link",
                      "Open demo link in incognito",
                      "Confirm demo_viewed badge appears",
                      "Copy proposal link",
                      "Confirm proposal_viewed badge appears",
                      "Start client intake",
                      "Submit client intake",
                      "Confirm intake_submitted badge appears",
                      "Confirm asset readiness board appears",
                      "Mark email sent",
                      "Schedule follow-up +3d",
                      "Mark replied",
                      "Mark proposal sent",
                      "Mark DNC / opt out",
                    ].map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <input
                          type="checkbox"
                          checked={qaChecklist[idx] || false}
                          onChange={() => toggleQaChecklist(idx)}
                          className="rounded border-slate-700 bg-slate-950 text-cyan-500 cursor-pointer"
                        />
                        <span
                          className={`text-sm font-light ${qaChecklist[idx] ? "text-slate-500 line-through" : "text-slate-300"}`}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-white">
                      Active Follow-ups Due
                    </h3>
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded font-mono uppercase font-bold">
                      {
                        leads.filter(
                          (l) =>
                            l.next_follow_up_at &&
                            l.next_follow_up_at <=
                              new Date().toISOString().split("T")[0] &&
                            l.status !== "Won" &&
                            l.status !== "Lost" &&
                            !l.status?.includes("Do not contact"),
                        ).length
                      }{" "}
                      Active
                    </span>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {(() => {
                      const todayChar = new Date().toISOString().split("T")[0];
                      const overdue = leads.filter(
                        (l) =>
                          l.next_follow_up_at &&
                          l.next_follow_up_at <= todayChar &&
                          l.status !== "Won" &&
                          l.status !== "Lost" &&
                          !l.status?.includes("Do not contact"),
                      );

                      if (overdue.length === 0) {
                        return (
                          <div className="text-center py-6">
                            <p className="text-sm text-slate-500 italic font-mono">
                              No follow-ups due. Outbox clear.
                            </p>
                          </div>
                        );
                      }

                      return overdue.map((lead) => (
                        <div
                          key={lead.id}
                          className="p-3 border border-slate-850 rounded-xl bg-[#020617] hover:border-slate-700 transition flex flex-col justify-between gap-3 group"
                        >
                          <div
                            className="flex justify-between items-start cursor-pointer"
                            onClick={() => {
                              setSelectedLead(lead);
                              setActiveTab("readiness");
                              setProjControlFilterTab("leads");
                            }}
                          >
                            <div>
                              <p className="text-sm text-white font-medium group-hover:text-cyan-400 transition">
                                {lead.businessName}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {lead.contactName || "No contact name"} •{" "}
                                {lead.industry}
                              </p>
                              <p className="text-[10px] font-mono text-cyan-500 mt-1">
                                🗓 Target: {lead.next_follow_up_at}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-[10px] uppercase font-mono rounded font-semibold whitespace-nowrap">
                              Due Now
                            </span>
                          </div>

                          {/* Daily delay actions button matrix */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] text-slate-500 font-mono">
                              Reschedule:
                            </span>
                            <button
                              onClick={(e) =>
                                handlePostponeFollowUp(e, lead.id, 3)
                              }
                              className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-300 hover:bg-slate-850 hover:text-white transition font-mono font-medium"
                            >
                              +3d
                            </button>
                            <button
                              onClick={(e) =>
                                handlePostponeFollowUp(e, lead.id, 7)
                              }
                              className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-300 hover:bg-slate-850 hover:text-white transition font-mono font-medium"
                            >
                              +7d
                            </button>
                            <button
                              onClick={(e) =>
                                handlePostponeFollowUp(e, lead.id, 14)
                              }
                              className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[9px] text-slate-300 hover:bg-slate-855 hover:text-white transition font-mono font-medium"
                            >
                              +14d
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-4">
                    Latest Intakes
                  </h3>
                  <div className="space-y-3">
                    {intakes.slice(0, 5).map((intake) => (
                      <div
                        key={intake.id}
                        className="flex justify-between items-center p-3 border border-slate-800 rounded-xl bg-[#020617] cursor-pointer hover:border-slate-700"
                        onClick={() => {
                          setSelectedLead(intake);
                          setActiveTab("readiness");
                          setProjControlFilterTab("intakes");
                        }}
                      >
                        <div>
                          <p className="text-sm text-white font-medium">
                            {intake.business_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {intake.budget_range}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-mono rounded">
                          {intake.status || "New"}
                        </span>
                      </div>
                    ))}
                    {intakes.length === 0 && (
                      <p className="text-sm text-slate-500 italic">
                        No incoming intakes yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PIPELINE KANBAN BOARD TAB */}
          {activeTab === "pipeline" &&
            (() => {
              const allItems = [
                ...intakes.map((i) => ({ ...i, _type: "intakes" })),
                ...leads.map((l) => ({ ...l, _type: "outreachLeads" })),
              ].filter(
                (i) =>
                  i.status !== "Lost" &&
                  i.status !== "Do not contact" &&
                  i.status !== "Do Not Contact",
              );

              const lanes = [
                {
                  id: "prospects",
                  title: "Lead / Prospecting",
                  color: "border-slate-800 bg-slate-900",
                  statuses: [
                    "New lead",
                    "Researching",
                    "Sent outreach",
                    "Follow-up 1",
                    "Follow-up 2",
                    "Interested",
                    "Replied",
                    "New Intake",
                    "Question Asked",
                  ],
                },
                {
                  id: "scoping",
                  title: "Scoping & Intake",
                  color: "border-indigo-900/50 bg-indigo-950/20",
                  statuses: [
                    "Intake Started",
                    "Proposal Sent",
                    "Proposal Approved",
                  ],
                },
                {
                  id: "onboarding",
                  title: "Financial & Assets",
                  color: "border-cyan-900/50 bg-cyan-950/10",
                  statuses: [
                    "Deposit Requested",
                    "Deposit Paid",
                    "Assets Requested",
                    "Assets Received",
                  ],
                },
                {
                  id: "building",
                  title: "Active Construction",
                  color: "border-amber-900/50 bg-amber-950/10",
                  statuses: [
                    "Build Started",
                    "First Preview Sent",
                    "Client Review",
                    "Revisions",
                    "Final Review",
                    "Launch Ready",
                  ],
                },
                {
                  id: "won",
                  title: "Won / Completed",
                  color: "border-emerald-900/50 bg-emerald-950/20",
                  statuses: [
                    "Launched",
                    "Completed",
                    "Testimonial Requested",
                    "Closed",
                    "Won",
                  ],
                },
              ];

              return (
                <div className="h-full flex flex-col space-y-4 fade-in">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1 tracking-tight flex items-center gap-2 max-w-[80%]">
                      <FolderOpen className="w-5 h-5 text-cyan-400" />{" "}
                      Operational Pipeline
                    </h1>
                    <p className="text-slate-400 text-sm">
                      Real-time macro view of your active deals and projects.
                      Drag & drop coming soon.
                    </p>
                  </div>

                  <div className="w-full overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
                    <div className="flex gap-4 min-w-max items-stretch pb-2 h-[calc(100vh-220px)] min-h-[400px]">
                      {lanes.map((lane, index) => {
                        const itemsInLane = allItems.filter(
                          (i) =>
                            lane.statuses.includes(i.status || "") ||
                            (index === 0 && !i.status),
                        ); // default to first lane if no status
                        return (
                          <div
                            key={lane.id}
                            className={`w-[320px] flex flex-col rounded-2xl border ${lane.color} shrink-0 shadow-lg shadow-black/20`}
                          >
                            <div className="p-3 border-b border-inherit bg-black/20 rounded-t-2xl flex justify-between items-center backdrop-blur-sm">
                              <h3 className="font-bold text-white text-sm tracking-wide">
                                {lane.title}
                              </h3>
                              <span className="bg-slate-950 text-slate-350 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-800 shadow-inner">
                                {itemsInLane.length}
                              </span>
                            </div>
                            <div className="p-3 overflow-y-auto space-y-3 custom-scrollbar flex-1 pb-10">
                              {itemsInLane.map((item) => {
                                const attItem = attentionItems.find(
                                  (a) => a.id === item.id,
                                );
                                const hasAction =
                                  attItem?.actionInfo &&
                                  attItem.actionInfo.waitingOn !== "None";

                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => {
                                      setSelectedLead(item);
                                      setActiveTab("readiness");
                                      setProjControlFilterTab(
                                        item._type === "intakes"
                                          ? "intakes"
                                          : "leads",
                                      );
                                    }}
                                    className={`bg-[#020617] border group relative p-3.5 rounded-xl cursor-pointer transition-all duration-200 shadow hover:shadow-cyan-900/20 ${
                                      attItem?.isOverdue
                                        ? "border-rose-900/70 hover:border-rose-500"
                                        : "border-slate-800 hover:border-cyan-500"
                                    }`}
                                  >
                                    <p className="font-bold text-slate-100 text-[13px] leading-tight group-hover:text-cyan-400 transition-colors pr-2 break-words flex items-center justify-between">
                                      <span>
                                        {item.business_name ||
                                          item.businessName ||
                                          "Unnamed Request"}
                                      </span>
                                      {attItem?.priority && (
                                        <span
                                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${attItem.priority.colorClass}`}
                                        >
                                          {attItem.priority.score}
                                        </span>
                                      )}
                                    </p>

                                    <p className="text-[10px] text-slate-400 font-mono mt-1.5 mb-2.5 capitalize flex items-center justify-between">
                                      <span className="flex items-center gap-1.5">
                                        <div
                                          className={`w-1.5 h-1.5 rounded-full ${item._type === "intakes" ? "bg-emerald-400" : "bg-indigo-400"}`}
                                        />
                                        {item.status || "New"}
                                      </span>
                                      {attItem?.actionInfo?.dueDate && (
                                        <span
                                          className={`flex items-center gap-1 ${attItem.isOverdue ? "text-rose-400 font-bold" : attItem.isDueToday ? "text-amber-400" : "text-slate-500"}`}
                                        >
                                          <Clock className="w-3 h-3" />
                                          {`${attItem.actionInfo.dueDate.slice(5)}`}
                                        </span>
                                      )}
                                    </p>

                                    {hasAction && (
                                      <div className="mb-3 px-2 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800/80">
                                        <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-0.5">
                                          Next Action
                                        </p>
                                        <p className="text-[11px] text-amber-500/90 leading-snug">
                                          {attItem.actionInfo.label}
                                        </p>
                                      </div>
                                    )}

                                    <div className="flex justify-between items-center text-[9px] font-bold border-t border-slate-850 pt-2.5">
                                      <div className="flex gap-1.5 tracking-wider uppercase">
                                        {item._type === "intakes" ? (
                                          <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded shadow-sm">
                                            Inbound
                                          </span>
                                        ) : (
                                          <span className="bg-indigo-950/60 text-indigo-400 border border-indigo-900/40 px-1.5 py-0.5 rounded shadow-sm">
                                            Outbound
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-slate-450 font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80">
                                        {item.budget_range ||
                                          item.budgetRange ||
                                          "-"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

          {/* INTAKES TAB */}
          {activeTab === "intakes" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Inbound Project Intakes & Questions
                </h1>
                <p className="text-slate-400 text-sm">
                  Detailed requests and project questions captured from the
                  homepage and public conversion flow.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#020617] border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                      <tr>
                        <th className="p-4 font-semibold">Sender / Business</th>
                        <th className="p-4 font-semibold">Type / Parameters</th>
                        <th className="p-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {intakes.map((intake) => (
                        <tr
                          key={intake.id}
                          onClick={() => {
                            setSelectedLead(intake);
                            setActiveTab("readiness");
                            setProjControlFilterTab("intakes");
                          }}
                          className="hover:bg-slate-800/50 cursor-pointer transition"
                        >
                          <td className="p-4 font-medium text-white">
                            {intake.business_name ||
                              intake.businessName ||
                              "Individual"}
                            <span className="block text-xs font-normal text-slate-500">
                              {intake.contact_name || intake.contactName} •{" "}
                              {intake.email}
                            </span>
                          </td>
                          <td className="p-4">
                            {intake.lead_type === "project_question" ? (
                              <span className="text-[#22d3ee] font-mono text-xs bg-cyan-950/40 border border-cyan-900/50 px-2 py-0.5 rounded">
                                Project Question
                              </span>
                            ) : (
                              <span className="text-emerald-450 font-mono text-xs bg-emerald-950/20 border border-emerald-9ac/50 px-2 py-0.5 rounded">
                                Quote Request (
                                {intake.budget_range || "Unspecified"})
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-lg ${
                                intake.lead_type === "project_question"
                                  ? "bg-[#083344] text-[#22d3ee]"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {intake.status || "New Intake"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* LEADS TAB */}
          {activeTab === "leads" && (
            // Leaving Outbound Leads tab mostly untouched just so it continues to function as requested.
            // Using placeholder standard view.
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">
                    Outbound Leads
                  </h1>
                  <p className="text-slate-400 text-sm">
                    Self-sourced manual leads and tracking.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportToSheets}
                    disabled={isExporting}
                    className="px-4 py-2 border border-slate-700 text-slate-300 rounded-xl text-sm font-semibold flex items-center gap-2 hover:text-white hover:border-slate-600 transition disabled:opacity-50"
                  >
                    <FileText className="w-4 h-4" />{" "}
                    {isExporting ? "Exporting..." : "Export to Sheets"}
                  </button>
                  <button
                    onClick={() => setIsAddLeadModalOpen(true)}
                    className="px-4 py-2 bg-cyan-500 text-slate-900 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-cyan-400 transition"
                  >
                    <Plus className="w-4 h-4" /> Add Outbound Lead
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#020617] border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                      <tr>
                        <th className="p-4 font-semibold">Business</th>
                        <th className="p-4 font-semibold">
                          Campaign / Industry
                        </th>
                        <th className="p-4 font-semibold text-center">
                          Quality
                        </th>
                        <th className="p-4 font-semibold text-center">
                          Status
                        </th>
                        <th className="p-4 font-semibold text-center">
                          Indicators
                        </th>
                        <th className="p-4 font-semibold text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {leads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="hover:bg-slate-800/50 transition relative group"
                          onClick={() => {
                            setSelectedLead(lead);
                            setActiveTab("readiness");
                            setProjControlFilterTab("leads");
                          }}
                        >
                          <td className="p-4 cursor-pointer">
                            <p className="font-medium text-white">
                              {lead.businessName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              Next target:{" "}
                              {lead.next_follow_up_at || "Unscheduled"}
                            </p>
                          </td>
                          <td className="p-4 cursor-pointer">
                            <p className="text-xs">
                              {lead.campaign_name || "N/A"}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {lead.industry}
                            </p>
                          </td>
                          <td className="p-4 text-center cursor-pointer">
                            <span
                              className={`px-2 py-1 text-[10px] uppercase font-mono rounded-lg border ${
                                lead.lead_quality === "Strong fit"
                                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50"
                                  : lead.lead_quality === "Good fit"
                                    ? "bg-cyan-950/40 text-cyan-400 border-cyan-900/50"
                                    : "bg-slate-900 text-slate-400 border-slate-800"
                              }`}
                            >
                              {lead.lead_quality || "Cold"}
                            </span>
                          </td>
                          <td className="p-4 text-center cursor-pointer">
                            <span className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] uppercase font-mono rounded-lg">
                              {lead.status}
                            </span>
                          </td>
                          <td className="p-4 text-center cursor-pointer flex justify-center gap-1.5">
                            {lead.demo_viewed_at && (
                              <span
                                title="Demo Viewed"
                                className="w-5 h-5 rounded flex items-center justify-center bg-cyan-950/50 border border-cyan-800/50 text-cyan-400 text-xs font-bold"
                              >
                                D
                              </span>
                            )}
                            {lead.proposal_viewed_at && (
                              <span
                                title="Proposal Viewed"
                                className="w-5 h-5 rounded flex items-center justify-center bg-indigo-950/50 border border-indigo-800/50 text-indigo-400 text-xs font-bold"
                              >
                                P
                              </span>
                            )}
                            {lead.status === "Replied" && (
                              <span
                                title="Manual Reply"
                                className="w-5 h-5 rounded flex items-center justify-center bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-xs font-bold"
                              >
                                R
                              </span>
                            )}
                            {lead.intake_submitted_at && (
                              <span
                                title="Intake Submitted"
                                className="w-5 h-5 rounded flex items-center justify-center bg-amber-950/50 border border-amber-800/50 text-amber-400 text-xs font-bold"
                              >
                                IN
                              </span>
                            )}
                            {!lead.demo_viewed_at &&
                              !lead.proposal_viewed_at &&
                              !lead.intake_submitted_at &&
                              lead.status !== "Replied" && (
                                <span className="text-slate-600 text-xs">
                                  -
                                </span>
                              )}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(
                                    generatePrivateLink(lead, "demo"),
                                  );
                                }}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded uppercase font-mono tracking-wider transition"
                              >
                                Copy Demo
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateLeadStatus(
                                    lead.id,
                                    "Sent",
                                    "outreachLeads",
                                  );
                                }}
                                className="px-2 py-1 bg-slate-800 hover:bg-emerald-900 text-[10px] text-slate-300 rounded uppercase font-mono tracking-wider transition"
                              >
                                Mark Sent
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateLeadStatus(
                                    lead.id,
                                    "Do not contact",
                                    "outreachLeads",
                                  );
                                }}
                                className="px-2 py-1 bg-slate-800 hover:bg-red-900 text-[10px] text-slate-300 rounded uppercase font-mono tracking-wider transition"
                              >
                                DNC
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-8 text-center text-slate-500 italic"
                          >
                            No outbound leads tracked yet. Add one above.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ASSETS TAB */}
          {activeTab === "assets" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Drive & Assets
                </h1>
                <p className="text-slate-400 text-sm">
                  Manage assets and link proposal files via Google Drive.
                </p>
              </div>
              <div className="max-w-4xl">
                <DriveIntegration />
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Industry Maps Config
                </h1>
                <p className="text-slate-400 text-sm">
                  Pre-canned direct routing links for outreach.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-sm text-slate-400 mb-6 font-light leading-relaxed">
                  Links map specific industries to customized proposal
                  templates. These are public but hidden from standard site
                  navigation.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      name: "🏊 Swim Academy (HKD)",
                      link: "/swimming-school-quote",
                      package: "Booking / Portal Website",
                    },
                    {
                      name: "💼 Core Static Business (AUD)",
                      link: "/business-quote",
                      package: "Lead Website",
                    },
                    {
                      name: "⚖ Corporate Advisory (AUD)",
                      link: "/consultant-quote",
                      package: "Lead Website",
                    },
                    {
                      name: "📷 Creative Portfolio (AUD)",
                      link: "/portfolio-quote",
                      package: "Lead Website",
                    },
                    {
                      name: "🔧 Trades & Builders (AUD)",
                      link: "/trades-quote",
                      package: "Starter Website",
                    },
                    {
                      name: "🍴 Cafe & Restaurant (AUD)",
                      link: "/restaurant-quote",
                      package: "Starter Website",
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center p-3 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition px-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.name}
                        </p>
                        <p className="text-[10px] uppercase font-mono text-slate-500">
                          {item.package}
                        </p>
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-cyan-400 hover:underline"
                      >
                        {item.link}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* EFT Bank Transfer Default Settings Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-cyan-400" /> Default
                    Agency Payment Settings
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Configure standard offline EFT bank credentials. These are
                    saved locally and used to auto-populate direct payment
                    invoice blocks for your clients.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-550 uppercase block font-bold">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={bankSettings.bank_name}
                      onChange={(e) =>
                        setBankSettings({
                          ...bankSettings,
                          bank_name: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white outline-none"
                      placeholder="e.g. Commonwealth Bank (CBA)"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-550 uppercase block font-bold">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={bankSettings.bank_account_name}
                      onChange={(e) =>
                        setBankSettings({
                          ...bankSettings,
                          bank_account_name: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white outline-none"
                      placeholder="e.g. Clarity Space Group Pty Ltd"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-550 uppercase block font-bold">
                      BSB Number
                    </label>
                    <input
                      type="text"
                      value={bankSettings.bank_bsb}
                      onChange={(e) =>
                        setBankSettings({
                          ...bankSettings,
                          bank_bsb: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white outline-none"
                      placeholder="e.g. 062-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-555 uppercase block font-bold">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankSettings.bank_account_number}
                      onChange={(e) =>
                        setBankSettings({
                          ...bankSettings,
                          bank_account_number: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white outline-none"
                      placeholder="e.g. 1049 2039"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-mono text-slate-555 uppercase block font-bold">
                      PayID or Email Transfer identifier (Optional)
                    </label>
                    <input
                      type="text"
                      value={bankSettings.bank_payid}
                      onChange={(e) =>
                        setBankSettings({
                          ...bankSettings,
                          bank_payid: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white outline-none"
                      placeholder="e.g. billing@clarityspace.au"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-mono text-slate-555 uppercase block font-bold">
                      Custom Payment Reference / Deposit Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={bankSettings.bank_instructions}
                      onChange={(e) =>
                        setBankSettings({
                          ...bankSettings,
                          bank_instructions: e.target.value,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-white outline-none"
                      placeholder="e.g. Please include SOW-[Business Name] in direct EFT narrative to assure instant release of client staging folder."
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveBankSettings(bankSettings)}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs transition duration-200 cursor-pointer shadow-md shadow-cyan-950/20"
                  >
                    Save Agency Billing Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PROJECT CONTROL HUB & CONTROL CENTER */}
          {activeTab === "readiness" &&
            (() => {
              // Setup message templates
              const getMessageTemplates = (proj: any) => {
                const statusLink = `${window.location.origin}/project-status/${proj?.secure_token || "no-token"}`;
                const feedbackLink = `${window.location.origin}/project-feedback/${proj?.secure_token || "no-token"}`;
                const driveLink =
                  proj?.google_drive_folder_url ||
                  "[Drive Folder Not Linked Yet]";
                const clientName =
                  proj?.contactName || proj?.contact_name || "Client";
                const busName =
                  proj?.businessName || proj?.business_name || "your project";

                return [
                  {
                    title: "📂 Assets Handover Update",
                    subject:
                      "Clarity Space - Project Asset Handover Upload Folder",
                    body: `Hello ${clientName},\n\nWe have initialized your project workspace on Google Drive!\n\nPlease upload your files, assets, and branding materials using this secure path:\n${driveLink}\n\nRequired Assets Checklist:\n- Vector branding assets (Logo as SVG, EPS or high-res PNG)\n- Section briefs or draft copy content\n- High-resolution photography\n- Domain registrars / third-party config keys (if relevant)\n\nYou can verify active status and progression timelines here:\n${statusLink}\n\nBest regards,\nClarity Space Operations`,
                  },
                  {
                    title: "💻 Initial Staging Preview",
                    subject:
                      "Clarity Space - Your Project Staging Preview is Ready!",
                    body: `Hello ${clientName},\n\nGreat news! The staging build of your website is ready for your initial inspection!\n\nReview the active design layouts and page flows here:\n${proj?.preview_url || "[Save preview_url first]"}\n\nPlease check layout spacings, content wordings, and general vibes. You can submit visual or text-copy revisions directly to your secure interactive feedback board:\n${feedbackLink}\n\nLet us know once you have submitted your notes so we can implement updates!\n\nBest regards,\nClarity Space Operations`,
                  },
                  {
                    title: "🚀 Production Launch & Sign-off",
                    subject:
                      "Clarity Space - Production Deployment & SSL Mapping",
                    body: `Hello ${clientName},\n\nAll requested revisions have been successfully implemented and reviewed!\n\nVerify live page operations once more:\n${proj?.preview_url || "[Preview staging URL]"}\n\nIf you are completely satisfied with the branding, layouts, copy, and forms, please give us the final sign-off! We will proceed with production domain mapping and active security setup.\n\nKeep track of live details on your secure dashboard:\n${statusLink}\n\nBest regards,\nClarity Space Operations`,
                  },
                  {
                    title: "✍️ Review & Testimonial Request",
                    subject: "Clarity Space - Website Launch & Review Request",
                    body: `Hello ${clientName},\n\nWorking with you on building and launching ${busName} has been an absolute honor!\n\nNow that your live build is published, we would love to capture your feedback. Could you share a quick, 2-paragraph review of your experience working with Clarity Space?\n\n- What was your favorite aspect of our workspace?\n- How has the newly designed experience changed your customer perception?\n\nFeel free to write back here or submit directly on your private status portal:\n${statusLink}\n\nThank you for trusting Clarity Space with your digital presence!\n\nBest regards,\nClarity Space Team`,
                  },
                ];
              };

              const templates = curProject
                ? getMessageTemplates(curProject)
                : [];

              return (
                <div className="space-y-6 animate-fadeIn pb-12">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">
                        Project Control & Operations Hub
                      </h1>
                      <p className="text-slate-400 text-sm">
                        Totally control status workflows, access credentials,
                        client communications, finances, and feedback ledgers.
                      </p>
                    </div>
                    <div className="text-right font-mono text-[10px]">
                      <span className="px-2.5 py-1 rounded-full border border-cyan-800/60 bg-cyan-950/45 text-cyan-405 font-bold animate-pulse">
                        Operational Environment: Enabled
                      </span>
                    </div>
                  </div>

                  {/* Single Panel Layout */}
                  <div className="space-y-6 items-start">
                    {/* Mission Control & Access Hub */}
                    <div className="space-y-6">
                      {curProject ? (
                        <div className="space-y-6 animate-fadeIn">
                          {/* 1. HEADER INFO BANNER */}
                          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h2 className="text-xl font-bold text-white tracking-tight">
                                    {curProject.businessName}
                                  </h2>
                                  <span
                                    className={`text-[10px] font-bold font-mono uppercase bg-slate-850 px-2 rounded-full border border-slate-800 text-slate-400`}
                                  >
                                    {curColl === "intakes"
                                      ? "Inbound Intake Workflow"
                                      : "Outbound Campaign target"}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-400 font-sans">
                                  Primary Partner:{" "}
                                  <span className="font-semibold text-white">
                                    {curProject.contactName}
                                  </span>{" "}
                                  • {curProject.email || "No email registered"}
                                </p>
                                {curProject.website_url && (
                                  <p className="text-[11px] font-mono text-slate-505 mt-1">
                                    Domain Context:{" "}
                                    <a
                                      href={
                                        curProject.website_url.startsWith(
                                          "http",
                                        )
                                          ? curProject.website_url
                                          : `https://${curProject.website_url}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-cyan-405 hover:underline font-bold"
                                    >
                                      {curProject.website_url}
                                    </a>
                                  </p>
                                )}

                                <div className="mt-3.5 text-left select-none">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsEditingMetadata(!isEditingMetadata);
                                    }}
                                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 rounded-xl text-[10px] text-cyan-405 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                  >
                                    <span>⚙️ {isEditingMetadata ? "Hide Configuration Form" : "Configure Partner Fields"}</span>
                                  </button>
                                  {curProject?.secure_token && (
                                    <a
                                      href={`${window.location.origin}/project-status/${curProject.secure_token}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 bg-cyan-950/60 border border-cyan-800/40 hover:bg-cyan-900/50 hover:border-cyan-600 rounded-xl text-[10px] text-cyan-400 font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm select-none"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                                      <span>Open Client Portal</span>
                                    </a>
                                  )}
                                  <button className="hidden">
                                  </button>
                                </div>

                                {(curProject.lead_type ||
                                  curProject.budget_range) && (
                                  <div className="mt-3 flex gap-2">
                                    {curProject.lead_type ===
                                    "project_question" ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/40 text-cyan-400 border border-cyan-900/50 font-mono">
                                        Project Question
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 font-mono">
                                        Quote Details
                                      </span>
                                    )}
                                    {curProject.budget_range && (
                                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                                        {curProject.budget_range}
                                      </span>
                                    )}
                                    {curProject.timeline && (
                                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                                        Timeline: {curProject.timeline}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto shrink-0 select-none">
                                <span className="text-[10px] font-mono text-slate-500 uppercase font-black text-left sm:text-right">
                                  Project Lifecycle Status
                                </span>
                                <select
                                  value={curProject.status || "New Intake"}
                                  onChange={(e) =>
                                    updateLeadStatus(
                                      curProject.id,
                                      e.target.value,
                                      curColl,
                                    )
                                  }
                                  className="bg-[#020617] border border-slate-800 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-cyan-500"
                                >
                                  {PIPELINE_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {s}
                                    </option>
                                  ))}
                                </select>

                                <span className="text-[10px] font-mono text-slate-500 uppercase font-black text-left sm:text-right mt-1 mb-2 block">
                                  Generative Workflows
                                </span>
                                <div className="space-y-1.5 w-full">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyAIPrompt(curProject, "outreach")
                                    }
                                    className="bg-indigo-950/40 text-indigo-400 hover:bg-indigo-900 border border-indigo-900 text-[10px] font-bold rounded-xl px-3 py-2 outline-none cursor-pointer transition flex items-center justify-start gap-1.5 w-full"
                                  >
                                    <Copy className="w-3 h-3" /> Gen Outreach
                                    Emails
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyAIPrompt(curProject, "proposal")
                                    }
                                    className="bg-indigo-950/40 text-indigo-400 hover:bg-indigo-900 border border-indigo-900 text-[10px] font-bold rounded-xl px-3 py-2 outline-none cursor-pointer transition flex items-center justify-start gap-1.5 w-full"
                                  >
                                    <Copy className="w-3 h-3" /> Gen Proposal
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyAIPrompt(curProject, "data")
                                    }
                                    className="bg-[#020617] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 text-[10px] font-bold rounded-xl px-3 py-2 outline-none cursor-pointer transition flex items-center justify-start gap-1.5 w-full"
                                  >
                                    <Copy className="w-3 h-3" /> Copy Raw Data
                                    Context
                                  </button>
                                </div>
                              </div>
                            </div>

                            {isEditingMetadata && (
                              <div key={curProject.id} className="pt-5 border-t border-slate-800/60 mt-5 space-y-4 text-left">
                                <h4 className="text-[10px] uppercase font-mono tracking-wider text-cyan-405 font-bold select-none font-black">
                                  ✏️ Edit & Configure Partner Metadata
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                  {/* Business Name */}
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Business Name</label>
                                    <input
                                      type="text"
                                      defaultValue={curProject.businessName || curProject.business_name || ""}
                                      onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        if (val) {
                                          updateLeadData(curProject.id, {
                                            businessName: val,
                                            business_name: val,
                                          }, curColl);
                                        }
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 text-xs text-white"
                                      placeholder="Enter business name"
                                    />
                                  </div>

                                  {/* Contact Name */}
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Contact Name</label>
                                    <input
                                      type="text"
                                      defaultValue={curProject.contactName || curProject.contact_name || ""}
                                      onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        updateLeadData(curProject.id, {
                                          contactName: val,
                                          contact_name: val,
                                        }, curColl);
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 text-xs text-white"
                                      placeholder="Enter contact name"
                                    />
                                  </div>

                                  {/* Contact Email */}
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Contact Email</label>
                                    <input
                                      type="email"
                                      defaultValue={curProject.email || ""}
                                      onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        updateLeadData(curProject.id, { email: val }, curColl);
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 text-xs text-white"
                                      placeholder="Enter contact email"
                                    />
                                  </div>

                                  {/* Phone Number */}
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Phone Number</label>
                                    <input
                                      type="text"
                                      defaultValue={curProject.phone || ""}
                                      onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        updateLeadData(curProject.id, { phone: val }, curColl);
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 text-xs text-white"
                                      placeholder="Enter phone number"
                                    />
                                  </div>

                                  {/* Website URL */}
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Website URL</label>
                                    <input
                                      type="text"
                                      defaultValue={curProject.website_url || ""}
                                      onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        updateLeadData(curProject.id, { website_url: val }, curColl);
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 text-xs text-white"
                                      placeholder="e.g. example.com"
                                    />
                                  </div>

                                  {/* Industry Select */}
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Industry</label>
                                    <select
                                      defaultValue={curProject.industry || "general-business"}
                                      onChange={(e) => {
                                        updateLeadData(curProject.id, { industry: e.target.value }, curColl);
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 text-xs text-white cursor-pointer"
                                    >
                                      <option value="trades-business">Trades Business</option>
                                      <option value="swimming-school">Swimming School</option>
                                      <option value="cafe-restaurant">Cafe & Restaurant</option>
                                      <option value="cleaners">Cleaners</option>
                                      <option value="beauty">Beauty & Wellness</option>
                                      <option value="health">Healthcare Services</option>
                                      <option value="tutors">Tutors & Coaching</option>
                                      <option value="pets">Pet Services</option>
                                      <option value="accommodation">Accommodation & Hotel</option>
                                      <option value="general-business">General Business</option>
                                    </select>
                                  </div>

                                  {/* Package Select */}
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Suggested Package</label>
                                    <select
                                      defaultValue={curProject.package || curProject.suggestedPackage || curProject.newLeadPackage || "Starter Website"}
                                      onChange={(e) => {
                                        updateLeadData(curProject.id, {
                                          package: e.target.value,
                                          suggestedPackage: e.target.value,
                                          newLeadPackage: e.target.value,
                                        }, curColl);
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 text-xs text-white cursor-pointer"
                                    >
                                      <option value="Starter Website">Starter Website</option>
                                      <option value="Custom Portal">Custom Portal</option>
                                      <option value="E-Commerce Suite">E-Commerce Suite</option>
                                      <option value="Lead Website">Lead Website</option>
                                      <option value="Booking / Portal Website">Booking / Portal Website</option>
                                      <option value="Custom System Block">Custom System Block</option>
                                    </select>
                                  </div>

                                  {/* Budget Range */}
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Budget Range</label>
                                    <input
                                      type="text"
                                      defaultValue={curProject.budget_range || ""}
                                      onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        updateLeadData(curProject.id, { budget_range: val }, curColl);
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 text-xs text-white"
                                      placeholder="e.g. $3,000 - $5,000"
                                    />
                                  </div>

                                  {/* Timeline */}
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Timeline</label>
                                    <input
                                      type="text"
                                      defaultValue={curProject.timeline || ""}
                                      onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        updateLeadData(curProject.id, { timeline: val }, curColl);
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 text-xs text-white"
                                      placeholder="e.g. 4 Weeks"
                                    />
                                  </div>

                                  {/* Lead Quality factor */}
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Lead Quality Factor</label>
                                    <select
                                      defaultValue={curProject.lead_quality || "Cold"}
                                      onChange={(e) => {
                                        updateLeadData(curProject.id, { lead_quality: e.target.value }, curColl);
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 text-xs text-white cursor-pointer"
                                    >
                                      <option value="Cold">Cold</option>
                                      <option value="Warm">Warm</option>
                                      <option value="High potential">High potential</option>
                                      <option value="Do not contact">Do not contact</option>
                                    </select>
                                  </div>

                                  {/* Website Issue / Opportunity */}
                                  <div className="sm:col-span-2">
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Website Issue / Opportunity</label>
                                    <input
                                      type="text"
                                      defaultValue={curProject.website_issue_opportunity || ""}
                                      onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        updateLeadData(curProject.id, { website_issue_opportunity: val }, curColl);
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 text-xs text-white"
                                      placeholder="e.g. Mobile layout is hard to use"
                                    />
                                  </div>

                                  {/* Initial Prospect Notes */}
                                  <div className="sm:col-span-3">
                                    <label className="text-[10px] font-mono text-slate-500 block mb-1 font-bold">Initial Prospect Notes (Wix/Wordpress, speed, etc)</label>
                                    <textarea
                                      defaultValue={curProject.notes || ""}
                                      onBlur={(e) => {
                                        const val = e.target.value.trim();
                                        updateLeadData(curProject.id, { notes: val }, curColl);
                                      }}
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500/80 outline-none rounded-xl p-2.5 h-16 text-xs text-white resize-none custom-scrollbar font-sans"
                                      placeholder="Insert notes about their situation manually..."
                                    />
                                  </div>
                                </div>
                                <div className="text-[9px] text-slate-500 italic mt-1 font-mono select-none">
                                  * Configurable fields are synchronized securely automatically when clicking away.
                                </div>
                              </div>
                            )}

                            {(curProject.question_text || curProject.notes) && (
                              <div className="pt-5 border-t border-slate-800/60 mt-5">
                                <h4 className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mb-2 font-bold select-none">
                                  Initial Prospect Request / Notes
                                </h4>
                                <div className="p-3.5 bg-[#020617] rounded-xl border border-slate-850">
                                  <p className="text-[13px] font-light text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {curProject.question_text ||
                                      curProject.notes}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="pt-5 border-t border-slate-800/60 mt-5 flex flex-col sm:flex-row gap-6">
                              <div className="flex-1">
                                <h4 className="text-[10px] uppercase font-mono tracking-wider text-cyan-500 mb-2 font-bold select-none">
                                  Admin Internal Notes
                                </h4>
                                <div className="relative">
                                  <textarea
                                    defaultValue={
                                      curProject.admin_internal_notes || ""
                                    }
                                    onBlur={(e) =>
                                      updateLeadData(
                                        curProject.id,
                                        {
                                          admin_internal_notes: e.target.value,
                                        },
                                        curColl,
                                      )
                                    }
                                    className="w-full bg-[#020617] border border-slate-800 rounded-lg p-3 text-xs text-slate-300 outline-none focus:border-cyan-500/50 hover:border-slate-700 resize-none min-h-[90px] custom-scrollbar transition-all"
                                    placeholder="Write internal notes... (automatically saves when you click outside)"
                                  />
                                  <div className="absolute top-1.5 right-2 text-[9px] text-slate-600 italic select-none">
                                    Saves on click away
                                  </div>
                                </div>
                              </div>

                              <div className="sm:w-[220px] shrink-0">
                                <h4 className="text-[10px] uppercase font-mono tracking-wider text-cyan-500 mb-2 font-bold select-none">
                                  Lead Quality Triage
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {[
                                    "Strong fit",
                                    "Good fit",
                                    "Maybe",
                                    "Not fit",
                                  ].map((q) => {
                                    const quality =
                                      curProject.lead_quality ||
                                      curProject.admin_lead_quality;
                                    const isActive = quality === q;
                                    return (
                                      <button
                                        key={q}
                                        onClick={() => {
                                          updateLeadData(
                                            curProject.id,
                                            { admin_lead_quality: q },
                                            curColl,
                                          );
                                          if (curColl === "outreachLeads") {
                                            updateLeadData(
                                              curProject.id,
                                              { lead_quality: q },
                                              curColl,
                                            );
                                          }
                                        }}
                                        className={`px-2 py-1 border rounded text-[10px] font-bold transition-all ${
                                          isActive
                                            ? "bg-cyan-500 text-slate-950 border-cyan-500 shadow-md shadow-cyan-950/20"
                                            : "bg-[#020617] text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-300"
                                        }`}
                                      >
                                        {q}
                                      </button>
                                    );
                                  })}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-800/60">
                                  <h4 className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2 font-bold select-none">
                                    Quick Status Jump
                                  </h4>
                                  <button
                                    onClick={() => {
                                      updateLeadStatus(
                                        curProject.id,
                                        "Needs Review",
                                        curColl,
                                      );
                                      updateLeadData(
                                        curProject.id,
                                        {
                                          reviewed_at: new Date().toISOString(),
                                        },
                                        curColl,
                                      );
                                    }}
                                    className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                                      curProject.reviewed_at
                                        ? "bg-emerald-950/20 text-emerald-500 border border-emerald-900/40 select-none"
                                        : "bg-slate-800 text-white hover:bg-slate-700 cursor-pointer shadow-md"
                                    }`}
                                  >
                                    {curProject.reviewed_at
                                      ? "✓ Marked as Reviewed"
                                      : "Mark Reviewed"}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Interactive Status Timeline Indicator */}
                            <div className="pt-6 border-t border-slate-800/60 mt-6 space-y-3 font-mono">
                              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-450">
                                <span>Operational Stage Progression</span>
                                <span className="text-cyan-405">
                                  {getStatusProgressPercent(curProject.status)}%
                                  Completed
                                </span>
                              </div>
                              <div className="w-full bg-[#020617] rounded-full h-2 overflow-hidden border border-slate-850/60 p-[1.5px]">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-450 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${getStatusProgressPercent(curProject.status)}%`,
                                  }}
                                />
                              </div>
                              <div className="flex justify-between text-[8px] text-slate-500 uppercase select-none font-black pt-1 tracking-wider">
                                <span>Intake / Pitch</span>
                                <span>Contract & Deposit</span>
                                <span>Staging Build</span>
                                <span>Revision Loop</span>
                                <span>Launch & Handover</span>
                              </div>
                            </div>
                          </div>

                          {/* STAGE GUIDANCE & CHECKLIST PROGRESSION */}
                          {(() => {
                            const curStatus = curProject.status || "New Intake";
                            const guide = STAGE_GUIDES[curStatus] || {
                              description:
                                "Review details and map out standard layout milestones with your client partner.",
                              checklist: [
                                "Confirm contact info and details matching client records",
                                "Verify pending communication feedback items in the discussion stream",
                                "Align target delivery schedule with active milestones checklist",
                              ],
                            };

                            const currentStepChecklists =
                              curProject.step_checklists || {};
                            const completedForThisStage =
                              currentStepChecklists[curStatus] || {};
                            const totalSteps = guide.checklist.length;
                            const completedStepsCount = guide.checklist.filter(
                              (item) => completedForThisStage[item],
                            ).length;
                            const isStageFullyComplete =
                              completedStepsCount === totalSteps;

                            const curIdx = PIPELINE_STATUSES.indexOf(curStatus);
                            const nextStatus =
                              curIdx >= 0 &&
                              curIdx < PIPELINE_STATUSES.length - 1
                                ? PIPELINE_STATUSES[curIdx + 1]
                                : null;

                            return (
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-850 pb-3">
                                  <div className="space-y-1">
                                    <h3 className="text-sm font-black text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
                                      <Sparkles className="w-4 h-4 text-cyan-400" />{" "}
                                      Active Stage Guide & Gates
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-sans">
                                      Actions required before transitioning from{" "}
                                      <strong className="text-cyan-400">
                                        {curStatus}
                                      </strong>{" "}
                                      to the next stage.
                                    </p>
                                  </div>
                                  <div className="bg-[#020617] px-2.5 py-1 rounded-full border border-slate-800 text-[10px] font-mono text-slate-400 shrink-0 uppercase">
                                    Stage Steps:{" "}
                                    <span className="text-cyan-400 font-bold">
                                      {completedStepsCount}/{totalSteps}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-3 bg-[#020617]/40 rounded-xl border border-slate-850">
                                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                                    {guide.description}
                                  </p>
                                </div>

                                {/* Checklist Items */}
                                <div className="space-y-2">
                                  {guide.checklist.map((item, idx) => {
                                    const isCompleted =
                                      !!completedForThisStage[item];
                                    return (
                                      <label
                                        key={idx}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          toggleStageChecklistItem(
                                            curProject.id,
                                            curStatus,
                                            item,
                                            curColl,
                                          );
                                        }}
                                        className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-[#020617]/50 border border-transparent hover:border-slate-800/40 transition cursor-pointer select-none group"
                                      >
                                        <div
                                          className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition shrink-0 ${
                                            isCompleted
                                              ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-transparent text-slate-950"
                                              : "border-slate-700 bg-[#020617] group-hover:border-cyan-500"
                                          }`}
                                        >
                                          {isCompleted && (
                                            <svg
                                              className="w-2.5 h-2.5 stroke-[3] stroke-current"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4.5 12.75l6 6 9-13.5"
                                              />
                                            </svg>
                                          )}
                                        </div>
                                        <span
                                          className={`text-[11.5px] leading-tight font-light font-sans transition ${
                                            isCompleted
                                              ? "text-slate-450 line-through"
                                              : "text-slate-300"
                                          }`}
                                        >
                                          {item}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>

                                {/* Flow advancement gate */}
                                {nextStatus && (
                                  <div className="pt-3 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-3">
                                    <div className="text-[10px] text-slate-500 font-mono text-left w-full sm:w-auto uppercase">
                                      {isStageFullyComplete ? (
                                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                                          ✓ Gate check passed! Ready to
                                          transition.
                                        </span>
                                      ) : (
                                        <span>
                                          Check off all {totalSteps} items to
                                          unlock direct transition
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateLeadStatus(
                                          curProject.id,
                                          nextStatus,
                                          curColl,
                                        );
                                        alert(
                                          `Project state successfully transitioned to: ${nextStatus}`,
                                        );
                                      }}
                                      className={`w-full sm:w-auto px-4 py-2 text-[11px] font-bold font-mono uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition select-none cursor-pointer ${
                                        isStageFullyComplete
                                          ? "bg-gradient-to-r from-emerald-450 to-cyan-500 text-slate-950 hover:shadow-lg hover:shadow-emerald-500/10"
                                          : "bg-slate-800 text-slate-400 hover:bg-slate-750 opacity-60"
                                      }`}
                                    >
                                      Advance to: {nextStatus}{" "}
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* MISSION CONTROL TABS BAR */}
                          <div className="flex flex-wrap gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-[11px] font-bold font-mono shadow-inner">
                            {[
                              {
                                id: "portal",
                                label: "🔑 Portal & Access",
                                desc: "Secure links & deployments",
                              },
                              {
                                id: "scope",
                                label: "🎨 Scope & Brand",
                                desc: "Pages, colors & fonts",
                              },
                              {
                                id: "schedule",
                                label: "📅 Timeline & Tasks",
                                desc: "Deadlines & checklist",
                              },
                              {
                                id: "finances",
                                label: "💰 Finances & Mail",
                                desc: "Budgets & Stripe tools",
                              },
                              {
                                id: "discussion",
                                label: "💬 Discussions",
                                desc: "Ticks, private logs & chat",
                              },
                            ].map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setControlHubTab(t.id as any)}
                                className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center min-w-[110px] ${
                                  controlHubTab === t.id
                                    ? "bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/10"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                                }`}
                              >
                                <span>{t.label}</span>
                                <span
                                  className={`text-[8px] font-normal leading-none mt-0.5 select-none ${
                                    controlHubTab === t.id
                                      ? "text-slate-900 font-medium"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {t.desc}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* TAB CONTENTS */}
                          {controlHubTab === "portal" && (
                            <div className="space-y-6 animate-fadeIn">
                              {/* Sec. 1: Client Portal Links & Drive Folder */}
                              <div className="grid sm:grid-cols-2 gap-6">
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
                                  <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider block">
                                    Secure Client Access Node
                                  </span>
                                  <div className="flex flex-wrap gap-2 mb-1.5 select-none pt-2">
                                    <a
                                      href={`${window.location.origin}/project-status/${curProject?.secure_token}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 bg-cyan-500 text-slate-950 font-black hover:bg-cyan-400 rounded-xl text-[10px] transition flex items-center gap-1.5 cursor-pointer shadow-md"
                                    >
                                      <ExternalLink className="w-3 h-3 text-slate-950" />
                                      <span>View Client Portal</span>
                                    </a>
                                    <a
                                      href={`${window.location.origin}/project-feedback/${curProject?.secure_token}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl text-[10px] text-cyan-455 font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                      <MessageSquare className="w-3 h-3 text-cyan-400" />
                                      <span>View Reviews Board</span>
                                    </a>
                                  </div>
                                  <span className="hidden">
                                  </span>
                                  <div className="flex flex-col gap-2">
                                    {curProject.secure_token ? (
                                      <>
                                        <div className="p-2.5 bg-[#020617] border border-slate-800 rounded-xl font-mono text-[9.5px] break-all text-slate-400 line-clamp-1 flex justify-between items-center px-3">
                                          <span className="truncate max-w-[180px]">
                                            {curProject.secure_token}
                                          </span>
                                          <span className="text-[9px] text-emerald-400 font-bold shrink-0">
                                            ✓ Active
                                          </span>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(
                                                `${window.location.origin}/project-status/${curProject.secure_token}`,
                                              );
                                              setToastMessage("Copied private client portal link!");
                                              setTimeout(() => setToastMessage(""), 3000);
                                            }}
                                            className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-cyan-955/30 border border-cyan-900/60 text-cyan-400 text-xs font-bold rounded-xl hover:bg-cyan-900/50 cursor-pointer transition-all"
                                          >
                                            <Copy className="w-3.5 h-3.5" />{" "}
                                            Copy Portal
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              navigator.clipboard.writeText(
                                                `${window.location.origin}/project-feedback/${curProject.secure_token}`,
                                              );
                                              setToastMessage("Copied client reviews board link!");
                                              setTimeout(() => setToastMessage(""), 3000);
                                            }}
                                            className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-slate-950 border border-slate-850 text-slate-350 text-xs font-bold rounded-xl hover:bg-slate-900 cursor-pointer transition-all"
                                          >
                                            <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />{" "}
                                            Copy Reviews
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (
                                                confirm(
                                                  "Are you sure you want to revoke this secure client token?",
                                                )
                                              ) {
                                                updateLeadData(
                                                  curProject.id,
                                                  { secure_token: null },
                                                  curColl,
                                                );
                                              }
                                            }}
                                            className="px-2.5 bg-rose-955/10 border border-rose-900/40 text-rose-400 hover:bg-rose-950/30 rounded-xl text-xs cursor-pointer transition-all"
                                            title="Revoke Token"
                                          >
                                            <XCircle className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="space-y-2">
                                        <p className="text-[11px] text-slate-500 italic font-mono font-light">
                                          No secure client access node exists
                                          for this project yet.
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const token =
                                              Math.random()
                                                .toString(36)
                                                .substring(2, 11) +
                                              Math.random()
                                                .toString(36)
                                                .substring(2, 11);
                                            updateLeadData(
                                              curProject.id,
                                              { secure_token: token },
                                              curColl,
                                            );
                                          }}
                                          className="w-full flex justify-center items-center gap-1.5 py-2 bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-cyan-400 cursor-pointer transition-all shadow-md shadow-cyan-500/10"
                                        >
                                          <Sparkles className="w-3.5 h-3.5" />{" "}
                                          Initialize Client Secure Portal
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-md">
                                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block mb-1">
                                    Drive Folder integration
                                  </span>

                                  <LeadWorkspace
                                    lead={curProject}
                                    onUpdateLead={(id, updates) =>
                                      updateLeadData(id, updates, curColl)
                                    }
                                  />

                                  {curProject.google_drive_folder_url && (
                                    <div className="pt-3 border-t border-slate-800/80">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            confirm(
                                              "Disconnect Google Drive folder linkage?",
                                            )
                                          ) {
                                            updateLeadData(
                                              curProject.id,
                                              {
                                                google_drive_folder_url: null,
                                                google_drive_folder_id: null,
                                              },
                                              curColl,
                                            );
                                          }
                                        }}
                                        className="w-full text-center text-[10px] text-slate-550 hover:text-red-400 font-mono transition-colors cursor-pointer"
                                      >
                                        Disconnect Folder Linkage
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Sec 2: Live staging & Production Workspaces */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
                                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider block border-b border-slate-800 pb-2">
                                  Deployment & Playground URLs
                                </span>
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-400 block mb-1.5 font-bold">
                                      Staging / Preview URL
                                    </label>
                                    <input
                                      type="text"
                                      value={curProject.preview_url || ""}
                                      placeholder="e.g. preview-slug.clarityspace.app"
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          { preview_url: e.target.value },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-400 block mb-1.5 font-bold">
                                      Production / Final URL
                                    </label>
                                    <input
                                      type="text"
                                      value={curProject.final_site_url || ""}
                                      placeholder="e.g. www.clientbusiness.com"
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          { final_site_url: e.target.value },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Sec 3: Custom Domains, Registrar Credentials & External tags */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block border-b border-slate-800 pb-2">
                                  Domain Registration, DNS & Hosting Platform
                                </span>
                                <div className="grid sm:grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Preferred Domain Name
                                    </label>
                                    <input
                                      type="text"
                                      value={curProject.domain_name || ""}
                                      placeholder="e.g. business.com.au"
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          { domain_name: e.target.value },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white font-mono"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Domain Registrar
                                    </label>
                                    <input
                                      type="text"
                                      value={curProject.domain_registrar || ""}
                                      placeholder="e.g. GoDaddy, Namecheap"
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          { domain_registrar: e.target.value },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Hosting/Deploy Target
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        curProject.hosting_staging_platform ||
                                        ""
                                      }
                                      placeholder="e.g. Vercel, Cloud Run, Netlify"
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          {
                                            hosting_staging_platform:
                                              e.target.value,
                                          },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white"
                                    />
                                  </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Domain DNS & Nameservers Setup Status
                                    </label>
                                    <select
                                      value={
                                        curProject.domain_dns_setup_status ||
                                        "Awaiting Client Delegation"
                                      }
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          {
                                            domain_dns_setup_status:
                                              e.target.value,
                                          },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none cursor-pointer focus:border-cyan-500"
                                    >
                                      <option value="Awaiting Client Delegation">
                                        Awaiting Client Delegation
                                      </option>
                                      <option value="Delegated to Clarity Nameservers">
                                        Delegated to Clarity Nameservers
                                      </option>
                                      <option value="DNS Routing In Progress">
                                        DNS Routing In Progress
                                      </option>
                                      <option value="SSL Certified & Launch Ready">
                                        SSL Certified & Launch Ready
                                      </option>
                                      <option value="N/A (Subdomain)">
                                        N/A (Subdomain)
                                      </option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Google Analytics measurement ID / Meta
                                      pixel
                                    </label>
                                    <input
                                      type="text"
                                      value={
                                        curProject.external_analytics_id || ""
                                      }
                                      placeholder="e.g. G-H27XB908XY, Meta pixel ID"
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          {
                                            external_analytics_id:
                                              e.target.value,
                                          },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TAB 2: Scope & Design */}
                          {controlHubTab === "scope" && (
                            <div className="space-y-6 animate-fadeIn">
                              {/* Sec 1: Branding Specs */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider block border-b border-slate-800 pb-2">
                                  Visual Palette & Typography specs
                                </span>

                                <div className="grid sm:grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Primary Brand Color
                                    </label>
                                    <div className="flex gap-2">
                                      <input
                                        type="color"
                                        value={
                                          curProject.brand_colors_primary?.startsWith(
                                            "#",
                                          ) &&
                                          curProject.brand_colors_primary
                                            ?.length === 7
                                            ? curProject.brand_colors_primary
                                            : "#0ea5e9"
                                        }
                                        onChange={(e) =>
                                          updateLeadData(
                                            curProject.id,
                                            {
                                              brand_colors_primary:
                                                e.target.value,
                                            },
                                            curColl,
                                          )
                                        }
                                        className="w-10 h-8 rounded border border-slate-800 bg-[#020617] cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={
                                          curProject.brand_colors_primary || ""
                                        }
                                        placeholder="e.g. #0ea5e9 or Teal"
                                        onChange={(e) =>
                                          updateLeadData(
                                            curProject.id,
                                            {
                                              brand_colors_primary:
                                                e.target.value,
                                            },
                                            curColl,
                                          )
                                        }
                                        className="flex-1 bg-[#020617] border border-slate-800 focus:border-cyan-500 outline-none rounded-xl px-2 text-xs text-white font-mono"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Secondary Brand Color
                                    </label>
                                    <div className="flex gap-2">
                                      <input
                                        type="color"
                                        value={
                                          curProject.brand_colors_secondary?.startsWith(
                                            "#",
                                          ) &&
                                          curProject.brand_colors_secondary
                                            ?.length === 7
                                            ? curProject.brand_colors_secondary
                                            : "#6366f1"
                                        }
                                        onChange={(e) =>
                                          updateLeadData(
                                            curProject.id,
                                            {
                                              brand_colors_secondary:
                                                e.target.value,
                                            },
                                            curColl,
                                          )
                                        }
                                        className="w-10 h-8 rounded border border-slate-800 bg-[#020617] cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={
                                          curProject.brand_colors_secondary ||
                                          ""
                                        }
                                        placeholder="e.g. #6366f1 or Slate Blue"
                                        onChange={(e) =>
                                          updateLeadData(
                                            curProject.id,
                                            {
                                              brand_colors_secondary:
                                                e.target.value,
                                            },
                                            curColl,
                                          )
                                        }
                                        className="flex-1 bg-[#020617] border border-slate-800 focus:border-cyan-500 outline-none rounded-xl px-2 text-xs text-white font-mono"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Accent / Highlight color
                                    </label>
                                    <div className="flex gap-2">
                                      <input
                                        type="color"
                                        value={
                                          curProject.brand_colors_accent?.startsWith(
                                            "#",
                                          ) &&
                                          curProject.brand_colors_accent
                                            ?.length === 7
                                            ? curProject.brand_colors_accent
                                            : "#10b981"
                                        }
                                        onChange={(e) =>
                                          updateLeadData(
                                            curProject.id,
                                            {
                                              brand_colors_accent:
                                                e.target.value,
                                            },
                                            curColl,
                                          )
                                        }
                                        className="w-10 h-8 rounded border border-slate-800 bg-[#020617] cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={
                                          curProject.brand_colors_accent || ""
                                        }
                                        placeholder="e.g. #10b981 or Amber"
                                        onChange={(e) =>
                                          updateLeadData(
                                            curProject.id,
                                            {
                                              brand_colors_accent:
                                                e.target.value,
                                            },
                                            curColl,
                                          )
                                        }
                                        className="flex-1 bg-[#020617] border border-slate-800 focus:border-cyan-500 outline-none rounded-xl px-2 text-xs text-white font-mono"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Typography Font Pairings
                                    </label>
                                    <input
                                      type="text"
                                      value={curProject.typography_style || ""}
                                      placeholder="e.g. Space Grotesk + Inter, Fira Code + Outfit"
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          { typography_style: e.target.value },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      General Visual Mood & Look
                                    </label>
                                    <select
                                      value={
                                        curProject.design_mood ||
                                        "Cosmic Slate Dark"
                                      }
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          { design_mood: e.target.value },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 text-white text-xs rounded-xl p-2.5 outline-none cursor-pointer focus:border-cyan-500"
                                    >
                                      <option value="Cosmic Slate Dark">
                                        Cosmic Slate Dark
                                      </option>
                                      <option value="High-Contrast Swiss Light">
                                        High-Contrast Swiss Light
                                      </option>
                                      <option value="Minimalist Charcoal">
                                        Minimalist Charcoal
                                      </option>
                                      <option value="Warm Editorial Serif">
                                        Warm Editorial Serif
                                      </option>
                                      <option value="Vibrant Neon Tech">
                                        Vibrant Neon Tech
                                      </option>
                                    </select>
                                  </div>
                                </div>
                              </div>

                              {/* Sec 2: Website Scope & Brand Voice */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider block border-b border-slate-800 pb-2">
                                  Target Pages & Brand Tone of Voice
                                </span>

                                <div className="grid sm:grid-cols-1 gap-4">
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Target Website Pages / Sections To
                                      Construct
                                    </label>
                                    <input
                                      type="text"
                                      value={curProject.pages_to_build || ""}
                                      placeholder="e.g. Home, About, Services Bookings, Testimonials Feed, Project Status Portal, Contact Map"
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          { pages_to_build: e.target.value },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white"
                                    />
                                    <p className="text-[9px] text-slate-500 italic mt-1 font-mono">
                                      Separate pages with commas. Example: Home,
                                      Contact, Gallery.
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Copywriting Style & Brand Tone of Voice
                                    </label>
                                    <textarea
                                      value={
                                        curProject.brand_tone_of_voice || ""
                                      }
                                      placeholder="e.g. Luxurious, minimal, clear copy with technical precision. High security and modern aesthetics focus."
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          {
                                            brand_tone_of_voice: e.target.value,
                                          },
                                          curColl,
                                        )
                                      }
                                      className="w-full h-24 bg-[#020617] border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white resize-none custom-scrollbar"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TAB 3: Schedule & Timeline Checklist */}
                          {controlHubTab === "schedule" && (
                            <div className="space-y-6 animate-fadeIn">
                              {/* Sec 1: Project Timeline Estimates */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider block border-b border-slate-800 pb-2">
                                  Target Launch Schedule & Deadlines
                                </span>
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Estimated Start Date
                                    </label>
                                    <input
                                      type="date"
                                      value={
                                        curProject.estimated_start_date || ""
                                      }
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          {
                                            estimated_start_date:
                                              e.target.value,
                                          },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                      Target Launch / Delivery Date
                                    </label>
                                    <input
                                      type="date"
                                      value={
                                        curProject.target_launch_date || ""
                                      }
                                      onChange={(e) =>
                                        updateLeadData(
                                          curProject.id,
                                          {
                                            target_launch_date: e.target.value,
                                          },
                                          curColl,
                                        )
                                      }
                                      className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                    Critical Deadlines / Deployments & Handover
                                    Notes
                                  </label>
                                  <textarea
                                    value={curProject.launch_notes || ""}
                                    placeholder="e.g. Customer wants integration with Stripe on the services section finished early for booking prep."
                                    onChange={(e) =>
                                      updateLeadData(
                                        curProject.id,
                                        { launch_notes: e.target.value },
                                        curColl,
                                      )
                                    }
                                    className="w-full h-20 bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white resize-none custom-scrollbar"
                                  />
                                </div>
                              </div>

                              {/* Sec 2: Administrative Checklist */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                                <div className="border-b border-slate-800 pb-2.5">
                                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <CheckSquare className="w-4 h-4 text-cyan-400" />{" "}
                                    Administrative Task List & Milestones
                                  </h3>
                                  <p className="text-xs text-slate-400">
                                    Review assets progress, assign tasks, and
                                    set operational deadlines.
                                  </p>
                                </div>

                                <AestheticInternalChecklist
                                  lead={curProject}
                                  collectionName={curColl}
                                  onToggleItem={toggleChecklistItem}
                                  onUpdateLead={updateLeadData}
                                />
                              </div>
                            </div>
                          )}

                          {/* TAB 4: Finances & Contracting */}
                          {controlHubTab === "finances" && (
                            <div className="space-y-6 animate-fadeIn">
                              {/* Proposal Details Manager */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                                <div className="flex justify-between items-center border-b border-slate-800/65 pb-2 ml-0.2">
                                  <span className="text-[10.5px] font-mono uppercase text-slate-400 font-bold tracking-wider block font-black">
                                    Project Proposal & Statement of Work
                                  </span>
                                </div>
                                <div className="space-y-4">
                                  <p className="text-xs text-slate-400 font-light">
                                    Paste the generated proposal output here.
                                    This enables the client to view and securely
                                    sign-off on the proposal via their internal
                                    project portal.
                                  </p>
                                  <textarea
                                    value={curProject.proposal_text || ""}
                                    placeholder="Paste the finalized statement of work text here..."
                                    onChange={(e) =>
                                      updateLeadData(
                                        curProject.id,
                                        { proposal_text: e.target.value },
                                        curColl,
                                      )
                                    }
                                    className="w-full h-40 bg-[#020617] border border-slate-800 hover:border-slate-700 focus:border-cyan-500 outline-none rounded-xl p-3 text-xs text-slate-300 resize-y custom-scrollbar font-sans"
                                  />
                                  {curProject.proposal_approved && (
                                    <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl flex items-center justify-between text-xs mt-2">
                                      <div className="space-y-1">
                                        <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                                          ✓ Contract Electronically Signed
                                        </p>
                                        <p className="text-slate-400 font-mono text-[10px]">
                                          Signee Name:{" "}
                                          <strong className="text-white">
                                            {curProject.client_signature}
                                          </strong>
                                        </p>
                                      </div>
                                      <div className="text-right space-y-1">
                                        <span className="bg-emerald-950 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded border border-emerald-900/40 font-bold">
                                          APPROVED
                                        </span>
                                        <p className="text-slate-500 font-mono text-[10px]">
                                          {new Date(
                                            curProject.proposal_approved_at,
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Budget & invoice */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                                <div className="flex justify-between items-center border-b border-slate-800/65 pb-2 ml-0.2">
                                  <span className="text-[10.5px] font-mono uppercase text-slate-400 font-bold tracking-wider block font-black">
                                    Project Finance & Invoice Controls
                                  </span>
                                  <span className="text-[11px] bg-slate-950 font-mono text-cyan-405 px-3 py-1 rounded-xl font-bold border border-slate-850">
                                    Est. Budget:{" "}
                                    {curProject.budget_range ||
                                      curProject.budget ||
                                      "Unspecified"}
                                  </span>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-[10px] font-mono text-slate-400 block mb-1.5 font-bold">
                                        Deposit Amount Requested
                                      </label>
                                      <input
                                        type="text"
                                        className="w-full bg-[#020617] border border-slate-800 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white font-mono"
                                        value={
                                          curProject.deposit_amount || "$1,500"
                                        }
                                        onChange={(e) =>
                                          updateLeadData(
                                            curProject.id,
                                            { deposit_amount: e.target.value },
                                            curColl,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-mono text-slate-400 block mb-1.5 font-bold">
                                        Deposit Due Date Reference
                                      </label>
                                      <input
                                        type="date"
                                        className="w-full bg-[#020617] border border-slate-800 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white"
                                        value={
                                          curProject.deposit_due_date || ""
                                        }
                                        onChange={(e) =>
                                          updateLeadData(
                                            curProject.id,
                                            {
                                              deposit_due_date: e.target.value,
                                            },
                                            curColl,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-mono text-slate-400 block mb-1.5 font-bold">
                                        Stripe Custom Payment Link
                                      </label>
                                      <input
                                        type="text"
                                        className="w-full bg-[#020617] border border-slate-800 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white font-mono"
                                        value={curProject.payment_link || ""}
                                        placeholder="https://buy.stripe.com/..."
                                        onChange={(e) =>
                                          updateLeadData(
                                            curProject.id,
                                            { payment_link: e.target.value },
                                            curColl,
                                          )
                                        }
                                      />
                                    </div>
                                    <div className="pt-2 border-t border-slate-800/60 mt-1">
                                      <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-mono text-slate-400 block mb-1.5 font-bold">
                                          EFT Bank Transfer Settings (Lead
                                          specific)
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateLeadData(
                                              curProject.id,
                                              {
                                                bank_name:
                                                  bankSettings.bank_name,
                                                bank_account_name:
                                                  bankSettings.bank_account_name,
                                                bank_bsb: bankSettings.bank_bsb,
                                                bank_account_number:
                                                  bankSettings.bank_account_number,
                                                bank_payid:
                                                  bankSettings.bank_payid,
                                                bank_instructions:
                                                  bankSettings.bank_instructions,
                                              },
                                              curColl,
                                            )
                                          }
                                          className="text-[9px] font-mono hover:text-cyan-400 text-cyan-600 bg-cyan-950/30 px-2 py-1 rounded"
                                        >
                                          Auto-Fill Agency Defaults
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                        <input
                                          type="text"
                                          placeholder="Bank Name"
                                          value={curProject.bank_name || ""}
                                          onChange={(e) =>
                                            updateLeadData(
                                              curProject.id,
                                              { bank_name: e.target.value },
                                              curColl,
                                            )
                                          }
                                          className="bg-[#020617] border border-slate-800 rounded-lg p-2 text-[10px] text-white"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Account Name"
                                          value={
                                            curProject.bank_account_name || ""
                                          }
                                          onChange={(e) =>
                                            updateLeadData(
                                              curProject.id,
                                              {
                                                bank_account_name:
                                                  e.target.value,
                                              },
                                              curColl,
                                            )
                                          }
                                          className="bg-[#020617] border border-slate-800 rounded-lg p-2 text-[10px] text-white"
                                        />
                                        <input
                                          type="text"
                                          placeholder="BSB"
                                          value={curProject.bank_bsb || ""}
                                          onChange={(e) =>
                                            updateLeadData(
                                              curProject.id,
                                              { bank_bsb: e.target.value },
                                              curColl,
                                            )
                                          }
                                          className="bg-[#020617] border border-slate-800 rounded-lg p-2 text-[10px] text-white"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Account Number"
                                          value={
                                            curProject.bank_account_number || ""
                                          }
                                          onChange={(e) =>
                                            updateLeadData(
                                              curProject.id,
                                              {
                                                bank_account_number:
                                                  e.target.value,
                                              },
                                              curColl,
                                            )
                                          }
                                          className="bg-[#020617] border border-slate-800 rounded-lg p-2 text-[10px] text-white"
                                        />
                                        <input
                                          type="text"
                                          placeholder="PayID / Email (Optional)"
                                          value={curProject.bank_payid || ""}
                                          onChange={(e) =>
                                            updateLeadData(
                                              curProject.id,
                                              { bank_payid: e.target.value },
                                              curColl,
                                            )
                                          }
                                          className="col-span-2 bg-[#020617] border border-slate-800 rounded-lg p-2 text-[10px] text-white"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Instructions/Reference"
                                          value={
                                            curProject.bank_instructions || ""
                                          }
                                          onChange={(e) =>
                                            updateLeadData(
                                              curProject.id,
                                              {
                                                bank_instructions:
                                                  e.target.value,
                                              },
                                              curColl,
                                            )
                                          }
                                          className="col-span-2 bg-[#020617] border border-slate-800 rounded-lg p-2 text-[10px] text-white"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex flex-col justify-between p-4 bg-slate-950/40 rounded-2xl border border-slate-850/80">
                                    <div className="space-y-1">
                                      <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">
                                        Payment Status Indicator
                                      </span>
                                      <p className="text-xs font-bold text-slate-350 mt-1">
                                        {curProject.status === "Deposit Paid" ||
                                        curProject.status === "Completed" ||
                                        curProject.deposit_paid_at ? (
                                          <span className="text-emerald-400 flex items-center gap-1.5">
                                            💰 Deposit Paid (Won Project)
                                          </span>
                                        ) : curProject.status ===
                                          "Deposit Requested" ? (
                                          <span className="text-amber-400 flex items-center gap-1.5">
                                            ⏳ Deposit Requested & Pending
                                          </span>
                                        ) : (
                                          <span className="text-slate-500 italic">
                                            💤 Draft Pipeline Status
                                          </span>
                                        )}
                                      </p>
                                      {curProject.deposit_paid_at && (
                                        <p className="text-[9.5px] text-cyan-400 font-mono mt-1">
                                          Paid on:{" "}
                                          {new Date(
                                            curProject.deposit_paid_at,
                                          ).toLocaleDateString()}
                                        </p>
                                      )}
                                      <p className="text-[10px] text-slate-500 leading-normal font-light pt-1.5">
                                        Deposit payment actions automatically
                                        update user timelines. Click below to
                                        transition states.
                                      </p>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateLeadStatus(
                                            curProject.id,
                                            "Deposit Requested",
                                            curColl,
                                          );
                                          alert(
                                            "State transitioned to 'Deposit Requested'!",
                                          );
                                        }}
                                        className="flex-1 py-1.5 bg-orange-950/30 hover:bg-orange-950/50 text-orange-400 border border-orange-900/40 rounded-xl text-xs font-bold cursor-pointer transition-all"
                                      >
                                        Mark Requested
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (
                                            confirm(
                                              "Confirm deposit paid? This will transition status and mark contract as WON.",
                                            )
                                          ) {
                                            updateLeadData(
                                              curProject.id,
                                              {
                                                status: "Deposit Paid",
                                                deposit_paid_at:
                                                  new Date().toISOString(),
                                                project_won: true,
                                              },
                                              curColl,
                                            );
                                          }
                                        }}
                                        className="flex-1 py-1.5 bg-emerald-950/30 hover:bg-[#064e3b] text-emerald-400 border border-emerald-900/40 rounded-xl text-xs font-bold cursor-pointer transition-all"
                                      >
                                        Mark Paid ✓
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-mono text-slate-450 block mb-1.5 font-bold">
                                    Financial notes & terms references
                                  </label>
                                  <input
                                    type="text"
                                    value={curProject.deposit_notes || ""}
                                    placeholder="e.g. Estimated remaining balance of 50% payable on staging preview approval."
                                    onChange={(e) =>
                                      updateLeadData(
                                        curProject.id,
                                        { deposit_notes: e.target.value },
                                        curColl,
                                      )
                                    }
                                    className="w-full bg-[#020617] border border-slate-800 hover:border-slate-700/80 focus:border-cyan-500 outline-none rounded-xl p-2.5 text-xs text-white"
                                  />
                                </div>
                              </div>

                              {/* Client email notification compiler */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                                <div className="border-b border-slate-800 pb-3">
                                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                    <Send className="w-4 h-4 text-cyan-400" />{" "}
                                    Client Phase Email Templates
                                  </h3>
                                  <p className="text-xs text-slate-400 font-sans">
                                    Pre-compiled messaging blocks that
                                    automatically embed active portal links.
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-1 bg-[#020617] p-1 rounded-xl border border-slate-800 text-[10.5px] font-bold font-mono">
                                  {templates.map((tpl, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() =>
                                        setSelectedTemplateIndex(idx)
                                      }
                                      className={`flex-1 text-center py-2 px-1 rounded-lg transition-all cursor-pointer ${
                                        selectedTemplateIndex === idx
                                          ? "bg-cyan-500 text-slate-950 font-black shadow"
                                          : "text-slate-400 hover:text-white"
                                      }`}
                                    >
                                      {tpl.title.split(" ").slice(1).join(" ")}
                                    </button>
                                  ))}
                                </div>

                                <div className="bg-[#020617] rounded-xl border border-slate-850 p-4 space-y-4 relative">
                                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-402 border-b border-slate-850 pb-2">
                                    <span className="uppercase text-slate-500 font-bold max-w-[70%] truncate">
                                      SUBJECT:{" "}
                                      {
                                        templates[selectedTemplateIndex]
                                          ?.subject
                                      }
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          templates[selectedTemplateIndex]
                                            ?.body,
                                        );
                                        setToastMessage("Copied custom email template!");
                                        setTimeout(() => setToastMessage(""), 3000);
                                      }}
                                      className="bg-cyan-950/70 border border-cyan-800/60 text-cyan-405 font-bold text-[9.5px] px-2.5 py-1 rounded hover:bg-cyan-800/40 cursor-pointer transition flex items-center gap-1 shrink-0"
                                    >
                                      <Copy className="w-3.5 h-3.5" /> Copy
                                      Template
                                    </button>
                                  </div>
                                  <pre className="text-xs text-slate-350 font-sans whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto custom-scrollbar font-light">
                                    {templates[selectedTemplateIndex]?.body}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TAB 5: Client Discussions & Revision History */}
                          {controlHubTab === "discussion" && (
                            <div className="space-y-6 animate-fadeIn">
                              {/* Create / Send direct message to client */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                                <div className="border-b border-slate-800 pb-3">
                                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                    <Send className="w-4 h-4 text-cyan-400" />{" "}
                                    Dispatch Message to Project Discussion
                                  </h3>
                                  <p className="text-xs text-slate-400">
                                    Post a new text message, request or general
                                    notification. This pushes instantly to the
                                    client's private portal status board.
                                  </p>
                                </div>

                                <form
                                  onSubmit={async (e) => {
                                    e.preventDefault();
                                    const text = directMessageText.trim();
                                    if (!text) return;
                                    setIsSendingDirect(true);
                                    try {
                                      const msgData = {
                                        project_id: curProject.id,
                                        project_collection: curColl,
                                        business_name:
                                          curProject.businessName ||
                                          "Your Business",
                                        contact_name: "Support / Developer",
                                        feedback_type: "General Question",
                                        message: text,
                                        submitted_by: "admin",
                                        submitted_at: new Date().toISOString(),
                                        status: "New",
                                      };

                                      if (isFirebaseConfigured) {
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        const {
                                          addDoc: addFbDoc,
                                          serverTimestamp: ts,
                                        } = await import("firebase/firestore");
                                        await addFbDoc(
                                          collection(db, "feedbacks"),
                                          {
                                            ...msgData,
                                            created_at: ts(),
                                            updated_at: ts(),
                                          },
                                        );
                                      } else {
                                        const existingStr =
                                          localStorage.getItem(
                                            "clarity_local_feedbacks",
                                          ) || "[]";
                                        const existing =
                                          JSON.parse(existingStr);
                                        existing.push({
                                          id: Math.random()
                                            .toString(36)
                                            .substring(2, 9),
                                          ...msgData,
                                        });
                                        localStorage.setItem(
                                          "clarity_local_feedbacks",
                                          JSON.stringify(existing),
                                        );
                                        setActiveFeedbacks(
                                          existing.filter(
                                            (f: any) =>
                                              f.project_id === curProject.id,
                                          ),
                                        );
                                      }
                                      setDirectMessageText("");
                                      alert(
                                        "Message posted to client discussion feed successfully!",
                                      );
                                    } catch (err) {
                                      console.error(err);
                                      alert("Error sending message.");
                                    } finally {
                                      setIsSendingDirect(false);
                                    }
                                  }}
                                  className="space-y-3"
                                >
                                  <textarea
                                    rows={2}
                                    value={directMessageText}
                                    onChange={(e) =>
                                      setDirectMessageText(e.target.value)
                                    }
                                    placeholder="Type an announcement, instructions, list of requirements, or greeting..."
                                    className="w-full bg-[#020617] border border-slate-800 focus:border-cyan-500 outline-none rounded-xl p-3 text-xs text-slate-200 resize-none font-sans"
                                  />
                                  <div className="flex justify-end">
                                    <button
                                      type="submit"
                                      disabled={
                                        isSendingDirect ||
                                        !directMessageText.trim()
                                      }
                                      className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 select-none cursor-pointer font-mono uppercase tracking-wider flex items-center gap-1.5"
                                    >
                                      {isSendingDirect ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Send className="w-3.5 h-3.5" />
                                      )}
                                      Send Message
                                    </button>
                                  </div>
                                </form>
                              </div>

                              {/* Private feedback list */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
                                <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                                  <div>
                                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5 matches">
                                      <MessageSquare className="w-4 h-4 text-cyan-400" />{" "}
                                      Private Client Revisions Feed
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                      View and respond to specific cosmetic or
                                      copy revision items requested on feedback
                                      screens.
                                    </p>
                                  </div>
                                  <span className="bg-[#020617] text-slate-450 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-slate-800 select-none">
                                    {activeFeedbacks.length} items logged
                                  </span>
                                </div>

                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                                  {activeFeedbacks.length === 0 ? (
                                    <div className="text-center py-8 bg-[#020617]/50 border border-slate-850/50 rounded-xl select-none">
                                      <p className="text-[11px] font-mono text-slate-500 italic text-center">
                                        No feedback entries linked on client
                                        portal yet.
                                      </p>
                                    </div>
                                  ) : (
                                    activeFeedbacks.map((fb: any) => (
                                      <div
                                        key={fb.id}
                                        className="p-3.5 bg-[#020617]/40 border border-slate-850 rounded-xl space-y-2.5 text-left"
                                      >
                                        <div className="flex justify-between items-start gap-2">
                                          <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                                              {fb.feedback_type ||
                                                fb.type ||
                                                fb.overall_feeling ||
                                                "General"}{" "}
                                              feedback
                                            </span>
                                            <span className="text-[9px] text-slate-500 font-mono uppercase">
                                              PRIORITY:{" "}
                                              {fb.priority || "Medium"}
                                            </span>
                                          </div>
                                          <span className="text-[9.5px] text-slate-500 font-mono">
                                            {fb.submitted_at || fb.submittedAt
                                              ? new Date(
                                                  fb.submitted_at ||
                                                    fb.submittedAt,
                                                ).toLocaleDateString()
                                              : "N/A"}
                                          </span>
                                        </div>

                                        <p className="text-xs text-slate-200 font-light leading-relaxed whitespace-pre-wrap">
                                          {fb.notes ||
                                            fb.notes_text ||
                                            fb.feedback ||
                                            fb.message ||
                                            "No description provided."}
                                        </p>

                                        {fb.reference_link && (
                                          <p className="text-[10px] font-mono">
                                            <span className="text-slate-500">
                                              REF:{" "}
                                            </span>
                                            <a
                                              href={fb.reference_link}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-cyan-400 hover:underline break-all"
                                            >
                                              {fb.reference_link}
                                            </a>
                                          </p>
                                        )}

                                        {/* Saved Response Display */}
                                        {fb.admin_response && (
                                          <div className="p-2.5 bg-cyan-950/20 border border-cyan-800/30 rounded-lg space-y-1">
                                            <div className="flex justify-between items-center text-[9px] font-bold text-cyan-400 font-mono uppercase">
                                              <span>Developer Response</span>
                                              {fb.admin_responded_at && (
                                                <span className="text-slate-500 font-normal normal-case">
                                                  {new Date(
                                                    fb.admin_responded_at,
                                                  ).toLocaleDateString()}
                                                </span>
                                              )}
                                            </div>
                                            <p className="text-xs text-slate-300 leading-normal font-light whitespace-pre-wrap">
                                              {fb.admin_response}
                                            </p>
                                          </div>
                                        )}

                                        {/* Inline response container */}
                                        <div className="pt-2 border-t border-slate-850/45 space-y-2">
                                          <div className="flex gap-2">
                                            <textarea
                                              rows={2}
                                              placeholder="Type a response message to this ticket..."
                                              value={replyTexts[fb.id] || ""}
                                              onChange={(e) =>
                                                setReplyTexts((prev) => ({
                                                  ...prev,
                                                  [fb.id]: e.target.value,
                                                }))
                                              }
                                              className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 outline-none rounded-lg p-2 text-xs text-slate-200 resize-none font-sans"
                                            />
                                            <button
                                              type="button"
                                              disabled={
                                                isSendingReply[fb.id] ||
                                                !(
                                                  replyTexts[fb.id] || ""
                                                ).trim()
                                              }
                                              onClick={() =>
                                                handleSendFeedbackResponse(
                                                  fb.id,
                                                  fb,
                                                )
                                              }
                                              className="px-3 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-bold rounded-lg transition hover:opacity-90 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center shrink-0 font-mono"
                                            >
                                              {isSendingReply[fb.id] ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                              ) : (
                                                "RESPOND"
                                              )}
                                            </button>
                                          </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-2.5 border-t border-slate-850/60 text-[9.5px] font-mono">
                                          <span className="text-slate-500 font-bold">
                                            SECTION:{" "}
                                            {fb.selected_section ||
                                              fb.selectedSection ||
                                              fb.page_section ||
                                              fb.pageSection ||
                                              "General"}
                                          </span>
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500 mr-2 font-light">
                                              Status:
                                            </span>
                                            {[
                                              "Pending",
                                              "In Progress",
                                              "Resolved",
                                            ].map((opt) => (
                                              <button
                                                key={opt}
                                                type="button"
                                                onClick={() =>
                                                  handleUpdateFeedbackStatusInControlCenter(
                                                    fb.id,
                                                    opt,
                                                  )
                                                }
                                                className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold border transition cursor-pointer ${
                                                  fb.status === opt
                                                    ? "bg-cyan-500 border-cyan-400 text-slate-950 font-black"
                                                    : "text-slate-500 border-slate-850/80 hover:text-white hover:border-slate-800"
                                                }`}
                                              >
                                                {opt}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Internal Operations Journal Notes */}
                              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-md">
                                <label className="text-[10.5px] uppercase font-mono tracking-wider text-slate-400 block font-bold">
                                  Internal Operations Journal Notes
                                </label>
                                <textarea
                                  className="w-full h-32 bg-[#020617] border border-slate-800 focus:border-cyan-505 outline-none rounded-xl p-3 text-xs text-indigo-305 leading-relaxed custom-scrollbar resize-none font-mono font-light h-28"
                                  placeholder="Type progress updates or custom client constraints here... (updates on typing)"
                                  value={
                                    curProject.admin_internal_notes ||
                                    curProject.notes ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    updateLeadData(
                                      curProject.id,
                                      { admin_internal_notes: e.target.value },
                                      curColl,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4"
                          style={{ minHeight: "500px" }}
                        >
                          <div className="p-4 rounded-full bg-cyan-950/30 border border-cyan-900 text-cyan-400">
                            <Sliders className="w-8 h-8 animate-pulse" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-white">
                              Mission Control Offline
                            </h3>
                            <p className="text-xs text-slate-450 max-w-sm">
                              Please select an active client project or prospect
                              lead from the Left Operations Queue to interface
                              with its live operations panel.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
        </div>
      </main>

      {/* GENERATIVE DRAFT MODAL */}
      {isGenerativeModalOpen && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" /> Generated Outreach
                Content
              </h3>
              <button
                onClick={() => setIsGenerativeModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto w-full">
              <p className="text-xs text-slate-400 mb-4 italic">
                Review and edit in your email client prior to sending. Note the
                mandatory opt-out inclusion block at the base.
              </p>
              <textarea
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                className="w-full h-64 bg-[#020617] border border-slate-800 rounded-xl p-4 text-sm text-slate-300 font-sans leading-relaxed focus:outline-none focus:border-cyan-500 custom-scrollbar resize-none"
              />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-between">
              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(generatedDraft);
                                  setToastMessage("Copied draft to clipboard!");
                                  setTimeout(() => setToastMessage(""), 3050);
                                }}
                                className="px-4 py-2 border border-slate-700 bg-[#020617] text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-800 transition-all"
                              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setIsGenerativeModalOpen(false)}
                className="px-6 py-2 bg-white text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {isAddLeadModalOpen && (
        <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" /> New Outbound Prospect
              </h3>
              <button
                onClick={() => setIsAddLeadModalOpen(false)}
                className="text-slate-500 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={handleSaveNewLead}
              className="flex-1 flex flex-col overflow-hidden min-h-0"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain p-6 space-y-4">
                {/* AI Workflows for Outreach Intake */}
                <div className="bg-indigo-950/25 border border-indigo-900/40 rounded-2xl p-4 space-y-3 mb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-left">
                      <p className="text-xs uppercase font-mono text-indigo-400 font-bold mb-0.5">
                        ⚡ Quick AI Intake & Profiler
                      </p>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Extract and auto-fill prospect metadata from websites using AI.
                      </p>
                    </div>
                    <div className="flex gap-1.5 w-full sm:w-auto select-none">
                      <button
                        type="button"
                        onClick={() => setShowIntakeTemplate(!showIntakeTemplate)}
                        className="flex-1 whitespace-nowrap px-2.5 py-1.5 bg-slate-900 text-indigo-400 border border-indigo-900/50 hover:bg-slate-800 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        {showIntakeTemplate ? "Hide Template" : "Show Template"}
                      </button>
                      <button
                        type="button"
                        onClick={copyAILeadProfilerPrompt}
                        className="flex-1 whitespace-nowrap px-2.5 py-1.5 bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Copy className="w-3 h-3 text-indigo-400" /> Copy AI Prompt
                      </button>
                    </div>
                  </div>

                  {showIntakeTemplate && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                        <span>Copy this template to ChatGPT/Gemini alongside your prospect's data:</span>
                      </div>
                      <pre className="text-[9.5px] font-mono text-indigo-305 bg-[#020617] p-2.5 rounded border border-slate-900 overflow-x-auto select-all leading-normal whitespace-pre-wrap">
{`Business Name: [The name of the business]
Contact Name: [The name of the owner or main contact if found]
Contact Email: [Email address if found]
Phone Number: [Phone number if found]
Website URL: [Website URL if found]
Industry: [Must be one of: trades-business, swimming-school, cafe-restaurant, cleaners, beauty, health, tutors, pets, accommodation, general-business]
Suggested Package: [Starter Website, Custom Portal, or E-Commerce Suite]
Budget Range: [Estimated budget range, e.g., $1,500 - $3,000, $3,000 - $5,050]
Timeline: [timeline expectations, e.g., 2 Weeks, 4 Weeks, 1-2 Months]
Lead Quality: [Cold or Warm (Cold if generic, Warm if specific buying signal found)]
Issue/Opportunity: [One specific, highly critical issue with their current site. E.g. "Mobile layout is broken", "No online booking", "Takes 10 seconds to load"]
Initial Prospect Notes: [A quick 1-2 sentence summary of their current situation, what platform they use (e.g. Wix/Wordpress) if obvious, and why we should reach out]`}
                      </pre>
                    </div>
                  )}

                  {/* Manual Paste Area fallback & bypass */}
                  <div className="space-y-2 pt-1 text-left">
                    <label className="text-[10px] font-mono text-slate-400 uppercase font-black block">
                      Manual AI Paste Area (Avoids Clipboard Blocks)
                    </label>
                    <textarea
                      value={aiPasteText}
                      onChange={(e) => setAiPasteText(e.target.value)}
                      placeholder="Paste the generated response from ChatGPT / Gemini here..."
                      className="w-full h-24 bg-[#020617] text-xs text-slate-305 placeholder-slate-700 rounded-xl p-3 border border-indigo-950 focus:border-indigo-500 hover:border-indigo-900/60 focus:outline-none resize-none font-mono custom-scrollbar transition-all"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          parseAndApplyContext(aiPasteText);
                        }}
                        className="flex-1 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-900/20 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" /> Auto-Fill Form from Text Area
                      </button>
                      <button
                        type="button"
                        onClick={handlePasteProfilerContext}
                        className="px-3.5 py-2 bg-slate-900 text-indigo-400 hover:bg-slate-800 border border-indigo-905 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" /> Auto-Fill from Clipboard
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-cyan-900/30 mb-2">
                  <label className="text-xs font-mono text-cyan-400 uppercase block mb-1">
                    Campaign Assigned To
                  </label>
                  <input
                    type="text"
                    value={newLeadCampaign}
                    onChange={(e) => setNewLeadCampaign(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#020617] text-white rounded-lg border border-slate-800 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alpha Trades"
                      value={newLeadBusiness}
                      onChange={(e) => setNewLeadBusiness(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={newLeadContact}
                      onChange={(e) => setNewLeadContact(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. contact@business.com"
                      value={newLeadEmail}
                      onChange={(e) => setNewLeadEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +61 400 000 000"
                      value={newLeadPhone}
                      onChange={(e) => setNewLeadPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Website URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. www.alphatrades.com"
                      value={newLeadWebsite}
                      onChange={(e) => setNewLeadWebsite(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Industry
                    </label>
                    <select
                      value={newLeadIndustry}
                      onChange={(e) => setNewLeadIndustry(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-cyan-500 outline-none select-none"
                    >
                      <option value="trades-business">Trades & Builders</option>
                      <option value="swimming-school">Swim Academy</option>
                      <option value="cafe-restaurant">Cafe & Restaurant</option>
                      <option value="cleaners">Cleaners</option>
                      <option value="beauty">Beauty & Salon</option>
                      <option value="health">Allied Health</option>
                      <option value="tutors">Tutors</option>
                      <option value="pets">Pet Services</option>
                      <option value="accommodation">Accommodation</option>
                      <option value="general-business">General Business</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Suggested Package
                    </label>
                    <select
                      value={newLeadPackage}
                      onChange={(e) => setNewLeadPackage(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-cyan-500 outline-none select-none"
                    >
                      <option value="Starter Website">Starter Website</option>
                      <option value="Lead Website">Lead Website</option>
                      <option value="Booking / Portal Website">
                        Booking / Portal Website
                      </option>
                      <option value="Custom System Block">
                        Custom System Block
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Budget Range
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. $3,000 - $5,000"
                      value={newLeadBudget}
                      onChange={(e) => setNewLeadBudget(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Timeline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 4 Weeks"
                      value={newLeadTimeline}
                      onChange={(e) => setNewLeadTimeline(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Lead Quality Factor
                    </label>
                    <select
                      value={newLeadRating}
                      onChange={(e) => setNewLeadRating(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 text-white rounded-xl border border-slate-800 focus:border-cyan-500 outline-none select-none"
                    >
                      <option value="Cold">Cold</option>
                      <option value="Warm">Warm</option>
                      <option value="High potential">High potential</option>
                      <option value="Do not contact">Do not contact</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                      Website Issue / Opportunity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mobile layout is hard to use"
                      value={newLeadIssue}
                      onChange={(e) => setNewLeadIssue(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-[#020617] text-white rounded-xl border border-slate-800 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 uppercase block mb-1">
                    Initial Prospect Notes
                  </label>
                  <textarea
                    placeholder="Insert any gathered info about their current website, slow speeds, Wix/Squarespace, etc."
                    value={newLeadNotes}
                    onChange={(e) => setNewLeadNotes(e.target.value)}
                    className="w-full h-20 bg-[#020617] border border-slate-800 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-cyan-505 resize-none"
                  />
                </div>

                <div className="border-t border-slate-800/80 pt-4 font-sans pb-6">
                  <h4 className="text-xs font-mono text-cyan-400 uppercase block mb-3">
                    Optional Outreach Pipeline Schedule
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                        First Contacted At
                      </label>
                      <input
                        type="date"
                        value={newLeadFirstContact}
                        onChange={(e) => setNewLeadFirstContact(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-cyan-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                        Next Follow-Up At
                      </label>
                      <input
                        type="date"
                        value={newLeadNextFollowUp}
                        onChange={(e) => setNewLeadNextFollowUp(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-950 text-white rounded-lg border border-slate-800 focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 bg-[#020617] text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-800 transition-all font-sans cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition-all font-sans cursor-pointer inline-flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                  <Send className="w-3.5 h-3.5" /> Add Prospect Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function parsePotentialValue(str: string): number {
  if (!str) return 0;
  const regex = /\$?([0-9,]+)/g;
  let match;
  let maxVal = 0;
  while ((match = regex.exec(str)) !== null) {
    const val = parseInt(match[1].replace(/,/g, ""), 10);
    if (!isNaN(val) && val > maxVal) {
      maxVal = val;
    }
  }
  return maxVal || 1500;
}

function OperationalAssistantPanel({
  lead,
  collectionName,
  onUpdateStatus,
  onUpdateLead,
}: {
  lead: any;
  collectionName: "intakes" | "outreachLeads";
  onUpdateStatus: (id: string, stat: string, col: any) => void;
  onUpdateLead: (id: string, updates: any) => void;
}) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<string>("intake_received");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const status = (lead.status || "").trim();
    if (
      status === "Review & Send Quote" ||
      status === "New Intake" ||
      status === "Reviewed"
    )
      setSelectedTemplate("intake_received");
    else if (status === "Proposal Sent") setSelectedTemplate("proposal_ready");
    else if (status === "Question Asked") setSelectedTemplate("question_reply");
    else if (status === "Scope Change Requested")
      setSelectedTemplate("scope_change_received");
    else if (status === "Proposal Approved")
      setSelectedTemplate("proposal_approved");
    else if (status === "Deposit Requested")
      setSelectedTemplate("deposit_request");
    else if (status === "Deposit Paid")
      setSelectedTemplate("asset_handover_request");
    else if (status === "Assets Requested")
      setSelectedTemplate("missing_asset_reminder");
    else if (status === "Active Build" || status === "Build Started")
      setSelectedTemplate("build_started");
    else if (status === "First Preview Sent")
      setSelectedTemplate("first_preview_ready");
    else if (status === "Client Review")
      setSelectedTemplate("feedback_reminder");
    else if (status === "Revisions") setSelectedTemplate("build_started");
    else if (status === "Final Review")
      setSelectedTemplate("final_review_ready");
    else if (status === "Launch Ready") setSelectedTemplate("launch_ready");
    else if (status === "Launched") setSelectedTemplate("site_launched");
    else if (status === "Completed") setSelectedTemplate("handover_message");
    else if (status === "Testimonial Requested")
      setSelectedTemplate("testimonial_request");
    else setSelectedTemplate("intake_received");
  }, [lead.status]);

  const actionInfo = getNextActionInfo(lead.status, lead);
  const priority = calculatePriorityScore(lead);
  const missingAssets = detectMissingAssets(lead);
  const checkReport = generateWebsiteCheckReport(
    lead.business_name || lead.businessName,
    lead.website_issue_opportunity || "",
  );

  const origin = window.location.origin;
  const messageBody = buildClientMessage(selectedTemplate, lead, origin);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const templatesList = [
    { id: "intake_received", label: "1. Intake Received / Welcome" },
    { id: "proposal_ready", label: "2. Custom Proposal Ready" },
    { id: "question_reply", label: "3. Answer Clarification" },
    { id: "scope_change_received", label: "4. Scope Alteration Received" },
    { id: "updated_proposal_ready", label: "5. Polished Contract Proposal" },
    { id: "proposal_approved", label: "6. Proposal Approval & Success" },
    { id: "deposit_request", label: "7. Initial Deposit Invoice" },
    { id: "deposit_reminder", label: "8. Deposit Invoice Reminder" },
    { id: "asset_handover_request", label: "9. Start Folders Handover" },
    { id: "missing_asset_reminder", label: "10. Handover Gaps Reminder" },
    { id: "build_started", label: "11. Visual Build Commission" },
    { id: "first_preview_ready", label: "12. Preview Staging Live" },
    { id: "feedback_reminder", label: "13. Feedbacks Draft Reminder" },
    { id: "final_review_ready", label: "14. Final Signoff Request" },
    { id: "launch_ready", label: "15. DNS Deployment Commenced" },
    { id: "site_launched", label: "16. Production Active Global" },
    { id: "handover_message", label: "17. Master Assets Archive" },
    { id: "testimonial_request", label: "18. Administrative Review Test" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mt-8 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-base font-bold text-white">
            🤖 Clarity Space Operations Assistant
          </h3>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-bold uppercase tracking-wider ${priority.colorClass}`}
        >
          {priority.label} score: {priority.score}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-[#020617] p-4 rounded-2xl border border-slate-850 space-y-2">
          <p className="text-[10px] font-mono uppercase text-[#22d3ee] font-black">
            NEXT BEST ACTION
          </p>
          <div className="flex items-start gap-1.5">
            <h4 className="text-sm font-bold text-white leading-tight">
              ⚡ {actionInfo.action}
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            {actionInfo.reason}
          </p>
        </div>

        <div className="bg-[#020617] p-4 rounded-2xl border border-slate-850 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase text-[#22d3ee] font-black">
              WAITING ON
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded bg-slate-900 text-slate-300 border border-slate-800">
              {actionInfo.waitingOn}
            </span>
          </div>
          <div className="pt-2">
            <p className="text-[10px] font-mono uppercase text-slate-500">
              Suggested Target
            </p>
            <p className="text-xs font-mono font-medium text-slate-300 mt-0.5">
              {actionInfo.dueDate || "Unscheduled"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-300">
              Stage-Specific Outreach Message Composer
            </h4>
            <p className="text-[10px] text-slate-500">
              Drafted dynamically with client token and workspace parameters.
            </p>
          </div>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="px-3 py-1.5 bg-[#020617] border border-slate-800 rounded-lg text-xs text-slate-305 outline-none focus:border-cyan-500"
          >
            {templatesList.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative bg-[#020617] border border-slate-850 rounded-2xl p-4">
          <pre className="text-xs font-mono text-cyan-300/90 leading-relaxed whitespace-pre-wrap select-all max-h-60 overflow-y-auto pr-2">
            {messageBody || "Select a pipeline template to compile."}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none"
          >
            {copied ? "✓ Copied" : "Copy Template"}
          </button>
        </div>

        {/* SENT LOGGING & CLIENT RESPONSE STATES PANEL */}
        <div className="bg-[#020617]/50 rounded-2xl p-4 border border-slate-850/80 grid sm:grid-cols-2 gap-4 mt-3">
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-extrabold tracking-widest block">
              Communications Action Tracker
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const updatedSent = {
                    ...(lead.templatesSent || {}),
                    [selectedTemplate]: new Date().toISOString(),
                  };
                  onUpdateLead(lead.id, { templatesSent: updatedSent });
                  alert(
                    `Logged message "${templatesList.find((t) => t.id === selectedTemplate)?.label}" as SENT successfully.`,
                  );
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/40 border border-cyan-800 text-cyan-400 text-xs font-semibold rounded-lg hover:bg-cyan-900/50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Mark Template Sent
              </button>

              {lead.templatesSent?.[selectedTemplate] && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/20 border border-emerald-900/30 px-2 rounded select-none">
                  ✓ Sent:{" "}
                  {new Date(
                    lead.templatesSent[selectedTemplate],
                  ).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1.5">
                Client Response Tracker
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  {
                    key: "awaiting",
                    val: "Awaiting Response",
                    cl: "border-orange-900/50 text-orange-400 bg-orange-950/10",
                  },
                  {
                    key: "replied",
                    val: "Client Replied ✓",
                    cl: "border-emerald-900/50 text-emerald-400 bg-emerald-950/10",
                  },
                  {
                    key: "followup",
                    val: "Follow-up Needed",
                    cl: "border-cyan-900/50 text-cyan-400 bg-cyan-950/10",
                  },
                  {
                    key: "none",
                    val: "Closed/Resolved",
                    cl: "border-slate-800 text-slate-400 bg-slate-900",
                  },
                ].map((opt) => {
                  const isActive = lead.client_response_state === opt.val;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() =>
                        onUpdateLead(lead.id, {
                          client_response_state: opt.val,
                        })
                      }
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition cursor-pointer ${
                        isActive
                          ? "bg-cyan-500 text-slate-950 border-cyan-400 ring-2 ring-cyan-500/10"
                          : `${opt.cl} hover:brightness-125`
                      }`}
                    >
                      {opt.val}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-[#01040f] p-3 border border-slate-900/90 rounded-lg space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-extrabold tracking-widest block">
              Sent Outreach History Archive
            </span>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {!lead.templatesSent ||
              Object.keys(lead.templatesSent).length === 0 ? (
                <p className="text-[10px] text-slate-500 italic py-3 text-center select-none font-mono">
                  No communication records logged sent yet.
                </p>
              ) : (
                Object.entries(lead.templatesSent).map(
                  ([tplId, stamp]: any) => {
                    const tplMeta = templatesList.find((t) => t.id === tplId);
                    return (
                      <div
                        key={tplId}
                        className="flex justify-between items-center text-[10px] bg-slate-950/40 p-1.5 rounded border border-slate-900/50 select-none"
                      >
                        <span
                          className="text-slate-300 truncate max-w-[170px]"
                          title={tplMeta?.label || tplId}
                        >
                          {tplMeta?.label || tplId}
                        </span>
                        <span className="text-slate-500 font-mono text-[9px]">
                          {new Date(stamp).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  },
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {lead.website_issue_opportunity && (
        <div className="bg-amber-950/10 border border-amber-900/35 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-amber-400">
              ⚡ Client Website Audit Report (Outbound Opportunity)
            </h4>
            <button
              onClick={() => {
                const head = `--- AUDIT REPORT FOR ${lead.businessName || lead.business_name} ---\n\n`;
                const issuesText = checkReport.improvements
                  .map(
                    (issue, idx) =>
                      `${idx + 1}. ${issue.issueNoticed}\n   Importance: ${issue.whyItMatters}\n   Upgrade Suggestion: ${issue.suggestedImprovement}\n   Interactive Demo: ${issue.demoLink}\n`,
                  )
                  .join("\n");
                const tail = `\n${checkReport.nextStep}`;
                navigator.clipboard.writeText(head + issuesText + tail);
                alert("Website Opportunity audit copied successfully!");
              }}
              className="bg-amber-950 hover:bg-amber-900 border border-amber-900 px-2.5 py-1 text-[10px] text-amber-400 font-bold rounded"
            >
              Copy Audit Report
            </button>
          </div>
          <p className="text-[10px] text-amber-200/60 leading-relaxed font-light mt-1">
            Generated using custom tags: "{lead.website_issue_opportunity}"
          </p>

          <div className="bg-[#020617] rounded-xl p-3 border border-amber-900/10 space-y-3">
            {checkReport.improvements.map((row, idx) => (
              <div
                key={idx}
                className="text-xs space-y-1 font-sans border-b border-slate-850 last:border-0 pb-2.5 last:pb-0"
              >
                <p className="text-slate-200 font-semibold">
                  {idx + 1}. {row.issueNoticed}
                </p>
                <p className="text-slate-450 font-light flex items-start gap-1">
                  <span className="text-rose-450 font-bold">⚠</span>{" "}
                  {row.whyItMatters}
                </p>
                <p className="text-emerald-400/90 font-medium">
                  ✓ Solution: {row.suggestedImprovement}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {collectionName === "intakes" && missingAssets.length > 0 && (
        <div className="bg-[#020617] border border-slate-850 rounded-2xl p-4 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-350 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            Detected Missing Client Assets Task List ({missingAssets.length})
          </h4>
          <p className="text-[10px] text-slate-500 leading-normal mb-3">
            Gaps parsed dynamically based on readiness responses. Track these
            manual deliverables.
          </p>
          <div className="space-y-2">
            {missingAssets.map((task, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs gap-3"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-200">{task.task}</p>
                  <p className="text-[10px] text-slate-400 font-light">
                    {task.description}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-slate-950 text-orange-400 border border-orange-950 text-[10px] font-mono rounded overflow-hidden">
                  {task.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
