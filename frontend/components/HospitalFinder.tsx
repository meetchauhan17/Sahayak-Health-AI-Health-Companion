import React from "react";
import { MapPin, Phone } from "lucide-react";
import hospitalsData from "@/data/hospitals.json";

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  type?: string;
}

export default function HospitalFinder() {
  // Inline chat card: show hospitals and clinics only
  const hospitals: Hospital[] = (hospitalsData as Hospital[]).filter(
    (h) => !h.type || h.type === "hospital" || h.type === "clinic"
  );

  return (
    <div className="mt-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 rounded-xl p-3 shadow-sm max-w-full">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
          Nearby Help
        </span>
      </div>

      {/* Hospital list – scrollable after 3 entries */}
      <div className="max-h-60 overflow-y-auto space-y-1.5 pr-0.5 scrollbar-hide">
        {hospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg p-2.5 flex items-center justify-between gap-2 hover:border-teal-200 dark:hover:border-teal-800 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-tight">
                  {hospital.name}
                </h4>
                <span className="inline-block bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-teal-100 dark:border-teal-800 flex-shrink-0">
                  {hospital.distance}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-400 leading-tight truncate">
                {hospital.address}
              </p>
            </div>

            <a
              href={hospital.phone}
              aria-label={`Call ${hospital.name}`}
              className="flex-shrink-0 inline-flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1"
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
