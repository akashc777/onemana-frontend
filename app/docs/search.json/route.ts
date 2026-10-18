import { publishedDocsWithContent, type DocPage } from "@/lib/docs";
import { renderMarkdown } from "@/lib/markdown";
import { articleSections, enhanceArticle } from "@/lib/article";
import type { SearchIndex } from "@/lib/docsSearch";

// The docs search's index: every published guide, section by section, as
// text (lib/docsSearch.ts searches it in the browser). Built from the same
// cached reads the doc pages make, and regenerated with them, so a guide is
// findable as soon as it is readable. Fetched only when somebody reaches for
// the search field.
export const revalidate = 300;

export async function GET() {
  // Every guide with its body in one request, not a request per guide.
  let full: DocPage[] = [];
  try {
    full = await publishedDocsWithContent();
  } catch {
    full = [];
  }
  const index: SearchIndex = {
    docs: full
      .filter((d) => d.content)
      .map((doc) => ({
        s: doc.slug,
        t: doc.title,
        c: doc.category.trim(),
        d: doc.seo_desc?.trim() ?? "",
        x: articleSections(enhanceArticle(renderMarkdown(doc.content)).html).map((s) => [s.id, s.heading, s.text]),
      })),
  };
  return Response.json(index);
}
