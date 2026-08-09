"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart, User, Calendar, Globe, Sparkles, ArrowRight } from "lucide-react";
import { saveUserProfile, UserProfile } from "@/lib/userProfile";

const LANGUAGES: Array<UserProfile["language"]> = ["English", "हिंदी", "ગુજરાતી"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

export default function OnboardingPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState<UserProfile["language"]>("English");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!age || isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      setError("Please enter a valid age.");
      return;
    }

    setError("");
    const profile: UserProfile = {
      name: name.trim(),
      age: age.trim(),
      gender: gender || undefined,
      language,
    };

    saveUserProfile(profile);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-teal-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-up transition-colors">
      {/* ── Top brand bar ── */}
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Heart className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Sahayak Health</h1>
          <p className="text-teal-100 text-xs mt-1">
            Let&apos;s personalize your health companion experience
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 28"
              className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Gender <span className="text-gray-400 dark:text-gray-500 font-normal text-[10px]">(Optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GENDERS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g === gender ? "" : g)}
                  className={`text-xs font-medium py-2 px-3 rounded-xl border transition-all ${
                    gender === g
                      ? "bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-teal-700 dark:text-teal-300 font-semibold shadow-xs"
                      : "bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Preferred Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`text-xs font-medium py-2.5 px-2 rounded-xl border text-center transition-all ${
                    language === lang
                      ? "bg-teal-500 border-teal-500 text-white font-bold shadow-sm"
                      : "bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-md shadow-teal-200 dark:shadow-none hover:shadow-lg active:scale-98 transition-all"
          >
            <span>Continue to Health Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="bg-gray-50 dark:bg-slate-900/60 px-6 py-3 border-t border-gray-100 dark:border-gray-700/60 text-center">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Your information is stored locally on your device for personalizing assistance.
          </p>
        </div>
      </div>
    </main>
  );
}
