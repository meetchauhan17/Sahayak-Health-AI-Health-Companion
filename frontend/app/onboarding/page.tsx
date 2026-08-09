"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, User, Calendar, Globe, Sparkles, ArrowRight, ArrowLeft, MapPin, Navigation2 } from "lucide-react";
import { saveUserProfile, getUserProfile, UserProfile } from "@/lib/userProfile";

const LANGUAGES: Array<UserProfile["language"]> = ["English", "हिंदी", "ગુજરાતી"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

export default function OnboardingPage() {
  const router = useRouter();

  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState<UserProfile["language"]>("English");
  const [error, setError] = useState("");

  const [city, setCity] = useState("Surat, Gujarat");
  const [lat, setLat] = useState<number | undefined>(21.1702);
  const [lng, setLng] = useState<number | undefined>(72.8311);
  const [locating, setLocating] = useState(false);
  const [locStatus, setLocStatus] = useState("");

  const [suggestions, setSuggestions] = useState<{ displayName: string; lat: number; lng: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  useEffect(() => {
    const p = getUserProfile();
    if (p) {
      setHasExistingProfile(true);
      setName(p.name || "");
      setAge(p.age ? String(p.age) : "");
      setGender(p.gender || "");
      if (p.language) setLanguage(p.language);
      if (p.city) setCity(p.city);
      if (p.lat) setLat(p.lat);
      if (p.lng) setLng(p.lng);
    }
  }, []);

  // Fetch OpenStreetMap Nominatim city autocomplete suggestions as user types
  const handleCityChange = (value: string) => {
    setCity(value);
    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
  };

  useEffect(() => {
    if (!city || city.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingSuggestions(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&addressdetails=1&limit=5`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const parsed = data.map((item: any) => ({
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }));
          setSuggestions(parsed);
          setShowSuggestions(parsed.length > 0);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [city]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocStatus("Detecting GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude);
        setLng(longitude);

        try {
          setLocStatus("Fetching city name from OpenStreetMap...");
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address || {};
          const detectedCity =
            addr.city ||
            addr.town ||
            addr.suburb ||
            addr.county ||
            addr.state_district ||
            "Surat";
          const detectedState = addr.state || "Gujarat";
          const formatted = `${detectedCity}, ${detectedState}`;
          setCity(formatted);
          setLocStatus(`Detected: ${formatted}`);
        } catch {
          setCity(`${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`);
          setLocStatus("Coordinates acquired!");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocStatus("Location access denied. Used default location.");
      },
      { timeout: 10000 }
    );
  };

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
      city: city.trim() || "Surat, Gujarat",
      lat,
      lng,
    };

    saveUserProfile(profile);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-teal-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-up transition-colors">
      {/* ── Top brand bar ── */}
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-6 text-white text-center relative">
          {hasExistingProfile && (
            <Link
              href="/dashboard"
              className="absolute left-4 top-4 p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Heart className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {hasExistingProfile ? "Edit Profile" : "Welcome to Sahayak Health"}
          </h1>
          <p className="text-teal-100 text-xs mt-1">
            {hasExistingProfile
              ? "Update your personal health details"
              : "Let's personalize your health companion experience"}
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

          {/* Location Setting */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                City / Location
              </label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <Navigation2 className={`w-3 h-3 ${locating ? "animate-spin" : ""}`} />
                <span>{locating ? "Locating..." : "Auto-Detect (GPS)"}</span>
              </button>
            </div>
            <input
              type="text"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Type city or area (e.g. Delhi, Surat, Mumbai)..."
              className="w-full text-sm px-3.5 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white dark:focus:bg-slate-900 transition-all text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />

            {/* Suggestions Popover */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto animate-fade-up">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700">
                  OpenStreetMap Suggestions
                </p>
                {suggestions.map((sugg, idx) => {
                  const parts = sugg.displayName.split(",");
                  const mainName = parts[0];
                  const subName = parts.slice(1, 4).join(",").trim();
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCity(mainName + (subName ? `, ${subName}` : ""));
                        setLat(sugg.lat);
                        setLng(sugg.lng);
                        setShowSuggestions(false);
                        setLocStatus(`Selected: ${mainName}`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-teal-50 dark:hover:bg-slate-700/60 transition-colors flex items-start gap-2 border-b border-gray-50 dark:border-gray-700/40 last:border-none"
                    >
                      <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-800 dark:text-white truncate">
                          {mainName}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-400 truncate">
                          {subName}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {locStatus && (
              <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1">
                <span>📍</span> {locStatus}
              </p>
            )}
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
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-md shadow-teal-200 dark:shadow-none hover:shadow-lg active:scale-98 transition-all"
            >
              <span>{hasExistingProfile ? "Save Profile" : "Continue to Health Assistant"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {hasExistingProfile && (
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 py-2 transition-colors"
              >
                Cancel &amp; Return to Dashboard
              </Link>
            )}
          </div>
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
