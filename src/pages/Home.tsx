// Copy of the original App.tsx body without the routing shell. We'll export the Home component.
import { useState, useEffect, ReactNode } from "react";
import { motion } from "motion/react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Clock, Check, Activity } from "lucide-react";
import Header from "../components/Header";
import { db, isFirebaseConfigured } from "../firebase";
import { query, collection, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import Hero from "../components/Hero";
import Values from "../components/Values";
import Services from "../components/Services";
import SimplePricing from "../components/SimplePricing";
import Addons from "../components/Addons";
import Process from "../components/Process";
import FAQ from "../components/FAQ";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";
import SOWTemplates from "../components/SOWTemplates";
import WhoIsItFor from "../components/WhoIsItFor";
import CaseStudy from "../components/CaseStudy";
import IntakeCTABlocks from "../components/IntakeCTABlocks";
import FinalHomepageCTA from "../components/FinalHomepageCTA";
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

const FadeIn = ({ children, delay = 0 }: { children: ReactNode, delay?: number }) => (
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

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero");
  const [language, setLanguage] = useState<Language>("en");
  const [currency, setCurrency] = useState<Currency>("AUD");

  const [estimatePackage, setEstimatePackage] = useState("");
  const [estimateAddons, setEstimateAddons] = useState<string[]>([]);
  const [estimatePrice, setEstimatePrice] = useState("");
  const [recentProjectToken, setRecentProjectToken] = useState<string | null>(null);
  const [recentProjectName, setRecentProjectName] = useState<string | null>(null);
  const [recentQuotePath, setRecentQuotePath] = useState<string | null>(null);
  const [recentQuoteName, setRecentQuoteName] = useState<string | null>(null);
  const [lastViewedStep, setLastViewedStep] = useState<string | null>(null);
  
  const location = useLocation();

  useEffect(() => {
    try {
      const token = localStorage.getItem('clarity_recent_project_token');
      const name = localStorage.getItem('clarity_recent_project_name');
      if (token) {
        setRecentProjectToken(token);
        setRecentProjectName(name || "Your Quote Request");
      }
      const quotePath = localStorage.getItem('clarity_recent_quote_path');
      const quoteName = localStorage.getItem('clarity_recent_quote_name');
      if (quotePath) {
        setRecentQuotePath(quotePath);
        setRecentQuoteName(quoteName || "Custom Web Proposal");
      }
      const step = localStorage.getItem('clarity_last_viewed_step');
      if (step) {
        setLastViewedStep(step);
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    // Parse query parameter ?sec=
    const params = new URLSearchParams(location.search);
    const secParam = params.get("sec");
    if (secParam) {
      setTimeout(() => handleScrollToSection(secParam), 150);
      return;
    }

    // Basic route to section mapping
    const pathMap: Record<string, string> = {
      "/services": "services",
      "/packages": "pricing",
      "/free-website-check": "contact", // Or direct them specifically if a diff section
      "/contact": "contact"
    };
    
    if (pathMap[location.pathname]) {
      setTimeout(() => handleScrollToSection(pathMap[location.pathname]), 100);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "services", "comparison", "pricing", "process", "addons", "faq", "contact"];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    if (sectionId === "pricing") {
      window.location.href = "/work";
      return;
    }
    if (sectionId === "process") {
      window.location.href = "/process";
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -80; 
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  const handleApplyEstimateToForm = (pkgName: string, addons: string[], price: string) => {
    setEstimatePackage(pkgName);
    setEstimateAddons(addons);
    setEstimatePrice(price);
  };

  const handleClearPresets = () => {
    setEstimatePackage("");
    setEstimateAddons([]);
    setEstimatePrice("");
  };

   const handleSelectRecommendedFromHero = () => {
    const displayName = "Small Business Website";
    const displayPrice = "AUD 3,500";
    setEstimatePackage(displayName);
    setEstimateAddons([]);
    setEstimatePrice(displayPrice);

    handleScrollToSection("pricing");
  };

  const presetPkgId = estimatePackage ? (estimatePackage.includes("Landing") ? "landing_page" : estimatePackage.includes("Small") ? "small_business_website" : "growth_website_client_workflow") : "small_business_website";

  const applyPackageTarget = (id: string) => {
    const pkgNameMap: Record<string, string> = {
      landing_page: "Landing Page",
      small_business_website: "Small Business Website",
      growth_website_client_workflow: "Growth Website & Client Workflow",
    };
    const priceMap: Record<string, string> = {
      landing_page: "AUD 1,500",
      small_business_website: "AUD 3,500",
      growth_website_client_workflow: "AUD 5,500",
    };
    setEstimatePackage(pkgNameMap[id] || "Small Business Website");
    setEstimatePrice(priceMap[id] || "AUD 3,500");
    setEstimateAddons([]);
  };

  const hasBanner = !!(recentProjectToken || recentQuotePath);

  return (
    <div id="clarity-space-root" className="min-h-screen flex flex-col justify-between bg-transparent font-sans text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-white relative bg-[#020617]">
      {recentProjectToken ? (
        <div className="bg-cyan-950 text-cyan-200 py-2.5 px-4 text-center text-sm font-medium border-b border-cyan-800 z-[60] flex items-center justify-center gap-2 flex-wrap fixed top-0 w-full shadow-md animate-fadeIn">
          <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Tracking active project: <span className="font-bold text-white">{recentProjectName}</span></span>
          
          <Link to={`/project-status/${recentProjectToken}`} className="inline-flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-2.5 py-1 rounded text-xs font-bold transition">
            View Status <ChevronRight className="w-3 h-3" />
          </Link>

          {lastViewedStep && (
            <Link to={`/client-intake?token=${recentProjectToken}&step=${lastViewedStep}`} className="inline-flex items-center gap-1 bg-slate-900 override-bg hover:bg-slate-800 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded text-xs font-semibold transition">
              Resume {lastViewedStep.charAt(0).toUpperCase() + lastViewedStep.slice(1)} Step <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      ) : recentQuotePath ? (
        <div className="bg-[#051524] text-cyan-200 py-3 px-4 text-center text-sm font-medium border-b border-cyan-800/80 z-[60] flex items-center justify-center gap-2 fixed top-0 w-full shadow-md">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>You have an active dynamic quote request: <span className="font-bold text-white">{recentQuoteName}</span></span>
          <Link to={recentQuotePath} className="ml-2 inline-flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 py-1 rounded-md font-bold transition">
            Go Back &amp; View Proposal <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      ) : null}
      <BackgroundEffects />
      
      <div className={hasBanner ? "mt-12" : ""}>
        <Header 
          onScrollToSection={handleScrollToSection} 
          activeSection={activeSection} 
          language={language}
          setLanguage={setLanguage}
          currency={currency}
          setCurrency={setCurrency}
          hasBanner={hasBanner}
        />
      </div>

      <main className="flex-grow z-10 relative">
        <FadeIn delay={0.1}>
          <Hero 
            onScrollToSection={handleScrollToSection}
            onSelectRecommendedPackage={handleSelectRecommendedFromHero}
            language={language}
            currency={currency}
          />
        </FadeIn>

        <FadeIn>
          <Values />
        </FadeIn>

        <FadeIn>
          <WhoIsItFor />
        </FadeIn>

        <FadeIn>
          <CaseStudy />
        </FadeIn>

        <FadeIn>
          <IntakeCTABlocks />
        </FadeIn>

        <FadeIn>
          <Services 
            onScrollToSection={handleScrollToSection}
            onSelectServicePackage={() => handleScrollToSection("pricing")}
            language={language}
          />
        </FadeIn>

        <FadeIn>
          <SimplePricing />
        </FadeIn>

        <FadeIn>
          <SOWTemplates language={language} />
        </FadeIn>

        <FadeIn>
          <Addons language={language} currency={currency} />
        </FadeIn>

        <FadeIn>
          <Process language={language} />
        </FadeIn>

        <FadeIn>
          <FAQ language={language} />
        </FadeIn>

        <FadeIn>
          <FinalHomepageCTA />
        </FadeIn>

        <FadeIn>
          <ContactForm
            packageSelection={estimatePackage}
            addonsList={estimateAddons}
            calculatedPrice={estimatePrice}
            onClearSelection={handleClearPresets}
            language={language}
            currency={currency}
          />
        </FadeIn>
      </main>

      <Footer onScrollToSection={handleScrollToSection} language={language} />
    </div>
  );
}
