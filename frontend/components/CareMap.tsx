"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CareEntry {
  id: string;
  name: string;
  address: string;
  phone: string;
  phoneDisplay?: string;
  distance: string;
  type: "hospital" | "clinic" | "pharmacy" | "blood_bank";
  lat?: number;
  lng?: number;
}

interface CareMapProps {
  entries: CareEntry[];
  userLat: number;
  userLng: number;
  userCity: string;
}

const TYPE_COLORS: Record<string, string> = {
  hospital: "#3b82f6",
  clinic: "#10b981",
  pharmacy: "#f59e0b",
  blood_bank: "#ef4444",
};

export default function CareMap({
  entries,
  userLat,
  userLng,
  userCity,
}: CareMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [userLat, userLng],
        zoom: 13,
        zoomControl: true,
      });

      mapRef.current = map;
    }

    const map = mapRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
    const tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    // 1. User Marker
    const userIcon = L.divIcon({
      className: "custom-user-marker",
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50%;
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
        `<div style="font-family: Outfit, sans-serif; padding: 2px;">
          <strong style="color: #3b82f6; font-size: 13px;">Your Location</strong>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">${userCity}</p>
        </div>`
      )
      .addTo(map);

    markersRef.current.push(userMarker);
    bounds.extend([userLat, userLng]);

    // 2. Facility Markers
    entries.forEach((entry, idx) => {
      const pinLat = entry.lat ?? (userLat + (idx * 0.007 - 0.025));
      const pinLng = entry.lng ?? (userLng + (idx * 0.005 - 0.02));

      const color = TYPE_COLORS[entry.type] || "#3b82f6";

      const pinIcon = L.divIcon({
        className: "custom-facility-marker",
        html: `
          <div style="
            background: ${color};
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 10px;
            border: 2px solid white;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>${entry.name.slice(0, 18)}${entry.name.length > 18 ? "…" : ""}</span>
          </div>
        `,
        iconAnchor: [40, 14],
      });

      const directionsUrl =
        entry.lat && entry.lng
          ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLat}%2C${userLng}%3B${entry.lat}%2C${entry.lng}`
          : `https://maps.google.com/?q=${encodeURIComponent(entry.name + ", " + entry.address)}`;

      const callHref = entry.phone.startsWith("tel:") ? entry.phone : `tel:${entry.phone}`;

      const popupHtml = `
        <div style="font-family: Outfit, sans-serif; padding: 4px; min-width: 190px;">
          <span style="
            background: ${color};
            color: white;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 4px;
          ">${entry.type.replace("_", " ")}</span>
          <h4 style="margin: 2px 0 4px 0; font-size: 13px; font-weight: 700; color: #111827;">${entry.name}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #6b7280;">${entry.distance} • ${entry.address}</p>
          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <a href="${callHref}" style="
              flex: 1;
              background: #3b82f6;
              color: white;
              text-align: center;
              padding: 6px 8px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 700;
            ">Call (${entry.phoneDisplay || "108"})</a>
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="
              flex: 1;
              background: #f3f4f6;
              color: #111827;
              text-align: center;
              padding: 6px 8px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 700;
            ">Route</a>
          </div>
        </div>
      `;

      const m = L.marker([pinLat, pinLng], { icon: pinIcon })
        .bindPopup(popupHtml)
        .addTo(map);

      markersRef.current.push(m);
      bounds.extend([pinLat, pinLng]);
    });

    if (entries.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  }, [entries, userLat, userLng, userCity]);

  return (
    <div className="w-full h-full min-h-[480px] rounded-lg overflow-hidden relative border-2 border-gray-100">
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-0" />
    </div>
  );
}
