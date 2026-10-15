import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "./useCopy";

/**
 * Copying a licence key or an install command (hooks/useCopy). The clipboard
 * can refuse, and a refusal must be said: a button that goes on reading
 * "Copy" sends the reader to paste whatever the clipboard held before.
 */
describe("copying a key or a command", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("says copied when the clipboard takes it", async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    expect(await copyText("/bin/bash -c x")).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("/bin/bash -c x");
  });

  it("says failed when the clipboard refuses, or when there is none, as on an http page", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: async () => Promise.reject(new Error("denied")) } });
    expect(await copyText("key")).toBe("failed");
    vi.stubGlobal("navigator", {});
    expect(await copyText("key")).toBe("failed");
  });

  // /free's Copy caught a refusal and said nothing, while the account page's
  // said "Select it". Both copy through the one hook, and both say it.
  it("is the copy behind both Copy buttons, and each says when it did not work", () => {
    for (const file of ["app/free/FreeInstall.tsx", "components/account/AccountParts.tsx"]) {
      const src = readFileSync(join(__dirname, "..", file), "utf8");
      expect(src, file).toMatch(/useCopy\(/);
      expect(src, file).not.toContain("navigator.clipboard");
      expect(src, file).toMatch(/=== "failed" \?/);
      expect(src, file).toContain('"Select it"');
    }
  });
});
