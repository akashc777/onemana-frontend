import { AREA, type AreaHue } from "./areas";
import type { CampHue } from "./campHue";

// What a post is about, for the blog's colour: one of six topics, each with a
// camp hue of its own (the playful layer, "a hue per topic or tag").
//
// WHY TOPICS AND NOT TAGS. The posts carry 178 distinct tags, and three of
// them (OneCamp, Self-Hosted, OpenSource) are on nearly every post, so a hue
// per tag would be noise. Six topics, one hue each, are few enough to learn
// from the colour alone, and their names are always shown beside it. The
// first rule a post's tags match wins, so a security post that also shipped
// in a release reads as security.

export interface BlogTopic {
  key: "agents" | "security" | "projects" | "chat" | "tables" | "running";
  label: string;
  /** The area the topic is about (lib/areas.ts), or neutral ink for one that is no area (v3.1). */
  hue: AreaHue | "ink";
}

const AGENTS: BlogTopic = { key: "agents", label: "Agents", hue: AREA.agents.hue };

// Most specific first. The tags decide, then the title's words, and the
// generic "AI" tag last of all.
const RULES: { topic: BlogTopic; tags: string[] }[] = [
  {
    topic: { key: "tables", label: "Docs and tables", hue: AREA.docs.hue },
    tags: ["tables", "formulas", "relations", "rollups", "docs", "whiteboard", "airtable alternative", "notion alternative", "databases"],
  },
  {
    topic: { key: "chat", label: "Chat and calls", hue: AREA.chat.hue },
    tags: ["chat", "clips", "voice notes", "read receipts", "calls", "video", "meetings", "meeting notes", "slack bridge"],
  },
  {
    topic: { key: "projects", label: "Projects", hue: AREA.projects.hue },
    tags: [
      "project management", "kanban", "gantt", "timeline", "dependencies", "workload", "goals", "reports", "time tracking",
      "invoices", "invoicing", "templates", "custom fields", "cycles", "burndown", "agencies", "client portal", "freelancers",
      "estimates", "check-ins", "standups", "cumulative flow",
    ],
  },
  {
    topic: AGENTS,
    tags: ["ai agents", "agents", "ai teammates", "llm", "ollama", "mcp", "ai governance", "coding agent", "agent-to-agent"],
  },
  {
    topic: { key: "security", label: "Security", hue: "ink" },
    tags: ["security", "scim", "single sign-on", "sso", "passkeys", "governance", "audit", "eu ai act", "two-factor", "2fa", "privacy", "permissions", "ldap", "onboarding"],
  },
  {
    topic: { key: "running", label: "Running it", hue: "ink" },
    tags: [
      "release", "post-mortem", "docker", "operations", "silent failure", "devops", "deployment", "migrations",
      "reliability", "testing", "managed hosting", "provisioning", "ci", "traefik", "tls", "backups",
    ],
  },
];

/** When no tag is specific, the title often is ("OneCamp Tables: ...", "... for Team Chat"). */
const TITLE_WORDS: { topic: () => BlogTopic; words: string[] }[] = [
  { topic: () => RULES[0].topic, words: ["table", "tables", "whiteboard", "formulas", "docs"] },
  { topic: () => RULES[1].topic, words: ["chat", "calls", "slack", "clip", "meetings"] },
  { topic: () => RULES[2].topic, words: ["project", "projects", "tasks", "client", "invoice", "invoices"] },
  { topic: () => AGENTS, words: ["agent", "agents", "ai"] },
  { topic: () => RULES[4].topic, words: ["security", "permission", "permissions", "sign-in", "passkeys"] },
];

/** Posts about installing, releasing and running OneCamp, and anything the rules above do not name. */
const RUNNING: BlogTopic = RULES[RULES.length - 1].topic;

export const BLOG_TOPICS: BlogTopic[] = RULES.map((r) => r.topic);

export function blogTopic(tags: readonly string[] | null | undefined, title = ""): BlogTopic {
  const have = new Set((tags ?? []).map((t) => t.trim().toLowerCase()));
  for (const rule of RULES) if (rule.tags.some((t) => have.has(t))) return rule.topic;
  const words = new Set(title.toLowerCase().split(/[^a-z0-9-]+/));
  for (const rule of TITLE_WORDS) if (rule.words.some((w) => words.has(w))) return rule.topic();
  // "AI" is on a third of the posts; it decides only when nothing else has.
  if (have.has("ai")) return AGENTS;
  return RUNNING;
}

/**
 * Posts to read next: the newest on the same topic, then the newest of the
 * rest, never the post itself.
 */
export function relatedPosts<T extends { slug: string; tags?: string[] | null; title?: string }>(
  posts: readonly T[],
  current: { slug: string; tags?: string[] | null; title?: string },
  count = 3,
): T[] {
  const topic = blogTopic(current.tags, current.title).key;
  const others = posts.filter((p) => p.slug !== current.slug);
  const same = others.filter((p) => blogTopic(p.tags, p.title).key === topic);
  const rest = others.filter((p) => !same.includes(p));
  return [...same, ...rest].slice(0, count);
}

/**
 * The camp hue a topic's share card draws with (lib/og-post-card, which has
 * the six camp hues only): its area's, or none for the agents' indigo and
 * the neutral topics, where the card keeps its default.
 */
export function topicCampHue(hue: BlogTopic["hue"]): CampHue | undefined {
  return hue === "agent" || hue === "ink" ? undefined : hue;
}
