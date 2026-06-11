import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedDocs, groupDocs } from "@/lib/docs";
import { DocsShell } from "@/components/docs/DocsShell";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Docs - install & run OneCamp",
  description: "Guides to deploy, configure, and operate your self-hosted OneCamp workspace.",
  alternates: { canonical: "/docs" },
};

export const revalidate = 300;

export default async function DocsIndexPage() {
  let docs = [] as Awaited<ReturnType<typeof listPublishedDocs>>;
  try {
    docs = await listPublishedDocs();
  } catch {
    docs = [];
  }
  const groups = groupDocs(docs);

  return (
    <>
      <section className="border-b border-white/5 pt-16 sm:pt-20">
        <div className="container-x pb-10">
          <Badge>Documentation</Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">OneCamp docs</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Everything you need to deploy, configure, and run your self-hosted OneCamp workspace.
          </p>
        </div>
      </section>

      <DocsShell groups={groups}>
        {docs.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-4xl">📚</p>
            <h2 className="mt-4 text-lg font-semibold text-white">Docs are on the way</h2>
            <p className="mt-2 text-sm text-slate-400">Setup guides will appear here soon. Already purchased? Check the email we sent you.</p>
            <Link href="/buy" className="btn-primary mt-5 inline-flex px-4 py-2 text-sm">Get OneCamp</Link>
          </div>
        ) : (
          <div className="space-y-10">
            <p className="text-slate-300">Browse the guides below or pick a topic from the sidebar.</p>
            {groups.map((group) => (
              <div key={group.category}>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">{group.category}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/docs/${item.slug}`}
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
                    >
                      <h3 className="font-semibold text-white group-hover:text-brand-light">{item.title}</h3>
                      <span className="mt-2 inline-block text-sm text-slate-500">Read guide →</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DocsShell>

      <p className="container-x pb-16 text-center text-xs text-slate-600">
        Need help beyond the docs? Email {" "}
        <a href="mailto:support@onemana.dev" className="text-brand-light hover:underline">support@onemana.dev</a>.
      </p>
    </>
  );
}
