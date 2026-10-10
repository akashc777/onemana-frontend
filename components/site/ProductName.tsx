import type { ReactNode } from "react";
import { OneCampLogo } from "@/components/site/BrandMarks";
import { productHue } from "@/components/site/productHues";
import { IdentityMark } from "@/components/ui/graphics/IdentityMark";

/**
 * A product's name with its mark, for the comparison tables and lists:
 * OneCamp's logo, or a rival's identity square in its product hue
 * (productHues.ts), so a rival is the same colour in every table on every
 * page and neighbours in a list differ. The mark is decorative; the name says
 * what it is. Pass the name as children when it is a link, so the mark stays
 * outside the link.
 */
export function ProductName({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      {name === "OneCamp" ? (
        <OneCampLogo className="size-4 shrink-0" />
      ) : (
        <IdentityMark id={name} hue={productHue(name)} variant="square" size={10} />
      )}
      {children ?? name}
    </span>
  );
}
