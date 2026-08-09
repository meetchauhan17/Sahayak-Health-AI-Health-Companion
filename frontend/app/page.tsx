"use client";

import Link from "next/link";
import {
  MessageSquare,
  ShieldCheck,
  Globe,
  Clock,
  ArrowRight,
  Activity,
  CheckCircle2,
  Users,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#090d16] text-gray-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">

      {/* ── Top Header ── */}
      <header className="border-b-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 sticky top-0 z-30 transition-colors duration-150">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
              Sahayak <span className="text-blue-500">Health</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="text-xs font-bold text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md transition-colors"
            >
              Start Chat
            </Link>
            <Link
              href="/onboarding"
              className="text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-md transition-all duration-200 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section — solid blue-500 color block ── */}
      <section className="relative bg-blue-500 py-20 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 translate-x-32 -translate-y-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-20 translate-y-20 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-bold px-4 py-1.5 rounded-md uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Health Triage</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Your Personal AI Health Companion
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 font-medium max-w-2xl mx-auto leading-relaxed">
            Instant symptom check, triage advice, and care guidance in English, Hindi, and Gujarati.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 text-sm font-extrabold px-8 py-4 rounded-md transition-all duration-200 hover:scale-105"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border border-white/20 text-sm font-bold px-6 py-4 rounded-md transition-all duration-200"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Try Live Chat</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Key Features ── */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-[#090d16] border-b-2 border-gray-200 dark:border-gray-800 transition-colors duration-150">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Core Capabilities
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Designed for Speed, Accuracy, and Care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 hover:scale-[1.02] transition-all duration-200 cursor-default">
              <div className="w-10 h-10 rounded-md bg-blue-500 text-white flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Multilingual Assistant</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                Communicate naturally in English, English (Hindi-script), or Gujarati.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 hover:scale-[1.02] transition-all duration-200 cursor-default">
              <div className="w-10 h-10 rounded-md bg-emerald-500 text-white flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Instant Triage</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                Clear severity indicators (Self-care, Doctor Visit, Emergency) with immediate emergency hotline links.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-6 hover:scale-[1.02] transition-all duration-200 cursor-default">
              <div className="w-10 h-10 rounded-md bg-amber-500 text-white flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Family Profiles</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
                Keep health records separated for parents, children, and spouses with history tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Nearby Care & PDF Exports Section — emerald-500 block ── */}
      <section className="bg-emerald-500 py-16 px-6 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Locate Healthcare &amp; Generate Reports
          </h2>
          <p className="text-emerald-100 text-sm max-w-xl mx-auto font-medium leading-relaxed">
            Find hospitals, clinics, pharmacies, and blood banks near your city with one click, or export structured PDF summaries for doctor visits.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/nearby-care"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-extrabold px-6 py-3.5 rounded-md transition-all duration-200 hover:scale-105"
            >
              <MapPin className="w-4 h-4" />
              <span>Find Nearby Care</span>
            </Link>

            <Link
              href="/history"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-white/20 text-xs font-bold px-6 py-3.5 rounded-md transition-all duration-200"
            >
              <Clock className="w-4 h-4" />
              <span>View History &amp; PDFs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white dark:bg-slate-900 border-t-2 border-gray-100 dark:border-gray-800 py-8 px-6 text-center text-xs text-gray-400 dark:text-slate-500 font-medium transition-colors duration-150">
        <div className="max-w-6xl mx-auto space-y-2">
          <p className="font-bold text-gray-700 dark:text-gray-300">
            Sahayak Health &copy; {new Date().getFullYear()} — AI Health Companion
          </p>
          <p className="max-w-xl mx-auto text-[11px] leading-relaxed">
            Sahayak Health provides informational guidance only and is not a replacement for professional medical advice, diagnosis, or treatment. Always call 108 in emergencies.
          </p>
        </div>
      </footer>
    </div>
  );
}
