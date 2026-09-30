/**
 * The free self-hosted plan, as the site describes it. The server decides the
 * real limit (ONECAMP_FREE_SEATS on onemana-backend); keep this in step.
 */
export const FREE_SEATS = 25;

/** The plan code the backend gives a free licence's order (FreePlanCode). */
export const FREE_PLAN_CODE = "free_selfhost";

export const freeIncludes = [
  `Up to ${FREE_SEATS} people`,
  "Every feature, AI teammates included",
  "Your server, your data, one-command install",
  "Updates within your major version",
];

/** What the free form sends. Pure, so it is tested without a network. */
export function freeClaimPayload(email: string, name: string): { email: string; name: string } | null {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null;
  return { email: e, name: name.trim().slice(0, 120) };
}
