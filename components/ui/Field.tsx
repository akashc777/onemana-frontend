import type { ReactNode } from "react";

/** A form field's label: 13/510 in ink, over the field (site.md S10). */
export const FIELD_LABEL = "mb-1.5 block text-caption font-[510] text-foreground";
/** The line under a field. */
export const FIELD_HINT = "mt-1 block text-caption text-muted-foreground";

/**
 * The mark beside a required field's label. The field says it is required
 * itself (required, aria-required), so the mark is for the eye.
 */
export function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-danger-ink">
      *
    </span>
  );
}

/**
 * A labelled field: the label over the control, an optional line under it.
 * The control sits inside the <label>, so a click on the words focuses it.
 * A select draws its own label (components/ui/Select.tsx), because a
 * combobox is named by its label's id, not by an enclosing <label>.
 */
export function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className={FIELD_LABEL}>
        {label} {required && <RequiredMark />}
      </span>
      {children}
      {hint && <span className={FIELD_HINT}>{hint}</span>}
    </label>
  );
}
