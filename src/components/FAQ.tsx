import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Language, getFaqs, trans } from "../translations";

interface FAQProps {
  language: Language;
}

export default function FAQ({ language }: FAQProps) {
    const t = trans[language];
  const faqList = getFaqs(language);

  // Store open question IDs in state
  const [openId, setOpenId] = useState<string | null>("domain-hosting");

  const toggleFAQ = (id: string) => {
    if (openId === id) {
      setOpenId(null);
    } else {
      setOpenId(id);
    }
  };

  return (
    <section 
      id="faq" 
      className="py-18 bg-transparent border-t border-white/5 text-left relative overflow-hidden"
    >
      <div className="absolute top-[40%] right-[-10%] w-[35%] h-[35%] rounded-full bg-blue-900/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            Common Inquiries
          </span>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight mt-2 sm:text-4xl">
            {t.faqTitle}
          </h2>
          <p className="text-slate-400 mt-3 font-light">
            {t.faqSubtitle}
          </p>
        </div>

        {/* Accordions Stack */}
        <div className="space-y-4">
          {faqList.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "glass-card rounded-2xl border-cyan-500/30 shadow-[0_4px_20px_rgba(34,211,238,0.1)]"
                    : "glass-card rounded-2xl border-white/5 opacity-80 hover:border-white/10 hover:opacity-100"
                }`}
              >
                {/* Trigger bar button */}
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer select-none"
                >
                  <span className="text-sm sm:text-base font-semibold text-white tracking-tight pr-4 hover:text-cyan-400 transition-colors">
                    {faq.question}
                  </span>
                  <span className={`p-1.5 rounded-lg transition-colors ${isOpen ? "bg-cyan-500/10 text-cyan-400" : "bg-[#020617] text-slate-400"}`}>
                    {isOpen ? (
                      <Minus className="w-4 h-4 shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 shrink-0" />
                    )}
                  </span>
                </button>

                {/* Animated collapse content box */}
                <div
                  className={`transition-all duration-350 ease-in-out ${
                    isOpen ? "max-h-[350px] opacity-100 border-t border-white/5" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-5 text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
