"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import type { CountryCount } from "@/lib/adminApi";
import { COUNTRIES, countryName, countryFlag } from "@/lib/geo";

const GEO_URL = "/world-110m.json";

interface Hover {
  code: string;
  views: number;
  uniques: number;
  x: number;
  y: number;
}

/**
 * VisitorMap renders an Equal-Earth world map with a glowing marker per country,
 * sized by view volume. Markers are placed by ISO alpha-2 centroid (lib
 * COUNTRIES). Hovering shows precise counts. Loaded client-only (no SSR) since
 * react-simple-maps fetches the topojson at runtime.
 */
export function VisitorMap({ data }: { data: CountryCount[] }) {
  const [hover, setHover] = useState<Hover | null>(null);
  const points = data.filter((d) => COUNTRIES[d.code]);
  const max = points.reduce((m, d) => Math.max(m, d.views), 1);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 165 }}
        width={900}
        height={420}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="rgba(255,255,255,0.05)"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={0.4}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "rgba(255,255,255,0.08)" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {points.map((p) => {
          const info = COUNTRIES[p.code];
          const r = 3 + 16 * Math.sqrt(p.views / max);
          return (
            <Marker
              key={p.code}
              coordinates={[info.lng, info.lat]}
              onMouseEnter={(e: React.MouseEvent) =>
                setHover({ code: p.code, views: p.views, uniques: p.uniques, x: e.clientX, y: e.clientY })
              }
              onMouseMove={(e: React.MouseEvent) =>
                setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))
              }
              onMouseLeave={() => setHover(null)}
            >
              <circle r={r + 4} fill="#6d5efc" opacity={0.15} />
              <circle r={r} fill="#8b7dff" opacity={0.75} stroke="#34e3e3" strokeWidth={0.6} />
            </Marker>
          );
        })}
      </ComposableMap>

      {hover && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-white/10 bg-canvas-raised/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          <p className="font-semibold text-white">
            {countryFlag(hover.code)} {countryName(hover.code)}
          </p>
          <p className="mt-0.5 text-slate-400">
            {hover.views.toLocaleString()} views · {hover.uniques.toLocaleString()} visitors
          </p>
        </div>
      )}
    </div>
  );
}
