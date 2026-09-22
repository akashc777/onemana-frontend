/**
 * The one sentence about people on a workspace card.
 *
 * The plan is sold as "up to N users" and until now the customer's own status
 * page said nothing about how many of their people were in the workspace. This
 * is that sentence, kept pure so the three cases it has to get right can be
 * tested: never counted, counted, and counted past what the plan includes.
 *
 * "Included" is the honest word. Nothing in the product stops the thirty-first
 * person joining, so "of" or "limit" would promise an enforcement that does
 * not exist; a count over the included number is stated as a fact, and the
 * next sentence says who to talk to.
 */
export function seatsLine(used: number | undefined, included: number, asOf?: string): string {
  if (used === undefined || used === null) return "";
  const when = asOf ? ` as of ${new Date(asOf).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : "";
  const people = used === 1 ? "1 person" : `${used} people`;
  if (included > 0 && used > included) {
    return `${people}${when}. Your plan includes ${included}; get in touch about a larger workspace.`;
  }
  if (included > 0) {
    return `${people}${when} · ${included} included in your plan`;
  }
  return `${people}${when}`;
}
