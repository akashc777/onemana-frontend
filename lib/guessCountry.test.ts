import { describe, expect, it } from "vitest"
import { guessCountry } from "./guessCountry"
import { countries } from "./countries"

const known = new Set(countries.map((c) => c.code))

describe("guessCountry", () => {
  it("follows the time zone first", () => {
    expect(guessCountry("America/Chicago", ["en-IN"], known)).toBe("US")
    expect(guessCountry("Asia/Kolkata", ["en-US"], known)).toBe("IN")
    expect(guessCountry("Asia/Calcutta", [], known)).toBe("IN")
    expect(guessCountry("Europe/London", ["en-US"], known)).toBe("GB")
  })

  it("then the language's region", () => {
    expect(guessCountry("Etc/UTC", ["de-DE", "en"], known)).toBe("DE")
    expect(guessCountry(undefined, ["en", "fr-CA"], known)).toBe("CA")
  })

  it("defaults to the United States, never to India", () => {
    expect(guessCountry(undefined, [], known)).toBe("US")
    expect(guessCountry("Etc/UTC", ["en"], known)).toBe("US")
    expect(known.has("US") && known.has("IN")).toBe(true)
  })
})
