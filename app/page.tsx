import Link from "next/link";
import { site } from "@/lib/site";
import { features, steps, faqs, requirements } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(37,99,235,0.10),transparent)]" />
        <div className="container-x flex flex-col items-center pt-20 pb-14 text-center sm:pt-28">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Self-hosted · AI-native · One-time payment
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-ink sm:text-6xl">
            The workspace for the <span className="text-brand">AI era</span>.<br className="hidden sm:block" /> Yours forever.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            OneCamp replaces Slack, Notion, Asana, Zoom, and Google Calendar in a single Docker deploy — with a built-in AI that runs entirely on your own server. No per-seat fees. No subscriptions. No data leaving your infrastructure.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/buy" className="btn-primary px-6 py-3.5 text-base">
              Get {site.name} — ₹{site.priceInr} (~${site.priceUsdApprox}) one-time
            </Link>
            <a href={site.demoUrl} target="_blank" rel="noreferrer" className="btn-ghost px-6 py-3.5 text-base">
              Try Live Demo →
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-400">Unlimited users · Open-source frontend · Runs on your hardware</p>

          <div className="mt-14 w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-xl">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${site.demoVideoId}`}
                title="OneCamp demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          <Link href="/docs" className="btn-ghost mt-6">Setup Docs 📄</Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-100 bg-slate-50/50 py-20">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink">Everything your team needs</h2>
            <p className="mt-3 text-slate-600">Eight modules, one unified workspace — all self-hosted, with AI at the core.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card transition hover:shadow-md">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-3 font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink">Up and running in 3 steps</h2>
            <p className="mt-3 text-slate-600">One person installs it. Everyone else just logs in.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="card text-center">
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-lg font-bold text-brand">{s.n}</div>
                <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-blue-100 bg-blue-50/70 p-6 text-center">
            <p className="text-sm text-slate-600">
              📱 <span className="font-semibold text-ink">Works on every device.</span> Desktop, tablet, and mobile — as a web app or a PWA you launch from your home screen, with push notifications and app badges. No app store needed.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-slate-100 bg-slate-50/50 py-20">
        <div className="container-x">
          <div className="mx-auto max-w-xl">
            <div className="card overflow-hidden p-0 text-center shadow-md">
              <div className="bg-ink px-8 py-8 text-white">
                <p className="text-sm font-medium text-slate-300">OneCamp — Lifetime License</p>
                <p className="mt-2 text-5xl font-bold">₹{site.priceInr}</p>
                <p className="mt-1 text-sm text-slate-400">≈ ${site.priceUsdApprox} · one-time · all taxes included</p>
              </div>
              <div className="px-8 py-8">
                <ul className="space-y-2.5 text-left text-sm text-slate-700">
                  {["Unlimited users — no per-seat fees", "All modules incl. local AI", "Open-source frontend, yours forever", "Runs on your own server", "Free updates within your major version"].map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-500">✓</span> {b}
                    </li>
                  ))}
                </ul>
                <Link href="/buy" className="btn-primary mt-7 w-full py-3.5 text-base">Get OneCamp now</Link>
                <p className="mt-3 text-xs text-slate-400">Secure checkout via Razorpay · GST invoice emailed instantly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System requirements */}
      <section className="py-20">
        <div className="container-x mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink">System requirements</h2>
            <p className="mt-3 text-slate-600">Packaged as Docker containers. Our command handles deploy, SSL, and AI setup.</p>
          </div>
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-center text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Team Size</th>
                  <th className="px-4 py-3 font-semibold">RAM</th>
                  <th className="px-4 py-3 font-semibold">CPU</th>
                  <th className="px-4 py-3 font-semibold">AI Ready</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requirements.map((r) => (
                  <tr key={r.team}>
                    <td className="px-4 py-3 font-medium text-ink">{r.team}</td>
                    <td className="px-4 py-3 text-slate-600">{r.ram}</td>
                    <td className="px-4 py-3 text-slate-600">{r.cpu}</td>
                    <td className="px-4 py-3 text-slate-600">{r.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-slate-100 bg-slate-50/50 py-20">
        <div className="container-x mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-ink">Frequently asked questions</h2>
          <div className="mt-10 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group card">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
                  {f.q}
                  <span className="ml-4 text-slate-400 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container-x">
          <div className="mx-auto max-w-3xl rounded-3xl bg-ink px-8 py-14 text-center text-white">
            <h2 className="text-3xl font-bold tracking-tight">Ready to own your workspace?</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Deploy a self-hosted, AI-native workspace in minutes. One-time payment, unlimited users, your data forever.
            </p>
            <Link href="/buy" className="btn-primary mt-7 bg-white px-6 py-3.5 text-base text-ink hover:bg-slate-100">
              Get OneCamp — ₹{site.priceInr}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
