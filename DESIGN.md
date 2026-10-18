# The OneCamp design system

One system across three codebases: the product (`onecamp-fe`), the customer build
(`onecamp-fe-public`), and the storefront (`onemana-frontend`). A visitor who
buys on the storefront and lands in the product should not be able to tell they
changed companies.

These are rules, not suggestions. Where a rule exists, following it is not a
matter of taste, and departing from it should be a deliberate act with a reason
written next to it.

Every value the site draws with lives in one table, `lib/appSystem.ts`, copied
from the app with the file each comes from; `lib/tailwindAppSystem.ts` builds
the site from it, and `sharedTokens.test.ts`, `appSystem.test.tsx` and
`paletteContrast.test.ts` hold the site to it. The areas' colours live in
`lib/areas.ts`, which the app keeps a copy of.

How it got here:

- **10 October 2026, calm.** Cool graphite, one signal orange, light display
  weights. It took the template out, and with it most of the character.
- **11 October 2026, v3, premium** (`design/DESIGN_V3.md`). Inter Display, an
  elevation ladder, saturated avatars, the product drawn by its own
  components at 1:1.
- **18 October 2026, v3.1, a calm frame with coloured areas.** The owner asked
  for the site to be modern, colourful, playful, clean and premium. The frame
  stays calm; colour comes back, and it means something: each part of the
  product has its own hue.

## The direction: a calm frame, coloured areas

- **The frame is calm.** A neutral sheet, one action colour, light display
  weights, few sections and each a different shape, left-aligned. Nothing is
  centred except a page's final call to action.
- **Colour names an area.** Chat is sky wherever chat appears, docs are dusk,
  and so on (below). A hue seen twice is learned, so the page can be colourful
  without being noisy. Anything that is not an area is neutral ink.
- **Premium is depth and detail.** Surfaces sit on a ladder of tiny
  elevations, type follows Inter's own metrics, numbers are tabular, hairlines
  are alpha.
- **Playful is the product answering.** Live pieces of the product react to
  the pointer with one small change of state. Nothing moves on its own, and
  celebration comes only on intent.

What read as "AI slop" before the calm pass was a shape, and it stays banned:
eleven sections from one template (an orange mono eyebrow, a centred headline, a
grey subtitle, a block), two mockups in one hero, a line grid with a beam,
corner brackets, a kinetic underline, scroll reveals that hide content, and
four calls to action at once.

## Colour

### The frame

