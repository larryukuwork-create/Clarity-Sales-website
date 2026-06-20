import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Language, Currency, trans } from "../translations";

interface HeaderProps {
  onScrollToSection: (sectionId: string) => void;
  activeSection: string;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  hasBanner?: boolean;
}

export default function Header({ 
  onScrollToSection, 
  activeSection,
  language,
  setLanguage,
  currency,
  setCurrency,
  hasBanner: hasBannerProp
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [hasBanner, setHasBanner] = useState(false);

  useEffect(() => {
    if (hasBannerProp !== undefined) {
      setHasBanner(hasBannerProp);
    } else {
      try {
        const hasToken = !!localStorage.getItem('clarity_recent_project_token');
        const hasQuote = !!localStorage.getItem('clarity_recent_quote_path');
        if ((hasToken || hasQuote) && window.location.pathname === "/") {
          setHasBanner(true);
        } else {
          setHasBanner(false);
        }
      } catch(e) {
        setHasBanner(false);
      }
    }
  }, [hasBannerProp]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const t = trans[language];

  const navItems = [
    { label: t.navServices, id: "services" },
    { label: t.navPricing, id: "pricing" },
    { label: t.navProcess, id: "process" },
    { label: t.navFaq, id: "faq" },
  ];

  return (
    <header
      id="header-navigation"
      className={`fixed left-0 right-0 z-50 transition-all duration-300 border-b ${hasBanner ? 'top-12' : 'top-0'} ${
        isScrolled
          ? "bg-[#020617]/60 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] py-3 sm:py-4"
          : "bg-transparent border-transparent py-5 sm:py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Brand */}
          <div 
            onClick={() => onScrollToSection("hero")}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1.5px] transition-transform duration-300 group-hover:scale-105 shrink-0">
              <div className="h-full w-full bg-[#020617] rounded-[7px] flex items-center justify-center">
                <span className="font-display font-bold text-base bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">C</span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                {t.brandName}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-500 font-mono font-medium -mt-1 scale-90 origin-left">
                {t.brandSubtitle}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Link Cluster */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onScrollToSection(item.id);
                    setIsOpen(false);
                  }}
                  className={`text-xs lg:text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "text-cyan-400"
                      : "text-slate-400 hover:text-cyan-400"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Localisation Switchers + CTA (Desktop) */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4 shrink-0">
            <Link
              to="/project-status/portal"
              className="px-3.5 py-1.5 border border-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 rounded-full text-[11px] lg:text-xs font-semibold cursor-pointer transition-all"
            >
              💼 Client Portal
            </Link>
            {/* CTA */}
            <Link
              id="cta-header"
              to="/client-intake?source=header"
              className="px-4 lg:px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs lg:text-sm font-bold rounded-full hover:from-cyan-300 hover:to-blue-400 transition-all shadow-md hover:shadow-cyan-500/10 cursor-pointer"
            >
              {t.ctaQuote}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#020617]/98 backdrop-blur-3xl border-b border-l border-r border-white/10 rounded-b-2xl py-6 px-4 shadow-[0_12px_40px_rgba(0,0,0,0.85)] animate-fadeIn mt-0">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onScrollToSection(item.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "bg-gradient-to-r from-cyan-950/20 to-blue-950/20 text-cyan-400 border-l-2 border-cyan-500 pl-3"
                    : "text-slate-300 hover:bg-slate-900/50 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="h-[1px] bg-white/5 my-3"></div>

            <Link
              to="/project-status/portal"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 px-4 text-center rounded-xl border border-slate-800 hover:border-cyan-500/20 text-slate-300 font-bold text-sm mb-2 hover:bg-slate-900 transition-all cursor-pointer block"
            >
              💼 Client Portal
            </Link>

            <Link
              to="/client-intake?source=header-mobile"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 px-4 text-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-md cursor-pointer block"
            >
              {t.ctaQuote}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
