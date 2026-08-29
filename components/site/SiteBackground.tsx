/**
 * Site-wide atmosphere: Cloudflare-style line grid + soft orange beam.
 */
export function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="cf-orange-beam absolute inset-0" />
      <div
        className="cf-line-grid absolute inset-0 opacity-[0.45] dark:opacity-[0.22] [mask-image:radial-gradient(ellipse_90%_70%_at_50%_0%,black,transparent_75%)]"
      />
      <div
        className="absolute inset-x-0 top-0 h-px bg-border/80"
        style={{
          background: "linear-gradient(90deg, transparent 5%, rgb(var(--border)), transparent 95%)",
        }}
      />
    </div>
  );
}

export function HeroBeam() {
  return null;
}