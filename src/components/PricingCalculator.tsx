import { useState } from "react";
import { motion } from "motion/react";
import { Check, ArrowDown, Sliders } from "lucide-react";
import { Language, Currency, getPackages, trans, convertCost } from "../translations";

interface PricingProps {
  onScrollToSection: (sectionId: string) => void;
  onApplySelectionToForm: (pkgName: string, selectedAddons: string[], calculatedPrice: string) => void;
  selectedPackageId: string;
  setSelectedPackageId: (id: string) => void;
  language: Language;
  currency: Currency;
}

export default function PricingCalculator({
  onScrollToSection,
  onApplySelectionToForm,
  selectedPackageId,
  setSelectedPackageId,
  language,
  currency,
}: PricingProps) {
    const t = trans[language];
  const packagesList = getPackages(language, currency);

  // Local state for interactive quote builder
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  
  // Custom states to demonstrate high fidelity details
  const [adsIntensity, setAdsIntensity] = useState<"standard" | "premium">("standard");
  const [maintenanceIntensity, setMaintenanceIntensity] = useState<"basic" | "managed">("basic");

  // States for Custom individual features/itemized selections
  const [extraPagesCount, setExtraPagesCount] = useState<number>(0);
  const [extraFormsCount, setExtraFormsCount] = useState<number>(0);
  const [extraLanguagesCount, setExtraLanguagesCount] = useState<number>(0);

  const [customCMSSelected, setCustomCMSSelected] = useState<boolean>(false);
  const [bookingSystemSelected, setBookingSystemSelected] = useState<boolean>(false);
  const [paymentGatewaySelected, setPaymentGatewaySelected] = useState<boolean>(false);
  const [membersPortalSelected, setMembersPortalSelected] = useState<boolean>(false);
  const [customAnalyticsSelected, setCustomAnalyticsSelected] = useState<boolean>(false);

  // Helper to determine if a feature is already included in the active base package
  const isFeatureIncluded = (featureId: string) => {
    switch (selectedPackageId) {
      case "starter":
        return false; // Starter is simple and does not include database modularity
      case "standard":
        return featureId === "analytics"; // Lead Plan includes analytics connection
      case "booking":
        return ["cms", "analytics", "booking", "payment"].includes(featureId); // Booking / Portal plan inclusions
      case "professional":
        return ["cms", "analytics", "booking", "payment", "accounts"].includes(featureId); // Custom SaaS style base specs
      default:
        return false;
    }
  };

  const handleToggleAddon = (addonId: string) => {
    if (selectedAddonIds.includes(addonId)) {
      setSelectedAddonIds(selectedAddonIds.filter((id) => id !== addonId));
    } else {
      setSelectedAddonIds([...selectedAddonIds, addonId]);
    }
  };

  // Select base package and scroll to form or configurator
  const handleSelectPackageOnly = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    // Find the configurator section elements and scroll smoothly
    const element = document.getElementById("quote-configurator");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Itemized prices in AUD
  const basePrices = {
    page: 500,
    form: 300,
    lang: 1000,
    cms: 1600,
    booking: 3000,
    payment: 2400,
    accounts: 3600,
    analytics: 400,
  };

  // Calculate live estimate combining base package, custom a-la-carte variables, and third-party setups
  const calculateEstimate = () => {
    const pkg = packagesList.find((p) => p.id === selectedPackageId);
    if (!pkg) return { text: "Select a package", buildCost: 0, ongoingCost: "", itemizedFeatures: [] };

    // Standard baseline pricing logic
    let buildCost = convertCost(pkg.priceValue, currency);
    const isFromStr = pkg.price.startsWith("From") || pkg.price.startsWith("起價");
    
    let ongoingCostParts: string[] = [];
    let customFeaturesList: { name: string; price: number; type: string }[] = [];

    // 1. Extra Pages Setup
    if (extraPagesCount > 0) {
      const perItemCost = convertCost(basePrices.page, currency);
      const totalCost = extraPagesCount * perItemCost;
      buildCost += totalCost;
      customFeaturesList.push({ 
        name: `Additional Pages (${extraPagesCount} x ${currency} ${perItemCost.toLocaleString()})`, 
        price: totalCost, 
        type: "page" 
      });
    }

    // 2. Extra Contact Forms
    if (extraFormsCount > 0) {
      const perItemCost = convertCost(basePrices.form, currency);
      const totalCost = extraFormsCount * perItemCost;
      buildCost += totalCost;
      customFeaturesList.push({ 
        name: `Extra Submission Forms (${extraFormsCount} x ${currency} ${perItemCost.toLocaleString()})`, 
        price: totalCost, 
        type: "form" 
      });
    }

    // 3. Extra Languages Setup
    if (extraLanguagesCount > 0) {
      const perItemCost = convertCost(basePrices.lang, currency);
      const totalCost = extraLanguagesCount * perItemCost;
      buildCost += totalCost;
      customFeaturesList.push({ 
        name: `Extra Language Setups (${extraLanguagesCount} x ${currency} ${perItemCost.toLocaleString()})`, 
        price: totalCost, 
        type: "lang" 
      });
    }

    // 4. Custom CMS setup
    if ((customCMSSelected || isFeatureIncluded("cms")) && !isFeatureIncluded("cms")) {
      const costVal = convertCost(basePrices.cms, currency);
      buildCost += costVal;
      customFeaturesList.push({ 
        name: "CMS Admin Console Setup", 
        price: costVal, 
        type: "cms" 
      });
    }

    // 5. Booking Module
    if ((bookingSystemSelected || isFeatureIncluded("booking")) && !isFeatureIncluded("booking")) {
      const costVal = convertCost(basePrices.booking, currency);
      buildCost += costVal;
      customFeaturesList.push({ 
        name: "Interactive Booking System", 
        price: costVal, 
        type: "booking" 
      });
    }

    // 6. Payment checkout link
    if ((paymentGatewaySelected || isFeatureIncluded("payment")) && !isFeatureIncluded("payment")) {
      const costVal = convertCost(basePrices.payment, currency);
      buildCost += costVal;
      customFeaturesList.push({ 
        name: "Secured Payment Integration", 
        price: costVal, 
        type: "payment" 
      });
    }

    // 7. Customer account portal
    if ((membersPortalSelected || isFeatureIncluded("accounts")) && !isFeatureIncluded("accounts")) {
      const costVal = convertCost(basePrices.accounts, currency);
      buildCost += costVal;
      customFeaturesList.push({ 
        name: "User Portal & Account System", 
        price: costVal, 
        type: "accounts" 
      });
    }

    // 8. Google analytics setup
    if ((customAnalyticsSelected || isFeatureIncluded("analytics")) && !isFeatureIncluded("analytics")) {
      const costVal = convertCost(basePrices.analytics, currency);
      buildCost += costVal;
      customFeaturesList.push({ 
        name: "Analytics & Event Tracking Setup", 
        price: costVal, 
        type: "analytics" 
      });
    }

    // 9. Calculate addon costs (Monthly/Setup Addons)
    selectedAddonIds.forEach((addonId) => {
      if (addonId === "google-ads") {
        if (adsIntensity === "standard") {
          buildCost += convertCost(1200, currency);
          ongoingCostParts.push(
            `${currency} ${convertCost(600, currency).toLocaleString()}/mo (Ads Mgmt)`
          );
        } else {
          buildCost += convertCost(2400, currency);
          ongoingCostParts.push(
            `${currency} ${convertCost(1600, currency).toLocaleString()}/mo (Premium Ads)`
          );
        }
      }
      if (addonId === "maintenance") {
        if (maintenanceIntensity === "basic") {
          ongoingCostParts.push(
            `${currency} ${convertCost(160, currency).toLocaleString()}-${convertCost(300, currency).toLocaleString()}/mo (Basic)`
          );
        } else {
          ongoingCostParts.push(
            `${currency} ${convertCost(400, currency).toLocaleString()}-${convertCost(800, currency).toLocaleString()}/mo (Managed)`
          );
        }
      }
    });

    const ongoingText = ongoingCostParts.length > 0 ? ongoingCostParts.join(" + ") : "None";
    const baseText = isFromStr ? "From " : "";
    const formattedPrice = selectedPackageId === "professional" ? "Quoting after scope" : `${currency} ${buildCost.toLocaleString()}`;

    return {
      text: selectedPackageId === "professional" ? "Quoting after scope" : `${baseText}${formattedPrice}`,
      buildCost,
      ongoingCost: ongoingText,
      prefix: selectedPackageId === "professional" ? "" : baseText,
      itemizedFeatures: customFeaturesList,
    };
  };

  const currentEstimate = calculateEstimate();

  const handleApplyToContactForm = () => {
    const pkg = packagesList.find((p) => p.id === selectedPackageId);
    if (pkg) {
      // Build human-friendly report
      const labelArray = selectedAddonIds.map((id) => {
        if (id === "google-ads") {
          return `Google Ads Campaign Setup (${adsIntensity === "standard" ? "Standard" : "Premium"})`;
        }
        if (id === "maintenance") {
          return `Website Maintenance Plan (${maintenanceIntensity === "basic" ? "Basic Support" : "Managed Support"})`;
        }
        return id;
      });

      // Add actual customized individual features with their quantities
      if (extraPagesCount > 0) {
        labelArray.push(
          `+${extraPagesCount} Extra Pages (${currency} ${convertCost(basePrices.page, currency).toLocaleString()}/ea)`
        );
      }
      if (extraFormsCount > 0) {
        labelArray.push(
          `+${extraFormsCount} Extra custom forms (${currency} ${convertCost(basePrices.form, currency).toLocaleString()}/ea)`
        );
      }
      if (extraLanguagesCount > 0) {
        labelArray.push(
          `+${extraLanguagesCount} Extra languages (${currency} ${convertCost(basePrices.lang, currency).toLocaleString()}/ea)`
        );
      }
      
      const appendAlaCarte = (activeState: boolean, labelZh: string, labelEn: string, pricingKey: keyof typeof basePrices) => {
        if (activeState && !isFeatureIncluded(pricingKey)) {
          const costTxt = `${currency} ${convertCost(basePrices[pricingKey], currency).toLocaleString()}`;
          labelArray.push(`A-La-Carte ${labelEn} (${costTxt})`);
        }
      };

      appendAlaCarte(customCMSSelected, "CMS 內容大屏後台", "CMS Console Setup", "cms");
      appendAlaCarte(bookingSystemSelected, "日程預約占位系統", "Booking Scheduler", "booking");
      appendAlaCarte(paymentGatewaySelected, "信用卡刷卡扣帳對接", "Payment Checkout Gateway", "payment");
      appendAlaCarte(membersPortalSelected, "用戶註冊登錄門戶", "Membership Login Portal", "accounts");
      appendAlaCarte(customAnalyticsSelected, "谷歌轉化事件追蹤優化", "Google Analytics Hooks", "analytics");

      onApplySelectionToForm(pkg.name, labelArray, currentEstimate.text);
      onScrollToSection("contact");
    }
  };

  return (
    <section 
      id="pricing" 
      className="py-18 bg-transparent text-left relative overflow-hidden"
    >
      {/* Decorative Gradients for Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_40%,#1e1b4b_0%,transparent_60%)] opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            Clear Investments
          </span>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight mt-2 sm:text-4xl">
            {t.navPricing} • Transparent Pricing. No Guesswork.
          </h2>
          <p className="text-slate-400 mt-3 font-light">
            Each project has a defined scope and flat starting rate. Choose a package based on the scale of your business.
          </p>
        </div>

                {/* 4 Packages Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-16">
          {packagesList.map((pkg, index) => {
            const isRec = pkg.isRecommended;
            const isSelected = selectedPackageId === pkg.id;
            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                key={pkg.id}
                className={`relative rounded-[2rem] p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between ${
                  isRec
                    ? "bg-slate-900/60 backdrop-blur-3xl text-white shadow-[0_0_80px_rgba(34,211,238,0.15)] border border-cyan-500/40 transform lg:scale-105 lg:z-10"
                    : "glass-card hover:border-cyan-500/30 hover:-translate-y-1"
                }`}
              >
                {/* Recommended Highlight Tag */}
                {isRec && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg whitespace-nowrap">
                    Recommended
                  </span>
                )}

                <div>
                  {/* Name and Description */}
                  <div className="mb-5">
                    <h3 className={`text-xl font-display font-bold tracking-tight text-white`}>
                      {pkg.name}
                    </h3>
                    <p className={`text-xs mt-1.5 min-h-[32px] font-light leading-snug ${isRec ? "text-slate-300" : "text-slate-400"}`}>
                      {pkg.description}
                    </p>
                  </div>

                  {/* Pricing Display */}
                  <div className={`mb-6 pb-6 border-b border-white/10`}>
                    <span className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider block mb-0.5 ${isRec ? "text-cyan-400" : "text-slate-400"}`}>
                      Budget starting from
                    </span>
                    <span className={`text-2xl sm:text-3xl font-display font-bold select-all text-white`}>
                      {pkg.price}
                    </span>
                  </div>

                  {/* Package Checklist Items */}
                  <div className="space-y-3 mb-8 font-light">
                    <span className={`text-[10px] font-semibold tracking-wider uppercase font-mono block mb-2 text-slate-400`}>
                      Package deliverables:
                    </span>
                    {pkg.includes.map((incl, index) => (
                      <div key={index} className="flex items-start gap-2.5 text-xs">
                        {isRec ? (
                          <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <Check className="w-4 h-4 mt-0.5 text-cyan-400 shrink-0" />
                        )}
                        <span className={`leading-tight ${isRec ? "text-slate-200" : "text-slate-300"}`}>{incl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-auto pt-4">
                  <button
                    onClick={() => handleSelectPackageOnly(pkg.id)}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer text-center select-none ${
                      isRec
                        ? "bg-cyan-500 hover:bg-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                        : isSelected
                        ? "bg-white/15 text-white border border-cyan-400/40"
                        : "bg-white/5 hover:bg-white/10 text-slate-200 border border-transparent backdrop-blur-md"
                    }`}
                  >
                    {isRec 
                      ? "Configure Estimate"
                      : isSelected 
                      ? "Currently Chosen"
                      : "Select & Configure"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>



        {/* 2. Interactive Custom Estimate Configurator Block */}
        <motion.div 
          id="quote-configurator"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-md overflow-hidden max-w-5xl mx-auto"
        >
          {/* Subtle decoration inside the configurator block */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-6">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
              {t.calculatorTitle}
            </h3>
          </div>
          
          <p className="text-slate-300 text-sm font-light max-w-3xl mb-8 leading-relaxed">
            {t.calculatorSubtitle}
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Interactive Options Left (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Package Toggle */}
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono block mb-3.5">
                  {t.step1Pkg}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {packagesList.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPackageId(p.id)}
                      className={`px-4 py-3 text-xs font-medium rounded-xl text-left border transition-all cursor-pointer ${
                        selectedPackageId === p.id
                          ? "bg-[#020617] border-cyan-500 text-white shadow-inner"
                          : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold block truncate leading-tight">{p.name}</span>
                        {p.isRecommended && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block">{p.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Individual Custom Features (How Much Per Item) */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono block">
                    {t.step2Custom}
                  </label>
                  <span className="text-[10px] bg-cyan-950/40 text-cyan-400 border border-cyan-900/40 px-2 py-0.5 rounded font-mono">
                    {t.priceListBadge} (AUD)
                  </span>
                </div>
                
                <div className="space-y-3 bg-[#020617]/50 border border-white/5 rounded-2xl p-4 sm:p-5">
                  
                  {/* Item 1: Extra Pages Counter */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-white/5 last:border-b-0">
                    <div className="text-left flex-1 pr-4">
                      <span className="text-sm font-semibold text-white block">{t.extraPages}</span>
                      <span className="text-xs text-slate-400 font-mono mt-0.5 block">{currency} {convertCost(basePrices.page, currency).toLocaleString()} / page</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
                      <button
                        onClick={() => setExtraPagesCount(Math.max(0, extraPagesCount - 1))}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer select-none font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-semibold font-mono text-white">
                        {extraPagesCount}
                      </span>
                      <button
                        onClick={() => setExtraPagesCount(extraPagesCount + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer select-none font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Item 2: Extra Custom Forms Counter */}
                  <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-b-0">
                    <div className="text-left flex-1 pr-4">
                      <span className="text-sm font-semibold text-white block">{t.extraForms}</span>
                      <span className="text-xs text-slate-400 font-mono mt-0.5 block">{currency} {convertCost(basePrices.form, currency).toLocaleString()} / form</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
                      <button
                        onClick={() => setExtraFormsCount(Math.max(0, extraFormsCount - 1))}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer select-none font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-semibold font-mono text-white">
                        {extraFormsCount}
                      </span>
                      <button
                        onClick={() => setExtraFormsCount(extraFormsCount + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer select-none font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Item 3: Multilingual Support */}
                  <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-b-0">
                    <div className="text-left flex-1 pr-4">
                      <span className="text-sm font-semibold text-white block">{t.langSetup}</span>
                      <span className="text-xs text-slate-400 font-mono mt-0.5 block">{currency} {convertCost(basePrices.lang, currency).toLocaleString()} / extra language</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1 shrink-0">
                      <button
                        onClick={() => setExtraLanguagesCount(Math.max(0, extraLanguagesCount - 1))}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer select-none font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-semibold font-mono text-white">
                        {extraLanguagesCount}
                      </span>
                      <button
                        onClick={() => setExtraLanguagesCount(extraLanguagesCount + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer select-none font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Item 4: Content Management System (CMS) Setup */}
                  <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-b-0">
                    <div className="text-left flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white block">{t.cmsAdmin}</span>
                        {isFeatureIncluded("cms") && (
                          <span className="text-[9px] bg-emerald-900/40 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shrink-0">
                            {t.includedInPlan}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono mt-0.5 block">{currency} {convertCost(basePrices.cms, currency).toLocaleString()} / setup (Edit content easily)</span>
                    </div>
                    <button
                      disabled={isFeatureIncluded("cms")}
                      onClick={() => setCustomCMSSelected(!customCMSSelected)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all select-none shrink-0 cursor-pointer ${
                        isFeatureIncluded("cms")
                          ? "bg-slate-900 border-none text-emerald-400 opacity-80 cursor-not-allowed flex items-center gap-1"
                          : customCMSSelected
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {isFeatureIncluded("cms") ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> {t.inclText}
                        </>
                      ) : customCMSSelected ? (
                        t.addedText
                      ) : (
                        t.addModule
                      )}
                    </button>
                  </div>

                  {/* Item 5: Booking & Scheduling Module */}
                  <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-b-0">
                    <div className="text-left flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white block">{t.bookingModule}</span>
                        {isFeatureIncluded("booking") && (
                          <span className="text-[9px] bg-emerald-900/40 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shrink-0">
                            {t.includedInPlan}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono mt-0.5 block">{currency} {convertCost(basePrices.booking, currency).toLocaleString()} / module (Client scheduler)</span>
                    </div>
                    <button
                      disabled={isFeatureIncluded("booking")}
                      onClick={() => setBookingSystemSelected(!bookingSystemSelected)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all select-none shrink-0 cursor-pointer ${
                        isFeatureIncluded("booking")
                          ? "bg-slate-900 border-none text-emerald-400 opacity-80 cursor-not-allowed flex items-center gap-1"
                          : bookingSystemSelected
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {isFeatureIncluded("booking") ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> {t.inclText}
                        </>
                      ) : bookingSystemSelected ? (
                        t.addedText
                      ) : (
                        t.addModule
                      )}
                    </button>
                  </div>



                  {/* Item 7: Customer Accounts Portal */}
                  <div className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-b-0">
                    <div className="text-left flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white block">{t.membersPortal}</span>
                        {isFeatureIncluded("accounts") && (
                          <span className="text-[9px] bg-emerald-900/40 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shrink-0">
                            {t.includedInPlan}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono mt-0.5 block">{currency} {convertCost(basePrices.accounts, currency).toLocaleString()} / system (Member database)</span>
                    </div>
                    <button
                      disabled={isFeatureIncluded("accounts")}
                      onClick={() => setMembersPortalSelected(!membersPortalSelected)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all select-none shrink-0 cursor-pointer ${
                        isFeatureIncluded("accounts")
                          ? "bg-slate-900 border-none text-emerald-400 opacity-80 cursor-not-allowed flex items-center gap-1"
                          : membersPortalSelected
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {isFeatureIncluded("accounts") ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> {t.inclText}
                        </>
                      ) : membersPortalSelected ? (
                        t.addedText
                      ) : (
                        t.addModule
                      )}
                    </button>
                  </div>

                  {/* Item 8: Google Analytics setup */}
                  <div className="flex items-center justify-between pt-3.5">
                    <div className="text-left flex-1 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white block">{t.analyticsSetupText}</span>
                        {isFeatureIncluded("analytics") && (
                          <span className="text-[9px] bg-emerald-900/40 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold shrink-0">
                            {t.includedInPlan}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono mt-0.5 block">{currency} {convertCost(basePrices.analytics, currency).toLocaleString()} / setup (Sitemap + conversion hooks)</span>
                    </div>
                    <button
                      disabled={isFeatureIncluded("analytics")}
                      onClick={() => setCustomAnalyticsSelected(!customAnalyticsSelected)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all select-none shrink-0 cursor-pointer ${
                        isFeatureIncluded("analytics")
                          ? "bg-slate-900 border-none text-emerald-400 opacity-80 cursor-not-allowed flex items-center gap-1"
                          : customAnalyticsSelected
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {isFeatureIncluded("analytics") ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> {t.inclText}
                        </>
                      ) : customAnalyticsSelected ? (
                        t.addedText
                      ) : (
                        t.addModule
                      )}
                    </button>
                  </div>

                </div>
              </div>

              {/* Addons Checklist */}
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400 font-bold font-mono block mb-3.5">
                  {t.step3Addons}
                </label>
                <div className="space-y-3">
                  
                  {/* Google Ads Checkbox */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    selectedAddonIds.includes("google-ads")
                      ? "bg-white/10 border-cyan-500/30"
                      : "bg-white/5 border-white/5 hover:border-white/10"
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="addon-google-ads"
                        checked={selectedAddonIds.includes("google-ads")}
                        onChange={() => handleToggleAddon("google-ads")}
                        className="mt-1 h-4.5 w-4.5 rounded border-white/10 bg-[#020617] text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                      />
                      <div className="text-left flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <label htmlFor="addon-google-ads" className="text-sm font-semibold text-white cursor-pointer hover:text-cyan-400 transition-colors bg-clip-text">
                            Google Ads Setup/Management Plan
                          </label>
                        </div>
                        <p className="text-xs text-slate-400 font-light mt-1">
                          Campaign design, landing page mapping, custom metrics and tracking setup. Paid directly.
                        </p>
                        
                        {/* Interactive Scope slider sub-selector */}
                        {selectedAddonIds.includes("google-ads") && (
                          <div className="mt-3.5 bg-[#020617] border border-white/5 rounded-lg p-3 flex flex-col gap-2">
                            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">Select Ads Package Scale:</span>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setAdsIntensity("standard")}
                                className={`py-1.5 px-2.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                                  adsIntensity === "standard"
                                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                                    : "bg-white/5 border-white/5 text-slate-400"
                                  }`}
                                >
                                Standard: {currency} {convertCost(1200, currency).toLocaleString()} setup
                              </button>
                              <button
                                onClick={() => setAdsIntensity("premium")}
                                className={`py-1.5 px-2.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                                  adsIntensity === "premium"
                                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                                    : "bg-white/5 border-white/5 text-slate-400"
                                }`}
                              >
                                Premium: {currency} {convertCost(2400, currency).toLocaleString()} setup
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 font-light leading-snug font-mono">
                              Management fee: {currency} {adsIntensity === "standard" ? convertCost(600, currency).toLocaleString() : convertCost(1600, currency).toLocaleString()} per month thereafter.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Website Maintenance Checkbox */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    selectedAddonIds.includes("maintenance")
                      ? "bg-white/10 border-cyan-500/30"
                      : "bg-white/5 border-white/5 hover:border-white/10"
                  }`}>
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="addon-maintenance"
                        checked={selectedAddonIds.includes("maintenance")}
                        onChange={() => handleToggleAddon("maintenance")}
                        className="mt-1 h-4.5 w-4.5 rounded border-white/10 bg-[#020617] text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                      />
                      <div className="text-left flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <label htmlFor="addon-maintenance" className="text-sm font-semibold text-white cursor-pointer hover:text-cyan-400 transition-colors">
                            Professional Website Maintenance
                          </label>
                        </div>
                        <p className="text-xs text-slate-400 font-light mt-1">
                          Sustained support, minor improvements, platform diagnostics and sitemap maintenance.
                        </p>
                        
                        {/* Interactive intensity slider sub-selector */}
                        {selectedAddonIds.includes("maintenance") && (
                          <div className="mt-3.5 bg-[#020617] border border-white/5 rounded-lg p-3 flex flex-col gap-2">
                            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">Select Support Tier:</span>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setMaintenanceIntensity("basic")}
                                className={`py-1.5 px-2.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                                  maintenanceIntensity === "basic"
                                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                                    : "bg-white/5 border-white/5 text-slate-300"
                                }`}
                              >
                                Basic: {currency} {convertCost(160, currency).toLocaleString()}-{convertCost(300, currency).toLocaleString()}/mo
                              </button>
                              <button
                                onClick={() => setMaintenanceIntensity("managed")}
                                className={`py-1.5 px-2.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                                  maintenanceIntensity === "managed"
                                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                                    : "bg-white/5 border-white/5 text-slate-300"
                                }`}
                              >
                                Managed: {currency} {convertCost(400, currency).toLocaleString()}-{convertCost(800, currency).toLocaleString()}/mo
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 font-light leading-snug">
                              Includes {maintenanceIntensity === "basic" ? "basic checks & small updates" : "priority support, hosting oversight, sitemap sync & content help"}.
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Custom Interactive Estimate Summary Right (5 Columns) */}
            <div className="lg:col-span-5">
              <div className="bg-[#020617] rounded-2xl p-6 border border-white/10 sticky top-24">
                <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-900/30 font-semibold inline-block mb-4">
                  {t.sidebarSummaryTitle}
                </span>
                
                <div className="space-y-4 mb-6">
                  <div className="text-left">
                    <span className="text-xs text-slate-400 block mb-0.5 font-mono uppercase tracking-widest text-[10px]">{t.selectedBase}</span>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-sm font-semibold text-white font-display truncate">
                        {packagesList.find((p) => p.id === selectedPackageId)?.name || "Starter Website"}
                      </span>
                      <span className="text-xs font-semibold text-slate-300 font-mono shrink-0">
                        {currency} {(packagesList.find((p) => p.id === selectedPackageId)?.priceValue ? convertCost(packagesList.find((p) => p.id === selectedPackageId)!.priceValue, currency) : 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Itemized Features Breakdown */}
                  <div className="text-left border-t border-white/5 pt-3">
                    <span className="text-xs text-slate-400 block mb-2 font-mono uppercase tracking-widest text-[10px]">{t.itemizedCustom}</span>
                    {currentEstimate.itemizedFeatures.length === 0 ? (
                      <span className="text-xs text-slate-500 italic block">{t.noneSelected}</span>
                    ) : (
                      <div className="space-y-2 mt-1 bg-white/5 p-3 rounded-xl border border-white/5">
                        {currentEstimate.itemizedFeatures.map((feat, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs gap-2">
                            <span className="text-slate-300 font-light text-[11px] truncate flex-1">{feat.name}</span>
                            <span className="text-cyan-400 font-mono font-medium shrink-0">+{currency} {feat.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Growth Add-ons Breakdown */}
                  <div className="text-left border-t border-white/5 pt-3">
                    <span className="text-xs text-slate-400 block mb-1 font-mono uppercase tracking-widest text-[10px]">{t.growthAddons}</span>
                    {selectedAddonIds.length === 0 ? (
                      <span className="text-xs text-slate-500 italic block">{t.noneSelectedAddon}</span>
                    ) : (
                      <div className="space-y-1.5 mt-1.5">
                        {selectedAddonIds.map((id) => {
                          if (id === "google-ads") {
                            const setupVal = convertCost(adsIntensity === "standard" ? 6000 : 12000, currency);
                            return (
                              <div key={id} className="flex justify-between items-center text-xs gap-2">
                                <span className="text-slate-300 truncate">Google Ads Setup ({adsIntensity})</span>
                                <span className="text-cyan-400 font-mono font-medium shrink-0">+{currency} {setupVal.toLocaleString()}</span>
                              </div>
                            );
                          }
                          if (id === "maintenance") {
                            return (
                              <div key={id} className="flex justify-between items-center text-xs gap-2">
                                <span className="text-slate-300 truncate">Website Maintenance ({maintenanceIntensity})</span>
                                <span className="text-cyan-400 font-mono font-medium shrink-0">Listed below</span>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimate sum container */}
                <div className="bg-white/5 rounded-xl p-4.5 text-left border border-white/5 mb-6">
                  <div className="flex justify-between items-baseline mb-2 bg-[#020617] p-2.5 rounded-lg border border-white/5 gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.estBuildCost}</span>
                    <span className="text-lg sm:text-xl font-display font-bold text-cyan-400 select-all leading-none shrink-0 font-mono">
                      {currentEstimate.text}
                    </span>
                  </div>
                  <div className="h-[1px] bg-white/5 my-2"></div>
                  <div className="flex justify-between items-baseline gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.estOngoingCost}</span>
                    <span className="text-xs font-mono text-cyan-400 block text-right font-semibold">
                      {currentEstimate.ongoingCost}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleApplyToContactForm}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-cyan-500/10 hover:translate-y-[-1px]"
                  >
                    {t.applyToFormBtn}
                    <ArrowDown className="w-4 h-4 text-white" />
                  </button>
                  
                  <span className="text-[9px] font-light text-slate-400 mt-2 block text-center leading-normal">
                    This instant simulation generates localized sitemaps. Pricing forms package baseline. Exact criteria scoped with engineers before kicking off.
                  </span>
                </div>

              </div>
            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
}