The page is the sheet: white in light, `#0B0C0E` in dark. Values are design v3's
(`lib/appSystem.ts` SHARED), measured, not eyeballed:

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | `#FFFFFF` | `#0B0C0E` | the page |
| `card` | `#FFFFFF` | `#1B1C1F` | cards, inputs, raised surfaces |
| `pop` | `#FFFFFF` | `#1F2024` | menus, popovers, floating chips |
| `muted` | `#F8F9FA` | `#0F1012` | sunken grounds, table headers |
| `foreground` | `#16171B` | `#EEEEF0` | primary text |
| `muted-foreground` | `#5B5D65` | `#A8ABB1` | secondary text |
| `faint` | `#8A8C92` | `#72747B` | placeholders, disabled, and soft text at display size (3:1 is large text's floor) |
| `line`, `line-2`, `line-3` | ink at 7.5, 12, 18 % | white at 6.5, 10, 16 % | hairlines, rings, dashed orbits |
| `brand` | `#CC4A0B` | `#FF7A33` (with `#0B0C0E` text) | the action colour |
| `brand-ink` | `#C2410C` | `#FF8A4C` | links and accent text |
| `agent` | `#5B63D6` | `#9AA2F6` | agents, and only agents |
| `success` `warning` `danger` `info` | | | meaning, never decoration; text uses the `-ink` cuts |

**Alpha over hex for structure.** Hairlines, hover and selection are ink at a low
alpha, so one token reads on the page, a card and a menu.

**The dark accent is lifted, not reused**, and takes dark text: white on
`#FF7A33` fails AA. Text on a brand fill is always `text-brand-foreground`.

### The action colour

Orange is spent on what you press: the one primary button per view, links, the
focus ring, the current page's mark and the logo. It never goes on headings,
eyebrow text, icons, area marks, check marks or progress, and it is never
anybody's identity.

### Areas

| Area | Hue | What belongs to it |
|---|---|---|
| Chat | sky | channels, direct messages, threads, guests, polls, check-ins, the Slack bridge |
| Calls | berry | calls, huddles, voice, video and screen clips, recordings |
| Docs | dusk | docs, the page tree, comments, versions, imports |
| Projects | moss | tasks, boards, lists, timelines, cycles, goals, reports, forms, time |
| Calendar | sun | events, booking pages, focus time, Google Calendar |
| Tables | lake | tables, formulas, linked rows and rollups |
| Agents | the agent's indigo | agents, OneCamp AI's answers, the record of what they did |

The table is `lib/areas.ts`; `lib/areas.test.tsx` pins it, and holds every mark
of an area on the site to it. A new feature takes the hue of the area it lives
in.

Where an area's hue goes, the same way everywhere:

- **A tile:** the glyph in the hue's strong cut on its tint (`AreaTile`).
- **A stage:** the hue's tint with a radial of its strong cut, behind a live
  piece of the product (the tour, the box's panels).
- **A dot or a tab:** beside the area's name.
- **Interaction:** hover and selected tint in the hue, through `data-hue` on the
  interaction layer.

What is not an area wears neutral ink: installing, updating, backups, sign-in,
security, the law. Neutral tiles take `hue="ink"`.

Plans are not areas: their dots, the "Most teams start here" pill and the
raised column of a comparison are neutral (`RAISED_TINT`, the press step).

One other use of the camp hues has a name of its own, and stays:

- **Rivals in a comparison:** a categorical series in the chart order (sky,
  berry, sun, lake, dusk, moss; `components/site/productHues.ts`), so that
  neighbours never match.

Never hand out hues by position in a list: twelve rows in twelve colours name
nothing.

**People** keep their identity hue (`lib/campHue.ts`, the same hash as the app)
as a saturated two-stop avatar with white initials. **Agents** are an indigo
square with the spark, never a circle and never dusk.

**Every pair is measured.** `paletteContrast.test.ts` checks every pair a person
reads, in both themes, `bandContrast.test.ts` every tint a band can take.

## Type

| Role | Face | Weights |
|---|---|---|
| Display | **Inter Display**: Inter at its opsz 32 cut | 600 from 28 px, 590 below |
| Text | **Inter** (`cv11`, `ss01`, `ss03`), optical sizing on | 400, 510, 590 |
| Mono | **JetBrains Mono** | 400, 500: keys, IDs, hashes, timestamps, code. Never eyebrows. |

Inter Tight is retired: its built-in tightening plus our tracking crushed the
hero. Tracking follows Inter's own metrics for each size: −0.0223 + 0.185 ×
e^(−0.1745 × px) em (`tracking()` in `lib/appSystem.ts`).

**Marketing scale** (`APP.marketing`; desktop, tablet and phone):

| Step | Size / line height | Use |
|---|---|---|
| `hero` | 68/70, 56/60, 42/46 | the home page's headline, two-tone |
| `page` | 52/56, 44/48, 34/40 | an inner page's headline |
| `close` | 56/60, 48/52, 36/40 | the final call to action |
| `h2` | 44/50, 38/44, 32/38 | a section |
| `title-read` | 40/46, 36/42, 30/36 | a doc's, a post's and a policy's title |
| `h3` | 24/30, 22/28, 20/26 | a card or a group |
| `lead` | 20/30, 19/29, 18/28 | the line under a headline |
| `body` | 16/26 | text |
| `small` | 14/20 | secondary text |
| `eyebrow` | 13/16, 510 | rare, grey, after a 7 px dot |
| `price` | 44/48, tabular | a plan's price |

Every heading takes a step from this table; `typeScale.test.ts` refuses an
arbitrary size on a heading. A heading set at a text size is drawn in Inter at
590 by one rule in `globals.css`. Headings balance, paragraphs avoid a lone
last word, numbers that line up are tabular.

The app's own scale (14 px default UI, 15/23 message and doc body) is in
`APP.roles`, and the product scenes draw with it.

## Space, radius, depth

- **Spacing** is a 4-pt scale. A marketing section's content starts 64 px below
  its top on a phone and 96 on a wide screen, and ends 80 and 112 above its
  bottom (`Section`, `sectionRhythm.test.ts`). Content at most 1120 px; 16 px
  gutters on a phone; two-column parts sit on the 12-column grid with 32 px
  gutters.
- **Radius**, from `APP.radius`: 4 for kbd and checkboxes, 6 for chips, 8 for
  buttons, inputs and rows, 10 for an xl button and a segmented track, 12 for
  cards, menus and popovers, 16 for dialogs, pricing cards and the box's
  panels, 20 for the tour's stage, 24 for the hero's canvas. Inner radius is
  outer radius minus the padding between them.
- **Depth, not boxes.** Every surface sits on one step of the ladder
  (`ELEVATION`): `e1` at rest (cards, inputs, secondary buttons), `e2` raised
  (a hovered card, a piece of product on a stage), `e3` floating (menus,
  popovers, floating chips), `e4` modal (dialogs, the hero's window). Each step
  is a ring plus drops, with a top highlight in dark, so no surface needs a
  border as well. The primary button carries an inner highlight and a
  brand-tinted drop.
- **One blur:** the nav once the page has moved, with a solid fallback for
  reduced transparency.

## Layout

**Quiet chrome.** Hierarchy comes from type weight and spacing.

**Do not use a grid of identical cards with an icon chip on each.** Ask what the
content is:

| The content is | The form is |
|---|---|
| Claims, each with a mechanism behind it | A numbered specification (`GuaranteeList`) |
| An enumeration answering "does it have X" | The product itself, by area (the box's panels), or a scannable index |
| A list somebody checks off | A checklist with the group in the margin |
| A specification, a requirement, a fact | A definition list: the term in the margin, the detail beside it (`RunSpec`, the `/for` pages) |
| Evidence for a claim | The artefact itself: rows of the real record, or a live piece of the product |

**Alternate shapes.** Never two sections in a row with the same shape. At most
one tinted band and one night section a page.

**Eyebrows are rare and grey**: sentence case, `muted-foreground`, at most two on
a page.

**Icons carry information or are absent.** One set, one rendered 1.25 px stroke at
every size (`iconStroke.test.ts`). In ink-2, or in a tile's strong cut on its
tint.

## What makes it ours

- **The product, drawn by itself.** Where a page shows OneCamp it shows the
  app's own components with the live demo's data (`components/site/showcase`,
  the box's moments), at 1:1, never a screenshot and never a schematic, held to
  the app's tokens by `showcase.test.tsx`.
- **The record.** Where a page argues that agents are on the record, it shows
  rows of the real record (`RecordRows`, from `public/sample-record.json`, the
  file /verify checks). Mono is for that data only.
- **The camp.** The ring motif, the campfire glow behind the hero's window, the
  footer's flag in the areas' colours.

## Calls to action

| Rank | Look | Example |
|---|---|---|
| Primary | Filled accent, one per view | **Try the live demo** (no sign-up) |
| Secondary | Raised, outline | **Install free** (up to 25 people) |
| Tertiary | Text link | **Buy a licence**, with the rupee price |
| Nav | A text link, then one secondary button | "Live demo", then **Install free** |

The nav never sends a cold visitor to checkout. Prices are rupees: the rupee
amount is the price, and a figure in the reader's currency is an estimate beside
it, worked out from the day's rate and never typed. Nothing promises a trial or a
refund; the demo and the free plan are how somebody tries it.

## Motion and interaction

- **The interaction layer** (`INTERACTION` in `lib/appSystem.ts`, the app's
  `--ix-*` tokens): colour changes in 120 ms, a press in 90, a lift in 160, a
  popover in 180, a panel in 240, all on one curve. Hover is a tint of the
  accent or the object's hue, a press scales to .98 (.96 under a finger),
  selected adds a cue that is not colour, focus is a 2 px accent ring 2 px off.
  Nothing shifts layout on hover or select.
- **Transform and opacity only.** Transition named properties, never `all`
  (`noTransitionAll.test.ts`).
- **Nothing moves on its own** but the hero's one story while it is on screen.
  No infinite loops, no reveal that hides content from a capture or a fast
  reader, no scale-in on dialogs.
- **Reduced motion** stills everything (`reducedMotion.test.ts`); hover
  transforms sit behind `motion-safe:`.

Motion confirms a state change. It never decorates.

## Focus and access

- One focus ring for everything, drawn as an outline so forced-colours mode
  keeps it. Do not remove it per component.
- Contrast AA for every pair a person reads.
- Every page works at 360 px with no horizontal scroll. Wide tables scroll
  inside their own box; a row of panels may snap sideways inside its own box.
- On a phone everything a finger presses is a 44 px target.

## Copy

Words are design material. Name things as a person recognises them. Say what a
control does, then confirm it happened. Errors explain what went wrong and how to
fix it. British spelling, sentence case.

**Say what is not true, too.** The documents in this project name their own gaps,
and that is why they are believed. A marketing page that overstates itself is
worth less than none; acknowledging the operational cost of self-hosting is what
makes the rest of the argument credible. No page claims a regulation is met.

**No emoji as decoration.** No em dashes as punctuation (`visibleCopy.test.ts`).
