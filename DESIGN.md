# The OneCamp design system

One system across three codebases: the product (`onecamp-fe`), the customer build
(`onecamp-fe-public`), and the storefront (`onemana-frontend`). A visitor who
buys on the storefront and lands in the product should not be able to tell they
changed companies.

These are rules, not suggestions. Where a rule exists, following it is not a
matter of taste, and departing from it should be a deliberate act with a reason
written next to it.

The system was redrawn on 10 October 2026 (cool graphite, signal orange, Inter
Tight). The storefront carries it now; the app follows by swapping its tokens to
the values below, which both repos' `sharedTokens.test.ts` pin (here the table
lives in `lib/palette.ts`).

## What calm means here

The words were never the problem. What read as "AI slop" was the shape: eleven
sections built from one template (orange mono eyebrow, centred headline, grey
subtitle, block), two product mockups in one hero, a line grid with an orange
beam, corner brackets, a kinetic underline, scroll reveals and four calls to
action at once. Calm comes from the opposite:

- **Light display weights.** 600 at most, never 700.
- **One real product image** where a mockup would go. Show the product, do not draw it.
- **Few sections**, and each one a different shape.
- **Left-aligned.** Nothing is centred except a page's final call to action.
- **One accent, spent sparingly.**

## Colour

**One accent. Everything else is a cool, nearly achromatic neutral.**

Light:

| Token | Hex | Use |
|---|---|---|
| `background` | `#FCFCFD` | page |
| `card` | `#FFFFFF` | main panel, cards, inputs |
| `muted` | `#F5F6F7` | sidebar, table header, hover |
| `accent` | `#EDEEF0` | pressed, selected row |
| `border` | `#E4E5E8` | hairlines (structure only) |
| `border-strong` | `#D3D5DA` | input and outline-button borders |
| `foreground` | `#14161A` | primary text (17.7:1) |
| `muted-foreground` | `#5F6470` | secondary text (5.8:1) |
| `faint` | `#8A8F99` | placeholders and disabled only |
| `brand` | `#CC4A0B` | the accent fill, with white text (4.6:1) |
| `brand-ink` | `#C2410C` | links and accent text (5.05:1) |
| `brand-soft` | `#FFF1E8` | selected background |
| `agent` / `agent-muted` | `#4F5BD5` on `#EEF0FD` | agent tag only |
| `success` `warning` `danger` `info` | `#1F8A4C` `#B26B00` `#D1293D` `#2F6FDB` | meaning, never decoration |

Dark:

| Token | Hex |
|---|---|
| `background` | `#0E0F11` |
| `card` | `#16181C` |
| `muted` | `#1D2025` |
| `accent` | `#25282E` |
| `border` / `border-strong` | `#26282D` / `#33363D` |
| `foreground` | `#EDEEF0` (16.5:1) |
| `muted-foreground` | `#9BA0AA` (7.3:1) |
| `faint` | `#6B707A` |
| `brand` | `#FF7A33`, with `#0E0F11` text (`brand-foreground`) |
| `brand-ink` | `#FF8A4C` |
| `brand-soft` | `#2A1A10` |
| `agent` / `agent-muted` | `#A3ABF5` on `#1E2140` |
| `success` `warning` `danger` `info` | `#4CC38A` `#F0B44C` `#F2555A` `#6EA4F5` |

**Orange on graphite, not orange on cream.** The previous warm off-white with a
terracotta accent was the most common palette of 2025's template sites, and it
did not match the logo (`#FF8A00 → #FF3D00`). The cool ground makes the orange
read as a signal, so less of it is needed.

**The dark accent is lifted, not reused**, and takes dark text: white on
`#FF7A33` fails AA. Text on a brand fill is always `text-brand-foreground`,
never `text-white`.

**The accent budget.** The accent goes on: one primary button per view, the
focus ring, the current-selection marker, links and the logo. It never goes on
headings, eyebrows, icons, check marks, mention chips or progress bars; those
are neutral. A mention is a neutral chip at weight 500.

**Every pair is measured, not eyeballed.** `paletteContrast.test.ts` checks every
pair a person reads, in both themes. Hairlines are structure and are exempt;
`faint` is for placeholders and is exempt; nothing else is.

**Colour that carries meaning comes from a token**: `success`, `warning`,
`danger`, `info`. Never a raw Tailwind hue.

## Type

| Role | Face | Weights |
|---|---|---|
| Display | **Inter Tight** | 500, 600 |
| Text | **Inter** (`cv11`, `ss01`) | 400, 500, 600 |
| Mono | **JetBrains Mono** | 400, 500: keys, IDs, audit timestamps, code. Never eyebrows. |

Headings take the display face by default (`h1, h2, h3` in `globals.css`), at 600.
Bricolage Grotesque is retired: its quirky terminals were the tell of a
template-built site.

**Marketing scale** (`text-display` to `text-caption` in `tailwind.config.ts`):

| Step | Size / line height | Tracking |
|---|---|---|
| Display | 64 / 68 | −0.028em, weight 600 |
| H1 | 48 / 52 | −0.024em |
| H2 | 32 / 38 | −0.016em |
| H3 | 20 / 28 | −0.01em |
| Body-lg | 18 / 28 | |
| Body | 16 / 26 | |
| Small | 14 / 20 | |
| Caption | 13 / 18 | |

