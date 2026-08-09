"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageCircle, Clock, Users, MapPin, Heart } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Chat", href: "/chat", icon: MessageCircle },
  { label: "History", href: "/history", icon: Clock },
  { label: "Family", href: "/family", icon: Users },
  { label: "Nearby Care", href: "/nearby-care", icon: MapPin },
];

export default function Navigation() {
  const pathname = usePathname();

  // Hide navigation on landing ('/') and onboarding ('/onboarding')
  if (pathname === "/" || pathname === "/welcome" || pathname === "/onboarding") {
    return null;
  }

  return (
    <>
      {/* ── Desktop Top Nav / Header Sub-Bar ── */}
      <header className="hidden md:block bg-white border-b border-gray-200 shadow-2xs sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Sahayak <span className="text-teal-600">Health</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-teal-50 text-teal-700 border border-teal-100"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-teal-600" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 py-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                  isActive ? "text-teal-600 font-bold" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? "bg-teal-50 text-teal-600" : ""
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
