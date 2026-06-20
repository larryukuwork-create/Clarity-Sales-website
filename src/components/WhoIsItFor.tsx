import { motion } from "motion/react";
import { Award, GraduationCap, Wrench, Activity, Briefcase, Home } from "lucide-react";

interface WhoIsItForProps {}

interface TargetIndustry {
  id: string;
  icon: any;
  title: string;
  description: string;
  path?: string;
  example: string;
}

export default function WhoIsItFor({}: WhoIsItForProps) {
  const industries: TargetIndustry[] = [
    {
      id: "local-service",
      icon: Briefcase,
      title: "Local Service Businesses",
      description: "Cleaners, tradies, mechanics, salons, and mobile services looking to capture leads and look professional.",
      example: "Quote request websites, clear service area maps, and click-to-call integrations."
    },
    {
      id: "facebook-only",
      icon: Activity,
      title: "Facebook & Instagram Only",
      description: "Businesses relying entirely on social media that need a central hub to build trust and funnel real enquiries.",
      example: "Stand-alone professional websites that prove your credibility to cautious buyers."
    },
    {
      id: "outdated-websites",
      icon: Wrench,
      title: "Businesses with old websites",
      description: "If your website is slow, broken on mobile, or looks like it was built in 2012, we modernize it.",
      example: "Website redesigns that are fast, mobile-friendly, and SEO-ready."
    },
    {
      id: "need-enquiries",
      icon: Award,
      title: "Businesses needing more enquiries",
      description: "If you get traffic but no one calls or messages you, we fix your conversion flow.",
      example: "Custom quote forms, booking schedulers, and clear Call-To-Action buttons."
    }
  ];

  return (
    <section 
      id="who-it-is-for" 
      className="py-16 bg-transparent border-t border-white/5 relative overflow-hidden"
    >
      {/* Soft background cyan ambient light */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020617]/50 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-[#22d3ee] font-mono font-semibold">
            Who This Is For
          </span>
          <h2 className="text-3xl font-display font-black text-white tracking-tight mt-2 sm:text-4xl">
            Built for service businesses that need enquiries, bookings or quote requests
          </h2>
          <p className="text-slate-400 mt-4 text-base font-light font-sans">
            Every business has a signature enquiry path. We build specialized, professional flows designed around your target audience&apos;s daily routines.
          </p>
        </div>

        {/* 2x2 High-End Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {industries.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <motion.div
                key={ind.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="relative text-left p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-[#22d3ee]/30 transition-all group overflow-hidden"
              >
                {/* Diagonal background gloss */}
                <div className="absolute -inset-px bg-gradient-to-br from-[#22d3ee]/0 to-blue-500/0 rounded-2xl group-hover:from-[#22d3ee]/5 group-hover:to-transparent transition-all duration-300 pointer-events-none"></div>

                <div className="flex items-start gap-4">
                  {/* Icon Container with cyan border */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10 text-[#22d3ee] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 flex-1 select-none">
                    <h3 className="font-display font-semibold text-lg text-white group-hover:text-[#22d3ee] transition-colors leading-snug">
                      {ind.title}
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm font-light font-sans leading-relaxed">
                      {ind.description}
                    </p>
                  </div>
                </div>

                {/* Example application preview block inside the card */}
                <div className="mt-4 pt-3.5 border-t border-white/5 bg-slate-950/20 rounded-lg px-3 py-2.5">
                  <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider font-semibold">Active Blueprint Solution:</span>
                  <p className="text-[11px] text-[#38bdf8] font-sans font-light leading-relaxed mt-1">
                    {ind.example}
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
