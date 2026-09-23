/**
 * The one sentence about how full the workspace's machine is.
 *
 * Silent while the machine is fine: a customer does not need a memory
 * percentage to feel reassured. When the daily reading says tight or
 * outgrown, it says what is full and the two ways forward, the free one
 * first, and never reads as a block: the workspace keeps working.
 */
export function capacityLine(verdict?: string, reason?: string): string {
  if (verdict !== "tight" && verdict !== "outgrown") return "";
  const what = reason ? ` (${reason})` : "";
  const lead = verdict === "outgrown" ? "Your workspace has outgrown its machine" : "Your workspace is using most of its machine";
  return `${lead}${what}. Archive what you no longer need (Admin, then Archive), or reply to any of our emails for a larger machine; your team keeps the same workspace.`;
}

/** The admin row's reading, from the stored JSON; "" when there is none. */
export function capacitySummary(json?: string | null): string {
  if (!json) return "";
  try {
    const c = JSON.parse(json) as { mem_total_mb?: number; mem_avail_mb?: number; cores?: number; load15?: number; verdict?: string; reason?: string; messages?: number; db_size_mb?: number };
    if (!c.mem_total_mb) return "";
    const mem = Math.round(((c.mem_total_mb - (c.mem_avail_mb ?? 0)) * 100) / c.mem_total_mb);
    const parts = [`${c.verdict ?? "?"}`, `memory ${mem}% of ${Math.round(c.mem_total_mb / 1024)} GB`, `load ${c.load15 ?? 0} on ${c.cores ?? "?"} cores`];
    if (c.messages) parts.push(`${c.messages.toLocaleString()} messages`);
    if (c.db_size_mb) parts.push(`db ${c.db_size_mb} MB`);
    return parts.join(" · ") + (c.reason ? ` (${c.reason})` : "");
  } catch {
    return "";
  }
}
