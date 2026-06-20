import { useState, ReactNode } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  Rocket, Calendar, CheckSquare, Sparkles, CheckCircle2, UserCheck, 
  Settings, Terminal, HelpCircle, ArrowRight, ShieldCheck, Clock, Layers 
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

interface ProcessStage {
  phase: number;
  title: string;
  duration: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  shortLabel: string;
  summary: string;
  whatWeDo: string[];
  clientRole: string;
  deliverable: string;
}

export default function ProcessPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [currency, setCurrency] = useState<Currency>("AUD");

  const processStages: ProcessStage[] = [
    {
      phase: 1,
      title: "Discovery & Scope Blueprinting",
      duration: "1–2 Days",
      icon: Clock,
      iconBg: "bg-cyan-950/40",
      iconColor: "text-cyan-400",
      shortLabel: "Mapping goals & sitemaps",
      summary: "Every project kicks off with a rigorous mapping phase. We review your intake submission, cross-reference competitor structures, and draft a granular scope detailing exactly what landing segments, modules, and content hierarchies are required—all with absolutely zero upfront cost or deposit required.",
      whatWeDo: [
        "Interactive intake sheet alignment review",
        "Competitor layout & local keyword search audits",
        "Initial structural sitemap layout mapping",
        "Detailed fixed-scope proposal sheet dispatcher"
      ],
      clientRole: "Complete the digital intake form, specify design references or current brand values, and agree on core sitemap bounds.",
      deliverable: "An itemized scope checklist with complete fixed-cost parameters — NO billing surprises."
    },
    {
      phase: 2,
      title: "Interactive Typography & Interface Designs",
      duration: "4–6 Days",
      icon: Layers,
      iconBg: "bg-indigo-950/40",
      iconColor: "text-indigo-400",
      shortLabel: "High-precision wireframing",
      summary: "Before typing a line of application code, we mock up every viewport of your new site. We compile pristine initial design drafts completely free of charge. You get to inspect layout wireframes, review real copy flows, and ensure the design represents your brand perfectly before making any financial commitment.",
      whatWeDo: [
        "Curating high-contrast visual palette guidelines",
        "Pairing elegant display fonts (e.g. Space Grotesk) with legible system bodies",
        "Creating high-fidelity mobile + laptop wireframe blueprints",
        "Polishing booking, appointment blocks, and contact submission wireframes"
      ],
      clientRole: "Provide brand logos or existing color assets, review layout wireframes, request dynamic enhancements, and authorize the design draft once satisfied.",
      deliverable: "Responsive high-fidelity layout screens which you can test and approve. Zero deposit is paid until this deliverable is fully approved by you."
    },
    {
      phase: 3,
      title: "High-Performance Clean Web Engineering",
      duration: "8–12 Days",
      icon: Terminal,
      iconBg: "bg-purple-950/40",
      iconColor: "text-purple-400",
      shortLabel: "Writing custom performant code",
      summary: "Once you approve the initial design drafts, the kickoff deposit is processed to initialize main framework engineering. Under the hood, we write clean React codebase structures, connect automated form routing mechanisms, build database directories, and deploy client modifications with edge CDN distribution rules.",
      whatWeDo: [
        "Custom development with React and Vite for sub-millisecond page loading speed",
        "Injecting responsive Tailwind CSS grids for perfect touch targets on dynamic viewports",
        "Developing forms with secure serverless routing blocks",
        "Building CMS admin dashboards or operators' database panels"
      ],
      clientRole: "Review and sign off on the design draft. Clear the kickoff milestone deposit invoice to commence the main code framework initialization.",
      deliverable: "A private development staging link where you can click buttons, trigger form notifications, and view responsive pages in real-time."
    },
    {
      phase: 4,
      title: "Structured Pre-Launch Quality Auditing",
      duration: "2–3 Days",
      icon: CheckSquare,
      iconBg: "bg-rose-950/40",
      iconColor: "text-rose-400",
      shortLabel: "Rigorous testing & QA validation",
      summary: "Our websites must pass a rigid pre-launch assessment. We run multiple browser tests, stress-test booking estimators, check edge contact form notifications, and review local Google Search optimization profiles.",
      whatWeDo: [
        "Testing responsive form submissions across Safari, Chrome, and iOS viewports",
        "Validating semantic WCAG text contrast parameters and keyboard accessibility hooks",
        "Benchmarking load speeds using industry standard indicators (e.g., Google PageSpeed Insights)",
        "Reviewing and optimizing sitemaps, robots tags, and social graphic previews"
      ],
      clientRole: "Perform a final walkthrough of approved content copy, sitemap spelling, and test form dispatch confirmations.",
      deliverable: "A polished and validated pre-launch report showing perfect metrics ready for domain routing."
    },
    {
      phase: 5,
      title: "DNS Registrar live Connection & Support",
      duration: "1–2 Days",
      icon: Rocket,
      iconBg: "bg-emerald-950/40",
      iconColor: "text-emerald-400",
      shortLabel: "Going live smoothly",
      summary: "Going live represents zero customer disruption. We safely assist with domain mapping configurations, bind SSL certificates for HTTPS security, connect Google Search Console tags, and hand over straightforward documentation so clients can edit text in seconds.",
      whatWeDo: [
        "Surgical mapping of .com / .com.au domains on DNS name host records",
        "Enforcing instant SSL cloud verification rules",
        "Registering XML sitemaps directly with Google Search Console index systems",
        "Providing brief tutorial recordings and editing panels guide checklists"
      ],
      clientRole: "Provide secure access to domain registrar (GoDaddy, Namecheap, hover, etc.) or update registrar fields according to our instructions.",
      deliverable: "Your professional website live on the global grid, completely secure, with a 30-day initial monitoring period."
    }
  ];

  const handleScrollToSection = (sectionId: string) => {
    window.location.href = `/?sec=${sectionId}`;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white relative flex flex-col overflow-x-hidden pt-16 sm:pt-20">
      <BackgroundEffects />

      {/* Embedded Header component */}
      <Header 
        onScrollToSection={handleScrollToSection} 
        activeSection="process" 
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
      />

      {/* Main Container Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10 w-full text-left">
        
        {/* Intro Hero Section Header */}
        <section id="process-intro" className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-bold px-3 py-1 bg-cyan-950/35 border border-cyan-500/20 rounded-full inline-block">
            Our Development Workflow
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight text-white mt-4 leading-none">
            A strategic, transparent <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">pathway to launch.</span>
          </h1>
          <p className="text-slate-400 mt-6 text-sm sm:text-base font-light leading-relaxed max-w-2xl">
            We believe professional web development should have zero surprises. Our 5-step strategic implementation model keeps you informed, respects your time, and guarantees fixed-scope pricing on every single milestone.
          </p>
        </section>

        {/* Vertical/Horizontal Staged Stack of Process Cards */}
        <section id="process-steps-timeline" className="relative">
          {/* Vertical connecting line in the center/left for large viewports */}
          <div className="absolute left-4 lg:left-1/2 top-10 bottom-24 w-[2px] bg-gradient-to-b from-cyan-500 via-indigo-500 to-slate-800 pointer-events-none hidden md:block lg:-translate-x-1/2"></div>

          <div className="space-y-12 lg:space-y-20 relative">
            {processStages.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isEven = idx % 2 === 0;

              return (
                <FadeIn key={stage.phase}>
                  <div className="relative flex flex-col md:flex-row items-start lg:items-center justify-between gap-6 md:gap-12 lg:gap-20">
                    
                    {/* Circle timeline bullet absolute on viewport axis */}
                    <div className="absolute left-0 lg:left-1/2 top-4 lg:top-1/2 -translate-x-[5px] lg:-translate-x-1/2 lg:-translate-y-1/2 z-20 hidden md:flex items-center justify-center">
                      <div className={`h-11 w-11 rounded-full border-2 border-slate-900 bg-[#020617] flex items-center justify-center font-display font-black text-sm text-cyan-400 transition-transform hover:scale-110 shadow-lg ${stage.iconBg}`}>
                        0{stage.phase}
                      </div>
                    </div>

                    {/* Left block panel layout depends on parity */}
                    <div className={`w-full md:pl-12 lg:pl-0 lg:w-[45%] ${isEven ? 'lg:order-1' : 'lg:order-2 text-left'}`}>
                      <div className="p-6 sm:p-8 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden text-left hover:border-cyan-500/20 transition-all duration-300">
                        
                        {/* Glow light accent inside card */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/2 to-indigo-505/2 pointer-events-none"></div>

                        {/* Top layout row */}
                        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">
                            Milestone Phase 0{stage.phase} • {stage.duration}
                          </span>
                          <span className="px-2.5 py-0.5 bg-cyan-950/50 border border-cyan-500/15 rounded-lg text-[9px] font-mono text-cyan-400 uppercase tracking-wider block">
                            {stage.duration}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight leading-dense">
                          {stage.title}
                        </h2>
                        
                        <p className="text-slate-400 text-xs sm:text-sm font-light leading-relaxed mt-3">
                          {stage.summary}
                        </p>

                        <div className="h-[1px] bg-white/5 my-5"></div>

                        {/* What we actually do list */}
                        <div className="space-y-2.5">
                          <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#22d3ee] font-bold">What is done under-the-hood:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-slate-300 font-light leading-snug">
                            {stage.whatWeDo.map((todo, tIdx) => (
                              <div key={tIdx} className="flex gap-2 items-start">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                                <span>{todo}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Middle divider separator axis spacing spacer for large desktops */}
                    <div className="hidden lg:block lg:w-[5%]"></div>

                    {/* Right side block panel for deliverables and roles */}
                    <div className={`w-full md:pl-12 lg:pl-0 lg:w-[45%] ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                      <div className="p-6 sm:p-8 rounded-3xl border border-white/5 bg-slate-950/40 relative overflow-hidden text-left hover:border-indigo-500/20 transition-all duration-300">
                        
                        {/* Interactive checklist bullet lists representation */}
                        <div className="space-y-6">
                          
                          <div className="space-y-2 relative pl-6 border-l border-white/5">
                            <span className="h-5 w-5 rounded bg-slate-900 border border-slate-800 text-slate-500 font-display font-bold text-[9px] flex items-center justify-center absolute left-[-11px] top-0">C</span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Your Responsibility</span>
                            <p className="text-slate-300 text-xs font-light leading-relaxed">
                              {stage.clientRole}
                            </p>
                          </div>

                          <div className="space-y-2 relative pl-6 border-l border-cyan-500/10">
                            <span className="h-5 w-5 rounded bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 font-display font-bold text-[9px] flex items-center justify-center absolute left-[-11px] top-0">D</span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">Phase Deliverable</span>
                            <p className="text-white text-xs font-medium leading-relaxed">
                              {stage.deliverable}
                            </p>
                          </div>

                        </div>

                      </div>
                    </div>

                  </div>
                </FadeIn>
              );
            })}
          </div>
        </section>

        {/* Zero Risk Assurance Card */}
        <section id="process-zero-risk-assurance" className="mt-16 sm:mt-24 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-950/20 via-emerald-950/40 to-cyan-950/25 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 text-left flex flex-col md:flex-row items-start gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/15">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                🛡️ 100% Zero-Risk Draft-First Assurance
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight">
                Review and approve your custom design draft before paying any setup deposits
              </h3>
              <p className="text-slate-350 text-xs sm:text-sm font-light leading-relaxed max-w-3xl">
                We believe in complete transparency and backing our craft. That is why we provide a complete custom visual design draft of your website for you to review and request modifications on <span className="font-semibold text-white">before requiring a single dollar of mobilization deposits</span>. If you decide the proposed layout or direction is not correct for your brand, there is no lock-in, no fee, and $0 obligations.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed FAQ section regarding onboarding, hosting requirements, ownership and support timelines */}
        <section id="process-post-faq" className="mt-20 sm:mt-32 max-w-4xl mx-auto border-t border-white/5 pt-16 sm:pt-24 text-left">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs uppercase tracking-widest text-cyan-454 font-mono font-bold">Process FAQ</span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mt-2">
              Common process &amp; expectations questions
            </h3>
            <p className="text-slate-450 mt-2 text-xs sm:text-sm font-light">
              Here is exactly how ownership, revisions, credentials, and timeline delays are aligned.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            {[
              {
                q: "Is there any financial risk to get started?",
                a: "Absolutely zero financial risk. We compile a bespoke interactive design draft of your homepage and primary visual direction completely free. You only pay your starting co-investment mobilization invoice once you are thrilled with the draft and instruct us to commence framework engineering."
              },
              {
                q: "Do I completely own the website and source code?",
                a: "Absolutely. Once the final invoice is paid, complete ownership of the static files, design mockups, asset lists, and domain configurations is transferred directly to your company. We host under your names or hand over source repositories fully so you are never locked in."
              },
              {
                q: "What happens if there are delays on my side in providing copywriting or photos?",
                a: "No problem. Our fixed schedule includes standard placeholder layouts during development. If copy additions are delayed, we pause target launch milestones, complete structural features, and resume when files are ready with no penalty fees."
              },
              {
                q: "How many visual layout iterations or revisions do I get?",
                a: "Every step includes robust walkthrough check windows. Phase 2 (Design Wireframing) includes up to 3 complete revision cycles where we polish typography, spacing layouts, and content boxes based on your feedback so they are approved before any engineering starts."
              },
              {
                q: "What is required to connect my domain registrar, and is it secure?",
                a: "We only require DNS configuration updates (CNAME and ALIAS parameters). We assist you securely over a quick videoconference screen-share or guide you on how to update them yourself without ever needing to expose passwords."
              }
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/35 border border-white/5 space-y-2">
                <span className="font-semibold text-white tracking-tight block flex gap-2 items-start text-xs sm:text-sm">
                  <HelpCircle className="w-4 h-4 text-cyan-405 shrink-0 mt-0.5" />
                  {item.q}
                </span>
                <p className="text-slate-400 font-light text-xs leading-relaxed pl-6">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Lower section CTA */}
        <section id="process-lower-cta" className="mt-20 sm:mt-28 text-center max-w-xl mx-auto glass-card rounded-3xl p-8 sm:p-12 border border-white/5 flex flex-col items-center">
          <Sparkles className="w-8 h-8 text-cyan-400 mb-4 animate-pulse" />
          <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
            Ready to initiate Step 1?
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed mb-8">
            Take 5 minutes to submit your basic requirements. We will analyze your baseline and deliver your structural project blueprint in 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link
              to="/client-intake?source=process-cta"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/10 cursor-pointer text-center block"
            >
              Configure Intake Estimate
            </Link>
            <Link
              to="/work"
              className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-705 text-sm font-semibold transition-all cursor-pointer block text-center"
            >
              Analyze Client Examples
            </Link>
          </div>
        </section>

      </main>

      {/* Embedded Footer component */}
      <Footer onScrollToSection={handleScrollToSection} language={language} />
    </div>
  );
}
