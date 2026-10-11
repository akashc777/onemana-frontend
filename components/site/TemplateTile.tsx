import { Icon, type IconName } from "@/components/ui/icons";
import { hueFor } from "@/lib/campHue";

/**
 * A template's project tile (DESIGN_V3 §3.5, site.md T1 and T2): the hue's
 * avatar gradient under a white glyph, the way a project shows in the app,
 * its hue from the template's id as the app picks it. Each template has a
 * glyph of its own: every tile used to hold the same three lines, so seven
 * cards in a row said nothing about which was which.
 */
const GLYPH: Record<string, IconName> = {
  "client-project": "briefcase",
  "product-launch": "megaphone",
  "website-redesign": "browser",
  "feature-build": "code",
  event: "ticket",
  "new-hire-onboarding": "user-plus",
  "security-audit-prep": "shield",
};

export function templateGlyph(id: string): IconName {
  return GLYPH[id] ?? "task";
}

const SIZES = {
  md: { box: "size-10 rounded-ctl", icon: 20 },
  lg: { box: "size-12 rounded-xl", icon: 24 },
} as const;

export function TemplateTile({ id, size = "md" }: { id: string; size?: keyof typeof SIZES }) {
  const hue = hueFor(id);
  const s = SIZES[size];
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center text-white shadow-mark ${s.box}`}
      style={{ backgroundImage: `linear-gradient(140deg, rgb(var(--camp-${hue}-a1)), rgb(var(--camp-${hue}-a2)))` }}
    >
      <Icon name={templateGlyph(id)} size={s.icon} />
    </span>
  );
}
