import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest for this site, kept deliberately small.
 *
 * WHY IT EXISTS. This repo had no test framework at all — no runner, no config, no test
 * files. That was fine while it was only marketing copy, and stopped being fine once it
 * grew two HTML injection sinks that are rendered with dangerouslySetInnerHTML: the
 * Markdown renderer for admin-authored articles, and the JSON-LD serialiser.
 *
 * Both were hardened after an audit found the original regex-based sanitiser let six
 * distinct payloads through. Those fixes are the highest-value code in the repo and had
 * nothing holding them: a well-meaning simplification of the allowlist would look like a
 * tidy-up and reopen the hole silently.
 *
 * NODE ENVIRONMENT, NOT JSDOM. Everything worth testing here is a pure string function, so
 * there is no DOM to simulate and no component to render. That keeps this to one dev
 * dependency on a site whose whole job is to load fast — no jsdom, no react plugin, no
 * testing-library. If a component ever needs rendering, adding jsdom then is a smaller
 * change than carrying it now.
 */
export default defineConfig({
  // JSX via the automatic runtime, so a component can be rendered to a string
  // with react-dom/server in the node environment. This is the case the note
  // above anticipated, and it needs no jsdom and no plugin: the stat strip bug
  // was a SERVER-render bug ("<0 min" in the HTML crawlers see), and the only
  // honest test for it is to render on the server and read the string.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "dist"],

    coverage: {
      provider: "v8",
      reporter: ["text"],
      include: ["lib/**"],
    },
  },
  resolve: {
    alias: {
      // Mirrors the `@/*` alias in tsconfig.json so a test imports the same path a
      // component does.
      "@": path.resolve(__dirname, "."),
    },
  },
});
