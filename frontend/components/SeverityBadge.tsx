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
      bg: "bg-emerald-500 text-white",
      icon: CheckCircle,
      label: "Self-Care",
    },
    yellow: {
      bg: "bg-amber-500 text-white",
      icon: AlertTriangle,
      label: "See a Doctor",
    },
    red: {
      bg: "bg-red-500 text-white",
      icon: AlertOctagon,
      label: "Emergency — Seek Help Now",
    },
  }[level];

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${config.bg}`}
    >
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
      <span>{config.label}</span>
    </span>
  );
}
