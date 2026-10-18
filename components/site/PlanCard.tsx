import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

/** A benefit line with a 16px moss check (site.md H9): a mark, not text. */
export function PlanBenefit({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon name="check" className="mt-0.5 text-success" />
      {children}
    </li>
  );
}
