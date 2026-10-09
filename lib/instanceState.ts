// How a managed workspace's state is presented.
//
// ONE MAP, TWO AUDIENCES. The customer's page and the operator's panel were each
// carrying their own copy of state-to-colour, written a few minutes apart and
// already differing in which states they knew about. Two copies of a vocabulary
// drift silently. The state added later gets a colour in one place and the default
// grey in the other, and nobody notices because both still render.
//
// This is presentation only. What the states MEAN lives in the backend, which sends
// the wording, and this never decides anything, only how it looks.

export type StateTone = "good" | "bad" | "waiting" | "working" | "done";

const TONES: Record<string, StateTone> = {
  live: "good",
  failed: "bad",
  awaiting_setup: "waiting",
  awaiting_hardware: "waiting",
  suspended: "waiting",
  adopting: "working",
  provisioning: "working",
  verifying: "working",
  migrating: "working",
  exporting: "done",
  terminated: "done",
};

const CLASSES: Record<StateTone, string> = {
  good: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  bad: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  waiting: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  working: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  done: "bg-slate-500/20 text-foreground/80",
};

/** The tone a state should read as. Unknown states are treated as working, because
 *  a state this does not recognise is far more likely to be a new step in the middle
 *  of the flow than a new ending. */
export function stateTone(state: string): StateTone {
  return TONES[state] ?? "working";
}

/** Tailwind classes for a workspace state badge. */
export function stateBadgeClass(state: string): string {
  return CLASSES[stateTone(state)];
}

/** States where something is actively happening, so a view should keep polling. */
export function isWorkingState(state: string): boolean {
  return stateTone(state) === "working";
}

/**
 * Whether the account page should say a workspace is on its way: a Cloud
 * subscription has been paid for (Razorpay marks it active with its first
 * charge) and no workspace exists yet, because the payment's webhook has not
 * reached us or is being recovered. Without this a buyer who signed in quickly
 * saw no workspace at all, and nothing saying one was coming. Add-ons name the
 * workspace they extend, so they never count.
 */
export function paidWithoutWorkspace(
  subscriptions: { status: string; instance_id?: string }[],
  instanceCount: number,
): boolean {
  return instanceCount === 0 && subscriptions.some((s) => !s.instance_id && s.status === "active");
}
