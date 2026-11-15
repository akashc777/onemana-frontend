import { formatDayMonth } from "@/lib/format";
import { PEOPLE } from "@/lib/freePlan";

/** The people sentence on a workspace card, and what follows a count past the number. */
export type SeatsLine = {
  text: string;
  /** "upgrade": Business, on this page's subscription tab; "talk": a word with support, past Business. */
  step?: "upgrade" | "talk";
};

/**
 * The one sentence about people on a workspace card.
 *
 * The plan is sold as sized for N people (lib/freePlan PEOPLE.cloud), and until
 * then the customer's own status page said nothing about how many of their
 * people were in the workspace. This is that sentence, kept pure so the cases
 * it has to get right can be tested: never counted, counted, and counted past
 * the number the plan is sized for, on Team and on Business.
 *
 * "Sized for" is the honest word, as on every page that sells the plan.
 * Nothing in the product stops the thirty-first person joining, so "of",
 * "limit" or "included" would promise an enforcement or a price step that
 * does not exist; a count past the number is stated as a fact, followed by
 * the next step. On Team, with Business on offer (business is its size from
 * the pricing answer, 0 when it is not offered), that step is Business, which
 * the customer can buy on the same page. Past Business, or with nothing larger
 * to buy, it is a word with support. The card draws the step as a link.
 *
 * The date is the house one ("9 Oct", as on the rest of the account page), and
 * the space before each "·" does not break, so a wrapped line never starts
 * with a dot.
 */
export function seatsLine(used: number | undefined, included: number, asOf?: string, plan?: string, business = 0): SeatsLine {
  if (used === undefined || used === null) return { text: "" };
  const when = asOf ? ` as of ${formatDayMonth(asOf)}` : "";
  const people = used === 1 ? "1 person" : `${used} people`;
  if (included > 0 && used > included) {
    const past = `${people}${when}. Your plan is ${PEOPLE.cloud(included)}`;
    if (plan === "team" && business > included) return { text: `${past}; Business is ${PEOPLE.cloud(business)}.`, step: "upgrade" };
    return { text: `${past}.`, step: "talk" };
  }
  if (included > 0) {
    return { text: `${people}${when} · your plan is ${PEOPLE.cloud(included)}` };
  }
  return { text: `${people}${when}` };
}
