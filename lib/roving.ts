/**
 * The keys of a group that is one Tab stop (INTERACTION_SPEC.md §7.3): a
 * tablist, a radiogroup, a segmented control. The arrows move to the next or
 * the previous item and wrap round, Home and End jump to the ends; the item
 * reached is chosen and takes focus (a roving tabindex: only the chosen one
 * has tabIndex 0). Every segmented control on the site moves by this one
 * rule, so a reader who learns one has learnt them all.
 *
 * Returns the index to move to, or null when the key is not the group's.
 */
export function rovingIndex(key: string, at: number, count: number): number | null {
  if (count <= 0) return null
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (at + 1) % count
    case "ArrowLeft":
    case "ArrowUp":
      return (at - 1 + count) % count
    case "Home":
      return 0
    case "End":
      return count - 1
    default:
      return null
  }
}
