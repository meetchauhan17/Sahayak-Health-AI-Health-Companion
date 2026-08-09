import Link from "next/link";
import { MessageCircle, FileText, MapPin, ArrowRight, Users, Activity } from "lucide-react";

// ─── How-It-Works steps ─────────────────────────────────────────────────────

const STEPS = [
  {
    icon: MessageCircle,
    label: "Describe Symptoms",
    description: "Type or speak your symptoms in any language",
  },
  {
    icon: Activity,
    label: "AI Triage",
    description: "Get instant severity assessment and guidance",
  },
  {
    icon: MapPin,
    label: "Find Help Nearby",
    description: "Locate hospitals and clinics near you",
  },
];

// ─── Feature blocks ──────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Multilingual AI Chat",
    description: "English, Hindi, and Gujarati — switch at any time",
    color: "bg-blue-500",
  },
  {
    icon: Activity,
    title: "Symptom Triage",
    description: "Green, yellow, and red severity levels on every response",
    color: "bg-emerald-500",
  },
  {
    icon: MapPin,
    title: "Nearby Healthcare",
    description: "Real hospitals and clinics on an interactive map",
    color: "bg-amber-500",
  },
  {
    icon: Users,
    title: "Family Profiles",
    description: "Manage health records for your entire family",
    color: "bg-blue-500",
  },
  {
    icon: FileText,
    title: "Health Summaries",
    description: "One-click AI-generated PDF health reports",
    color: "bg-emerald-500",
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">

      {/* ── Hero — full blue-500 color block ── */}
      <section className="relative bg-blue-500 overflow-hidden">
        {/* Geometric background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 translate-x-32 -translate-y-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-20 translate-y-20 pointer-events-none" />
        <div className="absolute top-1/2 right-16 w-32 h-32 bg-white/5 rotate-45 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col items-center text-center">
          {/* Brand mark */}
          <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center mb-6">
            <Activity className="w-8 h-8 text-blue-500" strokeWidth={2.5} />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 max-w-3xl">
            Sahayak Health
          </h1>

          <p className="text-lg md:text-xl text-blue-100 font-medium max-w-xl mb-4 leading-relaxed">
            Your free multilingual AI health companion — available in English, Hindi, and Gujarati
          </p>

          {/* Language tags */}
          <div className="flex items-center gap-2 mb-10 flex-wrap justify-center">
            {["English", "हिंदी", "ગુજરાતી"].map((lang) => (
              <span
                key={lang}
                className="text-xs font-semibold text-blue-500 bg-white px-3 py-1 rounded-md tracking-wide uppercase"
              >
                {lang}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-white text-blue-500 font-bold text-base px-8 py-4 rounded-md hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Start Health Check
            <ArrowRight className="w-5 h-5" />
          </Link>

          <p className="mt-4 text-xs text-blue-200 font-medium">
            Free — no account required
          </p>
        </div>
      </section>

      {/* ── How it works — white background ── */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2 text-center">
            How it works
          </h2>
          <p className="text-gray-500 text-center mb-12 font-medium">
            Three steps from symptoms to guidance
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  className="group bg-gray-100 rounded-lg p-8 hover:scale-[1.02] transition-all duration-200 cursor-default"
                >
                  {/* Step number */}
                  <div className="text-5xl font-extrabold text-gray-200 mb-4 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="w-12 h-12 rounded-md bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.label}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features — gray-100 color block ── */}
      <section className="bg-gray-100 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2 text-center">
            Everything you need
          </h2>
          <p className="text-gray-500 text-center mb-12 font-medium">
            Comprehensive health guidance at your fingertips
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group bg-white rounded-lg p-6 hover:scale-[1.02] transition-all duration-200 cursor-default"
                >
                  <div
                    className={`w-12 h-12 rounded-md ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA — blue-500 color block ── */}
      <section className="relative bg-blue-500 py-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-white/5 -translate-x-16 -translate-y-16 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-white/5 translate-x-20 translate-y-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to check your symptoms?
          </h2>
          <p className="text-blue-100 font-medium mb-8 max-w-lg mx-auto">
            Describe your symptoms in your preferred language and get instant, structured health guidance.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-white text-blue-500 font-bold text-base px-8 py-4 rounded-md hover:scale-105 transition-all duration-200"
          >
            Start Free Health Check
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer disclaimer ── */}
      <footer className="bg-gray-900 py-6 px-6 text-center">
        <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
          Sahayak Health is an informational tool only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
        </p>
        <p className="text-xs text-gray-600 mt-2 font-medium">
          Built with Groq, FastAPI, and Next.js
        </p>
      </footer>
    </main>
  );
}
