import type { CampHue } from "./campHue";
import { site } from "./site";

/**
 * What the site says about each open-source repository (the cards on
 * /open-source and the home page). The live facts, stars, the licence GitHub
 * detects and the latest release, come from lib/github.ts; these are the
 * words, which do not change with a read.
 *
 * The licence here is the one each repository carries in its LICENSE file.
 * A card shows GitHub's own reading when GitHub answers, and this one when it
 * does not, so a card never goes without its licence (openSource.test.ts
 * holds the two to the same values).
 */
export interface RepoCopy {
  /** "OneMana-Soft/OneCamp", one of site.githubRepos. */
  repo: string;
  /** What it is, as a person names it. */
  role: string;
  /** The same, inside a sentence a screen reader says ("Star the web app on GitHub"). */
  called: string;
  /** One line: what it does. */
  line: string;
  licence: "AGPL-3.0" | "MIT";
  /** Its dot, in the chart's order (lib/campHue.ts). */
  hue: CampHue;
}

export const REPO_COPY: RepoCopy[] = [
  {
    repo: "OneMana-Soft/OneCamp",
    role: "Server",
    called: "the server",
    line: "The workspace itself: chat, docs, tasks, calls and the agents.",
    licence: "AGPL-3.0",
    hue: "sky",
  },
  {
    repo: "OneMana-Soft/OneCamp-fe",
    role: "Web app",
    called: "the web app",
    line: "What your team opens in the browser, in Next.js.",
    licence: "MIT",
    hue: "moss",
  },
  {
    repo: "OneMana-Soft/OneCamp-desktop",
    role: "Desktop app",
    called: "the desktop app",
    line: "Your workspace in its own window on Windows, macOS and Linux.",
    licence: "MIT",
    hue: "sun",
  },
  {
    repo: "OneMana-Soft/onemana-omarchy",
    role: "Omarchy kit",
    called: "the Omarchy kit",
    line: "Unread messages and agent approvals on the Omarchy bar.",
    licence: "MIT",
    hue: "dusk",
  },
];

/** The repository's name on GitHub, without its organisation: "OneCamp-fe". */
export function repoName(repo: string): string {
  return repo.slice(repo.indexOf("/") + 1);
}

/** The repository's page on GitHub, from its name, for when GitHub has not answered. */
export function repoUrl(repo: string): string {
  return `https://github.com/${repo}`;
}

/**
 * A file on the repository's default branch, whatever that branch is called
 * (the web app's is `ai`): GitHub resolves HEAD to it.
 */
export function repoFile(repo: string, path: string): string {
  return `${repoUrl(repo)}/blob/HEAD/${path}`;
}

const server = site.serverGithubUrl.replace("https://github.com/", "");

/** Where the page's links go, in one place, so a test can check each against the repositories. */
export const OPEN_SOURCE_LINKS = {
  serverLicence: repoFile(server, "LICENSE"),
  commercialLicence: repoFile(server, "COMMERCIAL-LICENSE.md"),
  webLicence: repoFile("OneMana-Soft/OneCamp-fe", "LICENSE"),
  contributing: repoFile(server, "CONTRIBUTING.md"),
  security: repoFile(server, "SECURITY.md"),
  privateReport: `${site.serverGithubUrl}/security/advisories/new`,
  issues: `${site.serverGithubUrl}/issues`,
  discussions: `${site.serverGithubUrl}/discussions`,
  readme: `${site.serverGithubUrl}#run-it-from-source`,
} as const;
