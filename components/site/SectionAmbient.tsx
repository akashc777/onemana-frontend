type AmbientVariant = "tour" | "features" | "product" | "pricing";

const VARIANTS: Record<AmbientVariant, string> = {
  tour: "ambient-tour",
  features: "ambient-features",
  product: "ambient-product",
  pricing: "ambient-pricing",
};

/** Per-section CF grid patch - localized structure, not floating orbs. */
export function SectionAmbient({ variant }: { variant: AmbientVariant }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${VARIANTS[variant]}`}>
      <div className="cf-section-grid absolute inset-0" />
    </div>
  );
}