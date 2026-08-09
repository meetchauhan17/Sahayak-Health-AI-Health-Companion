"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CareEntry {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  type: "hospital" | "clinic" | "pharmacy" | "blood_bank";
}

interface CareMapProps {
  entries: CareEntry[];
  userLat: number;
  userLng: number;
  userCity: string;
  theme?: "light" | "dark";
}

const TYPE_COLORS: Record<string, string> = {
  hospital: "#3b82f6",
  clinic: "#0d9488",
  pharmacy: "#22c55e",
  blood_bank: "#ef4444",
};

export default function CareMap({
  entries,
  userLat,
  userLng,
  userCity,
  theme = "dark",
}: CareMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map if not created yet
    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [userLat, userLng],
        zoom: 13,
        zoomControl: true,
      });

      mapRef.current = map;
    }

    const map = mapRef.current;

    // Update tile layer based on theme
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const isDark =
      theme === "dark" ||
      document.documentElement.classList.contains("dark");

    const tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    // 1. Add User Location Marker
    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #14b8a6;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(20, 184, 166, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const userMarker = L.marker([userLat, userLng], { icon: userIcon })
      .bindPopup(
        `<div style="font-family: sans-serif; padding: 2px;">
          <strong style="color: #0d9488; font-size: 13px;">📍 Your Location</strong>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">${userCity}</p>
        </div>`
      )
      .addTo(map);

    markersRef.current.push(userMarker);
    bounds.extend([userLat, userLng]);

    // 2. Add Facility Markers
    entries.forEach((entry, idx) => {
      // Offset coordinates slightly if exact lat/lng is missing
      const offsetLat = userLat + (idx * 0.007 - 0.025);
      const offsetLng = userLng + (idx * 0.005 - 0.02);

      const color = TYPE_COLORS[entry.type] || "#0d9488";

      const pinIcon = L.divIcon({
        className: "custom-facility-marker",
        html: `
          <div style="
            background: ${color};
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-weight: bold;
            font-size: 10px;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>📍</span>
            <span>${entry.name.slice(0, 18)}${entry.name.length > 18 ? "…" : ""}</span>
          </div>
        `,
        iconAnchor: [40, 14],
      });

      const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
        entry.name + ", " + entry.address
      )}`;

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 180px;">
          <span style="
            background: ${color}20;
            color: ${color};
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 99px;
            display: inline-block;
            margin-bottom: 4px;
          ">${entry.type.replace("_", " ")}</span>
          <h4 style="margin: 2px 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${entry.name}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">📍 ${entry.distance} • ${entry.address}</p>
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <a href="${entry.phone}" style="
              flex: 1;
              background: #0d9488;
              color: white;
              text-align: center;
              padding: 5px 8px;
              border-radius: 8px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 600;
            ">📞 Call</a>
            <a href="${mapsUrl}" target="_blank" style="
              flex: 1;
              background: #f1f5f9;
              color: #334155;
              text-align: center;
              padding: 5px 8px;
              border-radius: 8px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 600;
            ">🧭 Directions</a>
          </div>
        </div>
      `;

      const m = L.marker([offsetLat, offsetLng], { icon: pinIcon })
        .bindPopup(popupHtml)
        .addTo(map);

      markersRef.current.push(m);
      bounds.extend([offsetLat, offsetLng]);
    });

    if (entries.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [entries, userLat, userLng, userCity, theme]);

  return (
    <div className="w-full h-full min-h-[480px] rounded-xl overflow-hidden relative border border-gray-200 dark:border-gray-800 shadow-inner">
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-0" />
    </div>
  );
}
