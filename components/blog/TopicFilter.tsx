"use client";

import { useEffect, useState } from "react";
import { BLOG_TOPICS } from "@/lib/blogTopics";
import { HUE_CLASS } from "@/components/ui/graphics/hues";

/**
 * The blog's topic chips (site.md BL1): All and the six topics, each with
 * its hue's dot. Choosing one sets data-topic-filter on the list, and CSS
 * hides the posts of the other topics (app/blog/page.tsx writes the rules),
 * so the list is in the page for a crawler and a reader without script.
 * The choice is in the address (?topic=) so a link can share it.
 */
export function TopicFilter({ target }: { target: string }) {
  const [topic, setTopic] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("topic") ?? "";
    if (BLOG_TOPICS.some((b) => b.key === t)) setTopic(t);
  }, []);

  useEffect(() => {
    const el = document.getElementById(target);
    if (el) {
      if (topic) el.setAttribute("data-topic-filter", topic);
      else el.removeAttribute("data-topic-filter");
    }
    const url = new URL(window.location.href);
    if (topic) url.searchParams.set("topic", topic);
    else url.searchParams.delete("topic");
    window.history.replaceState(null, "", url);
  }, [topic, target]);

  const chips = [{ key: "", label: "All", hue: null }, ...BLOG_TOPICS.map((t) => ({ key: t.key, label: t.label, hue: t.hue }))];
  return (
    <div role="group" aria-label="Show posts about" className="fade-x -mx-4 flex snap-x gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:[mask-image:none]">
      {chips.map((c) => (
        <button
          key={c.key || "all"}
          type="button"
          aria-pressed={topic === c.key}
          onClick={() => setTopic(c.key)}
          className={`${c.hue ? HUE_CLASS[c.hue] : ""} flex min-h-11 min-w-11 shrink-0 snap-start items-center justify-center gap-2 rounded-md px-3 text-caption font-[510] transition-[background-color,box-shadow,color] duration-hover sm:min-h-8 sm:min-w-0 ${
            topic === c.key ? "bg-card text-foreground shadow-e2" : "text-muted-foreground hover:bg-hover hover:text-foreground"
          }`}
        >
          {c.hue && <span aria-hidden="true" className="size-[7px] rounded-full bg-hue" />}
          {c.label}
        </button>
      ))}
    </div>
  );
}
