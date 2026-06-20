import { ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Language, trans } from "../translations";

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
  language: Language;
}

export default function Footer({ onScrollToSection, language }: FooterProps) {
  const currentYear = new Date().getFullYear();
    const t = trans[language];

  return (
    <footer className="bg-transparent border-t border-white/5 py-12 text-left relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Logo Brand / Wording */}
          <div className="md:col-span-4 space-y-4">
            <div 
              onClick={() => onScrollToSection("hero")}
              className="flex items-center gap-2.5 cursor-pointer group w-fit"
            >
              <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1.5px] transition-transform duration-300 group-hover:scale-105">
                <div className="h-full w-full bg-[#020617] rounded-[7px] flex items-center justify-center">
                  <span className="font-display font-bold text-base bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">C</span>
                </div>
              </div>
              <span className="font-display font-semibold text-lg group-hover:text-cyan-400 transition-colors text-white">
                {t.brandName}
              </span>
            </div>
            
            <p className="text-slate-200 text-sm font-medium tracking-tight">
              Clear websites. Better enquiries. Less confusion.
            </p>
            
            <p className="text-slate-400 text-xs font-light max-w-sm leading-relaxed">
              We help local service providers and growing companies construct professional interfaces that build customer trust and capture bookings smoothly.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
              General Navigation
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              <button
                onClick={() => onScrollToSection("services")}
                className="text-xs font-medium text-slate-400 hover:text-cyan-400 cursor-pointer text-left transition-colors"
              >
                {t.navServices}
              </button>
              <button
                onClick={() => onScrollToSection("pricing")}
                className="text-xs font-medium text-slate-400 hover:text-cyan-400 cursor-pointer text-left transition-colors"
              >
                {t.navPricing}
              </button>
              <button
                onClick={() => onScrollToSection("process")}
                className="text-xs font-medium text-slate-400 hover:text-cyan-400 cursor-pointer text-left transition-colors"
              >
                {t.navProcess}
              </button>
              <button
                onClick={() => onScrollToSection("addons")}
                className="text-xs font-medium text-slate-400 hover:text-cyan-400 cursor-pointer text-left transition-colors"
              >
                {t.navAddons}
              </button>
              <button
                onClick={() => onScrollToSection("faq")}
                className="text-xs font-medium text-slate-400 hover:text-cyan-400 cursor-pointer text-left transition-colors"
              >
                {t.navFaq}
              </button>
              <Link
                to="/client-intake?source=footer"
                className="text-xs font-medium text-slate-400 hover:text-cyan-400 cursor-pointer text-left transition-colors"
              >
                {t.navContact}
              </Link>
            </div>
          </div>

          {/* Location & Status Coordinates */}
          <div className="md:col-span-3 space-y-4 text-left">
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-500 font-bold">
              Business Basics
            </h4>
            <div className="space-y-1 text-xs text-slate-400 font-light">
              <a href="mailto:hello@clarityspace.com.au" className="font-semibold text-cyan-400 hover:text-cyan-300 block mb-2">hello@clarityspace.com.au</a>
              <div className="text-slate-300">Service area:</div>
              <div>Sydney / Remote Australia</div>
              <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <a href="#" className="block hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>

        </div>

        {/* Outer bottom row bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-500 font-light flex items-center gap-2">
            &copy; {currentYear} {t.allRightsReserved}
            <span className="inline-block w-1 h-1 bg-slate-600 rounded-full mx-1"></span>
            Made with ❤️ in Sydney 
            <span className="inline-block w-1 h-1 bg-slate-600 rounded-full mx-1"></span>
            ABN: 45 690 307 094
          </span>
          
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer flex gap-1.5 items-center text-xs font-medium hover:bg-white/10"
            aria-label="Back to top"
          >
            <span>{t.backToTop}</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
}
