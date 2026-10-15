// A file imported as its text, `import text from "./file.md?raw"`: the legal
// pages' Markdown (lib/legalPages.ts). Built in by next.config.mjs, and read by
// Vitest on its own.
declare module "*.md?raw" {
  const text: string;
  export default text;
}
