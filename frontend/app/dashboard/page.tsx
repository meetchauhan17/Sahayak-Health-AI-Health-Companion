"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  MessageSquare,
  Users,
  MapPin,
  Clock,
  Sparkles,
  Lightbulb,
  ArrowRight,
  PlusCircle,
  ChevronDown,
} from "lucide-react";

import { getUserProfile, saveUserProfile, UserProfile } from "@/lib/userProfile";
import { getStreak, StreakData } from "@/lib/streak";
import { getRecentCheckIns, CheckInItem } from "@/lib/history";
import SeverityBadge from "@/components/SeverityBadge";
import tipsData from "@/data/tips.json";

interface Tip {
  id: number;
  category: string;
  tip: string;
}

const LANGUAGES: UserProfile["language"][] = ["English", "हिंदी", "ગુજરાતી"];

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastDate: "" });
  const [recentChecks, setRecentChecks] = useState<CheckInItem[]>([]);
  const [dailyTip, setDailyTip] = useState<Tip | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    // Read user profile
    const p = getUserProfile();
    setProfile(p);

    // Read streak
    const s = getStreak();
    setStreak(s);

    // Read recent checks
    const checks = getRecentCheckIns(3);
    setRecentChecks(checks);

    // Calculate day of year for rotating daily health tip
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const tips: Tip[] = tipsData;
    const tip = tips[dayOfYear % tips.length];
    setDailyTip(tip);
  }, []);

  const handleLanguageChange = (newLang: UserProfile["language"]) => {
    if (!profile) return;
    const updated = { ...profile, language: newLang };
    saveUserProfile(updated);
    setProfile(updated);
    setLangOpen(false);
  };

  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const userName = profile?.name || "Friend";

  // Compute ring percentage for streak (max 7-day milestone loop)
  const streakCount = streak.count;
  const streakPercent = Math.min(100, Math.max(10, ((streakCount % 7) || (streakCount > 0 ? 7 : 0)) * (100 / 7)));

  return (
    <main className="min-h-screen bg-gray-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 animate-fade-up max-w-6xl mx-auto w-full transition-colors">
      {/* ── Top Greeting Bar ── */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Hi, {userName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{currentDateStr}</span>
          </p>
        </div>

        {/* Language Selector */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <span>Language:</span>
            <span className="text-teal-600 dark:text-teal-400 font-bold">{profile?.language || "English"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                    profile?.language === lang
                      ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── Main Dashboard Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* ── Card 1: Health Streak Card ── */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Health Streak
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
              Daily Active
            </span>
          </div>

          <div className="flex items-center gap-5 my-2">
            {/* SVG Progress Ring */}
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-100 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${streakPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                <span className="text-xs font-extrabold text-gray-900 dark:text-white leading-none mt-0.5">
                  {streakCount}d
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {streakCount} {streakCount === 1 ? "Day" : "Days"} Streak
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                {streakCount > 0
                  ? "Great job checking in daily! Keep it up."
                  : "Start a check-in today to kick off your health streak!"}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500">
            <span>Last check-in: {streak.lastDate || "None"}</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Goal: 7 Days</span>
          </div>
        </div>

        {/* ── Card 2: Quick Actions Card ── */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Quick Actions
            </span>
          </div>

          <div className="space-y-2.5 my-1">
            {/* Action 1: Symptom Check */}
            <Link
              href="/chat"
              className="w-full flex items-center justify-between bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white p-3 rounded-xl shadow-xs transition-all active:scale-98 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">Start Symptom Check</p>
                  <p className="text-[10px] text-teal-100">AI triage & guidance</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Action 2: View Family */}
            <Link
              href="/family"
              className="w-full flex items-center justify-between bg-gray-50 dark:bg-slate-800/70 hover:bg-teal-50/60 dark:hover:bg-slate-800 border border-gray-200/80 dark:border-gray-700/60 text-gray-700 dark:text-gray-200 hover:text-teal-700 dark:hover:text-teal-300 p-2.5 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-100/60 dark:bg-teal-950/80 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold">View Family Profiles</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Action 3: Find Nearby Care */}
            <Link
              href="/nearby-care"
              className="w-full flex items-center justify-between bg-gray-50 dark:bg-slate-800/70 hover:bg-teal-50/60 dark:hover:bg-slate-800 border border-gray-200/80 dark:border-gray-700/60 text-gray-700 dark:text-gray-200 hover:text-teal-700 dark:hover:text-teal-300 p-2.5 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100/60 dark:bg-rose-950/80 flex items-center justify-center text-rose-500 dark:text-rose-400">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold">Find Nearby Care</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* ── Card 3: Health Tip of the Day Card ── */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-100 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-300" />
                Health Tip of the Day
              </span>
              {dailyTip && (
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                  {dailyTip.category}
                </span>
              )}
            </div>

            <p className="text-sm font-medium leading-relaxed my-2 text-white/95">
              &quot;{dailyTip?.tip || "Stay active, drink water, and get 7-8 hours of sleep daily!"}&quot;
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-teal-100">
            <span>Changes daily</span>
            <span className="font-semibold text-white">Daily Wellness</span>
          </div>
        </div>

        {/* ── Card 4: Recent Activity Card (Spans 2 cols on md+) ── */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Recent Symptom Checks
            </span>
            <Link
              href="/history"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentChecks.length === 0 ? (
            <div className="py-8 text-center bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <PlusCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">No symptom checks yet</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 mb-3">
                Describe your symptoms to receive instant guidance and save history.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white px-3.5 py-1.5 rounded-lg transition-colors"
              >
                Start First Check
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentChecks.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-slate-800/70 border border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:bg-gray-100/60 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                      {item.symptom_query}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{item.date}</p>
                  </div>
                  <SeverityBadge severity={item.severity} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
