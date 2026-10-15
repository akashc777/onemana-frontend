"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * A chunk the page asked for is gone. The admin loads the visitor map's code
 * only when the Visitors tab opens; a deploy that changes that code takes the
 * old file away with the old deployment, so a page opened before the deploy
 * asks for a file that no longer exists. Reloading is the whole cure.
 */
export function isChunkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" ||
    /Loading (CSS )?chunk [\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
      error.message,
    )
  );
}

interface Props {
  /** The section, as the tabs name it ("visitors"), or the part ("map"). */
  name: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * One section's failure stays in that section. Without this, a throw anywhere
 * in the admin (or a chunk a deploy took away) unmounts the whole page and
 * leaves "Application error: a client-side exception has occurred" in place
 * of every tab. With it, the tabs and every other section keep working, and
 * the failed one says what happened and offers the way back.
 */
export class PanelBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`admin: the ${this.props.name} section failed`, error, info.componentStack);
  }

  render() {
    const { name, children } = this.props;
    const { error } = this.state;
    if (!error) return <div data-panel={name}>{children}</div>;

    const stale = isChunkError(error);
    return (
      <div
        role="alert"
        data-panel={name}
        data-failed={stale ? "stale" : "error"}
        className="rounded-2xl border border-border bg-muted/30 px-5 py-8 text-center text-sm"
      >
        <p className="font-medium text-foreground">
          {stale ? "The site was updated after this page opened." : `This part of the admin (${name}) hit an error.`}
        </p>
        <p className="mx-auto mt-1 max-w-prose break-words text-muted-foreground">
          {stale ? "Reload to get the new version." : error.message}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {!stale && (
            <button type="button" onClick={() => this.setState({ error: null })} className="btn-ghost px-4 py-2 text-xs">
              Try again
            </button>
          )}
          <button type="button" onClick={() => window.location.reload()} className="btn-ghost px-4 py-2 text-xs">
            Reload
          </button>
        </div>
      </div>
    );
  }
}
