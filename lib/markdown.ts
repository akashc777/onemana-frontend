import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { site } from "./site";

marked.setOptions({ gfm: true, breaks: true });

/**
 * Tags an admin-authored article can legitimately contain.
 *
 * Covers everything `marked` emits for GFM (headings, lists, tables, code,
 * blockquotes, images, links) plus the handful of presentational tags a human
 * author reasonably reaches for in raw HTML. Anything outside this list is
 * dropped rather than escaped, so a stray tag disappears instead of showing up
 * as literal angle brackets in a published post.
 *
 * Deliberately absent: <script>, <iframe>, <object>, <embed>, <form>, <input>,
 * <style>, <svg>, <math>. Each can execute script or exfiltrate input, and none
 * is needed to write an article. <svg> is excluded even though SVG uploads are
 * allowed as *images* — an <img src="…svg"> cannot run script, an inline <svg>
 * can.
 */
const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr", "blockquote", "pre", "code",
  "strong", "em", "b", "i", "u", "s", "del", "ins", "mark", "small", "sub", "sup",
  "ul", "ol", "li",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "a", "img", "figure", "figcaption",
  "div", "span",
  "video", "source",
  "details", "summary",
];

/**
 * Render admin-authored Markdown to HTML for article pages.
 *
 * The result is injected with dangerouslySetInnerHTML on public pages, so it is
 * sanitised with an allowlist rather than by pattern-matching for bad things.
 *
 * WHY AN ALLOWLIST. This function previously stripped `<script>…</script>` and
 * ` on*="…"` with regexes. That approach cannot work, and did not: every one of
 * these got through, because each falls outside the exact shapes the patterns
 * looked for.
 *
 *   <img src=x onerror=alert(1)>          unquoted attribute value
 *   <script src="//evil/x.js">            no closing tag, so nothing to match
 *   <svg onload=alert(1)>                 unquoted, and <svg> was never stripped
 *   [click](javascript:alert(1))          a URL scheme, not a tag or an attribute
 *   <iframe srcdoc="&lt;script&gt;…">     entity-encoded, so invisible to the regex
 *   <details open ontoggle=alert(1)>      unquoted handler on an allowed tag
 *
 * A denylist has to anticipate every encoding, every tag and every attribute; an
 * allowlist only has to name what is wanted. Content is authored through the
 * token-gated admin editor, so this is defence in depth — but it is the kind that
 * actually defends, which the previous version did not.
 */
export function renderMarkdown(md: string): string {
  const rendered = marked.parse(md ?? "", { async: false }) as string;

  const clean = sanitizeHtml(rendered, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      video: ["src", "controls", "poster", "width", "height"],
      source: ["src", "type"],
      // class only, never style: an attacker-controlled style can position an
      // overlay over the page or leak data through background-image requests.
      "*": ["class"],
    },
    // Anything not listed here — javascript:, vbscript:, file: — is removed.
    // `data:` is excluded deliberately: it is how an image gets inlined into the
    // article body instead of being uploaded to the media table.
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesAppliedToAttributes: ["href", "src", "poster"],
    // Force safe link behaviour rather than trusting the author to set it.
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.href?.startsWith("http")
          ? { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" }
          : attribs,
      }),
    },
    // Drop the contents of a disallowed tag too, so removing <script> does not
    // leave its body behind as visible text.
    nonTextTags: ["style", "script", "textarea", "option", "noscript"],
  });

  // Absolutize backend-relative asset URLs. Done AFTER sanitising so this step
  // cannot reintroduce anything: it only rewrites paths that already survived,
  // and only ones anchored at /onecamp/.
  return clean.replace(
    /(src|href)="(\/onecamp\/[^"]*)"/g,
    (_m, attr, path) => `${attr}="${site.backendUrl}${path}"`,
  );
}

/** Rough reading-time estimate from Markdown source. */
export function readingTime(md: string): number {
  const words = (md || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
