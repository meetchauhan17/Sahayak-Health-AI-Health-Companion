import Link from "next/link";
import { Heart, MessageCircle, Sparkles, MapPin, ArrowRight, ChevronRight } from "lucide-react";

// ─── How-It-Works steps ─────────────────────────────────────────────────────

const STEPS = [
  {
    icon: MessageCircle,
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/60",
    label: "Describe Symptoms",
  },
  {
    icon: Sparkles,
    color: "text-teal-500 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/60",
    label: "Get Guidance",
  },
  {
    icon: MapPin,
    color: "text-cyan-500 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/60",
    label: "Find Help Nearby",
  },
];

// ─── Feature pills ───────────────────────────────────────────────────────────

const FEATURES = [
  "English · हिंदी · ગુજરાતી",
  "Symptom Triage",
  "Hospital Finder",
  "Voice Input",
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col transition-colors">
      {/* ── Thin top accent bar ── */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400" />

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center px-6 pt-8 pb-4 text-center animate-fade-up">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-200 dark:shadow-none">
            <Heart className="w-8 h-8 text-white" strokeWidth={2.2} />
          </div>
          {/* Decorative ping */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500" />
          </span>
        </div>

        {/* App name */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          Sahayak{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-400 dark:to-cyan-400">
            Health
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 max-w-xs sm:max-w-sm leading-relaxed mb-5">
          Your multilingual AI health companion — available in English, हिंदी &amp; ગુજરાતી
        </p>

        {/* ── How it works ── */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-5 flex-wrap">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="flex items-center gap-2 sm:gap-4"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-11 h-11 rounded-xl ${step.bg} flex items-center justify-center shadow-xs`}
                  >
                    <Icon className={`w-5 h-5 ${step.color}`} strokeWidth={2} />
                  </div>
                  <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400 max-w-[68px] text-center leading-tight">
                    {step.label}
                  </span>
                </div>

                {/* Chevron between steps */}
                {i < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 flex-shrink-0 mb-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* ── CTA button ── */}
        <Link
          href="/chat"
          className="inline-flex items-center gap-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold text-base px-8 py-3.5 rounded-full shadow-md shadow-teal-200 dark:shadow-none hover:shadow-lg active:scale-95 transition-all duration-200 mb-5"
        >
          Start Chat
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* ── Feature pills ── */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xs">
          {FEATURES.map((feat) => (
            <span
              key={feat}
              className="text-[11px] font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60 px-3 py-1 rounded-full"
            >
              {feat}
            </span>
          ))}
        </div>
      </section>

      {/* ── Footer disclaimer ── */}
      <footer className="pb-4 px-6 text-center">
        <p className="text-xs text-gray-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
          AI-powered, not a substitute for professional medical advice.
          Always consult a qualified healthcare professional for medical decisions.
        </p>
      </footer>
    </main>
  );
}
