import { describe, expect, it } from "vitest";
import { docNeighbours, groupDocs, type DocPage } from "./docs";

const doc = (slug: string, category: string): DocPage => ({
  id: slug, slug, title: slug, category, content: "", order_index: 0, status: "published",
  seo_title: "", seo_desc: "", published_at: null, created_at: "", updated_at: "",
});

describe("the guides either side of one", () => {
  const groups = groupDocs([doc("dns", "Deployment"), doc("cloud", "Setup flow"), doc("disk", "deployment"), doc("install", "Setup flow")]);

  it("follow the sidebar's order, across its groups", () => {
    // groupDocs puts dns and disk together under Deployment, then the setup guides.
    expect(docNeighbours(groups, "disk")).toEqual({ prev: { slug: "dns", title: "dns", summary: undefined }, next: { slug: "cloud", title: "cloud", summary: undefined } });
  });

  it("stop at the ends, and say nothing for a guide that is not listed", () => {
    expect(docNeighbours(groups, "dns").prev).toBeUndefined();
    expect(docNeighbours(groups, "install").next).toBeUndefined();
    expect(docNeighbours(groups, "missing")).toEqual({});
  });
});
