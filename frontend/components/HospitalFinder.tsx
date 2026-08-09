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
  const hospitals: Hospital[] = (hospitalsData as Hospital[]).filter(
    (h) => !h.type || h.type === "hospital" || h.type === "clinic"
  );

  return (
    <div className="mt-3 bg-gray-100 border-2 border-gray-200 rounded-md p-3.5 max-w-full">
      <div className="flex items-center gap-1.5 mb-3">
        <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Nearby Healthcare Facilities
        </span>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 pr-0.5 scrollbar-hide">
        {hospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="bg-white border border-gray-200 rounded-md p-3 flex items-center justify-between gap-2 hover:border-blue-500 transition-all duration-200"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <h4 className="text-xs font-bold text-gray-900 truncate leading-tight">
                  {hospital.name}
                </h4>
                <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 flex-shrink-0">
                  {hospital.distance}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 leading-tight truncate font-medium">
                {hospital.address}
              </p>
            </div>

            <a
              href={hospital.phone}
              aria-label={`Call ${hospital.name}`}
              className="flex-shrink-0 inline-flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-all duration-200"
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
