"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  Map,
  Grid,
  Compass,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import hospitalsData from "@/data/hospitals.json";
import { getUserProfile, UserProfile } from "@/lib/userProfile";

// ─── Types ───────────────────────────────────────────────────────────────────

type CareType = "hospital" | "clinic" | "pharmacy" | "blood_bank";

interface CareEntry {
  id: string;
  name: string;
  address: string;
  phone: string;
  phoneDisplay?: string;
  distance: string;
  type: CareType;
  lat?: number;
  lng?: number;
}

const CATEGORIES: { key: string; label: string; icon: React.ElementType }[] = [
  { key: "all",        label: "All",         icon: MapPin },
  { key: "hospital",   label: "Hospitals",   icon: Hospital },
  { key: "clinic",     label: "Clinics",     icon: Stethoscope },
  { key: "pharmacy",   label: "Pharmacies",  icon: Pill },
  { key: "blood_bank", label: "Blood Banks", icon: Droplets },
];

const TYPE_CONFIG: Record<
  CareType,
  { label: string; bg: string; icon: React.ElementType }
> = {
  hospital:   { label: "Hospital",   bg: "bg-blue-500 text-white",    icon: Hospital },
  clinic:     { label: "Clinic",     bg: "bg-emerald-500 text-white", icon: Stethoscope },
  pharmacy:   { label: "Pharmacy",   bg: "bg-amber-500 text-white",   icon: Pill },
  blood_bank: { label: "Blood Bank", bg: "bg-red-500 text-white",     icon: Droplets },
};

function TypeBadge({ type }: { type: CareType }) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${cfg.bg}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function CareCard({ entry, userLat, userLng }: { entry: CareEntry; userLat?: number; userLng?: number }) {
  const directionsUrl =
    entry.lat && entry.lng
      ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLat || 21.1702}%2C${userLng || 72.8311}%3B${entry.lat}%2C${entry.lng}`
      : `https://maps.google.com/?q=${encodeURIComponent(entry.name + ", " + entry.address)}`;

  const callHref = entry.phone.startsWith("tel:") ? entry.phone : `tel:${entry.phone}`;

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-gray-800 rounded-lg p-5 hover:scale-[1.01] transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-1.5">
            {entry.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <TypeBadge type={entry.type} />
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-800">
              {entry.distance}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-4 flex items-start gap-1.5 font-medium">
        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
        {entry.address}
      </p>

      <div className="flex gap-2">
        <a
          href={callHref}
          title={entry.phoneDisplay || entry.phone}
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-2.5 rounded-md transition-all duration-200 hover:scale-105"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call ({entry.phoneDisplay || "108"})</span>
        </a>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-bold px-3 py-2.5 rounded-md transition-all duration-200 hover:scale-105"
        >
          <Navigation2 className="w-3.5 h-3.5" />
          <span>Route</span>
        </a>
      </div>
    </div>
  );
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const R = 6371;
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

