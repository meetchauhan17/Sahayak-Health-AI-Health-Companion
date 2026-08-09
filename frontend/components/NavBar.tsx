"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageCircle,
  Clock,
  Users,
  MapPin,
  Heart,
  Sun,
  Moon,
  User,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { getUserProfile, UserProfile } from "@/lib/userProfile";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Chat", href: "/chat", icon: MessageCircle },
  { label: "History", href: "/history", icon: Clock },
  { label: "Family", href: "/family", icon: Users },
  { label: "Nearby Care", href: "/nearby-care", icon: MapPin },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize theme and profile
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem("sahayak_theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }

    // Profile setup
    setProfile(getUserProfile());
  }, [pathname]);

  // Handle outside click for avatar dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("sahayak_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Hide navigation on landing ('/') and onboarding ('/onboarding', '/welcome')
  if (pathname === "/" || pathname === "/welcome" || pathname === "/onboarding") {
    return null;
  }

  const firstInitial = profile?.name ? profile.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* ── Desktop Left Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 z-40 p-4 justify-between flex-shrink-0 transition-colors">
        <div className="space-y-6">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-md flex-shrink-0">
              <Heart className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-xl tracking-tight">
              Sahayak <span className="text-teal-600 dark:text-teal-400">Health</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800/50 shadow-2xs"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls: Theme toggle + Profile Avatar */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/80 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-200 dark:border-gray-700/60 transition-all"
            aria-label="Toggle Dark Mode"
          >
            <span className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-teal-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </span>
            <span className="text-[10px] text-gray-400 uppercase font-bold">
              {theme === "dark" ? "On" : "Off"}
            </span>
          </button>

          {/* User Profile Avatar with Dropdown */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                  {firstInitial}
                </div>
                <div className="text-left truncate">
                  <p className="text-xs font-bold text-gray-800 dark:text-white truncate">
                    {profile?.name || "User"}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                    {profile?.language || "English"}
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  userMenuOpen ? "-rotate-90" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute bottom-12 left-0 right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-1.5 z-50 animate-fade-up">
                <Link
                  href="/family"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
                >
                  <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Switch to Family View</span>
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Edit Profile</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between shadow-2xs transition-colors">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-xs">
            <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight">
            Sahayak <span className="text-teal-600 dark:text-teal-400">Health</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-teal-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>

          {/* User Avatar with Dropdown Menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold flex items-center justify-center text-xs shadow-xs focus:ring-2 focus:ring-teal-400"
            >
              {firstInitial}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-9 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-1.5 z-50 animate-fade-up">
                <p className="px-3 py-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700 mb-1">
                  Hi, {profile?.name || "User"}
                </p>
                <Link
                  href="/family"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
                >
                  <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Switch to Family View</span>
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Edit Profile</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 z-50 px-2 py-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] transition-colors">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                  isActive
                    ? "text-teal-600 dark:text-teal-400 font-bold"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? "bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400" : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
