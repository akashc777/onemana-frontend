import { templateBySlug, templateFile, templates } from "@/lib/templates";

// The template as a file for "Add a template file" in OneCamp: a starting
// point to change and keep as a workspace's own.
export const dynamic = "force-static";

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
