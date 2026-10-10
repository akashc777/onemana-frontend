import type { BlogTopic } from "@/lib/blogTopics";
import { HUE_CLASS } from "@/components/ui/graphics/hues";

/** The topic's square, in its strong cut. Decorative: its name is always beside it. */
function Square() {
  return (
    <svg aria-hidden viewBox="0 0 10 10" className="size-2 shrink-0 fill-hue">
      <rect width="10" height="10" rx="2.5" />
    </svg>
  );
}

/** A post's topic as a chip, over its title: the topic's tint with its ink. */
export function TopicChip({ topic }: { topic: BlogTopic }) {
  return (
    <span className={`${HUE_CLASS[topic.hue]} inline-flex items-center gap-1.5 rounded-sm bg-hue-tint px-2 py-0.5 text-caption font-medium text-hue-ink`}>
      <Square />
      {topic.label}
    </span>
  );
}

/** A post's topic in a list: its square and its name, quiet. */
export function TopicLabel({ topic, className = "" }: { topic: BlogTopic; className?: string }) {
  return (
    <span className={`${HUE_CLASS[topic.hue]} inline-flex items-center gap-1.5 text-caption text-muted-foreground ${className}`}>
      <Square />
      {topic.label}
    </span>
  );
}
