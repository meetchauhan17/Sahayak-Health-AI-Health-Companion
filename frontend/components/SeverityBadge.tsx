import React from "react";
import { CheckCircle, AlertTriangle, AlertOctagon } from "lucide-react";

export type SeverityLevel = "green" | "yellow" | "red";

interface SeverityBadgeProps {
  severity?: SeverityLevel | string;
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  if (!severity) return null;

  const normalized = severity.toLowerCase().trim();

  let level: SeverityLevel = "yellow";
  if (normalized === "green" || normalized === "low") {
    level = "green";
  } else if (normalized === "red" || normalized === "high" || normalized === "emergency") {
    level = "red";
  } else if (normalized === "yellow" || normalized === "medium") {
    level = "yellow";
  }

  const config = {
    green: {
      bg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      icon: CheckCircle,
      label: "Self-Care",
      pulse: "",
    },
    yellow: {
      bg: "bg-amber-50 text-amber-700 border border-amber-200",
      icon: AlertTriangle,
      label: "See a Doctor",
      pulse: "",
    },
    red: {
      bg: "bg-red-50 text-red-700 border border-red-200",
      icon: AlertOctagon,
      label: "Emergency — Seek Help Now",
      pulse: "animate-pulse",
    },
  }[level];

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${config.bg} ${config.pulse}`}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
      <span>{config.label}</span>
    </span>
  );
}
