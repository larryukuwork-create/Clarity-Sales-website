import React, { useState } from "react";
import { 
  Palette, 
  Layers, 
  CalendarRange, 
  TrendingUp, 
  Search, 
  ShieldCheck,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Language, getServices, trans } from "../translations";

// Helper to pull the icon component
const renderServiceIcon = (iconName: string) => {
  switch (iconName) {
    case "Palette":
      return <Palette className="w-5 h-5 text-cyan-400" />;
    case "Layers":
      return <Layers className="w-5 h-5 text-blue-400" />;
    case "CalendarRange":
      return <CalendarRange className="w-5 h-5 text-purple-400" />;
    case "TrendingUp":
      return <TrendingUp className="w-5 h-5 text-cyan-400" />;
    case "Search":
      return <Search className="w-5 h-5 text-emerald-400" />;
    case "ShieldCheck":
      return <ShieldCheck className="w-5 h-5 text-blue-400" />;
    default:
      return <Palette className="w-5 h-5 text-cyan-400" />;
  }
};

interface ServiceCardProps {
  key?: string | number;
  service: any;
  onClick: () => void;
  language: Language;
}

function ServiceCard({ service, onClick, language }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Custom states for each specific feature preview
  const [theme, setTheme] = useState<"cyan" | "rose" | "amber">("cyan");
  const [activeTab, setActiveTab] = useState<"features" | "faqs">("features");
  const [selectedDay, setSelectedDay] = useState<"Mon" | "Wed" | "Fri">("Mon");
  const [selectedTime, setSelectedTime] = useState<"10am" | "3pm">("10am");
  const [budgetVal, setBudgetVal] = useState<1200 | 2500 | 5000>(1200);
  const [keywordText, setKeywordText] = useState("");
  const [diagStatus, setDiagStatus] = useState<"idle" | "running" | "success">("idle");

  const runDiag = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDiagStatus("running");
    setTimeout(() => {
      setDiagStatus("success");
    }, 1100);
  };

  const renderVisualizer = () => {
    switch (service.id) {
      case "website-redesign":
        return (
          <div className="mt-4 p-3.5 bg-[#020617]/80 rounded-xl border border-white/5 space-y-3 relative overflow-hidden pointer-events-auto">
             <div className="flex justify-between items-center relative z-10 text-[10px] font-mono text-slate-500 mb-2">
               <span>Before Redesign</span>
               <span className="text-cyan-400">After Launch</span>
             </div>
             
             <div className="flex gap-2">
               {/* Before */}
               <div className="w-1/2 p-2 rounded border border-white/5 bg-slate-900/30 opacity-60">
                 <div className="h-1.5 w-3/4 rounded bg-white/10 mb-2" />
                 <div className="h-1 w-full rounded bg-white/5 mb-1" />
                 <div className="h-1 w-5/6 rounded bg-white/5" />
                 <div className="mt-2 h-3 w-1/2 rounded bg-white/5" />
               </div>
               
               {/* After */}
               <div className="w-1/2 p-2 rounded border border-cyan-500/20 bg-cyan-950/20">
                 <div className="h-2 w-3/4 rounded bg-cyan-400 mb-2" />
                 <div className="h-1 w-full rounded bg-white/20 mb-1" />
                 <div className="h-1 w-5/6 rounded bg-white/20" />
                 <div className="mt-2 h-4 w-1/2 rounded bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]" />
               </div>
             </div>
          </div>
        );

      case "business-website-design":
        return (
          <div className="mt-4 p-3.5 bg-[#020617]/80 rounded-xl border border-white/5 space-y-3 relative overflow-hidden pointer-events-auto">
            <div className="flex justify-between items-center relative z-10">
              <span className="text-[10px] font-mono text-slate-500">Live Brand Theme:</span>
              <div className="flex gap-1.5">
                {(["cyan", "rose", "amber"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={(e) => { e.stopPropagation(); setTheme(t); }}
                    className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                      t === "cyan" ? "bg-cyan-400 border-cyan-300" : t === "rose" ? "bg-rose-500 border-rose-400" : "bg-amber-400 border-amber-300"
                    } ${theme === t ? "ring-2 ring-white/50 scale-110" : "opacity-60 hover:opacity-100 scale-90"}`}
                  />
                ))}
              </div>
            </div>
            
            <div className={`p-3 rounded-lg border transition-all duration-350 relative z-10 ${
              theme === "cyan" 
                ? "bg-cyan-950/15 border-cyan-500/20" 
                : theme === "rose" 
                ? "bg-rose-950/15 border-rose-500/20" 
                : "bg-amber-950/15 border-amber-500/20"
            }`}>
              <div className="flex items-center gap-1.5 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  theme === "cyan" ? "bg-cyan-400" : theme === "rose" ? "bg-rose-500" : "bg-amber-400"
                }`} />
                <div className="h-2 w-14 rounded bg-white/20" />
              </div>
              <div className="space-y-1.5 mb-3">
                <div className="h-1.5 w-full rounded bg-white/10" />
                <div className="h-1.5 w-5/6 rounded bg-white/5" />
              </div>
              <div className="flex justify-between items-center">
                <div className={`h-4.5 px-2.5 rounded-md text-[8px] font-bold flex items-center justify-center transition-all ${
                  theme === "cyan" 
                    ? "bg-cyan-400 text-slate-950" 
                    : theme === "rose" 
                    ? "bg-rose-500 text-white" 
                    : "bg-amber-400 text-slate-950"
                }`}>
                  Interactive UI Preview
                </div>
                <div className="text-[8px] font-mono text-slate-450">99% Score</div>
              </div>
            </div>
          </div>
        );

      case "service-website":
        return (
          <div className="mt-4 p-3.5 bg-[#020617]/80 rounded-xl border border-white/5 space-y-2.5 relative pointer-events-auto">
            <div className="flex gap-1 border-b border-white/5 pb-1.5">
              {(["features", "faqs"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                  className={`px-2.5 py-0.5 rounded text-[9px] font-mono capitalize transition-all cursor-pointer ${
                    activeTab === tab 
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/20 font-semibold" 
                      : "text-slate-500 hover:text-slate-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {activeTab === "features" ? (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between text-[10px] bg-white/5 p-1 px-2 rounded border border-white/5 text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-400 text-[10px]">✓</span> 
                    <span>Fast Loading layouts</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono">350ms</span>
                </div>
                <div className="flex items-center justify-between text-[10px] bg-white/5 p-1 px-2 rounded border border-white/5 text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-400 text-[10px]">✓</span>
                    <span>Service Landing Blueprints</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono">SEO ready</span>
                </div>
              </div>
            ) : (
              <div className="p-2 text-[9.5px] text-slate-400 leading-normal italic bg-white/5 rounded border border-white/5 animate-fadeIn text-left">
                "Are customizable contact fields supported?" <br />
                <span className="text-blue-300 block font-normal mt-1 font-sans not-italic">
                  → Yes! Standard forms, map cards &amp; file handlers are fully configurable.
                </span>
              </div>
            )}
          </div>
        );

      case "booking-registration-website":
        return (
          <div className="mt-4 p-3.5 bg-[#020617]/80 rounded-xl border border-white/5 space-y-3 relative pointer-events-auto">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500">Pick Day:</span>
              <div className="flex gap-1">
                {(["Mon", "Wed", "Fri"] as const).map((day) => (
                  <button
                    key={day}
                    onClick={(e) => { e.stopPropagation(); setSelectedDay(day); }}
                    className={`px-2 py-0.5 text-[8.5px] font-bold rounded transition-all cursor-pointer ${
                      selectedDay === day 
                        ? "bg-purple-500 text-white" 
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 font-medium">Session:</span>
              <div className="flex gap-1.5">
                {(["10am", "3pm"] as const).map((time) => (
                  <button
                    key={time}
                    onClick={(e) => { e.stopPropagation(); setSelectedTime(time); }}
                    className={`px-2 py-0.5 text-[8.5px] font-bold rounded transition-all cursor-pointer ${
                      selectedTime === time 
                        ? "bg-purple-500 text-white" 
                        : "bg-white/5 text-slate-450 hover:bg-white/10"
                    }`}
                  >
                    {time === "10am" ? "10:00 AM" : "3:00 PM"}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-purple-950/20 text-purple-300 rounded border border-purple-500/10 text-[9.5px] font-mono py-1 text-center font-bold">
               Confirmed schedule: {selectedDay} at {selectedTime === "10am" ? "10:00 AM" : "3:00 PM"} ✅
            </div>
          </div>
        );

      case "google-ads-setup":
        return (
          <div className="mt-4 p-3.5 bg-[#020617]/80 rounded-xl border border-white/5 space-y-2.5 relative pointer-events-auto">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500">Preset Budget Setup:</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400">AUD {budgetVal.toLocaleString()}</span>
            </div>
            
            <div className="flex gap-1 justify-between">
              {([1200, 2500, 5000] as const).map((b) => (
                <button
                  key={b}
                  onClick={(e) => { e.stopPropagation(); setBudgetVal(b); }}
                  className={`text-[8.5px] font-bold py-0.5 px-2 rounded-lg border transition-all cursor-pointer ${
                    budgetVal === b 
                      ? "bg-cyan-500/20 text-cyan-305 border-cyan-500/40 font-semibold" 
                      : "bg-white/5 text-slate-450 border-white/5 hover:bg-white/10"
                  }`}
                >
                  {b >= 1000 ? `AUD ${b/1000}k` : `AUD ${b}`}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 text-center text-[8px] bg-slate-950/70 rounded-lg p-2 border border-white/5">
              <div>
                <span className="text-slate-500 block text-[6.5px] uppercase font-mono tracking-wider">Impressions</span>
                <span className="text-white font-bold text-[10px] font-mono block mt-0.5">
                  {budgetVal === 1200 ? "4,500–12,000" : budgetVal === 2500 ? "10k–25k" : "22k–55k"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[6.5px] uppercase font-mono tracking-wider">Lead Clicks</span>
                <span className="text-cyan-400 font-bold text-[10px] font-mono block mt-0.5">
                  {budgetVal === 1200 ? "180–480" : budgetVal === 2500 ? "400–1,000" : "880–2,200"}
                </span>
              </div>
            </div>
          </div>
        );

      case "seo-foundation-setup":
        return (
          <div className="mt-4 p-3.5 bg-[#020617]/80 rounded-xl border border-white/5 space-y-2 pointer-events-auto text-left">
            <div className="flex gap-1.5 items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">Live Search Simulator:</span>
              <span className="text-[8px] text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-1 py-0.5 rounded font-mono font-bold">ACTIVE</span>
            </div>
            <input
              type="text"
              placeholder="e.g. Swimming School, Dentist, Accountant"
              value={keywordText}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setKeywordText(e.target.value)}
              className="w-full text-[10px] px-2.5 py-1 bg-slate-950 border border-white/10 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 font-sans"
            />
            <div className="border border-[#1a1c1e] bg-slate-950/70 rounded-lg p-2 space-y-0.5">
              <span className="text-[7.5px] text-slate-500 block">google.com ▸ search</span>
              <div className="text-[9.5px] text-[#8ab4f8] leading-tight font-semibold hover:underline cursor-pointer truncate">
                {keywordText ? keywordText : "Your Business Solution"} | Growth Agency
              </div>
              <p className="text-[7px] text-slate-400 leading-normal line-clamp-1">
                Fast loading, custom service timetables, organic local search indexing.
              </p>
            </div>
          </div>
        );

      case "website-maintenance":
        return (
          <div className="mt-4 p-3.5 bg-[#020617]/80 rounded-xl border border-white/5 space-y-2.5 pointer-events-auto">
            <div className="flex justify-between items-center text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-slate-300 font-bold text-[9px]">Server: Live</span>
              </div>
              <span className="text-[9.5px] font-mono text-slate-450">Uptime: 99.98%</span>
            </div>

            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full bg-blue-400 transition-all ${diagStatus === "running" ? "w-full duration-1000" : diagStatus === "success" ? "w-full" : "w-1/3"}`} />
            </div>

            <div className="flex items-center justify-between">
              {diagStatus === "idle" ? (
                <button
                  onClick={runDiag}
                  className="w-full text-center text-[8.5px] font-bold py-1 px-2 rounded bg-blue-500 hover:bg-blue-450 text-slate-950 transition-all uppercase tracking-wider cursor-pointer font-sans"
                >
                  Run Cloud Diagnostic
                </button>
              ) : diagStatus === "running" ? (
                <span className="w-full text-center text-[8.5px] font-mono text-blue-400 animate-pulse font-bold block">
                  🔍 Checking security nodes...
                </span>
              ) : (
                <div className="w-full text-center py-1 bg-emerald-950/30 text-emerald-400 rounded border border-emerald-800/10 text-[9px] font-mono font-bold animate-fadeIn flex items-center justify-center gap-1">
                  <span>✔ Security Diagnostic Passed</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDiagStatus("idle"); }} 
                    className="text-[8px] underline text-slate-400 ml-1 hover:text-white"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative glass-card rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full ${
        isHovered
          ? "border-cyan-500/30 bg-white/10 shadow-[0_20px_40px_rgba(34,211,238,0.15)] translate-y-[-5px]" 
          : "border-white/10"
      }`}
    >
      {/* Background flow gradient on hover */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 via-blue-500/0 to-purple-500/0 transition-opacity duration-300 pointer-events-none ${
        isHovered ? "opacity-100 from-cyan-500/10 to-purple-500/10" : "opacity-0"
      }`} />

      <div>
        {/* Top Bar inside card */}
        <div className="flex justify-between items-center mb-5">
          <div className="p-2.5 rounded-xl bg-[#020617]/50 backdrop-blur-md shadow-inner border border-white/10 flex items-center justify-center transition-transform duration-500 hover:scale-110">
            {renderServiceIcon(service.iconName)}
          </div>
          {service.badge && (
            <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 font-semibold rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {service.badge}
            </span>
          )}
        </div>

        {/* Service Title */}
        <h3 className="text-base font-display font-semibold text-white tracking-tight mb-2 transition-colors">
          <span className={isHovered ? "text-cyan-400" : ""}>{service.title}</span>
        </h3>

        {/* Service Description */}
        <p className="text-slate-400 text-xs font-light leading-relaxed mb-4">
          {service.description}
        </p>

        {/* Dynamic Mockup Feature Visualization */}
        {renderVisualizer()}
      </div>

      {/* Key Benefits List inside Card */}
      <div className="border-t border-white/5 pt-4 mt-5">
        <div className="space-y-2.5">
          {service.benefits.map((benefit: string, bIdx: number) => (
            <div key={bIdx} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
              <span className="text-xs text-slate-300 font-light">{benefit}</span>
            </div>
          ))}
        </div>

        {/* Action Link indicator */}
        <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors">
          <span>
            {service.id === "booking-registration-website" || service.id === "business-website-design" || service.id === "service-website"
              ? "View associated build package"
              : "View pricing details in Add-ons"}
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </div>
      </div>

    </div>
  );
}

interface ServicesProps {
  onScrollToSection: (sectionId: string) => void;
  onSelectServicePackage: (pkgId: string) => void;
  language: Language;
}

export default function Services({ onScrollToSection, onSelectServicePackage, language }: ServicesProps) {
  const t = trans[language];
  const translatedServices = getServices(language);

  // Map service item IDs to corresponding pricing plans
  const handleServiceClick = (serviceId: string) => {
    if (serviceId === "booking-registration-website") {
      onSelectServicePackage("booking");
    } else if (serviceId === "business-website-design") {
      onSelectServicePackage("starter");
    } else if (serviceId === "service-website") {
      onSelectServicePackage("standard");
    } else if (serviceId === "seo-foundation-setup" || serviceId === "google-ads-setup" || serviceId === "website-maintenance") {
      onScrollToSection("addons");
    } else {
      onScrollToSection("pricing");
    }
  };

  return (
    <section 
      id="services" 
      className="py-18 bg-transparent relative overflow-hidden text-left"
    >
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#0e172c_0%,transparent_50%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="md:flex items-end justify-between mb-12">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
              Our Expertise Areas
            </span>
            <h2 className="text-3xl font-display font-bold text-white tracking-tight mt-2 sm:text-4xl">
              {t.servicesTitle}
            </h2>
            <p className="text-slate-400 mt-3 font-light leading-relaxed">
              {t.servicesSubtitle}
            </p>
          </div>
          
          <button
            onClick={() => onScrollToSection("comparison")}
            className="mt-4 md:mt-0 inline-flex items-center gap-1 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors group cursor-pointer"
          >
            Compare Package Pricing
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        {/* Services Grid with stateful, visual cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {translatedServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => handleServiceClick(service.id)}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
