import { templateBySlug, templateFile, templates } from "@/lib/templates";

// The template as a file for "Add a template file" in OneCamp: a starting
// point to change and keep as a workspace's own.
export const dynamic = "force-static";
// Only the templates there are: any other name is the site's 404, not a
// handler run (and a cached "Not found") for every stray link.
export const dynamicParams = false;

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.id }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const t = templateBySlug((await params).slug);
  if (!t) return new Response("Not found", { status: 404 });
  return new Response(templateFile(t), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${t.id}.onecamp-template.json"`,
    },
  });
}
