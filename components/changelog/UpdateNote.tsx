import Link from "next/link";
import { Arrow } from "@/components/ui/v3";

/**
 * `make update`'s own progress lines, word for word (the customer Makefile's
 * update_apply), so the page shows what the command prints rather than a
 * description of it.
 */
export const UPDATE_STEPS = [
  "backing up before anything changes",
  "applying migrations, while the current version is still running",
  "rebuilding and restarting",
  "checking the result",
] as const;

/**
 * What an update does (RELEASES.md). A page of releases raises a question for
 * anyone who runs their own server: how often will I have to update, and what
 * breaks? This answers it beside the releases, with the evidence: the
 * command's output on the site's night terminal (as /free shows the install
 * command), then what happens when a step fails, and Cloud's answer.
 *
 * Every claim is the product's own: the order and the stop on failure are
 * update_apply's, the backup's place the installation guide's, and Cloud's
 * day of waiting the managed rollout's (onemana-backend instanceUpdate.go).
 */
export function UpdateNote({ headingId = "updating" }: { headingId?: string }) {
  return (
    <div>
      <h2 id={headingId} className="text-body font-[590] text-foreground">
        What an update does
      </h2>
      <div className="night mt-4 overflow-hidden rounded-xl shadow-e3">
        <div className="flex h-9 items-center border-b border-border px-4">
          <span className="text-caption text-muted-foreground">On your server</span>
        </div>
        <pre className="m-0 overflow-x-auto p-4 font-mono text-caption text-foreground">
          <span className="block">
            <span className="text-muted-foreground">$ </span>make update
          </span>
          {UPDATE_STEPS.map((step, i) => (
            // A hanging indent, so a step that wraps lines up under its own words.
            <span key={step} className="block whitespace-pre-wrap pl-[7ch] -indent-[7ch]">
              <span className="text-muted-foreground">{`▶ ${i + 1}/4  `}</span>
              {step}
            </span>
          ))}
        </pre>
      </div>
      <p className="mt-4 text-small text-muted-foreground">
        You don&apos;t have to take every release: one update brings everything since the one you run. If a step fails, the rest stop and the backup is kept.
      </p>
      <p className="mt-3 text-small text-muted-foreground">On OneCamp Cloud there is nothing to do: we move your workspace onto each release once it has been out for a day.</p>
      <Link href="/docs/installation#updating" className="go tap-target mt-4">
        How updating works <Arrow size={14} />
      </Link>
    </div>
  );
}
