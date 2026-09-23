import type { PortalMove } from "./portalApi";

/**
 * The one sentence about a move between machines on a workspace card.
 *
 * A move is the customer's plan becoming a machine, so it is said in those
 * terms: what size it is moving to, where it is, and, when it is waiting for
 * quiet hours, when that is. The date is the customer's own local time.
 */
export function moveLine(m: PortalMove | undefined): string {
  if (!m) return "";
  const size = m.to_size === "business" ? "Business" : "Team";
  const when = m.when
    ? `, ${new Date(m.when).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`
    : "";
  return `Moving to a ${size} machine: ${m.label}${when}.`;
}

/** The size in words, for the card's heading line. */
export function sizeLabel(size: string | undefined): string {
  return size === "business" ? "Business" : "Team";
}
