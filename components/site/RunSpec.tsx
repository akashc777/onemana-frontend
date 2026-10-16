import Link from "next/link";
import type { CampHue } from "@/lib/campHue";
import { Tile } from "@/components/ui/graphics/Tile";
import { Icon } from "@/components/ui/icons";

/** Each block's tile (site.md H7): a hue and a 1.25px line drawing on a 24 grid. */
const ICON: Record<string, { hue: CampHue; d: string }> = {
  Install: { hue: "sun", d: "M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4" },
  Updates: { hue: "sky", d: "M12 3q1.4 7.6 9 9-7.6 1.4-9 9-1.4-7.6-9-9 7.6-1.4 9-9z" },
  Backups: { hue: "lake", d: "M12 4a8 8 0 1 0 8 8M12 8a4 4 0 1 0 4 4M20 4v4h-4" },
  "Company sign-in": { hue: "dusk", d: "M14.5 9.5a4 4 0 1 1-1.2-2.8M13.3 10.7 21 18.4V21h-2.6l-.9-.9v-1.6h-1.6l-1.2-1.2v-1.6h-1.6" },
  "Moving from Slack": { hue: "berry", d: "M4 12h14M13 6l6 6-6 6" },
  "Who runs it": { hue: "moss", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" },
};

/**
 * What running OneCamp yourself involves, as a specification: the term in the
 * margin, the fact beside it. It merged three sections that each answered part
 * of one question (getting started, what IT will ask, switching), and it keeps
 * the honest line from the last of them: somebody has to run it.
 *
 * Each line is held to the product: the install floor and what the installer
 * does match lib/content's selfHostNeeds and steps (installExpectation.test.ts),
 * the Slack line says that an importer and a bridge exist and what stays
 * behind, and promises nothing about how a move goes (rivalClaims.test.tsx),
 * and the company controls are the ones a licence turns on.
 */
const SPEC: { term: string; detail: string; href?: string; link?: string }[] = [
  {
    term: "Install",
    detail: "One command on an Ubuntu or Debian server with 4 GB of RAM. It sets up Docker, SSL, the database and the web app; allow 10 to 20 minutes the first time.",
    href: "/docs/installation",
    link: "Install guide",
  },
  {
    term: "Updates",
    detail: "One command. It refuses to start against a database it does not match rather than corrupt anything.",
  },
  {
    term: "Backups",
    detail: "Scheduled at install, search included, and a restore that never leaves the app stopped. A backup on the same machine is an undo buffer, not disaster recovery, so copy it somewhere else.",
  },
  {
    term: "Company sign-in",
    detail: "SAML, OIDC and LDAP sign-in, SCIM provisioning, and an audit log you can export with its hashes. These come with a licence.",
  },
  {
    term: "Moving from Slack",
    detail: "There's an importer for Slack exports, and a bridge that links a Slack channel to a OneCamp channel while people move. Slack apps, workflows and huddles stay behind.",
  },
  {
    term: "Who runs it",
    detail: "You do: it is your server. If nobody on the team wants that job, OneCamp Cloud runs it for you, and a hosted tool may suit you better.",
    href: "/pricing",
    link: "See Cloud",
  },
];

export function RunSpec() {
  return (
    <dl className="m-0 grid gap-x-10 gap-y-8 border-t border-border pt-8 sm:grid-cols-2">
      {SPEC.map((s) => (
        <div key={s.term} className="reveal">
          <dt className="flex items-center gap-3 text-body font-[590] text-foreground">
          <Tile hue={ICON[s.term]!.hue} size="sm">
            <Icon d={ICON[s.term]!.d} />
          </Tile>
          {s.term}
          </dt>
          <dd className="m-0 mt-1.5 pl-10 text-small leading-[22px] text-muted-foreground">
            {s.detail}
            {s.href && (
              <>
                {" "}
                <Link href={s.href} className="link whitespace-nowrap">
                  {s.link}
                </Link>
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
