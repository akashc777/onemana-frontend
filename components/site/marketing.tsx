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
  video: "video",
  calendar: "calendar",
  teams: "team",
  lock: "lock",
};

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
    <Reveal delay={(index % 3) * 60}>
      <div className="card-premium feature-module-card group card card-hover relative h-full bg-card/90 backdrop-blur-sm">
        <span className="card-shine" aria-hidden />
        <span className={`feature-halo absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100 ${color.bg}`} aria-hidden />
        <div className={`feature-icon-wrap grid h-10 w-10 place-items-center rounded-lg ${color.bg} ${color.text}`}>
          <FeatureIcon icon={icon} className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
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