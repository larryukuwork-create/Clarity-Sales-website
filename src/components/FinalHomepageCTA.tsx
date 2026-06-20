import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export default function FinalHomepageCTA() {
  return (
    <section className="py-20 bg-transparent text-center relative overflow-hidden border-t border-white/5">
      {/* Radiant spot back light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 select-none">
        
        {/* Soft tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-800/10 rounded-full text-xs text-cyan-400 font-mono tracking-wider uppercase font-semibold">
          No Sales Pressure. Absolute Transparency.
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
          Ready to make your website easier to enquire from?
        </h2>

        {/* Explanation describing structured followups */}
        <p className="text-slate-405 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
          Unlock an organised process that builds customer trust from the very first click. Receive a structured workspace, secure project folder, and direct manual support.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-4">
          <Link
            to="/client-intake?source=homepage&type=project_intake"
            className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold font-sans transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10 text-sm sm:text-base shrink-0"
          >
            <span>Request Website Quote</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>
          
          <Link
            to="/free-website-check"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md rounded-xl font-bold font-sans border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base shrink-0"
          >
            <span>Request Free Website Check</span>
            <ArrowUpRight className="w-4.5 h-4.5 text-slate-400" />
          </Link>
        </div>

      </div>
    </section>
  );
}
