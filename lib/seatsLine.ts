import { formatDayMonth } from "@/lib/format";
import { PEOPLE } from "@/lib/plans";

/**
 * The one sentence about people on a workspace card.
 *
 * The plan is sold as sized for N people (lib/plans PEOPLE.cloud), and until
 * then the customer's own status page said nothing about how many of their
 * people were in the workspace. This is that sentence, kept pure so the three
 * cases it has to get right can be tested: never counted, counted, and counted
 * past the number the plan is sized for.
 *
 * "Sized for" is the honest word, as on every page that sells the plan.
 * Nothing in the product stops the thirty-first person joining, so "of",
 * "limit" or "included" would promise an enforcement or a price step that
 * does not exist; a count past the number is stated as a fact, and the next
 * sentence says who to talk to.
 *
 * The date is the house one ("9 Oct", as on the rest of the account page), and
 * the space before each "·" does not break, so a wrapped line never starts
 * with a dot.
 */
export function seatsLine(used: number | undefined, included: number, asOf?: string): string {
  if (used === undefined || used === null) return "";
  const when = asOf ? ` as of ${formatDayMonth(asOf)}` : "";
  const people = used === 1 ? "1 person" : `${used} people`;
  if (included > 0 && used > included) {
    return `${people}${when}. Your plan is ${PEOPLE.cloud(included)}; get in touch about a larger workspace.`;
  }
  if (included > 0) {
    return `${people}${when}\u00a0· your plan is ${PEOPLE.cloud(included)}`;
  }
  return `${people}${when}`;
}
