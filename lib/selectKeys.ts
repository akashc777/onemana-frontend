/**
 * The keyboard of the site's one select (components/ui/Select.tsx), as a pure
 * function so it can be held by tests without a browser.
 *
 * It is the WAI-ARIA select-only combobox (the APG pattern a native <select>
 * follows): focus stays on the combobox, the option under the keys is its
 * aria-activedescendant, and the chosen option is the one marked selected.
 *
 * Closed: ↓, ↑, Alt+↓, Enter and Space open the list on the chosen option;
 * Home and End open it on the first and last; a letter opens it on the first
 * option that starts with what was typed.
 *
 * Open: ↑ and ↓ move, Home and End jump, Page Up and Page Down move ten;
 * Enter, Space and Alt+↑ choose the option and close; Escape closes and keeps
 * the value; Tab chooses the option, closes, and lets focus move on, as a
 * native select does. Typing finds an option by its first letters; the same
 * letter again cycles through the options that start with it.
 */

export interface SelectState {
  open: boolean
  /** The option under the keys (aria-activedescendant), while open. */
  active: number
  /** What has been typed, and when, for type-ahead. */
  typed: string
  typedAt: number
}

export interface SelectKeyEvent {
  key: string
  altKey?: boolean
  /** Milliseconds, for type-ahead's pause; Date.now() in the component. */
  now: number
}

export interface SelectKeyResult {
  state: SelectState
  /** The option to choose, when the key chose one. */
  commit?: number
  /** The key did something here, so its default is prevented. Tab never is. */
  handled: boolean
}

/** How long a pause starts a new type-ahead search. */
export const TYPEAHEAD_MS = 500
/** How far Page Up and Page Down move. */
export const PAGE = 10

export const closedState = (): SelectState => ({ open: false, active: -1, typed: "", typedAt: 0 })

/** The id of an option, from the listbox's id: the combobox points at it while it is active. */
export const optionId = (listId: string, index: number) => `${listId}-o${index}`

/**
 * The option a search lands on: the first, from just after `from`, whose
 * label starts with `typed`. Typing one letter again and again ("ccc") cycles
 * through the options that start with it, as a native select does.
 */
export function typeaheadIndex(labels: readonly string[], typed: string, from: number): number {
  const n = labels.length
  if (!n || !typed) return -1
  const t = typed.toLocaleLowerCase()
  const same = [...t].every((c) => c === t[0])
  const needle = same ? t[0]! : t
  // A new search (one letter) starts after the current option; a longer one
  // may still match the current option, so it starts there.
  const start = same && t.length >= 1 ? from + 1 : Math.max(from, 0)
  for (let i = 0; i < n; i++) {
    const at = (start + i + n) % n
    if (labels[at]!.toLocaleLowerCase().startsWith(needle)) return at
  }
  return -1
}

/** What a key does to the select, given its state, its options' labels and the chosen option (-1 for none). */
export function selectKey(state: SelectState, ev: SelectKeyEvent, labels: readonly string[], chosen: number): SelectKeyResult {
  const n = labels.length
  const last = n - 1
  const at = (i: number) => Math.min(Math.max(i, 0), last)
  const open = (active: number): SelectKeyResult => ({ state: { open: true, active: at(active), typed: "", typedAt: 0 }, handled: true })
  const close = (commit?: number, handled = true): SelectKeyResult => ({ state: closedState(), ...(commit !== undefined && commit >= 0 ? { commit } : {}), handled })
  const printable = ev.key.length === 1 && ev.key !== " "
  const typing = state.typed !== "" && ev.now - state.typedAt < TYPEAHEAD_MS

  const typeahead = (from: number): SelectKeyResult => {
    const typed = (typing ? state.typed : "") + ev.key
    const hit = typeaheadIndex(labels, typed, from)
    return { state: { open: true, active: hit >= 0 ? hit : at(from), typed, typedAt: ev.now }, handled: true }
  }

  if (!n) return { state, handled: false }

  if (!state.open) {
    switch (ev.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Enter":
      case " ":
        return open(chosen >= 0 ? chosen : 0)
      case "Home":
        return open(0)
      case "End":
        return open(last)
      default:
        return printable ? typeahead(chosen) : { state, handled: false }
    }
  }

  switch (ev.key) {
    case "ArrowDown":
      return { state: { ...state, active: at(state.active + 1) }, handled: true }
    case "ArrowUp":
      return ev.altKey ? close(state.active) : { state: { ...state, active: at(state.active - 1) }, handled: true }
    case "Home":
      return { state: { ...state, active: 0 }, handled: true }
    case "End":
      return { state: { ...state, active: last }, handled: true }
    case "PageDown":
      return { state: { ...state, active: at(state.active + PAGE) }, handled: true }
    case "PageUp":
      return { state: { ...state, active: at(state.active - PAGE) }, handled: true }
    case "Enter":
      return close(state.active)
    case " ":
      // A space inside a search ("United K") is part of the search.
      return typing ? typeahead(state.active) : close(state.active)
    case "Escape":
      return close()
    case "Tab":
      // Chooses and closes, and focus moves on: the default is kept.
      return close(state.active, false)
    default:
      return printable ? typeahead(state.active) : { state, handled: false }
  }
}
