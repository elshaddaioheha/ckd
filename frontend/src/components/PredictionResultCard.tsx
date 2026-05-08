"use client";

import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Info } from "lucide-react";
import { clsx } from "clsx";
import type { CKDPredictionResult } from "@/types/prediction";

interface PredictionResultCardProps {
  result: CKDPredictionResult;
  onReset: () => void;
}

export default function PredictionResultCard({ result, onReset }: PredictionResultCardProps) {
  const isCkd = result.prediction === "ckd";
  const probabilityPercent = Math.round(result.risk_probability * 100);

  const riskStyles = {
    Low: {
      border: "border-emerald-200",
      bg: "bg-emerald-50/50",
      iconBg: "bg-emerald-500",
      text: "text-emerald-700",
      indicator: "bg-emerald-500",
      icon: CheckCircle,
    },
    Moderate: {
      border: "border-amber-200",
      bg: "bg-amber-50/50",
      iconBg: "bg-amber-500",
      text: "text-amber-700",
      indicator: "bg-amber-500",
      icon: AlertTriangle,
    },
    High: {
      border: "border-rose-200",
      bg: "bg-rose-50/50",
      iconBg: "bg-rose-500",
      text: "text-rose-700",
      indicator: "bg-rose-500",
      icon: XCircle,
    },
  }[result.risk_level];

  const Icon = riskStyles.icon;

  return (
    <div className={clsx(
      "animate-fade-up overflow-hidden rounded-3xl border-2 transition-all duration-500 print:rounded-none print:border-none print:shadow-none",
      riskStyles.border,
      riskStyles.bg
    )}>
      {/* Top Banner */}
      <div className={clsx("px-5 sm:px-8 py-6 sm:py-10 text-center", riskStyles.text)}>
        <div className={clsx(
          "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg shadow-current/20",
          riskStyles.iconBg
        )}>
          <Icon size={32} />
        </div>
        
        <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">
          Risk Assessment Result
        </h2>
        <p className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          {result.risk_level} Risk
        </p>
        
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className={clsx(
            "rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white",
            isCkd ? "bg-rose-600" : "bg-emerald-600"
          )}>
            {isCkd ? "CKD Detected" : "No CKD Detected"}
          </span>
          <span className="rounded-full bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            {probabilityPercent}% Confidence
          </span>
        </div>
      </div>

      {/* Progress Bar / Visualizer */}
      <div className="bg-white/40 px-5 sm:px-8 py-2 backdrop-blur-md">
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
          <div 
            className={clsx("h-full transition-all duration-1000", riskStyles.indicator)} 
            style={{ width: `${probabilityPercent}%` }}
          />
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-white px-5 sm:px-8 py-6 sm:py-10">
        <div className="space-y-6">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Info size={16} className="text-primary" />
              Clinical Interpretation
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {isCkd 
                ? "The clinical values provided align with patterns typically associated with Chronic Kidney Disease. Further diagnostic confirmation via biopsy or imaging may be necessary."
                : "Based on the provided laboratory values, there is a low probability of Chronic Kidney Disease. However, regular screening is advised for patients with underlying conditions."
              }
            </p>
          </div>

          <div className="rounded-2xl bg-muted/30 p-5 border border-border/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Generated Clinical Summary
            </h4>
            <p className="text-xs font-mono leading-relaxed text-foreground/80 italic">
              &quot;{result.clinical_text}&quot;
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row pt-4 print:hidden">
            <button
              onClick={onReset}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-primary/90 active:scale-95"
            >
              <RefreshCw size={16} />
              New Assessment
            </button>
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-white px-6 py-3.5 text-sm font-bold text-foreground transition-all hover:bg-muted active:scale-95"
            >
              Download PDF Report
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] leading-relaxed text-muted-foreground/60 uppercase tracking-widest font-medium">
          {result.disclaimer}
        </p>
      </div>
    </div>
  );
}
