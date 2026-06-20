import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Info, Sparkles, Scale, Search, Sliders, ArrowRight } from "lucide-react";
import { Language, Currency, getPackages, getServices, trans, formatPrice } from "../translations";

interface ServiceComparisonProps {
  language: Language;
  currency: Currency;
  activePackageId: string;
  onSelectPackage: (pkgId: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

interface FeatureComparisonRow {
  name: string;
  category: "foundation" | "features" | "growth" | "support";
  description: string;
  landing_page: string | boolean;
  small_business_website: string | boolean;
  growth_website_client_workflow: string | boolean;
}

export default function ServiceComparison({
  language,
  currency,
  activePackageId,
  onSelectPackage,
  onScrollToSection,
}: ServiceComparisonProps) {
  const t = trans[language];
  const packagesList = getPackages(language, currency);
  const servicesList = getServices(language);

  // Mode state: compare Pricing Packages ("packages") or Service Categories ("services")
  const [compareMode, setCompareMode] = useState<"packages" | "services">("packages");

  // Dynamic Package selections for column visibility
  const [visiblePackages, setVisiblePackages] = useState<Record<string, boolean>>({
    landing_page: true,
    small_business_website: true,
    growth_website_client_workflow: true,
  });

  // Dynamic Service selections for column visibility
  const [visibleServices, setVisibleServices] = useState<Record<string, boolean>>({
    "business-website-design": true,
    "service-website": true,
    "booking-registration-website": true,
    "google-ads-setup": false,
    "seo-foundation-setup": false,
    "website-maintenance": false,
  });

  // Search filtering state
  const [searchQuery, setSearchQuery] = useState("");

  // Highlight only differences toggle
  const [highlightDifferencesOnly, setHighlightDifferencesOnly] = useState(false);

  // Quiz states for "Find My Fit" Assistant
  const [quizVisible, setQuizVisible] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({
    purpose: "",
    hasLogin: "",
    updates: "",
  });
  const [recommendedPackage, setRecommendedPackage] = useState<string | null>(null);

  // Toggle visible status of columns
  const togglePackageVisibility = (pkgId: string) => {
    setVisiblePackages((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      // Allow toggling off only if at least 1 column remains
      if (prev[pkgId] && activeCount <= 1) return prev;
      return { ...prev, [pkgId]: !prev[pkgId] };
    });
  };

  const toggleServiceVisibility = (serviceId: string) => {
    setVisibleServices((prev) => {
      const activeCount = Object.values(prev).filter(Boolean).length;
      if (prev[serviceId] && activeCount <= 1) return prev;
      return { ...prev, [serviceId]: !prev[serviceId] };
    });
  };

  // Pricing package comparison database
  const packageRows: FeatureComparisonRow[] = useMemo(() => [
    {
      name: "Sensing Starting Cost",
      category: "foundation",
      description: "Typical baseline website development budget.",
      landing_page: "AUD 1,500",
      small_business_website: "AUD 3,500",
      growth_website_client_workflow: "AUD 5,500",
    },
    {
      name: "Ideal Business Application",
      category: "foundation",
      description: "Recommended target business demographic & model.",
      landing_page: "Single marketing campaigns, new offers, or testing an idea",
      small_business_website: "Local services, trades, consultants, and established small businesses",
      growth_website_client_workflow: "Businesses needing bookings, automated notifications, and workflow dashboard",
    },
    {
      name: "Delivery Blueprint (Duration)",
      category: "foundation",
      description: "Required planning, design approval, and assembly times.",
      landing_page: "1 - 2 Weeks",
      small_business_website: "2 - 3 Weeks",
      growth_website_client_workflow: "3 - 5 Weeks",
    },
    {
      name: "Core Included Page Count",
      category: "foundation",
      description: "Individual layout and content pages integrated.",
      landing_page: "1 scrolling page",
      small_business_website: "Up to 5 pages",
      growth_website_client_workflow: "Up to 8-10 pages",
    },
    {
      name: "Mobile Responsive Layout",
      category: "foundation",
      description: "Adaptive design fine-tuned across tablets and phones.",
      landing_page: true,
      small_business_website: true,
      growth_website_client_workflow: true,
    },
    {
      name: "Strategic Form Capabilities",
      category: "features",
      description: "Custom digital forms matching specific fields & business requirements.",
      landing_page: "Simple contact form",
      small_business_website: "Advanced quote/enquiry form",
      growth_website_client_workflow: "Multi-step enquiry/intake forms",
    },
    {
      name: "Automated Notifications",
      category: "features",
      description: "Instant notification triggers sent upon submission.",
      landing_page: "Basic Email Delivery",
      small_business_website: "Standard Admin Notification",
      growth_website_client_workflow: "Automated Email Workflows & Client Follow-up",
    },
    {
      name: "SEO Indexing Strategy",
      category: "growth",
      description: "Index verification, header hierarchy configurations and local SEO setups.",
      landing_page: "Basic SEO setup",
      small_business_website: "Local SEO foundation",
      growth_website_client_workflow: "Analytics & SEO foundation",
    },
    {
      name: "Interactive Booking & Calendar",
      category: "features",
      description: "Interactive scheduling tools permitting calendar self-booking.",
      landing_page: false,
      small_business_website: "Available as module",
      growth_website_client_workflow: true,
    },
    {
      name: "Lead Tracking & Dashboard",
      category: "features",
      description: "Self-managed inbox or dashboard to view received enquiries and quotes.",
      landing_page: false,
      small_business_website: false,
      growth_website_client_workflow: true,
    },
    {
      name: "Analytics Track Event Scripts",
      category: "growth",
      description: "Google Analytics 4 setup tagging events and tracking visitor actions.",
      landing_page: false,
      small_business_website: true,
      growth_website_client_workflow: true,
    },
    {
      name: "SLA Support Coverage Period",
      category: "support",
      description: "Complementary post-launch support window for bug-fix guarantees.",
      landing_page: "14 Days from launch",
      small_business_website: "30 Days from launch",
      growth_website_client_workflow: "60 Days from launch",
    },
  ], []);

  // Services comparison database
  const serviceRows = useMemo(() => [
    {
      id: "business-website-design",
      name: "Business Website Design",
      complexity: "Intermediate Spec",
      speed: "2 - 3 Weeks SLA",
      deliverable: "Responsive Web Interface, 5-8 Custom static pages",
      target: "Simple local builders, specialty trades, startup founders",
      impact: "Builds high digital trust & displays modern visual identity for incoming organic traffic",
      pricingRef: "Starter Package",
    },
    {
      id: "service-website",
      name: "Service Website",
      complexity: "High Custom Design",
      speed: "4 - 5 Weeks SLA",
      deliverable: "Full CMS capabilities, service sub-pages, listing grids",
      target: "Dynamic service companies, consulting firms, physical clinics",
      impact: "Bypasses cold outreach by showcasing structured dynamic offers and capture forms",
      pricingRef: "Standard Package",
    },
    {
      id: "booking-registration-website",
      name: "Booking & Registration",
      complexity: "Premium Architected",
      speed: "8 - 12 Weeks SLA",
      deliverable: "Booking flows, login portal database, transactions gateway",
      target: "SaaS systems, rental brands, multi-operator medical centers",
      impact: "Turns the company website into an automated operational system, capturing payments 24/7",
      pricingRef: "Booking Package",
    },
    {
      id: "google-ads-setup",
      name: "Google Ads Setup",
      complexity: "Growth Specialist",
      speed: "1 - 2 Weeks SLA",
      deliverable: "Competitor analysis, keyword structure, custom dashboard",
      target: "Firms looking for immediate inbound phone calls & hot quotes",
      impact: "Generates high intent search traffic straight away instead of waiting months for SEO",
      pricingRef: "Growth Add-on",
    },
    {
      id: "seo-foundation-setup",
      name: "SEO Foundation Setup",
      complexity: "Search Optimization",
      speed: "2 - 3 Weeks SLA",
      deliverable: "XML configuration, GSC set, schema structures, titles map",
      target: "Established brands building durable zero-cost inbound ranking authority",
      impact: "Durable organic visibility on Google, bringing recurring customers without ad spend",
      pricingRef: "Growth Add-on & Included in Pro",
    },
    {
      id: "website-maintenance",
      name: "Website Maintenance",
      complexity: "SLA Engineering Support",
      speed: "Monthly Retainer",
      deliverable: "Regular upgrades, checks, layouts tuning, server tracking",
      target: "Busy business operators who want zero software tension or downtime",
      impact: "Complete peace-of-mind. Fast-response support keeps layouts safe, high-performing and secure",
      pricingRef: "Support Add-on",
    },
  ], []);

  // Filter package rows based on search query and highlight state
  const filteredPackageRows = useMemo(() => {
    return packageRows.filter((row) => {
      // 1. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          row.name.toLowerCase().includes(query) ||
          row.description.toLowerCase().includes(query) ||
          String(row.landing_page).toLowerCase().includes(query) ||
          String(row.small_business_website).toLowerCase().includes(query) ||
          String(row.growth_website_client_workflow).toLowerCase().includes(query);
        
        if (!matchesQuery) return false;
      }

      // 2. Highlight Differences Filter
      if (highlightDifferencesOnly) {
        // Collect visible column values
        const activeVals: string[] = [];
        if (visiblePackages.landing_page) activeVals.push(String(row.landing_page));
        if (visiblePackages.small_business_website) activeVals.push(String(row.small_business_website));
        if (visiblePackages.growth_website_client_workflow) activeVals.push(String(row.growth_website_client_workflow));

        // If all active column values are identical, hide this row
        const allIdentical = activeVals.every((val) => val === activeVals[0]);
        if (allIdentical) return false;
      }

      return true;
    });
  }, [packageRows, searchQuery, highlightDifferencesOnly, visiblePackages]);

  // Handle Mini-Quiz Selection Change & calculate best recommendation
  const handleQuizAnswer = (key: "purpose" | "hasLogin" | "updates", value: string) => {
    const updatedAnswers = { ...quizAnswers, [key]: value };
    setQuizAnswers(updatedAnswers);

    // Dynamic Recommendation Logic
    if (updatedAnswers.hasLogin === "yes" || updatedAnswers.purpose === "booking-payments") {
      setRecommendedPackage("growth_website_client_workflow");
    } else if (updatedAnswers.purpose === "simple-profile" && updatedAnswers.updates === "never") {
      setRecommendedPackage("landing_page");
    } else {
      setRecommendedPackage("small_business_website");
    }
  };

  // Trigger loading configuration inside state & scroll
  const applyCompareSelection = (pkgId: string) => {
    onSelectPackage(pkgId);
    onScrollToSection("pricing");
  };

  return (
    <section id="comparison" className="py-20 bg-transparent relative overflow-hidden text-left border-t border-white/5 scroll-mt-20">
      {/* Background soft glow orbs */}
      <div className="absolute top-[20%] right-[10%] w-[25vw] h-[25vw] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[5%] w-[30vw] h-[30vw] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header content with title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-cyan-400 font-mono font-bold px-3 py-1 bg-cyan-950/40 rounded-full border border-cyan-500/20 shadow-md">
            Interactive Suite Analyzer
          </span>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight mt-4 sm:text-5xl">
            Compare Services &amp; Packages
          </h2>
          <p className="text-slate-400 mt-4 font-light text-sm sm:text-base leading-relaxed">
            Unpack and contrast the precise structural, functional, and ongoing differences between our custom starting plans or specialized growth solutions side-by-side.
          </p>

          {/* Toggle Switches between Packages and Services */}
          <div className="flex justify-center mt-8">
            <div className="bg-[#0b1329] p-1.5 rounded-full border border-white/10 shadow-inner flex items-center">
              <button
                onClick={() => setCompareMode("packages")}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer tracking-wide transition-all ${
                  compareMode === "packages"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Pricing Plan Blueprints
              </button>
              <button
                onClick={() => setCompareMode("services")}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer tracking-wide transition-all ${
                  compareMode === "services"
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Expert Solution Capabilities
              </button>
            </div>
          </div>
        </div>

        {/* -------------------- PACKAGES COMPARISON MODE -------------------- */}
        {compareMode === "packages" ? (
          <div>
            {/* Quick Interactive Tool Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
              
              {/* Quick selectors for visible columns (Left side) */}
              <div className="glass-card rounded-2xl p-5 border-white/5 lg:col-span-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-slate-400 font-mono font-semibold mb-3 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Select Packages to View Side-by-Side:
                  </h3>
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    {packagesList.map((pkg) => {
                      const isVisible = visiblePackages[pkg.id];
                      return (
                        <button
                          key={pkg.id}
                          onClick={() => togglePackageVisibility(pkg.id)}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center gap-2 ${
                            isVisible
                              ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-inner"
                              : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${
                            isVisible ? "bg-cyan-400 text-slate-950" : "border border-slate-500"
                          }`}>
                            {isVisible && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{pkg.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional controls: Search Row & Highlight difference filter */}
                <div className="mt-5 border-t border-white/5 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {/* Search Bar */}
                  <div className="relative flex-grow max-w-md">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-slate-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search row features (e.g. 'CMS', 'SEO', 'Forms')..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#020617]/70 py-2 pl-9 pr-4 rounded-xl border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-light"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Highlights trigger */}
                  <button
                    onClick={() => setHighlightDifferencesOnly(!highlightDifferencesOnly)}
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-medium cursor-pointer border transition-all flex items-center gap-2 ${
                      highlightDifferencesOnly
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                        : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Highlight Differences Only</span>
                  </button>
                </div>
              </div>

              {/* Quiz Promotion Sidebar "Find My Fit" Assistant */}
              <div className="glass-card rounded-2xl p-5 border-white/5 lg:col-span-4 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white/5 to-cyan-950/20">
                <div className="relative z-10">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-mono font-bold">Smart Guide Tool</span>
                  </div>
                  <h3 className="text-sm font-display font-bold text-white tracking-tight">
                    Not sure which plan matches?
                  </h3>
                  <p className="text-xs text-slate-400 font-light mt-1.5 leading-relaxed">
                    Take our 3-question match wizard to receive an intelligent recommendation mapped block-by-block.
                  </p>
                </div>

                <div className="mt-4 relative z-10">
                  <button
                    onClick={() => setQuizVisible(!quizVisible)}
                    className="w-full py-2.5 px-4 bg-[#0a1329] border border-cyan-500/35 hover:bg-cyan-500/10 text-cyan-400 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{quizVisible ? "Hide Matching Wizard" : "Launch Match Wizard"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Matching Wizard Collapse Box */}
            <AnimatePresence>
              {quizVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mb-8"
                >
                  <div className="glass-card rounded-2xl p-6 border-cyan-500/20 bg-cyan-950/10 shadow-inner">
                    <div className="flex justify-between items-start mb-5 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-cyan-400" />
                        <h4 className="text-sm font-display font-semibold text-white tracking-tight">
                          Find Your Core Fit Wizard
                        </h4>
                      </div>
                      <button
                        onClick={() => {
                          setQuizVisible(false);
                          setRecommendedPackage(null);
                          setQuizAnswers({ purpose: "", hasLogin: "", updates: "" });
                        }}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Question 1 */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 font-sans mb-2">
                          1. What is the website&apos;s primary function?
                        </label>
                        <select
                          value={quizAnswers.purpose}
                          onChange={(e) => handleQuizAnswer("purpose", e.target.value)}
                          className="w-full bg-[#020617] text-slate-100 text-xs rounded-xl p-3 border border-white/10 focus:border-cyan-500/50 focus:outline-none transition-all font-light"
                        >
                          <option value="" className="bg-[#020617] text-slate-300">-- Click to choose option --</option>
                          <option value="simple-profile" className="bg-[#020617] text-slate-200">Simple Profile / Organic Brand presence</option>
                          <option value="showcase" className="bg-[#020617] text-slate-200">Service grids / Dynamic showcase listing</option>
                          <option value="booking-payments" className="bg-[#020617] text-slate-200">Schedule appointments &amp; Online Reservations</option>
                        </select>
                      </div>

                      {/* Question 2 */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          2. Do you need custom client logins / databases?
                        </label>
                        <select
                          value={quizAnswers.hasLogin}
                          disabled={!quizAnswers.purpose}
                          onChange={(e) => handleQuizAnswer("hasLogin", e.target.value)}
                          className="w-full bg-[#020617] disabled:opacity-40 text-slate-100 text-xs rounded-xl p-3 border border-white/10 focus:border-cyan-500/50 focus:outline-none transition-all font-light"
                        >
                          <option value="" className="bg-[#020617] text-slate-300">-- Choose option --</option>
                          <option value="no" className="bg-[#020617] text-slate-200">No portal, booking widgets are sufficient</option>
                          <option value="yes" className="bg-[#020617] text-slate-200">Yes, users need to login to track sessions</option>
                        </select>
                      </div>

                      {/* Question 3 */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-2">
                          3. How frequently do you update files/text copy?
                        </label>
                        <select
                          value={quizAnswers.updates}
                          disabled={!quizAnswers.hasLogin}
                          onChange={(e) => handleQuizAnswer("updates", e.target.value)}
                          className="w-full bg-[#020617] disabled:opacity-40 text-slate-100 text-xs rounded-xl p-3 border border-white/10 focus:border-cyan-500/50 focus:outline-none transition-all font-light"
                        >
                          <option value="" className="bg-[#020617] text-slate-300">-- Choose option --</option>
                          <option value="never" className="bg-[#020617] text-slate-200">Rarely/Happy with static updates by builder</option>
                          <option value="regular" className="bg-[#020617] text-slate-200">Regularly (I need CMS dashboard controls)</option>
                        </select>
                      </div>
                    </div>

                    {/* Recommendation Output */}
                    {recommendedPackage && (
                      <div className="mt-6 bg-[#020617]/60 border border-emerald-500/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 leading-none">
                              Dynamic Fit Formulated
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-light mt-1.5">
                            We recommend our <strong className="text-white font-semibold">{packagesList.find(p => p.id === recommendedPackage)?.name}</strong> plan for your goal profiles.
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => {
                              // Ensure recommended package column is visible
                              setVisiblePackages((prev) => ({ ...prev, [recommendedPackage]: true }));
                              // Clean search query to show highlight smoothly
                              setSearchQuery("");
                            }}
                            className="px-3.5 py-1.5 bg-[#0b1329] border border-white/10 hover:border-cyan-500 hover:text-cyan-400 text-slate-300 text-xs font-medium rounded-lg transition-all cursor-pointer"
                          >
                            Jump to column
                          </button>
                          <button
                            onClick={() => applyCompareSelection(recommendedPackage)}
                            className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold rounded-lg transition-all shadow cursor-pointer flex items-center gap-1"
                          >
                            <span>Load in Estimator</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Side-by-Side Table Layout */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="min-w-[800px] w-full bg-[#050b18]/60 backdrop-blur-md">
                
                {/* Table Header Row */}
                <div className="grid grid-cols-12 border-b border-white/10 bg-[#0b1224]/80 py-6 items-center">
                  <div className="col-span-3 px-6">
                    <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest block mb-1">
                      Matrix Core Model
                    </span>
                    <h4 className="text-sm font-display font-semibold text-white tracking-tight">
                      Compare Features
                    </h4>
                  </div>

                  {/* Pricing Blueprint Columns */}
                  <div className="col-span-9 grid grid-cols-3 gap-4 pr-6">
                    {/* Landing Page */}
                    {visiblePackages.landing_page && (
                       <div className="flex flex-col justify-between h-full group text-left">
                         <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Campaign</span>
                         <h4 className="text-xs font-display font-bold text-white mt-0.5 truncate">Landing Page</h4>
                         <span className="text-xs text-cyan-400 font-mono font-semibold mt-1">AUD 1,500</span>
                         <button
                           onClick={() => applyCompareSelection("landing_page")}
                           className="mt-3 py-1.5 px-3 bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 text-[10px] font-medium rounded-lg transition-all text-center cursor-pointer"
                         >
                           Load Estimator
                         </button>
                       </div>
                    )}

                    {/* Small Business Website */}
                    {visiblePackages.small_business_website && (
                      <div className="flex flex-col justify-between h-full group text-left relative bg-cyan-950/10 border border-cyan-500/20 rounded-xl p-2.5 -my-4 shadow-sm">
                        <div className="absolute top-0 right-2 -translate-y-1/2 bg-cyan-400 text-slate-950 text-[8px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded-full">
                          Recommended
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">Standard</span>
                        <h4 className="text-xs font-display font-bold text-white mt-0.5 truncate">Small Business Website</h4>
                        <span className="text-xs text-cyan-400 font-mono font-semibold mt-1">AUD 3,500</span>
                        <button
                          onClick={() => applyCompareSelection("small_business_website")}
                          className="mt-3 py-1.5 px-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-[10px] font-bold rounded-lg transition-all text-center cursor-pointer shadow-sm"
                        >
                          Load Estimator
                        </button>
                      </div>
                    )}

                    {/* Growth Website & Client Workflow */}
                    {visiblePackages.growth_website_client_workflow && (
                      <div className="flex flex-col justify-between h-full group text-left">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold text-purple-400">A-la-carte Growth</span>
                        <h4 className="text-xs font-display font-bold text-white mt-0.5 truncate">Growth &amp; Workflow</h4>
                        <span className="text-xs text-cyan-400 font-mono font-semibold mt-1">AUD 5,500</span>
                        <button
                          onClick={() => applyCompareSelection("growth_website_client_workflow")}
                          className="mt-3 py-1.5 px-3 bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 text-[10px] font-medium rounded-lg transition-all text-center cursor-pointer"
                        >
                          Load Estimator
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories & Comparison Rows */}
                <div className="divide-y divide-white/5">
                  {filteredPackageRows.length === 0 ? (
                    <div className="py-12 text-center">
                      <Scale className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-xs text-slate-500 font-light font-mono">
                        No features matched &quot;{searchQuery}&quot; with selected filters.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setHighlightDifferencesOnly(false);
                        }}
                        className="mt-4 text-xs font-medium text-cyan-400 hover:underline"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    filteredPackageRows.map((row, index) => (
                      <div
                        key={row.name}
                        className={`grid grid-cols-12 items-center py-4 text-left transition-colors ${
                          index % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                        } hover:bg-white/5`}
                      >
                        {/* Row Description & Meta */}
                        <div className="col-span-3 px-6 pr-4">
                          <h5 className="text-xs font-medium text-slate-200 flex items-center gap-1.5 group">
                            {row.name}
                          </h5>
                          <p className="text-[10px] text-slate-500 font-light mt-0.5 leading-normal">
                            {row.description}
                          </p>
                        </div>

                        {/* Values for columns */}
                        <div className="col-span-9 grid grid-cols-3 gap-4 pr-6">
                          
                          {/* Landing Page */}
                          {visiblePackages.landing_page && (
                            <div className="text-xs font-light text-slate-300 self-center">
                              {typeof row.landing_page === "boolean" ? (
                                row.landing_page ? (
                                  <Check className="w-4 h-4 text-cyan-400" />
                                ) : (
                                  <X className="w-4 h-4 text-slate-600" />
                                )
                              ) : (
                                <span>{row.landing_page}</span>
                              )}
                            </div>
                          )}

                          {/* Small Business Website */}
                          {visiblePackages.small_business_website && (
                            <div className="text-xs text-slate-200 font-medium self-center bg-cyan-950/10 px-1 py-1.5 rounded">
                              {typeof row.small_business_website === "boolean" ? (
                                row.small_business_website ? (
                                  <Check className="w-4 h-4 text-cyan-400" />
                                ) : (
                                  <X className="w-4 h-4 text-slate-600" />
                                )
                              ) : (
                                <span>{row.small_business_website}</span>
                              )}
                            </div>
                          )}

                          {/* Growth Website & Client Workflow */}
                          {visiblePackages.growth_website_client_workflow && (
                            <div className="text-xs font-light text-slate-300 self-center">
                              {typeof row.growth_website_client_workflow === "boolean" ? (
                                row.growth_website_client_workflow ? (
                                  <Check className="w-4 h-4 text-purple-400" />
                                ) : (
                                  <X className="w-4 h-4 text-slate-600" />
                                )
                              ) : (
                                <span>{row.growth_website_client_workflow}</span>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-3 items-center mt-4">
              <span className="text-[10px] font-mono text-slate-500">
                Swipe matrix horizontally on tablet layouts *
              </span>
            </div>

          </div>
        ) : (
          /* -------------------- SERVICES COMPARISON MODE -------------------- */
          <div>
            {/* Quick selectors for visible service items */}
            <div className="glass-card rounded-2xl p-5 border-white/5 mb-8 text-left">
              <h3 className="text-xs uppercase tracking-wider text-slate-400 font-mono font-semibold mb-3 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Select Services to Compare Capability:
              </h3>
              <div className="flex flex-wrap gap-2.5 mt-2">
                {serviceRows.map((srv) => {
                  const isVisible = visibleServices[srv.id];
                  return (
                    <button
                      key={srv.id}
                      onClick={() => toggleServiceVisibility(srv.id)}
                      className={`px-4 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center gap-2 ${
                        isVisible
                          ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-inner"
                          : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${
                        isVisible ? "bg-cyan-400 text-slate-950" : "border border-slate-500"
                      }`}>
                        {isVisible && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span>{srv.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Side-by-Side Flex Grids for Service Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceRows.map((srv) => {
                if (!visibleServices[srv.id]) return null;

                return (
                  <div
                    key={srv.id}
                    className="glass-card rounded-2xl p-6 border-white/5 flex flex-col justify-between h-full bg-slate-950/35 relative overflow-hidden group hover:border-cyan-500/20"
                  >
                    {/* Subtle aesthetic backdrop tag */}
                    <div className="absolute top-0 right-0 p-3">
                      <span className="text-[9px] font-mono tracking-widest text-[#1e293b] uppercase select-none font-bold block">
                        CLARITY-CORE
                      </span>
                    </div>

                    <div>
                      {/* Name & Reference */}
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                        {srv.pricingRef}
                      </span>
                      <h3 className="text-base font-display font-semibold text-white tracking-tight mb-4 group-hover:text-cyan-400 transition-colors">
                        {srv.name}
                      </h3>

                      {/* Details Stack */}
                      <div className="space-y-4 border-t border-white/5 pt-4">
                        
                        <div>
                          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider block">
                            Complexity Rating
                          </span>
                          <span className="text-xs text-slate-200 mt-1 font-light block">
                            {srv.complexity}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider block">
                            Typical Build SLA Output
                          </span>
                          <span className="text-xs text-slate-200 mt-1 font-light block font-mono">
                            {srv.speed}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider block">
                            Key Core Deliverable
                          </span>
                          <span className="text-xs text-slate-200 mt-1 font-light block">
                            {srv.deliverable}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider block">
                            Best Suited For
                          </span>
                          <span className="text-xs text-slate-300 mt-1 font-light block">
                            {srv.target}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono font-medium text-slate-500 uppercase tracking-wider block">
                            Direct Business Outcome
                          </span>
                          <span className="text-xs text-slate-400 mt-1 font-light block leading-relaxed">
                            {srv.impact}
                          </span>
                        </div>

                      </div>
                    </div>

                    {/* Footer Action link */}
                    <div className="border-t border-white/5 pt-5 mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          if (srv.pricingRef.toLowerCase().includes("package")) {
                            const mappingId = srv.id === "business-website-design" ? "starter" : srv.id === "service-website" ? "standard" : "booking";
                            applyCompareSelection(mappingId);
                          } else if (srv.pricingRef.toLowerCase().includes("pro")) {
                            applyCompareSelection("professional");
                          } else {
                            onScrollToSection("addons");
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        <span>Configure / Select Solution</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
