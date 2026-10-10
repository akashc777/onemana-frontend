"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { searchDocs, type SearchIndex } from "@/lib/docsSearch";
import { SpotSearch } from "@/components/ui/graphics/spots";

// Shared by every search field on the page, fetched once, and only when a
// field is reached for (hover, focus or "/"): the page itself never pays for it.
let indexRequest: Promise<SearchIndex> | null = null;
function loadIndex(): Promise<SearchIndex> {
  indexRequest ??= fetch("/docs/search.json")
    .then((r) => {
      if (!r.ok) throw new Error(`search index ${r.status}`);
      return r.json() as Promise<SearchIndex>;
    })
    .catch((e) => {
      indexRequest = null;
      throw e;
    });
  return indexRequest;
}

/**
 * Search the docs: type, and the sections that mention every word appear
 * under the field. Enter opens the first, the arrow keys move through them,
 * Escape closes them. "/" anywhere on the page puts the cursor here.
 */
export function DocsSearch({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLUListElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const inputId = useId();
  const statusId = useId();

  const warm = () => {
    if (index || failed) return;
    loadIndex().then(setIndex, () => setFailed(true));
  };

  const asked = query.trim();
  const hits = useMemo(() => (index && asked ? searchDocs(index, asked) : []), [index, asked]);
  const showing = open && asked.length > 0;

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable='true']")) return;
      const el = field.current;
      if (!el || el.offsetParent === null) return; // a field that is not on screen (the other layout's)
      e.preventDefault();
      el.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!showing) return;
    const away = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [showing]);

  // Enter opens the first result, so once the typing pauses, that one guide
  // is fetched ahead; the rest wait for a pointer or the keyboard.
  const first = showing ? hits[0]?.href : undefined;
  useEffect(() => {
    if (!first) return;
    const t = window.setTimeout(() => router.prefetch(first), 300);
    return () => window.clearTimeout(t);
  }, [first, router]);

  const done = () => {
    setOpen(false);
    setQuery("");
  };

  const links = () => Array.from(results.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []);

  const onFieldKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && hits.length) {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => links()[0]?.focus());
    } else if (e.key === "Enter" && hits[0]) {
      e.preventDefault();
      router.push(hits[0].href);
      done();
      field.current?.blur();
    } else if (e.key === "Escape") {
      if (showing) setOpen(false);
      else setQuery("");
    }
  };

  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const all = links();
    const at = all.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = e.key === "ArrowDown" ? at + 1 : at - 1;
      if (next < 0) field.current?.focus();
      else all[Math.min(next, all.length - 1)]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      field.current?.focus();
    }
  };

  let status = "";
  if (showing) {
    if (failed) status = "Search is not available just now.";
    else if (!index) status = "Searching…";
    else status = hits.length ? `${hits.length} result${hits.length === 1 ? "" : "s"}` : "No results";
  }

  return (
    <div ref={box} className={`relative ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        Search the docs
      </label>
      <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground">
        <circle cx="7" cy="7" r="4.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.25 10.25L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        ref={field}
        id={inputId}
        type="search"
        value={query}
        placeholder="Search the docs…"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        aria-describedby={statusId}
        onPointerEnter={warm}
        onFocus={() => {
          warm();
          setOpen(true);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onFieldKey}
        className="h-10 w-full rounded-md border border-border-strong bg-card pl-9 pr-9 text-base text-foreground placeholder:text-faint sm:h-9 sm:text-small [&::-webkit-search-cancel-button]:hidden"
      />
      {!asked && (
        <kbd aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-sm border border-border bg-muted px-1.5 font-mono text-[0.6875rem] leading-5 text-muted-foreground lg:block">
          /
        </kbd>
      )}
      <p id={statusId} role="status" className="sr-only">
        {status}
      </p>

      {showing && (
        <div className="absolute left-0 top-full z-30 mt-2 w-[min(28rem,calc(100vw-2rem))] animate-popover-in rounded-lg border border-border bg-card p-1.5 shadow-popover">
          {failed ? (
            <p className="px-3 py-2.5 text-small text-muted-foreground">
              Search is not available just now.{" "}
              <Link href="/docs" onClick={done} className="link">
                Every guide is listed here
              </Link>
              .
            </p>
          ) : !index ? (
            <p className="px-3 py-2.5 text-small text-muted-foreground">Searching…</p>
          ) : hits.length === 0 ? (
            <div className="flex items-center gap-4 px-3 py-3">
              <SpotSearch size={56} className="shrink-0" />
              <div className="min-w-0">
                <p className="text-small text-foreground">Nothing in the docs matches “{asked}”.</p>
                <p className="mt-1 text-caption text-muted-foreground">Try fewer or shorter words, or write to support@onemana.dev.</p>
              </div>
            </div>
          ) : (
            <ul ref={results} onKeyDown={onListKey} className="max-h-[min(26rem,65vh)] overflow-y-auto overscroll-contain">
              {hits.map((h) => (
                <li key={h.href}>
                  {/* Fetched ahead on intent only: in view, every result of
                      every keystroke was fetched ahead, 64 KB of guides nobody
                      chose while typing "saml cert". */}
                  <Link
                    href={h.href}
                    prefetch={false}
                    onPointerEnter={() => router.prefetch(h.href)}
                    onFocus={() => router.prefetch(h.href)}
                    onClick={done}
                    className="block rounded-md px-3 py-2 outline-offset-0 transition-colors duration-150 hover:bg-muted focus-visible:bg-muted"
                  >
                    <span className="block text-small font-medium text-foreground">{h.section || h.title}</span>
                    <span className="block text-caption text-muted-foreground">{h.section ? h.title : "Guide"}</span>
                    {h.snippet && (
                      <span className="mt-1 line-clamp-2 block text-caption text-muted-foreground">
                        {h.snippet[0]}
                        <mark className="rounded-sm bg-brand-soft text-foreground">{h.snippet[1]}</mark>
                        {h.snippet[2]}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
