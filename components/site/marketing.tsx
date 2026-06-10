import { Reveal } from "@/components/site/Reveal";
import { replaces, stats } from "@/lib/content";

/** Single feature tile. */
export function FeatureCard({
  icon,
  title,
  body,
  index = 0,
}: {
  icon: string;
  title: string;
  body: string;
  index?: number;
}) {
  return (
    <Reveal delay={(index % 3) * 70}>
      <div className="card card-hover group h-full">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand/30 to-accent-cyan/20 text-2xl transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
        <h3 className="mt-4 font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
      </div>
    </Reveal>
  );
}

/** Numbered step tile. */
export function StepCard({ n, title, body, index = 0 }: { n: string; title: string; body: string; index?: number }) {
  return (
    <Reveal delay={index * 90}>
      <div className="card h-full text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand/15 text-lg font-bold text-brand-light">
          {n}
        </div>
        <h3 className="mt-4 font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
      </div>
    </Reveal>
  );
}

/** Headline metrics strip. */
export function StatStrip() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 70}>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient sm:text-4xl">{s.value}</div>
            <div className="mt-1 text-xs text-slate-400 sm:text-sm">{s.label}</div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** Infinite, accessible "replaces these tools" marquee. */
export function ReplacesMarquee() {
  const items = [...replaces, ...replaces];
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <ul className="flex w-max animate-marquee items-center gap-10 py-2" aria-label={`Replaces ${replaces.join(", ")}`}>
        {items.map((name, i) => (
          <li key={`${name}-${i}`} className="text-lg font-semibold text-slate-500 transition-colors hover:text-slate-300" aria-hidden={i >= replaces.length}>
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Accessible FAQ accordion item (native details/summary). */
export function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group card transition-colors hover:border-white/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-white">
        {q}
        <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full border border-white/10 text-slate-400 transition group-open:rotate-45 group-open:border-brand/40 group-open:text-brand-light">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M6 1.5V10.5M1.5 6H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{a}</p>
    </details>
  );
}
