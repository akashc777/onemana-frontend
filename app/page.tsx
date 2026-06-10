import { site } from "@/lib/site";
import { features, steps, faqs, requirements } from "@/lib/content";
import { getPricing, fmtUSD } from "@/lib/pricing";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/site/Reveal";
import { AuroraBackdrop } from "@/components/site/Visuals";
import { Pricing } from "@/components/site/Pricing";
import { GitHubStars } from "@/components/site/GitHubStars";
import { HeroShowcase } from "@/components/site/HeroShowcase";
import { StackConvergence } from "@/components/site/StackConvergence";
import { FeatureCard, StepCard, StatStrip, ReplacesMarquee, FaqItem } from "@/components/site/marketing";

export const revalidate = 300;

export default async function HomePage() {
  const pricing = await getPricing();
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 sm:pt-28">
        <AuroraBackdrop />
        <div className="container-x flex flex-col items-center pb-16 text-center">
          <Reveal>
            <Badge dot>Self-hosted · AI-native · One-time or managed</Badge>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              The workspace for the{" "}
              <span className="text-gradient">AI era</span>.
              <br className="hidden sm:block" /> Yours forever.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
              OneCamp replaces Slack, Notion, Asana, Zoom, and Google Calendar in a single Docker deploy - with a built-in AI that runs entirely on your own server. No per-seat fees. No data leaving your infrastructure.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <ButtonLink href="/buy" size="lg">
                Get OneCamp - {fmtUSD(pricing.lifetime_usd)} one-time
              </ButtonLink>
              <ButtonLink href={site.demoUrl} external variant="ghost" size="lg">
                Try Live Demo →
              </ButtonLink>
              <GitHubStars className="!py-3.5" />
            </div>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-4 text-xs text-slate-500">
              Just {fmtUSD(pricing.lifetime_usd)} once · or go fully managed with OneCamp Cloud at {fmtUSD(pricing.cloud_usd)}/mo
            </p>
          </Reveal>

          {/* Live product preview */}
          <Reveal delay={200} className="mt-16 w-full max-w-5xl">
            <div className="relative animate-float">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-r from-brand/20 via-accent-cyan/10 to-accent-pink/20 blur-2xl" />
              <HeroShowcase />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stack convergence — the wow moment */}
      <Section divider>
        <SectionHeading
          eyebrow="One workspace"
          title={<>One install replaces your <span className="text-gradient">entire stack</span></>}
          subtitle="Chat, channels, docs, tasks &amp; kanban, calendar, and meetings — every tool your team juggles, folded into a single self-hosted app with AI at its core."
        />
        <div className="mt-12">
          <StackConvergence />
        </div>
        <Reveal className="mt-6">
          <ReplacesMarquee />
        </Reveal>
      </Section>

      {/* Stats */}
      <Section className="!py-16">
        <StatStrip />
      </Section>

      {/* Features */}
      <Section id="features" divider>
        <SectionHeading
          eyebrow="Features"
          title="Everything your team needs"
          subtitle="Eight modules, one unified workspace - all self-hosted, with AI at the core."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} body={f.body} index={i} />
          ))}
        </div>
      </Section>

      {/* Steps */}
      <Section divider>
        <SectionHeading
          eyebrow="How it works"
          title="Up and running in 3 steps"
          subtitle="One person installs it. Everyone else just logs in."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <StepCard key={s.n} n={s.n} title={s.title} body={s.body} index={i} />
          ))}
        </div>
        <Reveal className="mx-auto mt-10 max-w-3xl">
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-sm text-slate-300">
              📱 <span className="font-semibold text-white">Works on every device.</span> Desktop, tablet, and mobile - as a web app or a PWA you launch from your home screen, with push notifications and app badges. No app store needed.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* Pricing */}
      <Section id="pricing" divider>
        <SectionHeading
          eyebrow="Pricing"
          title="Own it, or let us run it"
          subtitle="Buy a lifetime self-host license, or go fully managed with OneCamp Cloud. Either way, your Cloud plan includes a self-host license."
        />
        <Pricing pricing={pricing} />
      </Section>

      {/* System requirements */}
      <Section divider>
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Specs"
            title="System requirements"
            subtitle="Packaged as Docker containers. Our command handles deploy, SSL, and AI setup."
          />
          <Reveal className="mt-12 overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-center text-sm">
              <thead className="bg-white/5 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Team Size</th>
                  <th className="px-4 py-3 font-semibold">RAM</th>
                  <th className="px-4 py-3 font-semibold">CPU</th>
                  <th className="px-4 py-3 font-semibold">AI Ready</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {requirements.map((r) => (
                  <tr key={r.team} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium text-white">{r.team}</td>
                    <td className="px-4 py-3 text-slate-400">{r.ram}</td>
                    <td className="px-4 py-3 text-slate-400">{r.cpu}</td>
                    <td className="px-4 py-3 text-slate-400">{r.ai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section id="faq" divider>
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
          <div className="mt-12 space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-white/10 px-8 py-16 text-center">
            <AuroraBackdrop />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to own your workspace?</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
              Deploy a self-hosted, AI-native workspace in minutes - or let us host it for you. Your data, your terms.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/buy" size="lg">
                Get OneCamp - {fmtUSD(pricing.lifetime_usd)}
              </ButtonLink>
              <ButtonLink href="/buy?plan=cloud" variant="ghost" size="lg">
                Explore OneCamp Cloud
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
