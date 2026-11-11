/**
 * The free self-hosted plan, as the site describes it. The server decides the
 * real limit (ONECAMP_FREE_SEATS on onemana-backend); keep this in step.
 */
export const FREE_SEATS = 25;

/** The plan code the backend gives a free licence's order (FreePlanCode). */
export const FREE_PLAN_CODE = "free_selfhost";

/**
 * How many people a plan takes, said one way wherever a buyer reads it, in
 * people (never users or seats). The licence takes any number. A Cloud
 * plan's number is the people its machine is sized for: nobody past it is
 * turned away and nothing is charged per person, so it is not a cap. "100
 * users" for Business beside "Unlimited users" for the licence read as one,
 * and "up to 30 people" as a limit. The free plan's "up to 25 people" is one.
 * The size entry is a Cloud choice's tag under its name, where the sentence
 * won't fit; the line beside the choice always says what the number means.
 * It lives beside the free plan's limit, in this small module, so a page
 * that says how many people a plan takes doesn't ship every plan's names.
 */
export const PEOPLE = {
  licence: "Any number of people",
  cloud: (n: number) => `sized for ${n} people`,
  size: (n: number) => `${n} people`,
} as const;

export const freeIncludes = [
  `Up to ${FREE_SEATS} people`,
  "Chat, docs, projects, calls and AI teammates",
  "AI teammates never take one of the places",
  "Your server, your data, one-command install",
  "Updates within your major version",
  "Single sign-on, LDAP, SCIM and audit export come with a licence",
];

/** What the free form sends. Pure, so it is tested without a network. */
export function freeClaimPayload(email: string, name: string): { email: string; name: string } | null {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null;
  return { email: e, name: name.trim().slice(0, 120) };
}
