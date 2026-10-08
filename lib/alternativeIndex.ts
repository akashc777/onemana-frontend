// Which "alternative to" pages exist, and what to call them in links. Kept
// apart from lib/alternatives so the footer (on every page, the homepage
// included) doesn't pull in every page's copy. A test keeps the two in step.
export const ALTERNATIVE_INDEX = [
  { slug: "slack", label: "Slack" },
  { slug: "basecamp", label: "Basecamp" },
  { slug: "notion", label: "Notion" },
  { slug: "clickup", label: "ClickUp" },
  { slug: "asana", label: "Asana" },
  { slug: "monday", label: "monday.com" },
  { slug: "toggl", label: "Toggl" },
] as const;
