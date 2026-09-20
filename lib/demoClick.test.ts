import { describe, expect, it } from "vitest";
import { demoClickEvent, opensDemo } from "@/lib/track";

// These two decide what a demo click is worth as a measurement. They are pure
// so that the answer can be checked without a DOM, because the thing that went
// wrong here was never the DOM: it was counting two different populations under
// one name.

describe("opensDemo", () => {
  it("counts a plain click, including the keyboard's", () => {
    // A link opened with Enter reports button 0, exactly like a left click.
    expect(opensDemo("click", 0)).toBe(true);
  });

  it("counts the middle button, which fires auxclick and never click", () => {
    // The hole this closed. A middle click opens the demo in a new tab and
    // dispatches auxclick only, so a listener bound to click alone neither
    // counted the visit nor carried the visitor id into it.
    expect(opensDemo("auxclick", 1)).toBe(true);
  });

  it("does not count the right button, which opens a menu and not the demo", () => {
    // Right click also fires auxclick. Counting it would invent visits that
    // never happened, and every one of them would look like somebody who
    // clicked through and then vanished.
    expect(opensDemo("auxclick", 2)).toBe(false);
  });

  it("does not count pointerdown, which is where tagging happens, not counting", () => {
    // pointerdown precedes every one of the above. It exists to rewrite the
    // href in time; treating it as an open would double-count every click.
    expect(opensDemo("pointerdown", 0)).toBe(false);
  });
});

describe("demoClickEvent", () => {
  it("names a followable click and an unfollowable one differently", () => {
    expect(demoClickEvent(true)).toBe("demo-click");
    expect(demoClickEvent(false)).toBe("demo-click-untagged");
  });

  it("never reports an untagged click under the followable name", () => {
    // The whole point. A click with no id to carry cannot be reported arriving
    // at the demo, so putting it under demo-click adds somebody to the top of a
    // funnel they can never appear further down, and the loss reads as a
    // visitor giving up rather than as us failing to identify them.
    expect(demoClickEvent(false)).not.toBe(demoClickEvent(true));
  });
});
