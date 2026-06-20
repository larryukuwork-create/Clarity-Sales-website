/**
 * Automated Outreach & Project Operations Engine for Clarity Space
 * Generates checklists, templates, dates, followups, urgency scoring, and next best actions.
 */

export interface NextActionInfo {
  action: string;
  reason: string;
  dueDate: string; // YYYY-MM-DD
  waitingOn: 'Admin' | 'Client' | 'Payment' | 'Assets' | 'Feedback' | 'None';
}

export interface AssetTask {
  task: string;
  category: string;
  description: string;
}

export interface QuickImprovementsReport {
  title: string;
  intro: string;
  improvements: {
    issueNoticed: string;
    whyItMatters: string;
    suggestedImprovement: string;
    demoLink: string;
  }[];
  nextStep: string;
}

/**
 * Computes the Next Best Action details based on status and metadata
 */
export function getNextActionInfo(status: string, item: any, now: Date = new Date()): NextActionInfo {
  let action = "Review current stage";
  let reason = "Verify client timeline and project milestone sync state.";
  let dueDays = 2;
  let waitingOn: 'Admin' | 'Client' | 'Payment' | 'Assets' | 'Feedback' | 'None' = "Admin";

  const normStatus = (status || "").trim();

  switch (normStatus) {
    case "New Intake":
      action = "Review intake and prepare recommendation";
      reason = "New client questionnaire submitted and awaiting administrative review.";
      dueDays = 1;
      waitingOn = "Admin";
      break;
    case "Reviewed":
      action = "Generate proposal or send recommendation";
      reason = "Intake has been cleared by admin, ready for custom proposal draft.";
      dueDays = 1;
      waitingOn = "Admin";
      break;
    case "Proposal Sent":
      action = "Follow up if no response after 3 days";
      reason = "Awaiting decision or approval of the detailed project proposal.";
      dueDays = 3;
      waitingOn = "Client";
      break;
    case "Question Asked":
      action = "Reply to client question";
      reason = "The client has submitted a query that needs quick answering to proceed.";
      dueDays = 1;
      waitingOn = "Admin";
      break;
    case "Scope Change Requested":
      action = "Review scope change and update proposal";
      reason = "Client requested adjustments to the project scope of work.";
      dueDays = 1;
      waitingOn = "Admin";
      break;
    case "Proposal Approved":
      action = "Request deposit and prepare Drive folder";
      reason = "Proposal signed off! Prep the secure folder and send payment links.";
      dueDays = 1;
      waitingOn = "Admin";
      break;
    case "Deposit Requested":
      action = "Follow up on deposit if unpaid after 2 days";
      reason = "Milestone deposit invoice issued. Monitor payment confirmation.";
      dueDays = 2;
      waitingOn = "Payment";
      break;
    case "Deposit Paid":
      action = "Request assets and confirm start date";
      reason = "Initial deposit secured. Ready to kick off asset handover phase.";
      dueDays = 1;
      waitingOn = "Admin";
      break;
    case "Assets Requested":
      action = "Follow up on missing assets after 4 days";
      reason = "Handover checklist sent. Gather logos, text content, and photos.";
      dueDays = 4;
      waitingOn = "Assets";
      break;
    case "Assets Received":
      action = "Start build";
      reason = "Assets verified and cataloged in Drive. Workspace is unblocked.";
      dueDays = 2;
      waitingOn = "Admin";
      break;
    case "Build Started":
      action = "Prepare first preview";
      reason = "Staging sandbox active. Construct the responsive layout draft.";
      dueDays = 3;
      waitingOn = "Admin";
      break;
    case "First Preview Sent":
      action = "Wait for feedback or follow up after 3 days";
      reason = "Preview link is live. Awaiting client's alignment and feedback notes.";
      dueDays = 3;
      waitingOn = "Feedback";
      break;
    case "Client Review":
      action = "Review submitted feedback";
      reason = "Feedback tickets received. Analyze required edits or layouts.";
      dueDays = 1;
      waitingOn = "Admin";
      break;
    case "Revisions":
      action = "Complete revision checklist";
      reason = "Updating layouts and content blocks as requested in feedback.";
      dueDays = 2;
      waitingOn = "Admin";
      break;
    case "Final Review":
      action = "Confirm launch readiness";
      reason = "Signoff version delivered. Confirm final launch authorization.";
      dueDays = 2;
      waitingOn = "Client";
      break;
    case "Launch Ready":
      action = "Launch site";
      reason = "Final approval received. Setup DNS, SSL certs, and deploy live package.";
      dueDays = 1;
      waitingOn = "Admin";
      break;
    case "Launched":
      action = "Send handover and request testimonial";
      reason = "Site is live worldwide! Execute final handover and review request.";
      dueDays = 7;
      waitingOn = "Admin";
      break;
    case "Completed":
      action = "No action required";
      reason = "Project closed successfully. Post-launch support active.";
      dueDays = 0;
      waitingOn = "None";
      break;

    // Outbound statuses
    case "New lead":
      action = "Research business and pre-qualify lead";
      reason = "Manual lead identified. Profile target audience and potential issues.";
      dueDays = 2;
      waitingOn = "Admin";
      break;
    case "Researching":
      action = "Complete business opportunity report";
      reason = "Analysis in progress. Draft specific Quick Improvement suggestions.";
      dueDays = 2;
      waitingOn = "Admin";
      break;
    case "Sent outreach":
      action = "Wait for response or queue follow-up";
      reason = "Outbound pitch delivered. Awaiting client engagement.";
      dueDays = 3;
      waitingOn = "Client";
      break;
    case "Follow-up 1":
      action = "Check response or send follow-up 2";
      reason = "Initial follow-up sent. Queue secondary engagement attempt.";
      dueDays = 3;
      waitingOn = "Client";
      break;
    case "Follow-up 2":
      action = "Execute final outbound check";
      reason = "Secondary follow-up completed. Gauge interest or flag status.";
      dueDays = 3;
      waitingOn = "Client";
      break;
    case "Lost":
      action = "Archive lead";
      reason = "Lead marked as lost. Historical records archived.";
      dueDays = 0;
      waitingOn = "None";
      break;
    case "Do not contact":
    case "Do Not Contact":
      action = "Exclusion list active";
      reason = "Compliance check. User requested no communications.";
      dueDays = 0;
      waitingOn = "None";
      break;
  }

  // Parse reference timestamp
  let baseDate = now;
  if (item) {
    if (item.updated_at) {
      if (item.updated_at.seconds) {
        baseDate = new Date(item.updated_at.seconds * 1000);
      } else {
        const parsed = new Date(item.updated_at);
        if (!isNaN(parsed.getTime())) baseDate = parsed;
      }
    } else if (item.createdAt || item.created_at) {
      const rawC = item.createdAt || item.created_at;
      if (rawC.seconds) {
        baseDate = new Date(rawC.seconds * 1000);
      } else {
        const parsed = new Date(rawC);
        if (!isNaN(parsed.getTime())) baseDate = parsed;
      }
    }
  }

  // Auto-calculated due date
  let dueDateStr = "";
  if (item && item.next_follow_up_at) {
    dueDateStr = item.next_follow_up_at;
  } else if (dueDays > 0) {
    const dDate = new Date(baseDate.getTime() + dueDays * 24 * 60 * 60 * 1000);
    dueDateStr = dDate.toISOString().split('T')[0];
  }

  return {
    action,
    reason,
    dueDate: dueDateStr,
    waitingOn
  };
}

