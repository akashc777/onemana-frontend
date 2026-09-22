/**
 * The one sentence about backups on a workspace card.
 *
 * It is the first question anyone asks of a managed service, and the answer
 * has two halves: the nightly backup on the machine, and the copy kept off
 * it. Both are stated as facts with dates, never as a promise: a copy is only
 * mentioned when the store that holds it is actually set up. Pure, so each
 * state (not running, nightly only, copy coming, copy made) is tested.
 */
export function backupLine(nightly: boolean, offsiteConfigured: boolean, offsiteAt?: string): string {
  if (!nightly) return "";
  const local = "Backed up nightly on your machine, 7 kept";
  if (!offsiteConfigured) return `${local}.`;
  if (!offsiteAt) return `${local}. The first off-site copy is made within a day.`;
  const when = new Date(offsiteAt).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${local} · off-site copy from ${when}, 30 kept`;
}
