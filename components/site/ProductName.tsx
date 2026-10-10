import type { ReactNode } from "react";
import { OneCampLogo } from "@/components/site/BrandMarks";
import { IdentityMark } from "@/components/ui/graphics/IdentityMark";

/**
 * A product's name with its mark, for the comparison tables and lists:
 * OneCamp's logo, or a rival's identity square, a camp hue worked out from
 * its name (lib/campHue hueFor), so a rival is the same colour in every table
 * on every page. The mark is decorative; the name says what it is. Pass the
 * name as children when it is a link, so the mark stays outside the link.
 */
export function ProductName({ name, children, markId }: { name: string; children?: ReactNode; markId?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      {name === "OneCamp" ? (
        <OneCampLogo className="size-4 shrink-0 rounded-[4px]" gradientId={markId ?? "ocLogoGradName"} />
      ) : (
        <IdentityMark id={name} variant="square" size={10} />
      )}
      {children ?? name}
    </span>
  );
}
