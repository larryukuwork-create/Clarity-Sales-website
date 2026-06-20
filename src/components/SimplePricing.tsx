import { motion } from "motion/react";
import { Check, ShieldCheck } from "lucide-react";

export default function SimplePricing() {
  const packages = [
    {
      name: "Landing Page",
      price: "From $1,500",
      description: "Perfect for single marketing campaigns, new offers, or testing a business idea.",
      features: [
        "1 long-form scrolling page",
        "Mobile-responsive design",
        "Clear offer and call-to-action sections",
        "Simple contact/enquiry form",
        "Basic SEO setup",
        "Fast turnaround"
      ],
      popular: false
    },
    {
      name: "Small Business Website",
      price: "From $3,500",
      description: "Ideal for local services, trades, consultants, and established small businesses.",
      features: [
        "Up to 5 pages: Home, Services, About, Contact, FAQ/Gallery",
        "Mobile-responsive design",
        "Service-specific layouts",
        "Advanced quote/enquiry form",
        "Google Analytics setup",
        "Local SEO foundation"
      ],
      popular: true
    },
    {
      name: "Growth Website & Client Workflow",
      price: "From $5,500",
      description: "For businesses that want a stronger online presence, better enquiries, booking support, and smoother client follow-up.",
      features: [
        "Up to 8–10 website pages",
        "Multi-step enquiry/intake forms",
        "Booking calendar setup",
        "Automated email notifications",
        "Simple lead tracking dashboard",
        "Analytics, SEO foundation & launch handover"
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-16 bg-transparent border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            Pricing Guidance
          </span>
          <h2 className="text-3xl font-display font-black text-white tracking-tight mt-2 pb-2">
            Clear, transparent pricing guidelines
          </h2>
          <p className="text-slate-400 mt-4 text-base font-light font-sans">
            Every project is unique, but we believe in being open about costs. Here is a general guide to help you budget. We will provide an exact, fixed quote after learning about your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {packages.map((pkg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative rounded-2xl p-6 md:p-8 flex flex-col justify-between text-left ${pkg.popular ? "bg-cyan-950/20 border-cyan-500/30 ring-1 ring-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]" : "bg-slate-900/30 border-white/5"}`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-6 translate-y-[-50%]">
                  <span className="bg-cyan-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Common
                  </span>
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-display font-semibold text-white">{pkg.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono text-white tracking-tight">{pkg.price}</span>
                </div>
                <p className="mt-4 text-sm font-light text-slate-400 leading-relaxed">
                  {pkg.description}
                </p>
                
                <ul className="mt-6 border-t border-white/5 pt-6 space-y-3">
                  {pkg.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex space-x-3 text-sm text-slate-300 font-light">
                      <Check className="h-5 w-5 text-cyan-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8">
                <a
                  href="/client-intake?source=pricing"
                  className={`block text-center w-full py-3 px-4 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer ${
                    pkg.popular 
                      ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20" 
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  Request Exact Quote
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final Pricing Note */}
        <p className="mt-6 text-center text-xs text-slate-500 font-light max-w-2xl mx-auto italic font-sans leading-relaxed">
          *Final pricing depends on content, integrations, revisions, and whether custom functionality is required.
        </p>

        {/* Dynamic Trust Policy Alert Box */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 max-w-3xl mx-auto p-5 bg-[#0a1122]/40 border border-cyan-500/10 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-left"
        >
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Zero Upfront Financial Risk</h4>
            <p className="text-xs text-slate-450 leading-relaxed font-light">
              We operate on a <strong>100% Client Confidence Guarantee</strong>. We design & present your initial design drafts completely free of charge. You only sign-off on the layout and clear the kickoff deposit once you are completely happy with the visual drafts.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
