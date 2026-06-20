import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { FileText, Search, ArrowRight, Shield, Sparkles, FolderOpen, HelpCircle } from "lucide-react";

export default function IntakeCTABlocks() {
  return (
    <section className="py-16 bg-transparent relative overflow-hidden border-t border-white/5">
      {/* Decorative background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[25%] h-[25%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: Start with a clear website quote */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 rounded-3xl bg-slate-900/40 border border-cyan-500/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between relative group"
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none"></div>
            
            <div className="space-y-4">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl w-fit">
                <FileText className="w-6.5 h-6.5" />
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                Start with a clear website quote
              </h3>
              
              <p className="text-slate-350 text-sm sm:text-base font-light leading-relaxed">
                Tell me about your business, current website and goals. I’ll review your details and recommend the simplest path forward — whether that’s a clean website, enquiry flow, booking system, landing page or custom web tool. <strong>No payment is required upfront:</strong> we create your initial design draft first, and you only clear the kickoff deposit after reviewing and approving it.
              </p>
              
              {/* Trust badges */}
              <div className="pt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Structured Intake</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Secure Project Folder</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
              <Link
                to="/client-intake?source=homepage&type=project_intake"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold font-sans transition-all w-full sm:w-auto justify-center cursor-pointer select-none"
              >
                <span>Request Website Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Not ready for a quote yet? */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-8 rounded-3xl bg-slate-900/40 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between relative group"
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none"></div>
            
            <div className="space-y-4">
              <div className="p-3 bg-white/5 border border-white/10 text-slate-350 rounded-2xl w-fit">
                <Search className="w-6.5 h-6.5" />
              </div>
              
              <h3 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
                Not ready for a quote yet?
              </h3>
              
              <p className="text-slate-350 text-sm sm:text-base font-light leading-relaxed">
                Request a free website check and I’ll send 3 practical improvements for your current site.
              </p>
              
              {/* Trust badges */}
              <div className="pt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>3 Practical Improvements</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Manual Analysis</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
              <Link
                to="/free-website-check"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold font-sans transition-all w-full sm:w-auto justify-center cursor-pointer select-none"
              >
                <span>Request Free Website Check</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
