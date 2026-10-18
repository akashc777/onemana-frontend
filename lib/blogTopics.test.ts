import { describe, expect, it } from "vitest";
import { BLOG_TOPICS, blogTopic, relatedPosts } from "./blogTopics";

/**
 * A post's topic, from its tags, then its title, then the generic "AI" tag.
 * Pinned on real posts' tags (onemana.dev/blog, 10 Oct 2026).
 */
describe("a post's topic", () => {
  it("has six topics, each in its area's hue, and the two that are no area neutral (v3.1)", () => {
    expect(BLOG_TOPICS.map((t) => t.label)).toEqual(["Docs and tables", "Chat and calls", "Projects", "Agents", "Security", "Running it"]);
    expect(BLOG_TOPICS.map((t) => t.hue)).toEqual(["dusk", "sky", "moss", "agent", "ink", "ink"]);
  });

  it("is decided by the most specific tag", () => {
    expect(blogTopic(["OneCamp", "Tables", "Formulas", "Self-Hosted"]).key).toBe("tables");
    expect(blogTopic(["OneCamp", "Security", "Release", "Post-Mortem"]).key).toBe("security");
    expect(blogTopic(["OneCamp", "AI Agents", "Security", "Governance"]).key).toBe("agents");
    expect(blogTopic(["Traefik", "TLS", "Postgres", "Operations", "Silent Failure"], "One Dead Hostname Took Video Calls Down for 26 Days").key).toBe("running");
  });

  it("falls back to the title when no tag is specific", () => {
    expect(blogTopic(["Go", "NextJS", "Postgres", "AI", "Architecture"], "OneCamp Tables: Notion-Style Databases").key).toBe("tables");
    expect(blogTopic(["MQTT", "WebSockets", "Go"], "Why I Used MQTT for Team Chat").key).toBe("chat");
  });

  it("reads the generic AI tag last, and anything else as running it", () => {
    expect(blogTopic(["Go", "AI", "Cost"], "Putting a Budget on It").key).toBe("agents");
    expect(blogTopic(["OneCamp", "Self-Hosted", "OpenSource"], "Notes").key).toBe("running");
    expect(blogTopic(undefined).key).toBe("running");
  });
});

describe("posts to read next", () => {
  const post = (slug: string, tags: string[]) => ({ slug, tags, title: slug });
  const posts = [post("a", ["Tables"]), post("b", ["Security"]), post("c", ["Formulas"]), post("d", ["Chat"]), post("e", ["Tables"])];

  it("are the newest on the same topic first, then the newest of the rest, never the post itself", () => {
    expect(relatedPosts(posts, post("e", ["Tables"])).map((p) => p.slug)).toEqual(["a", "c", "b"]);
  });

  it("stop at the count, and cope with a blog of one post", () => {
    expect(relatedPosts(posts, post("x", ["Chat"]), 2).map((p) => p.slug)).toEqual(["d", "a"]);
    expect(relatedPosts([post("a", [])], post("a", []))).toEqual([]);
  });
});
