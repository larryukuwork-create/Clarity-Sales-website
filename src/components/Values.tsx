import { motion } from "motion/react";
import { Compass, Target, Zap, Rocket } from "lucide-react";

interface ValuesProps {}

export default function Values({}: ValuesProps) {
  const cards = [
    {
      id: "outdated",
      title: "My website looks outdated",
      description: "You know your website looks like it was built 10 years ago, and you worry it's costing you customers who judge your business based on it.",
      icon: Compass,
      color: "bg-cyan-950/40 border-cyan-500/20 text-cyan-400"
    },
    {
      id: "facebook-only",
      title: "I only have a Facebook page",
      description: "You've survived on word of mouth and social media, but you're losing out to competitors who look more established with a real website.",
      icon: Target,
      color: "bg-blue-950/40 border-blue-500/20 text-blue-400"
    },
    {
      id: "lose-track",
      title: "People message me but I lose track",
      description: "Quotes get lost in Facebook, Instagram DMs, or texts. You need a structured quote form that sends enquiries straight to your email.",
      icon: Zap,
      color: "bg-purple-950/40 border-purple-500/20 text-purple-400"
    },
    {
      id: "trust",
      title: "I want more professional trust online",
      description: "You do amazing work, but your online presence doesn't reflect your quality. A modern site proves you are professional and reliable.",
      icon: Rocket,
      color: "bg-emerald-950/40 border-emerald-500/20 text-emerald-400"
    }
  ];

  return (
    <section 
      id="problems-solved" 
      className="py-16 bg-transparent border-t border-white/5 relative"
    >
      {/* Background radial soft light */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020617] to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#22d3ee] font-mono font-semibold">
            Problems We Solve
          </span>
          <h2 className="text-3xl font-display font-black text-white tracking-tight mt-2 sm:text-4xl">
            Does this sound like your business?
          </h2>
          <p className="text-slate-400 mt-4 text-base font-light font-sans">
            We move away from complex tech jargon to focus entirely on clean presentation and solving the core problems small businesses face online.
          </p>
        </div>

        {/* 4 Premium Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="relative rounded-2xl p-6 bg-slate-900/30 border border-white/5 hover:border-cyan-500/20 transition-all duration-300 hover:translate-y-[-4px] group text-left flex flex-col justify-between"
              >
                {/* Subtle highlight gradient hover */}
                <div className="absolute -inset-px bg-gradient-to-br from-cyan-500/0 via-blue-500/0 to-purple-500/0 rounded-2xl group-hover:from-cyan-500/5 group-hover:to-transparent transition-all pointer-events-none"></div>

                <div>
                  {/* Icon Container */}
                  <div className={`p-3 rounded-xl border w-fit ${card.color} mb-6 transition-transform duration-300 group-hover:scale-105 shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-display font-semibold text-lg text-white mb-2.5 tracking-tight group-hover:text-cyan-400 transition-colors leading-tight">
                    {card.title}
                  </h3>
                  
                  <p className="text-slate-400 text-xs sm:text-sm font-sans font-light leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
