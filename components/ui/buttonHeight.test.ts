import { describe, expect, it } from "vitest"

import { buttonClasses } from "@/components/ui/Button"

/**
 * One button height per size, whatever the variant. A button's height is its
 * padding, its line height and, for an outline, two border pixels; the
 * minimum height only holds it level if that sum stays inside it. The large
 * size inherited its line height (22.5 px at 15 px text), so the filled
 * "Try the live demo" was 44 px and the outlined "Install free" beside it
 * 44.5 px on every page that pairs them.
 *
 * Read per breakpoint: the classes with no prefix, then each `md:` override.
 */
const REM = 16
const spacing = (n: string) => Number(n) * 4
const TEXT_LINE: Record<string, number> = { "text-xs": 16, "text-sm": 20, "text-base": 24, "text-small": 20, "text-caption": 18, "text-body": 26 }

function at(classes: string[], prefix: string, pattern: RegExp): string | undefined {
  const base = classes.filter((c) => !c.includes(":"))
  const scoped = prefix ? classes.filter((c) => c.startsWith(prefix)).map((c) => c.slice(prefix.length)) : []
  return [...scoped, ...base].find((c) => pattern.test(c))
}

function measure(cls: string, prefix: string) {
  const classes = cls.split(/\s+/).filter(Boolean)
  const minH = at(classes, prefix, /^min-h-\d+(\.\d+)?$/)
  const py = at(classes, prefix, /^py-\d+(\.\d+)?$/)
  const leading = at(classes, prefix, /^leading-\d+$/)
  const text = at(classes, prefix, /^text-(xs|sm|base|small|caption|body|\[[\d.]+rem\])$/)
  const line = leading ? spacing(leading.slice("leading-".length)) : text && TEXT_LINE[text]
  return {
    min: minH ? spacing(minH.slice("min-h-".length)) : 0,
    padding: py ? 2 * spacing(py.slice("py-".length)) : 0,
    line,
    border: /\bborder\b/.test(cls) ? 2 : 0,
    text,
  }
}

describe("a button size", () => {
  for (const size of ["sm", "md", "lg"] as const) {
    for (const prefix of ["", "md:"]) {
      it(`${size}${prefix ? ` from ${prefix.slice(0, -1)}` : ""} is one height, filled or outlined`, () => {
        for (const variant of ["brand", "primary", "ghost", "subtle"] as const) {
          const m = measure(buttonClasses(variant, size), prefix)
          // A size with an arbitrary text size must name its line height.
          expect(m.line, `${variant} ${size}: ${m.text} needs a leading-* class`).toBeTypeOf("number")
          expect(m.padding + (m.line as number) + m.border, `${variant} ${size}`).toBeLessThanOrEqual(m.min)
        }
      })
    }
  }

  // A finger presses md and lg on a phone (plan cards, the menu, every form),
  // so below md they reach 44 px; sm is the wide nav's.
  it("md and lg are 44 px targets on a phone", () => {
    for (const size of ["md", "lg"] as const) {
      expect(measure(buttonClasses("ghost", size), "").min, size).toBeGreaterThanOrEqual(44)
    }
  })

  it("keeps its text size on the scale or names it in rem", () => {
    for (const size of ["md", "lg"] as const) {
      const text = measure(buttonClasses("brand", size), "").text ?? ""
      expect(text).toMatch(/^text-(sm|small|\[[\d.]+rem\])$/)
      if (text.startsWith("text-[")) expect(Number(text.slice(6, -4)) * REM).toBeGreaterThanOrEqual(14)
    }
  })
})
