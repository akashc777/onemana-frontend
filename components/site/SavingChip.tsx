/**
 * How many times less OneCamp's first year is than the per-seat stack's
 * (lib/teamCost multiple), as the moss chip the calculator and the home
 * comparison share. Nothing below twice: a small gap is said in words.
 * A line of its own in running text; an item like any other in a flex row.
 * No client code of its own: it renders on the server on the home page and
 * adds only its markup to the calculator.
 */
export function SavingChip({ multiple, className = "" }: { multiple: number; className?: string }) {
  if (!(multiple >= 2)) return null;
  return (
    <span className={`hue-moss flex h-7 w-fit items-center rounded-full bg-hue-tint px-3 text-caption font-[590] text-hue-ink ${className}`}>
      {Math.round(multiple)}× less in the first year
    </span>
  );
}
