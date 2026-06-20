import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Language, getProcessSteps, trans } from "../translations";

interface ProcessProps {
  language: Language;
}

export default function Process({ language }: ProcessProps) {
    const t = trans[language];
  const processStepsList = getProcessSteps(language);
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <section 
      id="process" 
      className="py-18 bg-transparent border-t border-white/5 text-left relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono font-semibold">
            How we deliver
          </span>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight mt-2 sm:text-4xl">
            {t.processTitle}
          </h2>
          <p className="text-slate-400 mt-3 font-light">
            {t.processSubtitle}
          </p>
        </div>

        {/* 6-Steps Interactive Progress Line */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-10 max-w-5xl">
          {processStepsList.map((step) => {
            const isActive = activeStep === step.stepNumber;
            const isCompleted = activeStep > step.stepNumber;
            return (
              <button
                key={step.stepNumber}
                onClick={() => setActiveStep(step.stepNumber)}
                className={`group flex flex-col pt-3 pb-4 px-2 border-t-4 transition-all text-left cursor-pointer ${
                  isActive
                    ? "border-cyan-500 text-white"
                    : isCompleted
                    ? "border-slate-700 text-slate-300"
                    : "border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10"
                }`}
              >
                <span className="text-xs font-mono font-bold tracking-wider uppercase mb-1">
                  Step 0{step.stepNumber}
                </span>
                <span className="text-xs font-semibold truncate group-hover:text-cyan-400 transition-colors">
                  {step.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Highlight Focus Card representing the active Selected Process Step */}
        <div className="glass-card rounded-2xl p-6 sm:p-10 max-w-4xl relative overflow-hidden">
          {/* Subtle step giant watermark in back */}
          <div className="absolute right-6 -bottom-8 pointer-events-none text-white/5 font-display font-black text-9xl select-none leading-none">
            0{activeStep}
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 text-[10px] font-bold font-mono tracking-wider bg-cyan-950/40 border border-cyan-900/30 text-cyan-400 uppercase rounded-lg">
                Active Project Phase
              </div>
              
              <h3 className="text-xl font-display font-bold text-white tracking-tight">
                {processStepsList[activeStep - 1].title}
              </h3>
              
              <p className="text-slate-300 text-xs font-semibold">
                {processStepsList[activeStep - 1].description}
              </p>
              
              <p className="text-slate-400 text-xs font-light leading-relaxed max-w-xl">
                {processStepsList[activeStep - 1].detail}
              </p>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 pt-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Transparent feedback loops with zero technical fluff.</span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col justify-center items-start md:items-end gap-3 mt-4 md:mt-0">
              <span className="text-xs font-mono text-slate-500 font-medium">
                Want to know more?
              </span>
              <button
                onClick={() => {
                  if (activeStep < 6) {
                    setActiveStep(activeStep + 1);
                  } else {
                    setActiveStep(1);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-[#020617] hover:bg-[#020617]/80 text-xs text-cyan-300 hover:text-white border border-white/5 transition-all cursor-pointer font-medium"
              >
                {activeStep < 6 
                  ? "Review Next Step"
                  : "Return to Step 1"}
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
