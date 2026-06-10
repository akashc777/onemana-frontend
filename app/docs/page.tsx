import type { Metadata } from "next";
import { site } from "@/lib/site";
import { DocsShell, type DocsNavGroup } from "@/components/docs/DocsShell";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Setup & Docs — install OneCamp on your server",
  description:
    "Step-by-step guide to deploy OneCamp: DNS subdomains, install commands, OAuth callbacks, and service reference.",
  alternates: { canonical: "/docs" },
};

const NAV: DocsNavGroup[] = [
  {
    title: "Deployment",
    items: [
      { href: "#video-guide", label: "Video guide" },
      { href: "#dns", label: "DNS subdomains" },
      { href: "#service-reference", label: "Service reference" },
    ],
  },
  {
    title: "Setup flow",
    items: [
      { href: "#install", label: "Installation" },
      { href: "#oauth", label: "OAuth callbacks" },
    ],
  },
];

const SUBDOMAINS = [
  "traefik",
  "onecamp-dgraph-alpha",
  "onecamp-dgraph",
  "onecamp-ch",
  "onecamp-emqx",
  "onecamp-emqx-console",
  "onecamp-collab",
  "onecamp-postgres",
  "onecamp-minio",
  "onecamp-minio-console",
  "onecamp-redis",
  "onecamp-os",
  "onecamp-backend",
  "onecamp-livekit",
];

const SERVICES: [string, string][] = [
  ["traefik", "Traefik dashboard & API (protected)"],
  ["onecamp-dgraph-alpha", "Dgraph Alpha (internal)"],
  ["onecamp-dgraph", "Dgraph main endpoint"],
  ["onecamp-ch", "ClickHouse"],
  ["onecamp-emqx", "EMQX MQTT broker"],
  ["onecamp-emqx-console", "EMQX dashboard"],
  ["onecamp-collab", "Collaboration service"],
  ["onecamp-postgres", "PostgreSQL"],
  ["onecamp-minio", "MinIO object storage"],
  ["onecamp-minio-console", "MinIO console"],
  ["onecamp-redis", "Redis"],
  ["onecamp-os", "OpenSearch / Elasticsearch"],
  ["onecamp-backend", "Main application backend API"],
  ["onecamp-livekit", "LiveKit (WebRTC video & audio)"],
];

const INSTALL_CMDS = `cp ./.sample.env ./.env
cp ./sample-compose.yml ./compose.yml
make update-admin-email EMAIL=your-email
make update-server-ip
make replace-domain DOMAIN=your-domain
make create-traefik-password PASSWORD=secret
make update-traefik-email EMAIL=your-email
make update-allowed-domains DOMAINS=your-domain
make create-swap
make build_restart_all
make create_postgres_db
echo "127.0.0.1 onecamp-postgres.your-domain.com" | sudo tee -a /etc/hosts
ln -s /root/.cargo/bin/sqlx /usr/local/bin/sqlx
make migrate_up`;

function Video({ id, title }: { id: string; title: string }) {
  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="aspect-video">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <>
      <section className="border-b border-white/5 pt-16 sm:pt-20">
        <div className="container-x pb-10">
          <Badge>Documentation</Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">Setup &amp; installation</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Deploy OneCamp on any Docker-capable server. Configure DNS, run the install commands, and invite your team.
          </p>
        </div>
      </section>

      <DocsShell nav={NAV}>
        <div className="prose prose-invert prose-lg max-w-none prose-headings:scroll-mt-24 prose-headings:text-white prose-a:text-brand-light prose-strong:text-white prose-li:marker:text-slate-500">
          <h2 id="video-guide">Video guide</h2>
          <p>Watch the complete walkthrough for setting up OneCamp, configuring DNS, and launching your workspace.</p>
        </div>
        <Video id="UPq-dfRHgJE" title="OneCamp setup guide part 1" />
        <Video id="9HAHlKSFJJ8" title="OneCamp setup guide part 2" />

        <div className="prose prose-invert prose-lg mt-12 max-w-none prose-headings:scroll-mt-24 prose-headings:text-white prose-a:text-brand-light prose-strong:text-white prose-li:marker:text-slate-500">
          <h2 id="dns">Required DNS subdomains</h2>
          <p>
            Add the following subdomains to your DNS records. They should usually be <strong>A records</strong> pointing to your server IP, depending on your infrastructure.
          </p>
        </div>
        <CodeBlock label="subdomains (append .yourdomain.com)" code={SUBDOMAINS.join("\n")} />

        <div className="prose prose-invert prose-lg mt-12 max-w-none prose-headings:scroll-mt-24 prose-headings:text-white">
          <h2 id="service-reference">Service reference</h2>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Subdomain</th>
                <th className="px-4 py-3 font-semibold">Purpose / service</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {SERVICES.map(([sub, purpose]) => (
                <tr key={sub} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-mono text-xs text-brand-light">{sub}</td>
                  <td className="px-4 py-3 text-slate-300">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="prose prose-invert prose-lg mt-12 max-w-none prose-headings:scroll-mt-24 prose-headings:text-white">
          <h2 id="install">Run these commands in sequence</h2>
        </div>
        <CodeBlock label="Terminal setup commands" code={INSTALL_CMDS} />

        <div className="prose prose-invert prose-lg mt-12 max-w-none prose-headings:scroll-mt-24 prose-headings:text-white prose-a:text-brand-light prose-strong:text-white">
          <h2 id="oauth">OAuth callback URLs</h2>
          <p>Replace <code>yourDomain.com</code> with your domain.</p>
          <h3>Authorised JavaScript origins</h3>
          <ul>
            <li>https://onecamp-backend.yourDomain.com</li>
            <li>https://onecamp.yourDomain.com</li>
          </ul>
          <h3>Authorised redirect URIs</h3>
          <ul>
            <li>https://onecamp-backend.yourDomain.com/oauth_callback/google</li>
            <li>https://onecamp-backend.yourDomain.com</li>
          </ul>
          <p>
            Already purchased? Install with your key:{" "}
            <a href="/buy">get a license</a> or read the email we sent you.
          </p>
        </div>
        <CodeBlock label="install on your server" code={`/bin/bash -c "$(curl -fsSL ${site.backendUrl}/onecamp/download/YOUR-LICENSE-KEY)"`} />
      </DocsShell>
    </>
  );
}
