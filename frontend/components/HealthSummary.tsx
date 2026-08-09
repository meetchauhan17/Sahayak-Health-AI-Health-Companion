import React from "react";
import { Heart, Activity, Stethoscope, Lightbulb, ShieldCheck } from "lucide-react";
import SeverityBadge from "@/components/SeverityBadge";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HealthSummaryData {
  symptoms_discussed: string;
  advice_given: string;
  overall_severity: string;
  recommendation: string;
}

interface HealthSummaryProps {
  summary: HealthSummaryData;
  onClose: () => void;
}

// ─── Field config ─────────────────────────────────────────────────────────────

const FIELDS: {
  key: keyof HealthSummaryData;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "symptoms_discussed",
    label: "Symptoms Discussed",
    icon: <Activity className="w-3.5 h-3.5 text-blue-500" strokeWidth={2.5} />,
  },
  {
    key: "advice_given",
    label: "Advice Given",
    icon: <Stethoscope className="w-3.5 h-3.5 text-teal-500" strokeWidth={2.5} />,
  },
  {
    key: "recommendation",
    label: "Recommendation",
    icon: <Lightbulb className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.5} />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HealthSummary({ summary, onClose }: HealthSummaryProps) {
  return (
    <div className="w-full bg-white border border-teal-100 rounded-2xl shadow-md overflow-hidden animate-msg-in">
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <Heart className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Sahayak Health</p>
            <p className="text-teal-100 text-[10px] leading-tight">Health Conversation Summary</p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close summary"
          className="flex-shrink-0 w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors text-xs"
        >
          ✕
        </button>
      </div>

      {/* Severity row */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50/60 border-b border-slate-100">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={2.5} />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Overall Severity
        </span>
        <SeverityBadge severity={summary.overall_severity} />
      </div>

      {/* Summary fields */}
      <div className="divide-y divide-slate-100">
        {FIELDS.map(({ key, label, icon }) => (
          <div key={key} className="px-4 py-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              {icon}
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {label}
              </span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">{summary[key]}</p>
          </div>
        ))}
      </div>

      {/* Disclaimer footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          For informational purposes only · Not a substitute for professional medical advice
        </p>
      </div>
    </div>
  );
}
