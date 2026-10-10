import { describe, expect, it } from "vitest";
import { searchDocs, terms, type SearchIndex } from "./docsSearch";

const index: SearchIndex = {
  docs: [
    {
      s: "single-sign-on",
      t: "Single sign-on, LDAP and SCIM",
      c: "Setup flow",
      d: "Sign your team in with Google, GitHub, OIDC, SAML or LDAP.",
      x: [
        ["", "", "Sign-in methods a workspace can use."],
        ["saml", "SAML", "Run make saml-cert to create the service provider certificate, then set SAML_ENABLED=true."],
        ["ldap", "LDAP", "Point OneCamp at your directory."],
      ],
    },
    {
      s: "installation",
      t: "Installation",
      c: "Setup flow",
      d: "Install OneCamp on your own server.",
      x: [
        ["", "", "You need an Ubuntu or Debian server with 4 GB of RAM."],
        ["updating", "Updating", "Run make update. A concert of containers restarts, one after another."],
      ],
    },
  ],
};

describe("searching the docs", () => {
  it("finds the section that mentions every word, and links to it", () => {
    const [first] = searchDocs(index, "saml cert");
    expect(first.href).toBe("/docs/single-sign-on#saml");
    expect(first.title).toBe("Single sign-on, LDAP and SCIM");
    expect(first.section).toBe("SAML");
  });

  it("ranks a word in a heading above the same word in a body", () => {
    expect(searchDocs(index, "ldap")[0].href).toBe("/docs/single-sign-on#ldap");
  });

  it("lands a guide's title on the guide itself", () => {
    expect(searchDocs(index, "installation")[0].href).toBe("/docs/installation");
  });

  it("needs every word: a section with only some of them is not a result", () => {
    expect(searchDocs(index, "debian saml")).toEqual([]);
  });

  it("prefers a word that starts a word over one inside another", () => {
    const hits = searchDocs(index, "cert");
    expect(hits[0].href).toBe("/docs/single-sign-on#saml");
  });

  it("shows the words around the match", () => {
    const [hit] = searchDocs(index, "SAML_ENABLED");
    expect(hit.snippet?.[1]).toBe("SAML_ENABLED");
    expect(hit.snippet?.[0]).toMatch(/certificate, then set $/);
  });

  it("asks nothing of an empty or punctuation-only query", () => {
    expect(searchDocs(index, "   ")).toEqual([]);
    expect(searchDocs(index, "--- ...")).toEqual([]);
    expect(terms("make  --dry-run SAML_ENABLED")).toEqual(["make", "dry-run", "saml_enabled"]);
  });
});
