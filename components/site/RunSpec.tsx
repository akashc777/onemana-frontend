import Link from "next/link";

/**
 * What running OneCamp yourself involves, as a specification: the term in the
 * margin, the fact beside it. It merged three sections that each answered part
 * of one question (getting started, what IT will ask, switching), and it keeps
 * the honest line from the last of them: somebody has to run it.
 *
 * Each line is held to the product: the install floor and what the installer
 * does match lib/content's selfHostNeeds and steps (installExpectation.test.ts),
 * the import lists match the Slack importer, and the company controls are the
 * ones a licence turns on.
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
    detail: "Channels, threads, direct messages, files and reactions come across, with a plan shown first and a rollback after. Slack apps, workflows and huddles do not.",
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
    <dl className="grid gap-x-10 gap-y-8 border-t border-border pt-8 sm:grid-cols-2">
      {SPEC.map((s) => (
        <div key={s.term}>
          <dt className="text-small font-medium text-foreground">{s.term}</dt>
          <dd className="mt-1.5 text-small text-muted-foreground">
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