Inter Tight is already set tight, so the direction's −0.035em on top of it made
letters touch at 64 px; the tracking above is that, eased off until they do not.

**App scale:**

| Size / line height | Weight | Use |
|---|---|---|
| 24 / 32 | Inter Tight 600 | Page title |
| 17 / 24 | 600 | Section |
| **15 / 22** | 400 | **Message body and doc body** |
| **14 / 20** | 400 / 500 | **Default UI**: lists, nav, table cells |
| 13 / 18 | | Secondary and meta |
| 12 / 16 | | Timestamps and badges |
| 11 / 14 | | The floor: counts only |

The default is 14, not 12. Twelve-pixel text everywhere is what makes a dense UI
feel busy. Use the scale: an arbitrary `text-[13px]` is a size nobody chose.

## Space, radius, borders

- **Spacing** is a 4-pt scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
  - Marketing: sections 96 desktop and 64 phone; content at most 1120 px; 16 px gutters on a phone.
  - App: rows 32 (dense list) / 36 (table) / 40 (nav item); panel padding 24; page gutter 32.
- **Radius**, four steps only:
  - `rounded-sm` 4: chips, kbd, checkboxes.
  - `rounded-md` 6: buttons, inputs, nav items.
  - `rounded-lg` (and `xl`) 10: cards, popovers, menus, panels.
  - `rounded-2xl` 14: dialogs and sheets.
  - `rounded-full` is for avatars and status dots. Status and priority are dot plus text, not pills.
- **Borders, not shadows.** Structure is a 1 px `border` hairline, or simply space.
  Shadows exist only for things that float, one token per layer: `shadow-popover`
  (`0 4px 16px rgb(0 0 0 / .08)`) and `shadow-dialog` (`0 16px 48px rgb(0 0 0 / .16)`).
  No shadow on cards, inputs or buttons; `shadow-sm` is defined as none.

## Layout

**Quiet chrome.** Hierarchy comes from type weight and spacing, not from boxes.

**Do not use a grid of identical cards with an icon chip on each.** This is the
most recognisable shape on the AI-built web. Ask what the content actually is:

| The content is | The form is |
|---|---|
| Claims, each with a mechanism behind it | A numbered specification (`GuaranteeList`) |
| An enumeration answering "does it have X" | A scannable index (`ModuleIndex`) |
| A list somebody checks off | A checklist with the group in the margin (`ControlIndex`) |
| A specification, a requirement, a fact | A definition list: the term in the margin, the detail beside it (`SpecList`) |
| Evidence for a claim | The artefact itself. Show the record, or a real screenshot. |

**Alternate shapes.** A left-aligned heading over full-width content, then a
two-column section with the heading on the left and the content on the right.
Never two sections in a row with the same shape.

**Eyebrows are rare and grey**: sentence case, `muted-foreground`, at most two
on a page. An orange uppercase mono eyebrow above every section is the template.

**Icons carry information or are absent.** Lucide-style, 1.5 px stroke, 16 px in
UI and 18 in the nav, in `muted-foreground`. Never an icon inside a tinted chip.

## Calls to action

| Rank | Look | Example |
|---|---|---|
| Primary | Filled accent, one per view | **Try the live demo** (no sign-up, 2 minutes) |
| Secondary | Outline | **Install free** (up to 25 people) |
| Tertiary | Text link | **Buy a licence**, with the rupee price |
| Nav | A text link, then one outline button | "Live demo", then **Install free** |

The nav never sends a cold visitor to checkout. Prices are rupees: the rupee
amount is the price, and a dollar figure is an estimate beside it, worked out
from the day's rate and never typed. Nothing promises a trial or a refund; the
demo and the free plan are how somebody tries it.

## Motion

- 120 ms for hover and press, 160 ms for popovers (opacity plus 4 px), 220 ms for side panels.
- Easing `cubic-bezier(.2,.8,.2,1)` (the default in `tailwind.config.ts`).
- **No reveal on scroll**: it hides the page from full-page captures, link
  previews and fast readers. **No infinite loops**: bob, float, shimmer, beam,
  marquee. **No scale-in on dialogs**: fade only.
- **Every animation is in the `prefers-reduced-motion` block**, which
  `reducedMotion.test.ts` checks.
- **Transition named properties, never `all`** (`noTransitionAll.test.ts`).

Motion confirms a state change. It never decorates.

## Focus and access

- One focus ring for everything: 2 px of `ring` (the accent), offset 2, from
  `:focus-visible` in `globals.css`. Do not remove it per component.
- Contrast AA for every pair a person reads (`paletteContrast.test.ts`).
- Every page works at 360 px with no horizontal scroll. Wide tables scroll inside
  their own box, never the page.

## Copy

Words are design material. Name things as a person recognises them. Say what a
control does, then confirm it happened. Errors explain what went wrong and how to
fix it.

**Say what is not true, too.** The documents in this project name their own gaps,
and that is why they are believed. A compliance claim that overstates itself is
worth less than none, and the same is true of a marketing page: acknowledging the
operational cost of self-hosting is what makes the rest of the argument credible.

**No emoji as decoration.** No em dashes as punctuation (`visibleCopy.test.ts`).
