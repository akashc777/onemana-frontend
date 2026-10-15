"use client";

import { useState, type DragEvent } from "react";

/** A drag event's kind, as the drop zone counts it. */
export type DropEventKind = "dragenter" | "dragleave" | "drop" | "dragend";

/**
 * How deep a dragged file is in the zone. Every child the pointer crosses
 * fires dragleave on the one it leaves and dragenter on the next, so the zone
 * is "dragged over" while the count is above 0, and a boolean set on enter
 * and cleared on leave flickered as the file crossed the spot and the words
 * (storefront audit V1). A drop, or a drag that ends, clears it.
 */
export function nextDropDepth(depth: number, kind: DropEventKind): number {
  if (kind === "dragenter") return depth + 1;
  if (kind === "dragleave") return Math.max(0, depth - 1);
  return 0;
}

/**
 * A file drop zone: the handlers to spread on the zone and whether a file is
 * over it. While one is, the cursor says "copy", and the zone wears the
 * interaction layer's drop-target look (data-drop="valid").
 */
export function useFileDrop(onFile: (file: File) => void) {
  const [depth, setDepth] = useState(0);
  const dragging = depth > 0;
  return {
    dragging,
    bind: {
      "data-drop": dragging ? ("valid" as const) : undefined,
      onDragEnter: (e: DragEvent) => {
        e.preventDefault();
        setDepth((d) => nextDropDepth(d, "dragenter"));
      },
      onDragOver: (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      },
      onDragLeave: () => setDepth((d) => nextDropDepth(d, "dragleave")),
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        setDepth(0);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      },
    },
  };
}
