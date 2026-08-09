"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Calendar, Globe, ArrowRight, ArrowLeft, MapPin, Navigation2, Activity } from "lucide-react";
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
          setLocStatus("Fetching city name...");
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
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-up">
      <div className="w-full max-w-md bg-white border-2 border-gray-100 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 p-6 text-white text-center relative">
          {hasExistingProfile && (
            <Link
              href="/dashboard"
              className="absolute left-4 top-4 p-2 rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
          <div className="w-12 h-12 rounded-md bg-white text-blue-500 flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {hasExistingProfile ? "Edit Profile" : "Welcome to Sahayak Health"}
          </h1>
          <p className="text-blue-100 text-xs mt-1 font-medium">
            {hasExistingProfile
              ? "Update your personal health details"
              : "Personalize your health companion experience"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border-2 border-red-500 text-red-700 text-xs p-3 rounded-md font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
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
              className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Gender <span className="text-gray-400 font-normal text-[10px]">(Optional)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GENDERS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGender(g === gender ? "" : g)}
                  className={`text-xs font-bold py-2.5 px-3 rounded-md transition-all ${
                    gender === g
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                City / Location
              </label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating}
                className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <Navigation2 className={`w-3 h-3 ${locating ? "animate-spin" : ""}`} />
                <span>{locating ? "Locating..." : "Auto-Detect"}</span>
              </button>
            </div>
            <input
              type="text"
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Type city or area..."
              className="w-full text-sm px-3.5 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-900 font-medium"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border-2 border-gray-100 rounded-md z-50 overflow-hidden max-h-56 overflow-y-auto">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-100">
                  Suggestions
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
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors flex items-start gap-2 border-b border-gray-100 last:border-none"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {mainName}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {subName}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {locStatus && (
              <p className="text-[10px] text-blue-600 mt-1 font-bold">
                {locStatus}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              Preferred Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`text-xs font-bold py-2.5 px-2 rounded-md text-center transition-all ${
                    language === lang
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm py-3 px-4 rounded-md transition-all duration-200 hover:scale-105"
            >
              <span>{hasExistingProfile ? "Save Profile" : "Continue to Assistant"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {hasExistingProfile && (
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center text-xs font-bold text-gray-500 hover:text-gray-700 py-2 transition-colors"
              >
                Cancel &amp; Return to Dashboard
              </Link>
            )}
          </div>
        </form>

        <div className="bg-gray-50 px-6 py-3 border-t-2 border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium">
            Your information is stored locally on your device.
          </p>
        </div>
      </div>
    </main>
  );
}
