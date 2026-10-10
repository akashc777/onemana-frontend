import { site } from "@/lib/site";
import type { ReleaseFacts } from "@/lib/releases";

/**
 * One line of plain facts where a logo wall would go. No star count: until it
 * reads in the hundreds, a small number is anti-proof. The release line is read
 * from the public repository, so it cannot claim a version that is not there,
 * and it says nothing at all when GitHub does not answer.
 */
export function FactsStrip({ release }: { release: ReleaseFacts | null }) {
  const facts: { term: string; detail: React.ReactNode }[] = [
    {
      term: "Open source",
      detail: (
        <a href={site.serverGithubUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-border-strong underline-offset-4 hover:text-foreground">
          AGPL-3.0, on GitHub
        </a>
      ),
    },
    release
      ? { term: `${release.version}, ${release.date}`, detail: `${release.last30} releases in the last 30 days` }
      : { term: "Released in the open", detail: "Every release on GitHub" },
    { term: "4 GB of RAM minimum", detail: "Ubuntu or Debian, one command" },
    { term: "Your data stays put", detail: "No telemetry; your messages and files stay on your server" },
  ];
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-5 border-t border-border pt-6 min-[420px]:grid-cols-2 lg:grid-cols-4">
      {facts.map((f) => (
        <div key={f.term}>
          <dt className="text-small font-medium text-foreground">{f.term}</dt>
          <dd className="mt-0.5 text-small text-muted-foreground">{f.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
