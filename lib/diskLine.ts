/**
 * The one sentence about disk on a workspace card.
 *
 * The customer owns the data on the machine and is the only one who can decide
 * what to remove, so the figure has to be theirs to see, not only ours. Kept
 * pure for the same reason as seatsLine: three cases, each tested. Below the
 * threshold it is a quiet fact; from the threshold on it says what to do about
 * it, removing data first (it is theirs and costs nothing) and a larger
 * workspace second. "Removing" names the one control that frees bytes, the
 * archive policy's "Remove for good"; deleting a message only hides it. It
 * never says "full" or "limit": the workspace keeps working, and the sentence
 * must not read as a block.
 */
// The backend default for cloud_seats_nudge_pct, which also decides when the disk email goes out.
export const DISK_ATTENTION_PCT = 80;

export function diskLine(pct: number | undefined): string {
  if (pct === undefined || pct === null) return "";
  const p = Math.max(0, Math.min(100, Math.round(pct)));
  if (p >= DISK_ATTENTION_PCT) {
    return `Disk ${p}% used. Archive files and recordings you no longer need with "Remove for good" on (Admin, then Archive), or get in touch about a larger workspace.`;
  }
  return `Disk ${p}% used`;
}
