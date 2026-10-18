"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { journeySummary, type JourneyReport } from "@/lib/adminGaps";

// The daily walk of the buyer's path (05:00), which was recorded and emailed
// but readable nowhere: the latest result, and the steps that failed.
export function JourneyCard() {
  const [report, setReport] = useState<JourneyReport | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .lastJourney()
      .then((r) => setReport(r ?? null))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not read the journey"));
  }, []);

  if (error) return <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>;
  if (report === undefined) return null;
  const failed = (report?.steps ?? []).filter((s) => !s.ok);
  return (
    <section className={`rounded-md border p-3 text-sm ${failed.length ? "border-amber-400" : "border-border"}`}>
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily journey</h2>
      <p className="text-foreground">{journeySummary(report)}</p>
      {failed.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {failed.map((s) => (
            <li key={s.name}>
              <strong className="text-foreground">{s.name}</strong>
              {s.detail ? `: ${s.detail}` : ""}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