const CareMap = dynamic(() => import("@/components/CareMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
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
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=16&extratags=1`
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

            const nameLower = item.display_name.toLowerCase();
            let type: CareType = "hospital";
            if (nameLower.includes("clinic")) type = "clinic";
            else if (nameLower.includes("pharmacy") || nameLower.includes("chemist")) type = "pharmacy";
            else if (nameLower.includes("blood")) type = "blood_bank";

            const displayNameParts = item.display_name.split(",");
            const shortName = displayNameParts[0] || item.name || `Medical Center ${idx + 1}`;
            const address = displayNameParts.slice(1, 4).join(",").trim() || item.display_name;

            const rawPhone =
              item.extratags?.phone ||
              item.extratags?.["contact:phone"] ||
              item.extratags?.["phone:mobile"] ||
              item.extratags?.["emergency:phone"];

            const phoneClean = rawPhone ? rawPhone.replace(/[^0-9+]/g, "") : "";
            const defaultHelpline = type === "hospital" ? "108" : type === "clinic" ? "104" : "112";
            const phone = phoneClean ? `tel:${phoneClean}` : `tel:${defaultHelpline}`;
            const phoneDisplay = rawPhone || (phoneClean ? phoneClean : defaultHelpline);

            return {
              id: `osm-${item.place_id || idx}`,
              name: shortName,
              address: address || userCity,
              phone,
              phoneDisplay,
              distance: distStr,
              type,
              lat: isNaN(itemLat) ? userLat : itemLat,
              lng: isNaN(itemLon) ? userLng : itemLon,
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

    const base = hospitalsData as CareEntry[];
    return base.map((item, idx) => {
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

    if (activeCategory !== "all") {
      result = result.filter((e) => e.type === activeCategory);
    }

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

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: entries.length };
    for (const e of entries) {
      c[e.type] = (c[e.type] ?? 0) + 1;
    }
    return c;
  }, [entries]);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-[#090d16] p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8 animate-fade-up transition-colors duration-150">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-500" />
              Nearby Care
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
              <span>Healthcare facilities in</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 flex items-center gap-1">
                <Compass className="w-3 h-3 text-blue-500" />
                {userCity}
              </span>
              <Link href="/onboarding" className="text-[10px] text-blue-500 hover:underline font-semibold">
                (Change)
              </Link>
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-200 dark:bg-slate-800 p-1 rounded-md">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-blue-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all duration-200 ${
              viewMode === "map"
                ? "bg-blue-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Live Map</span>
          </button>
        </div>
      </div>

      {/* ── Emergency Hotlines Bar — solid red block ── */}
      <div className="bg-red-500 text-white rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold leading-tight">
              Medical Emergency?
            </p>
            <p className="text-xs text-red-100 font-medium">
              Call emergency ambulance or health helpline immediately
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="tel:108"
            className="inline-flex items-center gap-1.5 bg-white text-red-600 text-xs font-bold px-4 py-2 rounded-md hover:scale-105 transition-all duration-200"
          >
            <Phone className="w-3.5 h-3.5" />
            Ambulance (108)
          </a>
          <a
            href="tel:104"
            className="inline-flex items-center gap-1.5 bg-red-600 text-white border border-white/30 text-xs font-bold px-4 py-2 rounded-md hover:bg-red-700 transition-all duration-200"
          >
            <Phone className="w-3.5 h-3.5" />
            Helpline (104)
          </a>
        </div>
      </div>

      {/* ── Search Bar & Suggestion Chips ── */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by hospital name, clinic, or area..."
          className="w-full pl-10 pr-10 py-3 text-sm bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200 font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-5 px-1">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          Suggestions:
        </span>
        {["Hospital", "Clinic", "Pharmacy", "Emergency", "Civil", "Kiran"].map((sugg) => (
          <button
            key={sugg}
            type="button"
            onClick={() => setSearchQuery(searchQuery === sugg ? "" : sugg)}
            className={`text-xs font-semibold px-3 py-1 rounded-md transition-all duration-200 ${
              searchQuery === sugg
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            {sugg}
          </button>
        ))}
      </div>

      {/* ── Category Filter Tabs ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
        {CATEGORIES.map(({ key, label, icon: Icon }) => {
          const isActive = activeCategory === key;
          const count = counts[key] ?? 0;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex-shrink-0 inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-md transition-all duration-200 ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── View Content ── */}
      {isFetchingCity ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-12 text-center border-2 border-gray-100 dark:border-gray-800">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Fetching facilities in {userCity}...</h3>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">Connecting to OpenStreetMap</p>
        </div>
      ) : viewMode === "map" ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border-2 border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-500" />
              Interactive Map — {userCity} ({filtered.length} locations)
            </span>
          </div>
          <div className="relative w-full h-[480px]">
            <CareMap
              entries={filtered}
              userLat={userLat}
              userLng={userLng}
              userCity={userCity}
            />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg p-12 text-center border-2 border-gray-100 dark:border-gray-800">
          <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">No results found</h3>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-1 mb-4">Try another search term or category.</p>
          <button
            onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
            className="text-xs font-bold text-blue-500 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 dark:text-slate-400 mb-4 px-1 font-semibold">
            Showing <strong className="text-gray-900 dark:text-white">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "result" : "results"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((entry) => (
              <CareCard key={entry.id} entry={entry} userLat={userLat} userLng={userLng} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