/**
 * Calculates follow up offset date string based on status
 */
export function getAutoFollowUpDate(status: string, baseDate: Date = new Date()): string | null {
  const normStatus = (status || "").trim();
  let offsetDays = 0;

  if (normStatus === "Proposal Sent") {
    offsetDays = 3;
  } else if (normStatus === "Deposit Requested") {
    offsetDays = 2;
  } else if (normStatus === "Assets Requested") {
    offsetDays = 4;
  } else if (normStatus === "First Preview Sent") {
    offsetDays = 3;
  } else if (normStatus === "Final Review") {
    offsetDays = 2;
  } else if (normStatus === "Launched") {
    offsetDays = 7;
  } else {
    return null;
  }

  const retDate = new Date(baseDate.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  return retDate.toISOString().split('T')[0];
}

/**
 * Auto-detect missing assets based on answers in the client intake
 */
export function detectMissingAssets(item: any): AssetTask[] {
  const tasks: AssetTask[] = [];
  if (!item) return tasks;

  const logo = (item.branding_readiness_logo || "").toLowerCase();
  const photos = (item.content_readiness_photos || "").toLowerCase();
  const copy = (item.content_readiness_copy || "").toLowerCase();
  const domain = (item.domain_status || "").toLowerCase();
  const hosting = (item.hosting_status || "").toLowerCase();
  const email = (item.business_email_status || "").toLowerCase();

  if (logo === "no" || logo === "need help" || logo === "unsure" || !logo) {
    tasks.push({
      category: "Logo / Brand Identity",
      task: "Confirm logo direction or provide simple text/logo option",
      description: "Logo assets are unconfirmed or need graphic drafting help."
    });
  }

  if (photos === "no" || photos === "need help" || photos === "unsure" || !photos) {
    tasks.push({
      category: "Imagery & Photography",
      task: "Collect photos or choose suitable stock-style imagery",
      description: "No custom imagery library supplied. Filter styled stock photography mockups."
    });
  }

  if (copy === "no" || copy === "need help" || copy === "unsure" || !copy) {
    tasks.push({
      category: "Website Copy",
      task: "Draft website copy from intake answers",
      description: "Draft textual structure and tone outline based on submitted intake details."
    });
  }

  if (domain === "no" || domain === "need help" || domain === "unsure" || !domain) {
    tasks.push({
      category: "DNS & Domain",
      task: "Confirm domain ownership or domain purchase path",
      description: "Commercial domain name holds or direct buy requirements need to be cleared."
    });
  }

  if (hosting === "no" || hosting === "need help" || hosting === "unsure" || !hosting) {
    tasks.push({
      category: "Hosting Plan",
      task: "Confirm hosting/deployment approach",
      description: "No preferred web host. Assess optimal static fast delivery options."
    });
  }

  if (email === "no" || email === "need help" || email === "unsure" || !email) {
    tasks.push({
      category: "Business Email",
      task: "Confirm business email setup requirement",
      description: "Configure workspace profiles matching custom commercial domains."
    });
  }

  return tasks;
}

/**
 * Auto-generates internal checklist tasks based on features list
 */
export function generateInternalChecklist(selectedFeatures: string[] = []): string[] {
  const baseChecklist = [
    "Confirm final scope",
    "Confirm quote/payment stage",
    "Create Drive folder",
    "Request assets",
    "Confirm domain/hosting",
    "Prepare homepage direction",
    "Build first draft",
    "Mobile QA",
    "Form testing",
    "SEO metadata",
    "Analytics setup",
    "Client review",
    "Revisions",
    "Launch prep",
    "Handover",
    "Testimonial request"
  ];

  const listSet = new Map<string, boolean>();
  baseChecklist.forEach(item => listSet.set(item, true));

  const normalized = selectedFeatures.map(f => f.toLowerCase());

  // Booking/enquiry form
  if (normalized.some(f => f.includes("booking") || f.includes("enquiry") || f.includes("form") || f.includes("contact"))) {
    [
      "Design form fields",
      "Build form",
      "Add confirmation state",
      "Add admin/client notification",
      "Test mobile submission"
    ].forEach(item => listSet.set(item, true));
  }

  // Timetable/class display
  if (normalized.some(f => f.includes("timetable") || f.includes("class") || f.includes("schedule"))) {
    [
      "Structure class/timetable content",
      "Build timetable section",
      "Test mobile timetable layout"
    ].forEach(item => listSet.set(item, true));
  }

  // Google Ads landing page
  if (normalized.some(f => f.includes("google ads") || f.includes("landing page") || f.includes("ads") || f.includes("campaign"))) {
    [
      "Write conversion headline",
      "Add clear CTA",
      "Add tracking-ready thank-you state",
      "Check loading speed"
    ].forEach(item => listSet.set(item, true));
  }

  // SEO setup
  if (normalized.some(f => f.includes("seo") || f.includes("search engine") || f.includes("search") || f.includes("optimization"))) {
    [
      "Page titles",
      "Meta descriptions",
      "Open Graph",
      "Sitemap",
      "Robots",
      "Local service keywords"
    ].forEach(item => listSet.set(item, true));
  }

  // Admin dashboard
  if (normalized.some(f => f.includes("admin") || f.includes("dashboard") || f.includes("portal"))) {
    [
      "Confirm admin fields",
      "Build protected admin view",
      "Test access protection"
    ].forEach(item => listSet.set(item, true));
  }

  // PDF proposal/quote
  if (normalized.some(f => f.includes("pdf") || f.includes("proposal") || f.includes("generation") || f.includes("quote"))) {
    [
      "Build template",
      "Test PDF generation",
      "Save PDF or Doc link"
    ].forEach(item => listSet.set(item, true));
  }

  return Array.from(listSet.keys());
}

/**
 * Calculates project temperature / priority scoring index
 */
export function calculatePriorityScore(item: any): { score: number; label: string; colorClass: string } {
  if (!item) {
    return { score: 10, label: "Low priority", colorClass: "text-slate-400 bg-slate-900 border-slate-800" };
  }

  let score = 0;
  const status = (item.status || "").trim();

  // Status scores
  if (status === "Proposal Approved") {
    score += 30;
  } else if (status === "Deposit Requested") {
    score += 35;
  } else if (status === "Deposit Paid") {
    score += 50;
  } else if (status === "Client Review" || status === "Revisions") {
    score += 25;
  } else if (status === "Launch Ready") {
    score += 40;
  } else if (status === "Completed") {
    score -= 100;
  } else if (status === "Lost" || status === "Do not contact" || status === "Do Not Contact") {
    score -= 100;
  }

  // Missing assets check
  const missingTasks = detectMissingAssets(item);
  if (missingTasks.length > 0) {
    score += 10;
  }

  // Follow up overdue check
  const today = new Date().toISOString().split('T')[0];
  if (item.next_follow_up_at && item.next_follow_up_at < today && status !== "Completed" && status !== "Lost" && !status.toLowerCase().includes("contact")) {
    score += 20;
  }

  // Label mapping
  let label = "Low priority";
  let colorClass = "text-slate-400 border-slate-800 bg-slate-950/45";

  if (score < -50) {
    label = "Ready to close";
    colorClass = "text-slate-500 border-slate-900 bg-slate-950/20";
  } else if (score >= 70) {
    label = "Urgent";
    colorClass = "text-rose-400 border-rose-900 bg-rose-950/25";
  } else if (score >= 45) {
    label = "Active project";
    colorClass = "text-cyan-400 border-cyan-900 bg-cyan-950/20";
  } else if (score >= 20) {
    label = "Needs follow-up";
    colorClass = "text-amber-400 border-amber-900 bg-amber-950/20";
  }

  return {
    score,
    label,
    colorClass
  };
}

/**
 * Website opportunities improvements report generator
 */
export function generateWebsiteCheckReport(businessName: string, issueText: string): QuickImprovementsReport {
  const cleanIssue = (issueText || "").trim();

  const issues = [
    {
      issueNoticed: cleanIssue || "Standard viewport render lag and un-optimized content loading.",
      whyItMatters: "Loading delays lower conversion rates instantly and increase mobile abandonment by up to 50%.",
      suggestedImprovement: "Implement lazy image pipelines and serve optimized bundles from CDN caches.",
      demoLink: "https://clarityspace.com/demo/fast-static"
    },
    {
      issueNoticed: "Absence of persistent primary action CTA elements above digital layouts.",
      whyItMatters: "Customers browse in quick micro-sessions; confusing menus lead to significant drop-offs.",
      suggestedImprovement: "Inject prominent floating headers and quick booking forms for mobile-first CTAs.",
      demoLink: "https://clarityspace.com/demo/action-hub"
    },
    {
      issueNoticed: "Text elements lack fluid responsive sizing across touch visual layouts.",
      whyItMatters: "High local search traffic requires absolute mobile layout perfection and viewport sizing.",
      suggestedImprovement: "Adopt fluid typography metrics and clean modern sans-serif layouts.",
      demoLink: "https://clarityspace.com/demo/mobile-responsive"
    }
  ];

  return {
    title: `3 Quick Website Improvements for ${businessName || "Your Business"}`,
    intro: `Hi there, we executed a rapid layout audit of your current digital experience. Here are three quick visual and performance gaps we observed with simple action improvements:`,
    improvements: issues,
    nextStep: "Soft next step: Would you be open to a quick 5-minute interactive staging comparison to see what a polished, ultra-fast Clarity Space layout looks like for your brand?"
  };
}

/**
 * Dynamic message template builder
 */
export function buildClientMessage(templateId: string, item: any, origin: string): string {
  if (!item) return "";
  
  const bName = item.business_name || item.businessName || "your business";
  const cName = item.contact_name || item.contactName || "Client partner";
  const drive = item.google_drive_folder_url || "[Standard Drive folder is being synchronized]";
  const proposal = item.proposal_doc_url || item.proposal_url || "[Drafting proposal document]";
  const preview = item.preview_url || item.staging_url || "[Deploying staging viewport]";
  const payment = item.payment_link || "[Preparing payment ledger]";
  const amt = item.deposit_amount || "$1,500 AUD";
  const token = item.secure_token || "sample-token";
  const feedback = token ? `${origin}/project-feedback/${token}` : "[Awaiting security sync]";
  const statusHub = token ? `${origin}/project-status/${token}` : "[Awaiting portal access]";

  const templates: { [key: string]: string } = {
    intake_received: `Hi ${cName},

Thank you for submitting your client intake questionnaire for ${bName}! We have successfully received your answers and are currently analyzing your requirements and custom features.

We will prepare our tailored recommendations and setup plan within 24 hours.

Warmly,
Clarity Space Administrative Team`,

    proposal_ready: `Hi ${cName},

Great news! Your detailed custom website proposal for ${bName} is ready and waiting for your review. We've outlined the visual scope, core features, full pricing breakdowns, and launch timeline.

You can review and approve your proposal here:
${proposal}

Let us know if you have any questions before signing off!

Best regards,
Clarity Space Team`,

    question_reply: `Hi ${cName},

Thank you for reaching out with your question regarding the ${bName} project! Here is the clarification regarding your inquiry.

[Insert custom reply detail here...]

Let us know if this helps clarify or if you need any additional adjustments!

Best regards,
Clarity Space Team`,

    scope_change_received: `Hi ${cName},

We have received your request for adjustments to the project scope for ${bName}. Our development team is checking the details to update our visual architecture and proposal agreements accordingly.

We will shoot through the updated proposal review draft shortly.

Best regards,
Clarity Space Team`,

    updated_proposal_ready: `Hi ${cName},

We have successfully updated your website proposal for ${bName} with your requested scope adjustments! It is now fully active and ready for your signoff.

Review updated scope and finalize approval here:
${proposal}

Warmly,
Clarity Space Team`,

    proposal_approved: `Hi ${cName},

Fantastic! Your proposal agreement for ${bName} has been fully approved and signed off. We are thrilled to partner with you on this build!

Our administrator is preparing your initial invoice setup and secure Google Drive directories right now. Stay tuned for the payment details coming up next.

Excitedly,
Clarity Space Team`,

    deposit_request: `Hi ${cName},

To officially kick off development for ${bName} and secure your staging allocation slot, please complete the initial project deposit of ${amt}.

You can securely complete the milestone payment here:
${payment}

Once received, we will initialize your secure brand collection directory and schedule the development kickoff.

Best regards,
Clarity Space Team`,

    deposit_reminder: `Hi ${cName},

This is a friendly follow-up regarding the milestone deposit for ${bName}'s custom build.

Milestone Invoice Link:
${payment}

Completing this secure deposit will unblock our developer space and allow us to start construction according to our agreed timeline. Let us know if you need any help!

Warmly,
Clarity Space Team`,

    asset_handover_request: `Hi ${cName},

Your deposit payment for ${bName} has been securely verified! We are ready to gather your brand assets, logo files, preferred photographs, and text copy.

Please upload your files directly to your secure Google Drive directory here:
${drive}

We have initialized dedicated directories for Logo, Brand Assets, Website Content, and Reference materials.

Excited to see what you have!

Best regards,
Clarity Space Team`,

    missing_asset_reminder: `Hi ${cName},

This is a gentle reminder to assist us in collecting your necessary assets (logos, content copy, or graphics) for the ${bName} project.

Please upload them to your Google Drive folder:
${drive}

Having these materials saved helps our developer craft precise layout directions without delays!

Warmly,
Clarity Space Team`,

    build_started: `Hi ${cName},

Exciting milestone! All assets for ${bName} are verified and we have officially commenced active coding and staging build construction.

Our designers are wiring your layout styles, responsive blocks, and feature states. We will deliver the first preview of your customized layout within a few days!

Best regards,
Clarity Space Team`,

    first_preview_ready: `Hi ${cName},

Your first live staging preview for ${bName} is fully ready! We've deployed a responsive testing sandbox for your review.

Live Staging Link:
${preview}

Once viewed, please log any tweaks, text edits, or layout comments directly in your secure client status feedback board here:
${feedback}

We look forward to aligning this build with your precise vision!

Warmly,
Clarity Space Team`,

    feedback_reminder: `Hi ${cName},

This is a gentle follow-up regarding the responsive staging preview for ${bName}.

Preview URL:
${preview}

Please review the live pages and submit any alignment notes or content adjustments through your client feedback terminal so we can construct the revisions phase:
${feedback}

Looking forward to your thoughts!

Best regards,
Clarity Space Team`,

    final_review_ready: `Hi ${cName},

All requested revisions have been successfully compiled and polished for ${bName}! We have completed our quality checks and are ready for your final visual signoff.

Inspect the latest live layout here:
${preview}

Once satisfied, please confirm launch authorization in your Secure Portal:
${statusHub}

Warmly,
Clarity Space Team`,

    launch_ready: `Hi ${cName},

Your customized layout for ${bName} is fully approved and authorized for launch! We are preparing the primary production release.

We are deploying the DNS nameserver parameters, optimizing assets, configuring final SSL security keys, and indexing search engine metadata.

The live site will be ready globally within 24 hours!

Excitedly,
Clarity Space Team`,

    site_launched: `Hi ${cName},

Congratulations! ${bName} is officially live and active in real-time globally!

Live Production Address:
${preview} (or visit your live domain path)

Your secure, static build is loaded onto our ultra-fast CDN network for instant delivery. We have also index-registered your domain metadata in search engine directories.

Best regards,
Clarity Space Team`,

    handover_message: `Hi ${cName},

We have finalized the complete project handover for ${bName}! All master brand assets, static build source materials, and credentials have been archived in your Google Drive:
${drive}

Your live digital asset is robustly optimized and secured for peak operation. It has been a pleasure collaborating with you on this project!

Warmly,
Clarity Space Team`,

    testimonial_request: `Hi ${cName},

Now that ${bName} is successfully live and driving engagement, we would love to hear about your experience working with Clarity Space!

Please share a brief review or testimonial regarding our craftsmanship and partnership here:
${feedback}

Your story helps other businesses make informed choices. Thank you for your support!

With gratitude,
The Clarity Space Team`
  };

  return templates[templateId] || "";
}
