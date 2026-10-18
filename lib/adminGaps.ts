// The logic behind the admin screens for what was curl-only (OM10): which
// machine orders need a person, the typed confirm for erasing a workspace,
// and the one line about the daily journey. Pure, so it is tested as is.

export interface JourneyStep {
  name: string;
  ok: boolean;
  ms: number;
  detail?: string;
}

export interface JourneyReport {
  ran_at: string;
  steps: JourneyStep[];
  problems?: string[];
}

/** needsSettling: a machine order attempt whose checkout did not answer
 *  cleanly. Until a person settles it, nothing more is bought. */
export function needsSettling(o: { state: string }): boolean {
  return o.state === "ordering";
}

/** terminateConfirmed: the typed text is the workspace's own address. The
 *  backend checks the same, case aside. */
export function terminateConfirmed(typed: string, address: string): boolean {
  const want = address.trim().toLowerCase();
  return want !== "" && typed.trim().toLowerCase() === want;
}

/** journeySummary is one line about the last walk of the buyer's path. */
export function journeySummary(r: JourneyReport | null): string {
  if (!r) return "The daily journey has not run yet.";
  const when = new Date(r.ran_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  const failed = r.steps.filter((s) => !s.ok).map((s) => s.name);
  if (failed.length === 0 && !(r.problems ?? []).length) return `Passed on ${when}: all ${r.steps.length} steps.`;
  const what = failed.length ? failed.join(", ") : (r.problems ?? []).join("; ");
  return `Failed on ${when}: ${what}.`;
}
