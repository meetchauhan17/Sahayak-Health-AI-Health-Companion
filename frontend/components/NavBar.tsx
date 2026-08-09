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
  User,
  Settings,
  ChevronRight,
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

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(getUserProfile());
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

  // Hide navigation on landing and onboarding pages
  if (pathname === "/" || pathname === "/welcome" || pathname === "/onboarding") {
    return null;
  }

  const firstInitial = profile?.name ? profile.name.charAt(0).toUpperCase() : "U";

  return (
    <>
      {/* ── Desktop Left Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r-2 border-gray-100 h-screen sticky top-0 z-40 p-4 justify-between flex-shrink-0">
        <div className="space-y-6">
          {/* Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
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
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-white" : "text-gray-400"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile section */}
        <div className="pt-4 border-t-2 border-gray-100">
          <div ref={desktopMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="w-full flex items-center justify-between p-2.5 rounded-md hover:bg-gray-100 transition-all duration-200"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-md bg-blue-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {firstInitial}
                </div>
                <div className="text-left truncate">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {profile?.name || "User"}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
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
              <div className="absolute bottom-12 left-0 right-0 bg-white border-2 border-gray-100 rounded-md p-1 z-50 animate-fade-up">
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/family");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200 text-left"
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200 text-left"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b-2 border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900 text-base tracking-tight">
            Sahayak <span className="text-blue-500">Health</span>
          </span>
        </Link>

        <div ref={mobileMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="w-8 h-8 rounded-md bg-blue-500 text-white font-bold flex items-center justify-center text-xs focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:bg-blue-600"
          >
            {firstInitial}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white border-2 border-gray-100 rounded-md p-1 z-50 animate-fade-up">
              <p className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100 mb-1">
                Hi, {profile?.name || "User"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  router.push("/family");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200 text-left"
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
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-200 text-left"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span>Edit Profile</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 z-50 px-2 py-2">
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
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] font-semibold leading-none ${
                    isActive ? "text-blue-500" : "text-gray-400"
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
