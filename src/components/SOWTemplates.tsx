import { motion } from "motion/react";
import { FileText, ExternalLink, Briefcase, Camera, Wrench, Utensils, ShoppingBag, Award, ArrowRight } from "lucide-react";
import { Language } from "../translations";

interface SOWTemplatesProps {
  language: Language;
}

export default function SOWTemplates({ language }: SOWTemplatesProps) {
  const isZh = (language as string) === "zh";

  // List of SOW Templates mapped with their paths, prices, and design goals
  const templates = [
    {
      id: "corporate",
      icon: Briefcase,
      title: isZh ? "企業及諮詢顧問提案書" : "Corporate & Advisory Proposal",
      path: "/static-business-quote",
      aliases: ["/business-quote", "/consultant-quote"],
      alignedPackage: isZh ? "潛客高信賴版網站 (Lead)" : "Lead Website Plan",
      pricing: {
        normal: "AUD 4,800",
        final: "AUD 3,500",
        discount: "Lead Bundle"
      },
      desc: isZh 
        ? "專為高信任度的金融、投資、法律顧問與專業合夥人團隊打造。包含客戶甄別及諮詢引導架構、合夥人資歷展現以及極速交付標準。"
        : "Designed for high-trust financial advisers, legal partnerships, and executive consultants. Features dynamic lead screening, partner bios, and priority SLAs.",
      color: "from-blue-500/10 to-cyan-500/10",
      accent: "text-blue-400 border-blue-500/20"
    },
    {
      id: "creative",
      icon: Camera,
      title: isZh ? "創意機構與作品集提案書" : "Creative Agency & Portfolio SOW",
      path: "/portfolio-quote",
      aliases: ["/portfolio-website"],
      alignedPackage: isZh ? "潛客高信賴版網站 (Lead)" : "Lead Website Plan",
      pricing: {
        normal: "AUD 4,800",
        final: "AUD 3,500",
        discount: "Lead Bundle"
      },
      desc: isZh
        ? "專為視覺要求極高的建築師、攝影師和設計工作室量身定制。具備精美的全屏網格展現與高畫質視網膜(Retina)圖像優化。"
        : "Crafted for visual creatives, architects, premium photographers, and design studios. Features fullscreen masonry grids, instant retina assets, and ultra-sleek layout aesthetics.",
      color: "from-purple-500/10 to-pink-500/10",
      accent: "text-purple-400 border-purple-500/20"
    },
    {
      id: "trades",
      icon: Wrench,
      title: isZh ? "水電工程及工程承包商方案" : "Trades & Contractors Lead SOW",
      path: "/trades-quote",
      aliases: ["/trades-website"],
      alignedPackage: isZh ? "基礎形象版網站 (Starter)" : "Starter Website Plan",
      pricing: {
        normal: "AUD 2,200",
        final: "AUD 1,500",
        discount: "Starter Price"
      },
      desc: isZh
        ? "針對高轉化率的在地工匠、水電管路、空調安裝等工程承包商。專注於即時撥打電話、區域聯絡覆蓋以及高信譽五星好評導流。"
        : "Optimized for plumbing, electrical, and construction contractors. Focused on click-to-call conversions, service area grids, and rapid lead-form intakes.",
      color: "from-amber-500/10 to-orange-500/10",
      accent: "text-amber-400 border-amber-500/20"
    },
    {
      id: "dining",
      icon: Utensils,
      title: isZh ? "餐飲與咖啡廳預約提案書" : "Cafe & Dining Menu SOW",
      path: "/restaurant-quote",
      aliases: ["/restaurant-website"],
      alignedPackage: isZh ? "線上預約排班平台 (Booking)" : "Booking Platform Plan",
      pricing: {
        normal: "AUD 8,500",
        final: "AUD 6,500",
        discount: "Booking Deal"
      },
      desc: isZh
        ? "結合餐飲電子菜單、團體宴席預訂與營業時間導航。並內嵌結構化商家地圖標記(Schema)以大幅提升Google搜尋排序。"
        : "Combines beautiful responsive food/drink menus, party group bookings, location guides, and structured local business schema to rank local delivery searches.",
      color: "from-emerald-500/10 to-teal-500/10",
      accent: "text-emerald-400 border-emerald-500/20"
    },
    {
      id: "retail",
      icon: ShoppingBag,
      title: isZh ? "在地精品零售商方案" : "Bespoke Boutique Showcase SOW",
      path: "/local-quote",
      aliases: ["/local-business-quote"],
      alignedPackage: isZh ? "潛客高信賴版網站 (Lead)" : "Lead Website Plan",
      pricing: {
        normal: "AUD 4,800",
        final: "AUD 3,500",
        discount: "Lead Bundle"
      },
      desc: isZh
        ? "專為精品買手店、珠寶展廳或美甲美睫沙龍量身打造。強調動態當季視覺 Lookbook 以及『店內取貨(Click-and-Collect)』引流表單。"
        : "Bespoke lookbooks and high-fashion brand directories for luxury gift shops, high-street salons, or craft labels. Integrates convenient click-and-collect enquiry workflows.",
      color: "from-rose-500/10 to-red-500/10",
      accent: "text-rose-400 border-rose-500/20"
    },
    {
      id: "swim",
      icon: Award,
      title: isZh ? "游泳學校及體育學院平台" : "Swim Academy Scheduler SOW",
      path: "/swimming-school-quote",
      aliases: [],
      alignedPackage: isZh ? "線上預約排班平台 (Booking)" : "Booking Platform Plan",
      pricing: {
        normal: "AUD 8,500",
        final: "AUD 6,500",
        discount: "Booking Deal"
      },
      desc: isZh
        ? "分校課表預約及排班平台。支援分校/分店教練管理、小組排班動態分配以及完備提案。"
        : "Our premiere sports coaching and swimming academy build supporting multi-branch class selectors, trainer assignments, and streamlined booking flows.",
      color: "from-cyan-500/10 to-blue-500/10",
      accent: "text-cyan-400 border-cyan-500/20"
    }
  ];

  const handleNavigateToTemplate = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section 
      id="sow-templates" 
      className="py-16 bg-transparent text-left relative overflow-hidden border-t border-white/5"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,#1e1b4b_0%,transparent_50%)] opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            {isZh ? "高保真提案藍圖" : "Live Blueprint Showcase"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight mt-2">
            {isZh ? "選擇您的產業：點擊預覽即時客製化提案" : "Live SOW & Interactive Proposal Templates"}
          </h2>
          <p className="text-slate-400 mt-2.5 text-sm sm:text-base font-light">
            {isZh
              ? "我們為不同產業預先配置了高質感的客戶端即時估價提案。點擊下方任何一個模板即可直接查看、微調、生成 PDF 或與我們設計師團隊連線。"
              : "We have compiled real-world interactive proposal sheets for active segments. Click any design below to explore customized specs, synchronized budgets, and instant export features."}
          </p>
        </div>

        {/* Templates Grid Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl, idx) => {
            const IconComponent = tpl.icon;
            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`relative rounded-2xl border border-white/10 p-6 flex flex-col justify-between bg-gradient-to-br ${tpl.color} backdrop-blur-md hover:border-cyan-500/45 transition-all group`}
              >
                {/* Upper Details */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${tpl.accent.split(" ")[0]} shrink-0`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    {/* Aligned Package Badge */}
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-slate-300">
                      {tpl.alignedPackage}
                    </span>
                  </div>

                  <h3 className="text-lg font-display font-semibold text-white mb-2 leading-snug group-hover:text-cyan-400 transition-colors">
                    {tpl.title}
                  </h3>

                  <p className="text-slate-400 text-xs font-light leading-relaxed mb-5 min-h-[48px]">
                    {tpl.desc}
                  </p>
                </div>

                {/* Pricing & Navigation Bar */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">
                      {isZh ? "原本預算金額" : "Normal Price"}
                    </span>
                    <span className="text-xs text-slate-400 line-through font-mono">
                      {tpl.pricing.normal}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono uppercase text-cyan-400 block font-bold">
                      {isZh ? "特惠驚喜金額" : "70% Direct Savings"}
                    </span>
                    <span className="text-sm font-semibold font-mono text-cyan-400">
                      {tpl.pricing.final}
                    </span>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleNavigateToTemplate(tpl.path)}
                      className="h-9 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1 text-[11px] font-bold font-mono border border-white/10 transition-all cursor-pointer whitespace-nowrap animate-pulse hover:animate-none"
                      title={isZh ? "查看提案書" : "View Statement of Work Specs"}
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isZh ? "提案書" : "SOW"}</span>
                    </button>
                    <button
                      onClick={() => handleNavigateToTemplate(`${tpl.path}/demo`)}
                      className="h-9 px-2 rounded-lg bg-cyan-400/10 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 flex items-center gap-1 text-[11px] font-bold font-mono border border-cyan-400/20 hover:border-transparent transition-all cursor-pointer whitespace-nowrap font-black"
                      title={isZh ? "查看演示網站" : "Launch Website Demo"}
                    >
                      <span>{isZh ? "演示" : "Live Demo"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Subtext with alternative alias routes */}
                {tpl.aliases.length > 0 && (
                  <div className="mt-3.5 pt-2 border-t border-dashed border-white/5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-slate-500 font-mono">
                    <span className="font-semibold uppercase tracking-wider">{isZh ? "支援網址:" : "Alias paths:"}</span>
                    {tpl.aliases.map((al) => (
                      <span 
                        key={al} 
                        onClick={() => handleNavigateToTemplate(al)}
                        className="cursor-pointer hover:text-cyan-400 border-b border-transparent hover:border-cyan-400 transition-all"
                      >
                        {al}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
