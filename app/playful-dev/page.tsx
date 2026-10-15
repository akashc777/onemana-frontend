import type { Metadata } from "next"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"

import { HeroScene } from "@/components/site/showcase/HeroScene"
import { ShowcaseGallery } from "@/components/site/showcase/Gallery"
import {
  Arc,
  HUE_CLASS,
  HeroOrbit,
  IdentityMark,
  Orbit,
  ProgressRing,
  Rings,
  SPOTS,
  Spark,
  Tile,
  cx,
} from "@/components/ui/graphics"
import { CAMP_HUES, hueFor } from "@/lib/campHue"
import { CAMP } from "@/lib/palette"
import { ix } from "@/lib/interactive"

export const metadata: Metadata = {
  title: "Playful layer",
  robots: { index: false, follow: false },
}

const CAST = ["Sam Rivera", "Maya Chen", "Jonas Weber", "Lena Fischer", "Kofi Mensah", "Priya Shah"]
const CHANNELS = ["#engineering", "#general", "#acme", "#design"]
const TAGS = ["Design", "Shipped", "Launch", "Research", "Client", "Ops"]

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-h3">{title}</h2>
        <p className="max-w-prose text-small text-muted-foreground">{note}</p>
      </div>
      {children}
    </section>
  )
}

function Caption({ children }: { children: ReactNode }) {
  return <p className="text-caption text-muted-foreground">{children}</p>
}

/**
 * /playful-dev: the playful layer on the storefront, for the people building
 * the site to see and screenshot in light and dark: the hero's orbit round
 * the real product shot, the camp palette, identity marks, the ring motif, the
 * spot illustrations and motion. Linked from nowhere.
 *
 * It never ships: a production build answers 404, so it exists only under
 * next dev. It is kept out of the sitemap (app/sitemap.test.ts) and asks
 * search engines to stay away; playfulGuard.test.ts holds all three.
 */
export default function PlayfulDevPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return (
    <main className="container-x space-y-16 py-16">
      <header className="space-y-2">
        <p className="eyebrow">Design system</p>
        <h1 className="text-h2">The playful layer</h1>
        <p className="max-w-prose text-body text-muted-foreground">
          The camp hues, the ring motif, spot illustrations and motion, as the site draws them. Switch light and dark to see
          both.
        </p>
      </header>

      <Section title="The showcase" note="OneCamp drawn by its own components (components/site/showcase), at the sizes the live demo was captured at.">
        <ShowcaseGallery />
      </Section>

      <Section
        title="The hero's orbit"
        note="The product shot on a hued canvas, the ring and orbit turning slowly behind it, and real things named on it. It pauses off screen and stands still with reduced motion."
      >
        <HeroOrbit
          things={[
            { label: "#engineering", kind: "channel" },
            { label: "Maya Chen", kind: "person" },
            { label: "Release Captain", kind: "agent" },
          ]}
        >
          <HeroScene />
        </HeroOrbit>
      </Section>

      <Section title="Camp palette" note="Six identity hues in three cuts: strong for marks, tint for grounds, ink for text on its tint.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAMP_HUES.map((h) => (
            <div key={h} className={cx(HUE_CLASS[h], "space-y-3 rounded-lg border border-border bg-card p-4")}>
              <div className="flex items-baseline justify-between">
                <p className="text-small font-medium capitalize">{h}</p>
                <span className="rounded-sm bg-hue-tint px-1.5 py-0.5 text-caption font-medium text-hue-ink">Ink on tint</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["", "-tint", "-ink"] as const).map((cut) => (
                  <div key={cut} className="space-y-1.5">
                    <div
                      className={cx(
                        "h-10 rounded-md border border-border",
                        cut === "" ? "bg-hue" : cut === "-tint" ? "bg-hue-tint" : "bg-hue-ink",
                      )}
                    />
                    <p className="font-mono text-[11px] leading-4 text-muted-foreground">
                      {CAMP.light[`camp-${h}${cut}`]}
                      <br />
                      {CAMP.dark[`camp-${h}${cut}`]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Identity" note="Every person, channel and project gets a stable hue from its id (lib/campHue hueFor), the same as in the app.">
        <div className="space-y-5 rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            {CAST.map((name) => (
              <IdentityMark key={name} variant="avatar" id={name} label={name} size={32} />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {CHANNELS.map((c) => (
              <span key={c} className="inline-flex items-center gap-2 text-small">
                <IdentityMark id={c} />
                {c}
                <span className="text-caption text-muted-foreground">{hueFor(c)}</span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {CAMP_HUES.map((h) => (
              <span key={h} className="inline-flex items-center gap-2">
                <IdentityMark hue={h} />
                <IdentityMark hue={h} variant="square" />
                <IdentityMark hue={h} variant="tile" label={h} />
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {CAMP_HUES.map((h, i) => (
              <span key={h} className={cx(HUE_CLASS[h], "rounded-sm bg-hue-tint px-1.5 py-0.5 text-caption font-medium text-hue-ink")}>
                {TAGS[i]}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section title="The ring motif" note="The logo's ring, extended: rings, a dotted orbit, an arc, a spark and the tile.">
        <div className="grid grid-cols-2 items-end gap-6 rounded-lg border border-border bg-card p-5 sm:grid-cols-3 lg:grid-cols-6">
          <div className="space-y-2">
            <Rings hue="sky" size={96} />
            <Caption>Rings</Caption>
          </div>
          <div className="space-y-2 text-muted-foreground">
            <Orbit size={96} />
            <Caption>Orbit</Caption>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Arc hue="dusk" sweep={0.3} start={30} size={44} />
              <Arc hue="lake" sweep={0.7} size={44} track />
            </div>
            <Caption>Arc</Caption>
          </div>
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <Spark hue="sun" size={20} />
              <Spark hue="berry" size={14} />
              <Spark hue="sky" size={10} />
            </div>
            <Caption>Spark</Caption>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Tile hue="moss" size="lg">
                <Spark />
              </Tile>
              <Tile hue="sun">
                <Spark />
              </Tile>
            </div>
            <Caption>Tile</Caption>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ProgressRing value={35} label="35 percent" />
              <ProgressRing value={70} size={40} label="70 percent">
                70
              </ProgressRing>
            </div>
            <Caption>Progress ring</Caption>
          </div>
        </div>
      </Section>

      <Section title="Spot illustrations" note="For empty states, onboarding, errors and the 404. Under 600 bytes each, with no image files.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(SPOTS).map(([name, Spot]) => (
            <div key={name} className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4">
              <Spot />
              <Caption>{name}</Caption>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Motion and bands" note="A card that is a thing to open lifts a pixel. A section may sit on a full-width tint band, at most every other one.">
        <div className="grid gap-4 md:grid-cols-2">
          <a href="#motion" {...ix("card")} className="card block">
            <p className="text-small font-medium">A card that lifts</p>
            <p className="text-caption text-muted-foreground">1px and a little shadow, on pointers that hover.</p>
          </a>
          <div className="hue-lake rounded-lg bg-hue-tint p-6">
            <p className="text-small font-medium text-hue-ink">A lake band</p>
            <p className="text-caption text-hue-ink">Ink on its tint, for a section that needs a ground.</p>
          </div>
        </div>
      </Section>
    </main>
  )
}
