import { motion } from "motion/react";
import { Coffee, ArrowRight } from "lucide-react";

export default function CaseStudy() {
  return (
    <section id="work" className="py-16 bg-transparent border-t border-white/5 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020617]/50 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#22d3ee] font-mono font-semibold">
            Real Result Example
          </span>
          <h2 className="text-3xl font-display font-black text-white tracking-tight mt-2 sm:text-4xl">
            See how it works in action
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-xl shadow-cyan-900/10"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row">
            {/* Left side text/content */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10">
              <div className="flex items-center gap-3 mb-6 text-slate-300">
                <div className="p-2.5 bg-yellow-900/40 border border-yellow-500/20 rounded-xl text-yellow-500">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg leading-none">Coastline Roasters</h3>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-slate-500 block mt-1">Cafe & Wholesale</span>
                </div>
              </div>

              <h4 className="text-2xl font-display font-black text-white tracking-tight mb-4 leading-snug">
                Captured wholesale enquiries and booked tables automatically.
              </h4>
              
              <p className="text-slate-400 font-light mb-8 text-sm leading-relaxed">
                Before working with us, they managed all roast orders via Instagram DMs. We built a fast, mobile-friendly site with a structured wholesale quote form and an automated weekend table booking system.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1.5 shrink-0 mt-1">
                    <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold leading-none">Before</span>
                    <div className="w-[1px] h-[18px] bg-white/10"></div>
                    <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold leading-none">After</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 line-through">Messy Instagram DMs for wholesale</p>
                    <p className="text-sm font-medium text-emerald-300 mt-2">Professional wholesale application form with instant email alerts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side visual mockup */}
            <div className="md:w-1/2 bg-[#020617] p-8 md:p-12 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.1),transparent_60%)]"></div>
              
              {/* Abstract window frame */}
              <div className="relative w-full aspect-[4/3] rounded-xl border border-white/10 bg-slate-900/50 shadow-2xl flex flex-col overflow-hidden group">
                 {/* Window header */}
                 <div className="h-6 bg-slate-950 flex items-center px-3 border-b border-white/5 shrink-0">
                   <div className="flex gap-1.5">
                     <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                     <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                     <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                   </div>
                 </div>
                 
                 {/* Window content */}
                 <div className="flex-1 p-5 relative flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-4 w-1/3 bg-white/10 rounded"></div>
                      <div className="h-10 w-3/4 bg-white/5 rounded"></div>
                      <div className="h-2 w-1/2 bg-white/5 rounded"></div>
                    </div>
                    
                    <div className="mt-8 self-end p-3 bg-cyan-950/40 border border-cyan-500/20 rounded-lg text-left w-3/4 translate-y-2 group-hover:translate-y-0 transition-transform">
                       <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">New Wholesale Enquiry</span>
                       <div className="h-1.5 w-full bg-white/20 rounded mb-1"></div>
                       <div className="h-1.5 w-4/5 bg-white/10 rounded"></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
