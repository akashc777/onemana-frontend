import type { CampHue } from "@/lib/campHue"

/**
 * The demo's own content, as the live demo seeds it (onecamp backend
 * business/DemoSeed: demoSeed.go Curated, workspace.go CuratedProject and
 * CuratedDocs, checkins.go demoStandup). A visitor who opens the demo after
 * the site meets the same people, channels and words.
 *
 * Hues are the ones the app gives these names (lib/campHue hueFor), checked
 * against the live demo's captures.
 */
export type Person = { name: string; initials: string; hue: CampHue }
export type Agent = { name: string; kind: "agent" }

export const SAM: Person = { name: "Sam Rivera", initials: "SR", hue: "lake" }
export const MAYA: Person = { name: "Maya Chen", initials: "MC", hue: "moss" }
export const JONAS: Person = { name: "Jonas Weber", initials: "JW", hue: "berry" }
export const CAPTAIN: Agent = { name: "Release Captain", kind: "agent" }
export const ONECAMP_AI: Agent = { name: "OneCamp AI", kind: "agent" }

/** The workspace's name on the sidebar. The demo's install says "one camp"; the product is OneCamp. */
export const WORKSPACE = "OneCamp"

export const PROJECTS: { name: string; hue: CampHue }[] = [
  { name: "Q4 launch", hue: "sun" },
  { name: "Customer onboarding", hue: "lake" },
]

export const CHANNELS: { name: string; count?: number }[] = [
  { name: "acme", count: 4 },
  { name: "general", count: 2 },
  { name: "design" },
  { name: "engineering" },
]

/** #engineering, as seeded (demoSeed.go Curated[0]). */
export const ENGINEERING = {
  name: "engineering",
  members: [SAM, MAYA, JONAS] as Person[],
  memberCount: 4,
  checkin: { question: "What did you work on today?", answered: 2 },
  posts: {
    rc: { by: SAM, at: "9:05 AM", text: "Release candidate for the Q4 launch is up on staging. Everything on the checklist in the Q4 launch plan is green except the load test." },
    loadTest: { by: MAYA, at: "9:37 AM", text: "Load test is running now. I will post the numbers here and link them from the task." },
    checklist: { by: CAPTAIN, at: "9:38 AM", text: "Checklist status: 11 of 12 items are marked done. The load test is the one left, and I will not mark it until someone posts the numbers here." },
    rollback: { by: JONAS, at: "10:11 AM", text: "can we get the rollback steps into the Launch sync notes before Thursday? Legal asked for them in writing." },
    decisions: { by: MAYA, at: "10:40 AM", text: "Added them under Decisions. Two steps, both tried on staging this morning." },
    announcement: { by: SAM, at: "11:13 AM", text: "Great. Then the only thing between us and Thursday is the announcement." },
  },
}

/**
 * The hero's story: the governance drill the demo runs (Activity › AI),
 * told in #engineering. Jonas asks the agent to post where he cannot; the
 * agent, acting only with his access, is refused, and the attempt and the
 * refusal are on the record.
 */
export const STORY = {
  ask: {
    by: JONAS,
    at: "11:20 AM",
    text: "post the Q3 numbers in #finance before the board call.",
    /** The same ask on a phone, a line longer, so the phone's story ends on whole rows. */
    phoneText: "post the Q3 numbers in #finance before the board call, and pin them to the top of the channel.",
  },
  reply: {
    by: CAPTAIN,
    at: "11:20 AM",
    text: "I can't post in #finance. You aren't a member there, and I act only with the access of whoever asks.",
  },
  record: {
    who: "Release Captain",
    verb: "tried to",
    object: "post in #finance",
    outcome: "refused" as const,
    why: "Jonas Weber is not a member of this channel",
    at: "11:20 AM",
  },
}

/**
 * The record of the demo's governance drill (Activity › Agents): each run is
 * an attempt written down before it acts, then the refusal.
 */
export const DRILL = {
  attempt: { who: "The governance drill", verb: "is about to try", object: "post in #drill-finance", outcome: "attempt" as const, why: "the permission check runs first, and is written down before it", drill: true },
  refused: { who: "The governance drill", verb: "tried to", object: "post in #drill-finance", outcome: "refused" as const, why: "you are not a member of this channel", drill: true },
}

/** #design, as seeded (demoSeed.go Curated[1]), and the reply the tour's moment brings. */
export const DESIGN = {
  name: "design",
  members: [SAM, MAYA, JONAS] as Person[],
  memberCount: 3,
  posts: {
    hero: { by: MAYA, at: "9:14 AM", text: "Final hero for the launch page is in. The dark version finally passes contrast on the small text." },
    fits: { by: JONAS, at: "9:56 AM", text: "Looks sharp. Does the pricing table still fit on one screen on a phone?" },
    tap: { by: MAYA, at: "10:41 AM", text: "It does now. The comparison column moved behind a tap on small screens." },
    ship: { by: SAM, at: "11:22 AM", text: "Ship it. I will ask the AI teammate to draft alt text for every image, so nothing goes out without it." },
  },
  /** The tour's moment: Maya answers while you watch. */
  reply: { by: MAYA, at: "11:24 AM", text: "Thanks. I'll check the alt text before it goes out." },
}
