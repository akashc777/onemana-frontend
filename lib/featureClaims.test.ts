import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it } from "vitest"

/**
 * The site must not deny a capability the product ships.
 *
 * The FAQ answered "Can we import Slack data? Not at this time" while the
 * backend carried nineteen files of Slack import: an orchestrator, workers for
 * messages, DMs and files, de-duplication, a reaction pass, rollback, avatar
 * upload and mrkdwn conversion, with routed endpoints and four admin dialogs in
 * front of it.
 *
 * Migration is THE objection for anyone leaving Slack. Answering "no" to it, in
 * writing, on the page where people decide, is the most expensive sentence a
 * product can publish about itself, and it stayed there long enough that nobody
 * remembered it was wrong.
 *
 * A denial is not a claim that can be checked by looking at the code, so it
 * cannot be guarded generally. This pins the specific ones that were wrong, and
 * exists mostly as a note to whoever writes the next one: check before you say
 * a thing is missing.
 */
const CONTENT = resolve(__dirname, "..", "content", "onecamp.md")

describe("the site does not deny shipped capabilities", () => {
  const body = readFileSync(CONTENT, "utf8")

  it("does not claim Slack import is unavailable", () => {
    const denials = [
      /import Slack[^<]*<\/summary><div class="faq-answer">Not at this time/i,
      /cannot import (your )?Slack/i,
      /no Slack import/i,
    ]
    for (const pattern of denials) {
      expect(
        pattern.test(body),
        `the FAQ denies Slack import, which the product has shipped since the SlackImport orchestrator landed`,
      ).toBe(false)
    }
  })

  it("says so plainly instead", () => {
    expect(/import (your )?Slack history/i.test(body) || /Yes\. Export your workspace from Slack/i.test(body)).toBe(true)
  })
})
