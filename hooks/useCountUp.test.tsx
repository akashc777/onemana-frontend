import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { StatStrip } from "@/components/site/marketing";
import { stats } from "@/lib/content";

/**
 * The stat strip must never render a wrong number on the server.
 *
 * The count-up started at zero, and the initial state is what the server
 * renders, so the HTML that Google, Slack link previews and anyone on a slow
 * connection saw said "<0 min to get running" and "0% on your infrastructure".
 * The animation fixed it a second later for people with fast JS, which is why
 * nobody noticed from a laptop. Rendered to a string, exactly as the server does,
 * every stat must already read as its real value.
 */
describe("StatStrip server render", () => {
  it("shows every stat's real value before any JavaScript runs", () => {
    const html = renderToString(<StatStrip />);
    for (const s of stats) {
      // The value as it must appear: prefix, number, suffix, with tags between
      // allowed since each part is its own text node.
      const m = s.value.match(/^(<?)(\d+)(.*)$/);
      if (!m) {
        expect(html, `non-numeric stat "${s.value}" missing`).toContain(s.value);
        continue;
      }
      const [, prefix, num, suffix] = m;
      const pattern = new RegExp(
        (prefix ? "(<|&lt;)\\s*(<[^>]*>\\s*)*" : "") + num + "(<[^>]*>\\s*)*" + suffix.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      );
      expect(html, `stat "${s.value}" does not render as ${s.value} on the server`).toMatch(pattern);
    }
  });

  it("never renders a zero in place of a real statistic", () => {
    const html = renderToString(<StatStrip />);
    // "0" is itself a legitimate stat ("0 agent actions run unaudited"), so the
    // check is specifically for the two shapes the bug produced.
    expect(html).not.toMatch(/(<|&lt;)\s*(<[^>]*>\s*)*0\s*(<[^>]*>\s*)*min/);
    expect(html).not.toMatch(/(^|>)\s*0%\s*(<[^>]*>\s*)*on your infrastructure/);
  });
});
