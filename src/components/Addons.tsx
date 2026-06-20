import { AlertTriangle, Globe, Key, Mail, MessageSquare, CreditCard, Landmark } from "lucide-react";
import { Language, Currency, getAddons, getThirdPartyCosts, trans, convertCost } from "../translations";

interface AddonsProps {
  language: Language;
  currency: Currency;
}

// Helper to render relevant icons for third party expenses
const getThirdpartyIcon = (id: string) => {
  switch (id) {
    case "domain":
      return <Globe className="w-4 h-4 text-cyan-400" />;
    case "hosting":
      return <Key className="w-4 h-4 text-indigo-400" />;
    case "email":
      return <Mail className="w-4 h-4 text-purple-400" />;
    case "sms-email-provider":
      return <MessageSquare className="w-4 h-4 text-emerald-400" />;
    case "payment-gateway":
      return <CreditCard className="w-4 h-4 text-pink-400" />;
    case "ads-budget":
      return <Landmark className="w-4 h-4 text-rose-400" />;
    default:
      return <Globe className="w-4 h-4 text-cyan-400" />;
  }
};

export default function Addons({ language, currency }: AddonsProps) {
    const t = trans[language];
  const addonsList = getAddons(language, currency);
  const thirdPartyCosts = getThirdPartyCosts(language, currency);

  return (
    <section 
      id="addons" 
      className="py-18 bg-transparent border-t border-white/5 text-left relative overflow-hidden"
    >
      {/* Decorative Gradient Background subtle glow */}
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,transparent_50%)] opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            Growth & Operational Continuity
          </span>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight mt-2 sm:text-4xl">
            {t.addonsTitle}
          </h2>
          <p className="text-slate-400 mt-3 font-light">
            {t.addonsSubtitle}
          </p>
        </div>

        {/* 2-Column Core Add-ons Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {addonsList.map((addon) => {
            const isAds = addon.id === "google-ads";
            return (
              <div 
                key={addon.id}
                className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative group hover:border-cyan-500/30 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`flex h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor] ${isAds ? "bg-cyan-400 text-cyan-400" : "bg-blue-400 text-blue-400"}`}></span>
                    <h3 className="text-lg font-display font-bold text-white">{addon.name}</h3>
                  </div>
                  <p className="text-xs font-light text-slate-300 leading-relaxed mb-6">
                    {isAds ? (
                      "Target active customer searches in your industry. We design modern ad structures, write compelling copy, construct dedicated high-converting landing pages, and configure precise tracking."
                    ) : (
                      "Keep your platform fast, up-to-date and completely secure. Includes ongoing priorities for micro page edits, security dependencies checks, cloud logs review and DNS optimizations."
                    )}
                  </p>
                  
                  <div className="space-y-3.5 mb-6 bg-[#020617]/50 p-4 border border-white/5 rounded-xl">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-mono text-[10px] uppercase">
                        {isAds ? "One-time Setup Fee:" : "Basic Support Tier:"}
                      </span>
                      <span className="text-white font-semibold font-mono">
                        {isAds ? (
                          `${currency} ${convertCost(6000, currency).toLocaleString()} to ${currency} ${convertCost(12000, currency).toLocaleString()} setup`
                        ) : (
                          `${currency} ${convertCost(800, currency).toLocaleString()} to ${currency} ${convertCost(1500, currency).toLocaleString()} / mo`
                        )}
                      </span>
                    </div>
                    <div className="h-[1px] bg-white/5"></div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-mono text-[10px] uppercase">
                        {isAds ? "Monthly Management Fee:" : "Managed Premium Support:"}
                      </span>
                      <span className="text-cyan-400 font-medium font-mono">
                        {isAds ? (
                          `${currency} ${convertCost(3000, currency).toLocaleString()} to ${currency} ${convertCost(8000, currency).toLocaleString()} / mo`
                        ) : (
                          `${currency} ${convertCost(2000, currency).toLocaleString()} to ${currency} ${convertCost(4000, currency).toLocaleString()} / mo`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-white/5 pt-4 text-xs text-slate-500 italic">
                  * {addon.note}
                </div>
              </div>
            );
          })}
        </div>

        {/* Third-Party Operational Costs Callout Panel */}
        <div className="glass-card border-cyan-500/15 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
            <div className="p-2 sm:p-3 rounded-xl bg-yellow-500/10 text-yellow-400 mt-1">
              <AlertTriangle className="w-5 h-5 shrink-0" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-base sm:text-lg font-display font-bold text-white">
                {t.thirdPartyTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-light mt-1">
                To guarantee absolute billing transparency, these standard external licenses are paid directly to the service operators under your credentials & hold no markup. We test & integrate them securely at no added charge.
              </p>
            </div>
          </div>

          {/* Third Party Costs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {thirdPartyCosts.map((cost) => (
              <div 
                key={cost.id}
                className="bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-4 flex gap-3 text-left items-center group transition-colors animate-pulse-subtle"
              >
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:scale-105 transition-transform shrink-0">
                  {getThirdpartyIcon(cost.id)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-mono font-medium text-slate-300 hover:text-white block tracking-tight leading-tight mb-1 truncate">
                    {cost.name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-cyan-400 font-mono whitespace-nowrap">{cost.cost}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-light shrink-0 truncate">({cost.billing})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
