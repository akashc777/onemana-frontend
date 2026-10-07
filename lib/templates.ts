/**
 * OneCamp's built-in project templates, as the app makes them.
 *
 * content/templates.json is written by the OneCamp server's own code
 * (business/ProjectTemplate, TestExportBuiltIns), so these pages show exactly
 * the tasks, dates and statuses a project made from each template gets. When a
 * built-in template changes there, export it again:
 *
 *   TEMPLATES_EXPORT=…/onemana-frontend/content/templates.json \
 *     go test ./business/ProjectTemplate/ -run TestExportBuiltIns
 */
import data from "@/content/templates.json";
import { site } from "@/lib/site";

export interface TemplateTask {
  name: string;
  /** HTML as the app's editor keeps it: paragraphs and lists, escaped. */
  description?: string;
  status?: string;
  priority?: string;
  tags?: string;
  start_day?: number;
  due_day?: number;
  subtasks?: { name: string; due_day?: number }[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  statuses?: { name: string; category: string; color: string }[];
  tasks: TemplateTask[];
}

export const templates: ProjectTemplate[] = data;

export function templateBySlug(slug: string): ProjectTemplate | undefined {
  return templates.find((t) => t.id === slug);
}

/** Tasks and subtasks a project made from it gets. */
export function taskCount(t: ProjectTemplate): number {
  return t.tasks.reduce((n, task) => n + 1 + (task.subtasks?.length ?? 0), 0);
}

/** How long the plan runs, in whole weeks, from day 0 to its last date. */
export function weeksLong(t: ProjectTemplate): number {
  const last = Math.max(0, ...t.tasks.flatMap((task) => [task.due_day ?? 0, ...(task.subtasks ?? []).map((s) => s.due_day ?? 0)]));
  return Math.max(1, Math.ceil((last + 1) / 7));
}

/** The plan by week: week 1 is days 0 to 6. A task with no date goes in the week before it. */
export function byWeek(t: ProjectTemplate): { week: number; tasks: TemplateTask[] }[] {
  const weeks: { week: number; tasks: TemplateTask[] }[] = [];
  let current = 1;
  for (const task of t.tasks) {
    if (task.due_day !== undefined) current = Math.floor(task.due_day / 7) + 1;
    const last = weeks.at(-1);
    if (last?.week === current) last.tasks.push(task);
    else weeks.push({ week: current, tasks: [task] });
  }
  return weeks;
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&#34;": '"', "&quot;": '"', "&#39;": "'" };
const unescape = (s: string) => s.replace(/&(amp|lt|gt|quot|#34|#39);/g, (m) => ENTITIES[m] ?? m);

/**
 * A task's description as text blocks, in order. The HTML is the app's own
 * (paragraphs, line breaks and list items of escaped text), so this reads
 * those and nothing else: no markup from it reaches the page.
 */
export function descriptionBlocks(html = ""): { kind: "p" | "li"; text: string }[] {
  const out: { kind: "p" | "li"; text: string }[] = [];
  for (const m of html.matchAll(/<(p|li)>([\s\S]*?)<\/\1>/g)) {
    const text = unescape(m[2].replace(/<br\s*\/?>/g, "\n").replace(/<[^>]*>/g, "")).trim();
    if (text) out.push({ kind: m[1] as "p" | "li", text });
  }
  return out;
}

/** The template as a file the app's "Add a template file" reads. */
export function templateFile(t: ProjectTemplate): string {
  const { name, description, statuses, tasks } = t;
  return JSON.stringify({ onecamp_template: 1, name, description, statuses, tasks }, null, 2);
}

/** Signs a visitor into the live demo with New project open on this template. */
export const demoTemplateUrl = (slug: string) => site.demoUrlTo(`template-${slug}`);

/** "Day 1" for day 0: people count the first day as one. */
export const dayLabel = (day: number) => `Day ${day + 1}`;
