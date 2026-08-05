import { describe, it, expect } from "vitest";
import { execFileSync } from "child_process";

/**
 * A dependency constraint that is a comment is a constraint that gets bumped.
 *
 * sanitize-html is pinned to 2.17.0 rather than the latest 2.17.6, and the reason is not
 * obvious enough to survive a routine dependency bump:
 *
 *   2.17.6 depends on htmlparser2@^12, which is ESM-only, while sanitize-html itself is
 *   CommonJS and does a SYNCHRONOUS require('htmlparser2'). Node refuses that outright
 *   with ERR_REQUIRE_ESM, and no consumer configuration can fix it — a synchronous require
 *   of an ESM module is not resolvable, only a bundler statically rewriting the call makes
 *   it work. 2.17.0 and earlier are on the CommonJS htmlparser2@^8.
 *
 * The app hides this: Next's bundler resolves the interop, so `next build` passes on 2.17.6
 * and nothing looks wrong. What breaks is every non-bundled use — this test suite being the
 * first, and any future script or tool being the next.
 *
 * npm audit reports no advisory against sanitize-html at any version, so pinning 2.17.0 is
 * not taking an older security library to make tooling convenient. It is choosing the last
 * release that can actually be loaded, which for the most safety-critical dependency in the
 * repo is the property worth having.
 *
 * So this test fails on a bump, with that explanation, instead of the suite failing with an
 * opaque module error.
 */
describe("sanitize-html must be loadable without a bundler", () => {
  it("can be require()d from plain Node", () => {
    // Run in a separate Node process on purpose: under vitest the module graph is Vite's,
    // which is precisely the bundler-shaped environment that hides the problem.
    const check = () =>
      execFileSync(
        process.execPath,
        ["-e", "const s = require('sanitize-html'); if (typeof s !== 'function') throw new Error('not a function');"],
        { cwd: process.cwd(), stdio: "pipe" },
      );

    try {
      check();
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      throw new Error(
        "require('sanitize-html') failed under plain Node.\n\n" +
          "This almost certainly means sanitize-html was bumped to 2.17.1 or later, which " +
          "depends on the ESM-only htmlparser2@^12 while remaining CommonJS itself. That " +
          "combination cannot be require()d, and no vitest or Vite setting fixes it — only " +
          "a bundler rewriting the require does, which is why `next build` still passes.\n\n" +
          "Pin sanitize-html back to 2.17.0, or move the sanitiser behind a seam that does " +
          "not need to load it outside a bundler.\n\n" +
          "Underlying error:\n" +
          detail,
      );
    }
  });

  it("actually sanitises when loaded that way, not merely imports", () => {
    // Guards against a future "fix" that satisfies the import above with a stub or a
    // shim that does no sanitising.
    const out = execFileSync(
      process.execPath,
      [
        "-e",
        `const s = require('sanitize-html');
         process.stdout.write(s('<script>alert(1)</script><p>ok</p>', { allowedTags: ['p'] }));`,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(out).toBe("<p>ok</p>");
    expect(out).not.toContain("alert(1)");
  });
});
