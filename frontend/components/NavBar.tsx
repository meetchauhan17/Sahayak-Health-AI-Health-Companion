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
  Activity,
  Settings,
  ChevronRight,
  Sun,
  Moon,
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
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("sahayak_theme");
    const isDark =
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches) ||
      document.documentElement.classList.contains("dark");

    if (isDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }

    setProfile(getUserProfile());
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideDesktop = desktopMenuRef.current?.contains(target);
      const insideMobile = mobileMenuRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    const newTheme = isCurrentlyDark ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("sahayak_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (pathname === "/" || pathname === "/welcome" || pathname === "/onboarding") {
    return null;
  }

  const firstInitial = profile?.name ? profile.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* ── Desktop Left Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-slate-900 border-r-2 border-gray-100 dark:border-gray-800 h-screen sticky top-0 z-40 p-4 justify-between flex-shrink-0 transition-colors duration-150">
        <div className="space-y-6">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
              Sahayak <span className="text-blue-500">Health</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-white" : "text-gray-400 dark:text-gray-500"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls: Theme toggle + Profile Avatar */}
        <div className="pt-4 border-t-2 border-gray-100 dark:border-gray-800 space-y-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-bold text-gray-800 dark:text-slate-100 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-150 cursor-pointer"
            aria-label="Toggle Theme"
          >
            <span className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </span>

            {/* Slider Switch Pill */}
            <div
              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                theme === "dark" ? "bg-blue-500 justify-end" : "bg-gray-300 justify-start"
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
            </div>
          </button>

          {/* Profile Dropdown Trigger */}
          <div ref={desktopMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-md bg-blue-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {firstInitial}
                </div>
                <div className="text-left truncate">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {profile?.name || "User"}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                    {profile?.language || "English"}
                  </p>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  userMenuOpen ? "-rotate-90" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute bottom-12 left-0 right-0 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-700 rounded-md p-1 z-50 animate-fade-up">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/family");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-all duration-200 text-left"
                >
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Family Profiles</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/onboarding");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-all duration-200 text-left"
                >
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b-2 border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between transition-colors duration-150">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight">
            Sahayak <span className="text-blue-500">Health</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-blue-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>

          {/* User Avatar */}
          <div ref={mobileMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="w-8 h-8 rounded-md bg-blue-500 text-white font-bold flex items-center justify-center text-xs focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:bg-blue-600"
            >
              {firstInitial}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-gray-700 rounded-md p-1 z-50 animate-fade-up">
                <p className="px-3 py-1.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700 mb-1">
                  Hi, {profile?.name || "User"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/family");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-all duration-200 text-left"
                >
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Family Profiles</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/onboarding");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-all duration-200 text-left"
                >
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t-2 border-gray-100 dark:border-gray-800 z-50 px-2 py-2 transition-colors duration-150">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className="flex flex-col items-center gap-0.5 px-2 py-1 transition-all duration-200"
              >
                <div
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-semibold leading-none ${
                    isActive ? "text-blue-500" : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
