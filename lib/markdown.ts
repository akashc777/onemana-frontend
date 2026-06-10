import { marked } from "marked";
import { site } from "./site";

marked.setOptions({ gfm: true, breaks: true });

/**
 * Render admin-authored Markdown to HTML for article pages.
 * - Rewrites relative media URLs (src/href="/onecamp/...") to the backend.
 * - Strips <script> tags and inline on* handlers as defense-in-depth, even
 *   though content is authored only via the token-gated admin editor.
 */
export function renderMarkdown(md: string): string {
  let html = marked.parse(md ?? "", { async: false }) as string;

  // Absolutize backend-relative asset URLs.
  html = html.replace(/(src|href)="(\/onecamp\/[^"]+)"/g, (_m, attr, path) => `${attr}="${site.backendUrl}${path}"`);

  // Strip scripts and inline event handlers.
  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/ on[a-z]+="[^"]*"/gi, "")
    .replace(/ on[a-z]+='[^']*'/gi, "");

  return html;
}

/** Rough reading-time estimate from Markdown source. */
export function readingTime(md: string): number {
  const words = (md || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
