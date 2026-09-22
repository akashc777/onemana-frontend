import { describe, expect, it } from "vitest";
import { storageLine } from "./storageLine";
import { paymentTerms, storageOffered } from "./paymentTerms";
import { defaultPricing } from "./pricing";

describe("storageLine", () => {
  it("says nothing when there is no add-on", () => {
    expect(storageLine("", 500)).toBe("");
    expect(storageLine("bogus", 500)).toBe("");
  });

  it("states each stage as a fact", () => {
    expect(storageLine("paid", 500)).toContain("being attached");
    expect(storageLine("attached", 500)).toBe("500 GB of extra storage attached.");
    expect(storageLine("ending", 500)).toContain("fit on the machine again");
  });
});

describe("the add-on's money words", () => {
  it("say monthly, cancel to the end of the month, and no refunds", () => {
    const t = paymentTerms("addon");
    expect(t).toContain("monthly");
    expect(t).toContain("end of the paid month");
    expect(t).toContain("we do not offer refunds");
  });

  it("offer storage only when a plan and a price exist", () => {
    expect(storageOffered(defaultPricing)).toBe(false);
    expect(storageOffered({ ...defaultPricing, storage_addon_configured: true })).toBe(true);
    expect(storageOffered({ ...defaultPricing, storage_addon_configured: true, storage_addon_paise: 0 })).toBe(false);
  });
});
