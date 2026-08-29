"use client";

import { Reveal } from "@/components/site/Reveal";
import { FeatureIcon } from "@/components/site/FeatureIcons";
import { replaces, stats, type FeatureIconKey } from "@/lib/content";
import { categoryColors } from "@/lib/onecamp-colors";
import { useCountUp } from "@/hooks/useCountUp";

const ICON_TO_CATEGORY: Record<FeatureIconKey, keyof typeof categoryColors> = {
  ai: "ai",
  chat: "channel",
  tasks: "task",
  docs: "doc",
  board: "project",
  video: "video",
  calendar: "calendar",
  teams: "team",
  lock: "lock",
  table: "project",
  agent: "ai",
  automation: "team",
  api: "doc",
  // Governance pair, both mapped to the neutral `lock` set rather than a hue. Everything else on the
  // page uses colour to say WHICH module a card belongs to; these two are not modules, they are the
  // property that holds across all of them, and giving them a module colour would file them as one.
  shield: "lock",
  audit: "lock",
};

/**
 * One column of the enterprise-controls grid.
 *
 * A plain list, deliberately. Procurement reads this section looking for specific words — SAML, SCIM,
 * MFA — and a card with an icon and a paragraph makes them hunt. Nothing here needs persuading; it needs
 * to be findable.
 */
export function ControlGroup({
  label,
  items,
  index = 0,
}: {
  label: string;
  items: readonly string[];
  index?: number;
}) {
  return (
    <Reveal delay={(index % 4) * 60}>
      <div className="card-premium card relative h-full bg-card/90 backdrop-blur-sm">
        <span className="card-shine" aria-hidden />
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</h3>
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <CheckMark />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

/** Small inline tick. aria-hidden because the list semantics already convey membership. */
function CheckMark() {
  return (
    <svg
      className="mt-[0.3rem] h-3.5 w-3.5 shrink-0 text-brand"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      aria-hidden
    >
      <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FeatureCard({
  icon,
  title,
  body,
  index = 0,
}: {
  icon: FeatureIconKey;
  title: string;
  body: string;
  index?: number;
}) {
  const color = categoryColors[ICON_TO_CATEGORY[icon]];
  return (
    <Reveal delay={(index % 2) * 70}>
      {/* NO CARD. This was a bordered, shadowed, backdrop-blurred box carrying a
          shine sweep and a blurred halo on hover: five decorative layers around
          two paragraphs of text. A card should exist when elevation says
          something about hierarchy, and here every item is a peer of every other,
          so the box was saying nothing and adding noise.
          What is left is what a reader needs: an icon to anchor the eye, a title,
          and the text. The hairline rule marks where one item ends and the next
          begins, which is the only job the border was really doing. */}
      <article className="group relative h-full border-t border-border pt-6">
        <div className={`grid h-9 w-9 place-items-center rounded-md ${color.bg} ${color.text}`}>
          <FeatureIcon icon={icon} className="h-[18px] w-[18px]" />
        </div>
        <h3 className="mt-5 text-[0.9375rem] font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </h3>
        <p className="mt-2 max-w-prose text-sm leading-[1.7] text-muted-foreground">{body}</p>
      </article>
    </Reveal>
  );
}

export function StepCard({ n, title, body, index = 0 }: { n: string; title: string; body: string; index?: number }) {
  return (
    <Reveal delay={index * 80}>
      <div className="card-premium group card relative h-full overflow-hidden bg-card/90 backdrop-blur-sm">
        <span className="card-shine" aria-hidden />
        <span
          className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-brand/60 via-brand/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden
        />
        <span className="absolute -right-2 -top-3 select-none text-6xl font-semibold text-border" aria-hidden>
          {n}
        </span>
        <div className="relative">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </div>
    </Reveal>
  );
}

function StatValue({ value, glow }: { value: string; glow?: boolean }) {
  const match = value.match(/^<?(\d+)(.*)$/);
  const num = match ? Number(match[1]) : null;
  const prefix = value.startsWith("<") ? "<" : "";
  const suffix = match?.[2] ?? "";
  const { ref, value: animated } = useCountUp(num ?? 0, { enabled: num !== null });

  if (num === null) {
    return <span className={glow ? "stat-value-glow" : "text-foreground"}>{value}</span>;
  }

  return (
    <span ref={ref} className={glow ? "stat-value-glow" : "text-foreground"}>
      {prefix}
      {animated}
      {suffix}
    </span>
  );
}

export function StatStrip() {
  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal
          key={s.label}
          delay={i * 60}
          className={`text-center ${i > 0 ? "sm:border-l sm:border-border/70" : ""}`}
        >
          <div className="text-2xl font-semibold tracking-tight sm:text-3xl">
            <StatValue value={s.value} glow={i === 0} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
        </Reveal>
      ))}
    </div>
  );
}

export function ReplacesMarquee() {
  const items = [...replaces, ...replaces];
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/50 px-2 py-3 backdrop-blur-sm [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <ul className="flex w-max animate-marquee items-center gap-8 py-1" aria-label={`Replaces ${replaces.join(", ")}`}>
        {items.map((name, i) => (
          <li
            key={`${name}-${i}`}
            className="flex items-center gap-8 text-sm font-medium text-muted-foreground"
            aria-hidden={i >= replaces.length}
          >
            <span>{name}</span>
            <span className="marquee-dot" aria-hidden />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="faq-item card-premium group card card-hover">
      <span className="card-shine" aria-hidden />
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-foreground">
        {q}
        <span className="faq-chevron grid h-6 w-6 flex-shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition duration-300 group-open:border-brand/30 group-open:bg-brand/5 group-open:text-brand">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 1.5V10.5M1.5 6H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </summary>
      <div className="faq-panel">
        <p className="border-t border-border/60 pt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
      </div>
    </details>
  );
}