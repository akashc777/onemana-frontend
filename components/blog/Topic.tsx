import type { BlogTopic } from "@/lib/blogTopics";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { Dot } from "@/components/ui/v3";

// A topic is a dot in its strong cut, the site's one identity mark for a
// category (site.md G7), the same as the filter chips above the list: it was
// a rounded square here and a dot there. Decorative: its name is beside it.

/** A post's topic as a chip, over its title: the topic's tint with its ink. */
export function TopicChip({ topic }: { topic: BlogTopic }) {
  return (
    <span className={`${HUE_CLASS[topic.hue]} inline-flex h-[22px] items-center gap-1.5 rounded-sm bg-hue-tint px-2 text-caption font-[510] text-hue-ink`}>
      <Dot hue={topic.hue} size={6} />
      {topic.label}
    </span>
  );
}

/** A post's topic in a list: its dot and its name, quiet. */
export function TopicLabel({ topic, className = "" }: { topic: BlogTopic; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-caption text-muted-foreground ${className}`}>
      <Dot hue={topic.hue} size={6} />
      {topic.label}
    </span>
  );
}
