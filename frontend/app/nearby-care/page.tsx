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
  hospital:   { label: "Hospital",   color: "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",    icon: Hospital },
  clinic:     { label: "Clinic",     color: "bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800",    icon: Stethoscope },
  pharmacy:   { label: "Pharmacy",   color: "bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800", icon: Pill },
  blood_bank: { label: "Blood Bank", color: "bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",       icon: Droplets },
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
    <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all hover:border-teal-200 dark:hover:border-teal-800">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-1">
            {entry.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={entry.type} />
            <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60 px-2 py-0.5 rounded-full">
              📍 {entry.distance}
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-snug mb-3 flex items-start gap-1.5">
        <MapPin className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
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
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-teal-300 dark:hover:border-teal-600 active:scale-95 text-gray-700 dark:text-gray-200 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-semibold px-3 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1"
        >
          <Navigation2 className="w-3.5 h-3.5" />
          Directions
        </a>
      </div>
    </div>
  );
}

// ─── Haversine Distance Helper ───────────────────────────────────────────────

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = Math.round(R * c * 10) / 10;
  return `${dist} km`;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

import dynamic from "next/dynamic";
import { getUserProfile, UserProfile } from "@/lib/userProfile";
import { useEffect } from "react";
import { Map, Grid, Compass, Loader2 } from "lucide-react";

const CareMap = dynamic(() => import("@/components/CareMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
    </div>
  ),
});

export default function NearbyCare() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [cityEntries, setCityEntries] = useState<CareEntry[] | null>(null);
  const [isFetchingCity, setIsFetchingCity] = useState(false);

  useEffect(() => {
    setProfile(getUserProfile());
  }, []);

  const userCity = profile?.city || "Surat, Gujarat";
  const userLat = profile?.lat || 21.1702;
  const userLng = profile?.lng || 72.8311;

  // Dynamic fetch for cities other than Surat using free OpenStreetMap API
  useEffect(() => {
    if (!userCity) return;
    const isSurat = userCity.toLowerCase().includes("surat");
    if (isSurat) {
      setCityEntries(null);
      return;
    }

    let isMounted = true;
    setIsFetchingCity(true);

    async function fetchCityFacilities() {
      try {
        const query = encodeURIComponent(`hospital in ${userCity}`);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=16`
        );
        const data = await res.json();

        if (isMounted && Array.isArray(data) && data.length > 0) {
          const parsed: CareEntry[] = data.map((item: any, idx: number) => {
            const itemLat = parseFloat(item.lat);
            const itemLon = parseFloat(item.lon);
            const distStr =
              !isNaN(itemLat) && !isNaN(itemLon)
                ? calculateDistance(userLat, userLng, itemLat, itemLon)
                : "2.5 km";

            // Infer type
            const nameLower = item.display_name.toLowerCase();
            let type: CareType = "hospital";
            if (nameLower.includes("clinic")) type = "clinic";
            else if (nameLower.includes("pharmacy") || nameLower.includes("chemist")) type = "pharmacy";
            else if (nameLower.includes("blood")) type = "blood_bank";

            const displayNameParts = item.display_name.split(",");
            const shortName = displayNameParts[0] || item.name || `Medical Center ${idx + 1}`;
            const address = displayNameParts.slice(1, 4).join(",").trim() || item.display_name;

            return {
              id: `osm-${item.place_id || idx}`,
              name: shortName,
              address: address || userCity,
              phone: "tel:108",
              distance: distStr,
              type,
            };
          });
          setCityEntries(parsed);
        } else if (isMounted) {
          setCityEntries([]);
        }
      } catch (err) {
        console.error("Failed to fetch facilities for city:", err);
        if (isMounted) setCityEntries(null);
      } finally {
        if (isMounted) setIsFetchingCity(false);
      }
    }

    fetchCityFacilities();

    return () => {
      isMounted = false;
    };
  }, [userCity, userLat, userLng]);

  const entries = useMemo(() => {
    if (cityEntries && cityEntries.length > 0) {
      return cityEntries;
    }

    // Default Surat dataset with dynamic distance calculation if user is in Surat
    const base = hospitalsData as CareEntry[];
    return base.map((item, idx) => {
      // Offset slightly to simulate distance from user location
      const simulatedLat = userLat + (idx * 0.008 - 0.03);
      const simulatedLng = userLng + (idx * 0.006 - 0.02);
      return {
        ...item,
        distance: calculateDistance(userLat, userLng, simulatedLat, simulatedLng),
      };
    });
  }, [cityEntries, userLat, userLng]);

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

  // Generate free OpenStreetMap embed URL
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${userLng - 0.08}%2C${userLat - 0.08}%2C${userLng + 0.08}%2C${userLat + 0.08}&layer=mapnik&marker=${userLat}%2C${userLng}`;

  return (
    <main className="min-h-screen bg-gray-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8 transition-colors overflow-x-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              Nearby Care
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Healthcare facilities in</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60 flex items-center gap-1">
                <Compass className="w-3 h-3" />
                {userCity}
              </span>
              <Link href="/onboarding" className="text-[10px] text-gray-400 hover:underline">
                (Change)
              </Link>
            </p>
          </div>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center bg-gray-200/70 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "map"
                ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Live Interactive Map</span>
          </button>
        </div>
      </div>

      {/* ── Emergency Hotlines Bar ── */}
      <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/60 dark:to-rose-950/60 border border-red-200 dark:border-red-800/80 rounded-2xl p-3.5 mb-5 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 animate-pulse">
            🚨
          </div>
          <div>
            <p className="text-xs font-bold text-red-900 dark:text-red-200 leading-tight">
              Medical Emergency?
            </p>
            <p className="text-[11px] text-red-700 dark:text-red-300">
              Call emergency ambulance or health helpline immediately
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="tel:108"
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            Ambulance (108)
          </a>
          <a
            href="tel:104"
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            <Phone className="w-3.5 h-3.5" />
            Health Helpline (104)
          </a>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or area…"
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                  : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-700 dark:hover:text-teal-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Map View vs List View ── */}
      {isFetchingCity ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center shadow-xs animate-pulse">
          <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-white">Fetching nearby care facilities in {userCity}...</h3>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">
            Connecting to OpenStreetMap free API
          </p>
        </div>
      ) : viewMode === "map" ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm p-3">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-500" />
              Live Interactive OpenStreetMap — {userCity} ({filtered.length} locations)
            </span>
            <a
              href={`https://www.openstreetmap.org/?mlat=${userLat}&mlon=${userLng}#map=14/${userLat}/${userLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              Open Fullscreen OSM ↗
            </a>
          </div>
          <div className="relative w-full h-[480px]">
            <CareMap
              entries={filtered}
              userLat={userLat}
              userLng={userLng}
              userCity={userCity}
            />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 text-center mt-2.5">
            Click pins to view facility details, call numbers, or get Google Maps directions.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center shadow-xs">
          <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">No results found</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Try a different search term or category.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
            className="mt-4 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mb-3 px-1">
            Showing <strong className="text-gray-700 dark:text-gray-300">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "result" : "results"}
            {searchQuery && (
              <> for &ldquo;<strong className="text-gray-700 dark:text-gray-300">{searchQuery}</strong>&rdquo;</>
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
      <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center mt-8">
        Distances are approximate. Always call ahead to confirm availability.
      </p>
    </main>
  );
}
