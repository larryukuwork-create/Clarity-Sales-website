import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Language, Currency } from "../translations";

interface HeroProps {
  onScrollToSection: (sectionId: string) => void;
  onSelectRecommendedPackage: () => void;
  language: Language;
  currency: Currency;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] } }
};

export default function Hero({ 
  onScrollToSection, 
  onSelectRecommendedPackage,
  language,
  currency
}: HeroProps) {
  const priceDisplay = "3,500";

  return (
    <section 
      id="hero" 
      className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-transparent"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Content Left */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6 w-fit backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-450 animate-pulse"></span>
              Clarity Space Consultancy
            </motion.div>

            {/* Main Headline */}
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-[3.8rem] font-bold text-white leading-[1.1] mb-6 tracking-tight font-display font-black">
              Websites and enquiry systems for small businesses that need <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">more leads, bookings, and trust online.</span>
            </motion.h1>

            {/* Description */}
            <motion.p variants={itemVariants} className="text-base sm:text-lg text-slate-350 mb-8 max-w-2xl leading-relaxed font-light">
              We help cafés, cleaners, tradies, salons, clinics, tutors, and local businesses replace outdated pages with professional websites that convert visitors into enquiries.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link
                to="/client-intake?source=homepage"
                className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold font-sans shadow-xl shadow-cyan-500/10 transition-all cursor-pointer text-center select-none block"
              >
                Get a Website Quote
              </Link>
              
              <button
                onClick={() => onScrollToSection("services")}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md rounded-xl font-bold font-sans border border-white/10 transition-all cursor-pointer text-center select-none"
              >
                See Our Services
              </button>
            </motion.div>

            {/* Trust check factors below CTAs */}
            <motion.div variants={itemVariants} className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 text-xs sm:text-sm text-slate-400 select-none font-light">
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Fast turnaround</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Mobile-first design</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Approve design draft before paying deposit</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Quote forms and booking flows</span>
              </div>
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>SEO-ready pages</span>
              </div>
              <div className="flex items-center gap-2.5 lg:col-span-2">
                <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Australian small business focused</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Premium Hero Card Right - matches spec recommendation design */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: 1.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-5 flex items-center justify-center lg:justify-end"
          >
            <div className="w-full max-w-sm bg-slate-900/50 backdrop-blur-2xl rounded-[2rem] p-8 shadow-[0_0_80px_rgba(34,211,238,0.1)] relative border border-white/10 text-white select-none">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] rounded-full shadow-lg whitespace-nowrap">
                Recommended Choice
              </div>
              
              <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/10 text-left">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">
                    Lead Website
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-light">
                    Complete Enquiry Solution
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] sm:text-xs font-bold text-cyan-400 block tracking-wider uppercase">{currency} / FROM</span>
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none mt-1">{priceDisplay}</div>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/25 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                  </div>
                  5–8 Responsive Service Pages
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/25 border border-cyan-500/30 flex items-center justify-center text-[#22d3ee] shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                  </div>
                  Conversion-Focused Layout
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/25 border border-cyan-500/30 flex items-center justify-center text-[#22d3ee] shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                  </div>
                  Google Analytics Integration
                </li>
                <li className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/25 border border-cyan-500/30 flex items-center justify-center text-[#22d3ee] shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>
                  </div>
                  Local SEO Setup Included
                </li>
              </ul>
              
              <button 
                onClick={onSelectRecommendedPackage}
                className="w-full py-4 bg-cyan-500 text-[#0f172a] rounded-xl font-bold hover:bg-cyan-400 transition-all cursor-pointer text-sm sm:text-base shadow-[0_0_20px_rgba(34,211,238,0.25)] select-none"
              >
                Choose Lead Plan
              </button>
              <p className="mt-5 text-center text-xs text-slate-400 leading-normal">
                Best for service providers wanting more organic local customer enquiries.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
