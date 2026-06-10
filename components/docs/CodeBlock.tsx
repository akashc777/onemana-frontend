"use client";

import { useState } from "react";

/** Dark, copy-able code block used across the docs. */
export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-white/10 bg-canvas-soft">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-xs text-slate-500">{label ?? "shell"}</span>
        <button onClick={copy} className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/20">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-slate-200">{code}</code>
      </pre>
    </div>
  );
}
