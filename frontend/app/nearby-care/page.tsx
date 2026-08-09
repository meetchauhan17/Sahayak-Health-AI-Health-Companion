"use client";

import Link from "next/link";
import { MapPin, ArrowLeft, PhoneCall } from "lucide-react";
import HospitalFinder from "@/components/HospitalFinder";

export default function NearbyCarePage() {
  return (
    <main className="min-h-screen bg-gray-50/60 p-4 sm:p-6 lg:p-8 animate-fade-up max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-rose-500" />
              Find Nearby Care
            </h1>
            <p className="text-xs text-gray-500">Hospitals and clinics near Surat, Gujarat</p>
          </div>
        </div>

        <a
          href="tel:108"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all animate-pulse"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 108 Emergency</span>
        </a>
      </div>

      {/* Hospital Finder */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-6 shadow-xs">
        <HospitalFinder />
      </div>
    </main>
  );
}
