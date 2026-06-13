"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [hover, setHover] = useState<Hover | null>(null);
  const points = data.filter((d) => COUNTRIES[d.code]);
  const max = points.reduce((m, d) => Math.max(m, d.views), 1);

  const geoFill = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const geoStroke = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
  const geoHover = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20">
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
                fill={geoFill}
                stroke={geoStroke}
                strokeWidth={0.4}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: geoHover },
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
              <circle r={r + 4} fill="#FF4D00" opacity={0.15} />
              <circle r={r} fill="#FF4D00" opacity={0.75} stroke="#FF6B2E" strokeWidth={0.6} />
            </Marker>
          );
        })}
      </ComposableMap>

      {hover && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          <p className="font-semibold text-foreground">
            {countryFlag(hover.code)} {countryName(hover.code)}
          </p>
          <p className="mt-0.5 text-muted-foreground">
            {hover.views.toLocaleString()} views · {hover.uniques.toLocaleString()} visitors
          </p>
        </div>
      )}
    </div>
  );
}