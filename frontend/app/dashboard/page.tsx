"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  MessageSquare,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  PlusCircle,
  ChevronDown,
  TrendingUp,
  BookOpen,
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
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastDate: "" });
  const [recentChecks, setRecentChecks] = useState<CheckInItem[]>([]);
  const [dailyTip, setDailyTip] = useState<Tip | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = getUserProfile();
    setProfile(p);

    const s = getStreak();
    setStreak(s);

    const checks = getRecentCheckIns(3);
    setRecentChecks(checks);

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const tips: Tip[] = tipsData;
    setDailyTip(tips[dayOfYear % tips.length]);
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
  const streakCount = streak.count;
  const streakPercent = Math.min(100, Math.max(10, ((streakCount % 7) || (streakCount > 0 ? 7 : 0)) * (100 / 7)));

  if (!mounted) {
    return <main className="min-h-screen bg-white" />;
  }

  return (
    <main className="min-h-screen bg-gray-100 pb-16 md:pb-0 animate-fade-up">

      {/* ── Greeting Header — blue-500 color block ── */}
      <header className="relative bg-blue-500 z-20">
        {/* Geometric decorations contained inside overflow-hidden wrapper */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 translate-x-20 -translate-y-20" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 -translate-x-12 translate-y-12" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hi, {userName}
            </h1>
            <p className="text-blue-100 text-sm font-medium mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {currentDateStr}
            </p>
          </div>

          {/* Language Selector */}
          <div className="relative self-start sm:self-auto z-30">
            <button
              onClick={() => setLangOpen((o) => !o)}
              className="flex items-center gap-2 text-xs font-bold text-blue-500 bg-white rounded-md px-4 py-2.5 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              <span className="text-blue-400 font-semibold">Language:</span>
              <span>{profile?.language || "English"}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border-2 border-gray-100 rounded-md z-50 overflow-hidden shadow-md animate-fade-up">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                      profile?.language === lang
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Dashboard Grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* ── Card 1: Health Streak ── */}
        <div className="bg-white rounded-lg p-6 hover:scale-[1.02] transition-all duration-200 cursor-default">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Health Streak
            </span>
            <span className="text-xs font-bold text-amber-500 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              Daily
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${streakPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="square"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-extrabold text-gray-900 leading-none">
                  {streakCount}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">days</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900 leading-tight">
                {streakCount} {streakCount === 1 ? "Day" : "Days"}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {streakCount > 0
                  ? "Great job checking in daily!"
                  : "Start today to begin your streak."}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Last: {streak.lastDate || "None"}
            </span>
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
              Goal: 7 Days
            </span>
          </div>
        </div>

        {/* ── Card 2: Quick Actions ── */}
        <div className="bg-white rounded-lg p-6 hover:scale-[1.02] transition-all duration-200 cursor-default">
          <div className="flex items-center gap-1.5 mb-4">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Quick Actions
            </span>
          </div>

          <div className="space-y-2.5">
            <Link
              href="/chat"
              className="group w-full flex items-center justify-between bg-blue-500 hover:bg-blue-600 text-white p-3.5 rounded-md transition-all duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">Start Symptom Check</p>
                  <p className="text-[10px] text-blue-200">AI triage and guidance</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>

            <Link
              href="/family"
              className="group w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-md transition-all duration-200"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold">Family Profiles</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>

            <Link
              href="/nearby-care"
              className="group w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-md transition-all duration-200"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold">Find Nearby Care</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </div>

        {/* ── Card 3: Health Tip — emerald-500 color block ── */}
        <div className="relative bg-emerald-500 rounded-lg p-6 flex flex-col justify-between overflow-hidden hover:scale-[1.02] transition-all duration-200 cursor-default">
          {/* Subtle bottom-right circle decoration only */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative">
            <div className="flex items-center justify-between mb-4 gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-100 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-white" />
                Daily Health Tip
              </span>
              {dailyTip && (
                <span className="text-[10px] font-bold bg-white text-emerald-700 px-2.5 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0">
                  {dailyTip.category}
                </span>
              )}
            </div>

            <p className="text-sm font-medium leading-relaxed text-white my-2">
              &ldquo;{dailyTip?.tip || "Stay active, drink water, and get 7-8 hours of sleep daily."}&rdquo;
            </p>
          </div>

          <div className="relative mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
            <span className="text-[11px] text-emerald-100 font-medium">Changes daily</span>
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">Wellness</span>
          </div>
        </div>

        {/* ── Card 4: Recent Activity (spans 2 cols on md+) ── */}
        <div className="md:col-span-2 bg-white rounded-lg p-6 hover:scale-[1.01] transition-all duration-200">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              Recent Symptom Checks
            </span>
            <Link
              href="/history"
              className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors duration-200"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentChecks.length === 0 ? (
            <div className="py-10 text-center bg-gray-100 rounded-md">
              <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center mx-auto mb-3">
                <PlusCircle className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-bold text-gray-700">No symptom checks yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Describe your symptoms to receive instant guidance.
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-all duration-200 hover:scale-105"
              >
                Start First Check
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentChecks.map((item) => (
                <Link
                  key={item.id}
                  href={item.familyMemberId ? `/history?for=${item.familyMemberId}` : "/history"}
                  className="group flex items-center justify-between gap-3 p-3.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-all duration-200 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {item.symptom_query}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{item.date}</p>
                  </div>
                  <SeverityBadge severity={item.severity} />
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
