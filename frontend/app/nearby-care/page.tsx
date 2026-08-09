"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Navigation2,
  Search,
  ArrowLeft,
  Hospital,
  Pill,
  Stethoscope,
  Droplets,
  X,
} from "lucide-react";
import hospitalsData from "@/data/hospitals.json";

// ─── Types ───────────────────────────────────────────────────────────────────

type CareType = "hospital" | "clinic" | "pharmacy" | "blood_bank";

interface CareEntry {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  type: CareType;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const CATEGORIES: { key: string; label: string; icon: React.ElementType }[] = [
  { key: "all",        label: "All",         icon: MapPin },
  { key: "hospital",   label: "Hospitals",   icon: Hospital },
  { key: "clinic",     label: "Clinics",     icon: Stethoscope },
  { key: "pharmacy",   label: "Pharmacies",  icon: Pill },
  { key: "blood_bank", label: "Blood Banks", icon: Droplets },
];

const TYPE_CONFIG: Record<
  CareType,
  { label: string; color: string; icon: React.ElementType }
> = {
  hospital:   { label: "Hospital",   color: "bg-blue-100 text-blue-700 border-blue-200",    icon: Hospital },
  clinic:     { label: "Clinic",     color: "bg-teal-100 text-teal-700 border-teal-200",    icon: Stethoscope },
  pharmacy:   { label: "Pharmacy",   color: "bg-green-100 text-green-700 border-green-200", icon: Pill },
  blood_bank: { label: "Blood Bank", color: "bg-red-100 text-red-700 border-red-200",       icon: Droplets },
};

// ─── Type Badge ──────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: CareType }) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-full ${cfg.color}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

// ─── Care Card ───────────────────────────────────────────────────────────────

function CareCard({ entry }: { entry: CareEntry }) {
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
    entry.name + ", Surat, Gujarat"
  )}`;

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all hover:border-teal-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1">
            {entry.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={entry.type} />
            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
              📍 {entry.distance}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 leading-snug mb-3 flex items-start gap-1.5">
        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
        {entry.address}
      </p>

      {/* Action buttons */}
      <div className="flex gap-2">
        <a
          href={entry.phone}
          aria-label={`Call ${entry.name}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1"
        >
          <Phone className="w-3.5 h-3.5" />
          Call Now
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get directions to ${entry.name}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-teal-300 active:scale-95 text-gray-700 hover:text-teal-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1"
        >
          <Navigation2 className="w-3.5 h-3.5" />
          Directions
        </a>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function NearbyCare() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const entries = hospitalsData as CareEntry[];

  const filtered = useMemo(() => {
    let result = entries;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((e) => e.type === activeCategory);
    }

    // Search filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.address.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeCategory, searchQuery, entries]);

  // Count per category
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: entries.length };
    for (const e of entries) {
      c[e.type] = (c[e.type] ?? 0) + 1;
    }
    return c;
  }, [entries]);

  return (
    <main className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full pb-24 md:pb-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-teal-600" />
            Nearby Care
          </h1>
          <p className="text-xs text-gray-500">
            Hospitals, clinics, pharmacies &amp; blood banks in Surat
          </p>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or area…"
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Category Filter Tabs ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
        {CATEGORIES.map(({ key, label, icon: Icon }) => {
          const isActive = activeCategory === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full border transition-all active:scale-95 ${
                isActive
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Results ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-xs">
          <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700">No results found</h3>
          <p className="text-xs text-gray-400 mt-1">
            Try a different search term or category.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
            className="mt-4 text-xs font-semibold text-teal-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-gray-400 mb-3 px-1">
            Showing <strong className="text-gray-700">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "result" : "results"}
            {searchQuery && (
              <> for &ldquo;<strong className="text-gray-700">{searchQuery}</strong>&rdquo;</>
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((entry) => (
              <CareCard key={entry.id} entry={entry} />
            ))}
          </div>
        </>
      )}

      {/* ── Footer note ── */}
      <p className="text-[10px] text-gray-400 text-center mt-8">
        Distances are approximate. Always call ahead to confirm availability.
      </p>
    </main>
  );
}
