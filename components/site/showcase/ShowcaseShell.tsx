"use client";

import { useEffect, useState, type ReactNode } from "react";
import { OneCampLogo } from "@/components/site/BrandMarks";
import {
  IconBell,
  IconCalendar,
  IconHash,
  IconHome,
  IconMessage,
  IconSearch,
  IconSparkles,
  IconTasks,
} from "@/components/site/showcase/ShowcaseIcons";

export type ShowcaseNavKey = "home" | "channels" | "dms" | "tasks" | "calendar" | "activity";

const NAV: { key: ShowcaseNavKey; label: string; Icon: typeof IconHome; tint: string }[] = [
  { key: "home", label: "Home", Icon: IconHome, tint: "text-foreground" },
  { key: "channels", label: "Channels", Icon: IconHash, tint: "text-emerald-600 dark:text-emerald-400" },
  { key: "dms", label: "DMs", Icon: IconMessage, tint: "text-sky-600 dark:text-sky-400" },
  { key: "tasks", label: "My Tasks", Icon: IconTasks, tint: "text-rose-600 dark:text-rose-400" },
  { key: "calendar", label: "Calendar", Icon: IconCalendar, tint: "text-teal-600 dark:text-teal-400" },
  { key: "activity", label: "Activity", Icon: IconBell, tint: "text-foreground" },
];

type MobileView = "main" | "ai";

/**
 * App chrome mirroring OneCamp FE: left sidebar nav, top bar (org + search + AI),
 * main content, optional right AI panel. Mobile uses Channel | AI tabs.
 */
export function ShowcaseShell({
  activeNav = "channels",
  path = "/app/channel/engineering",
  children,
  aiPanel,
  aiActive = false,
  heightClass = "h-[min(420px,70vh)] sm:h-[420px]",
}: {
  activeNav?: ShowcaseNavKey;
  path?: string;
  children: ReactNode;
  aiPanel?: ReactNode;
  /** Highlights the AI toggle once the demo reaches the assistant step. */
  aiActive?: boolean;
  heightClass?: string;
}) {
  const [mobileView, setMobileView] = useState<MobileView>("main");
  const showAi = !!aiPanel;

  useEffect(() => {
    if (!aiPanel) return;
    setMobileView(aiActive ? "ai" : "main");
  }, [aiActive, aiPanel]);

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left ${heightClass}`}>
      {/* Desktop-style top bar (matches desktopNavigationTopBar) */}
      <div className="flex h-11 flex-shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background/90 px-3 backdrop-blur-sm sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <OneCampLogo className="h-5 w-5 flex-shrink-0 rounded" />
          <span className="status-pulse h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" aria-hidden />
          <span className="truncate text-xs font-semibold text-foreground sm:text-sm">Acme Inc</span>
        </div>
        <div className="hidden max-w-[12rem] flex-1 items-center gap-2 rounded-md border border-border/70 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground sm:flex lg:max-w-xs">
          <IconSearch className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">Search workspace…</span>
        </div>
        <div className="flex items-center gap-1">
          {aiPanel && (
            <button
              type="button"
              onClick={() => setMobileView("ai")}
              className={`grid h-8 w-8 place-items-center rounded-md transition-colors lg:pointer-events-none ${
                aiActive ? "bg-violet-500/15 text-violet-600 dark:text-violet-400" : "text-muted-foreground"
              }`}
              aria-label="AI Assistant"
            >
              <IconSparkles className="h-4 w-4" />
            </button>
          )}
          <span className="hidden h-7 w-7 rounded-full bg-indigo-500/15 text-[10px] font-semibold leading-7 text-indigo-700 dark:text-indigo-300 sm:grid sm:place-items-center">
            AK
          </span>
        </div>
      </div>

      {/* Mobile: Channel | AI (OneCamp opens AI full-screen on mobile) */}
      {aiPanel && (
        <div className="flex border-b border-border/60 lg:hidden">
          {(["main", "ai"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setMobileView(view)}
              className={`flex-1 py-2 text-center text-xs font-medium transition-colors ${
                mobileView === view ? "border-b-2 border-brand text-foreground" : "text-muted-foreground"
              }`}
            >
              {view === "main" ? "Channel" : "AI Assistant"}
            </button>
          ))}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {/* Sidebar — matches desktopSideNavigationBar primary items */}
        <aside className="hidden w-[11.5rem] flex-shrink-0 flex-col border-r border-border bg-muted/40 p-2 md:flex">
          <nav className="space-y-0.5" aria-label="OneCamp navigation">
            {NAV.map(({ key, label, Icon, tint }) => {
              const active = key === activeNav;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium ${
                    active ? "bg-accent text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className={tint}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate">{label}</span>
                  {key === "channels" && active && (
                    <span className="ml-auto rounded-full bg-brand px-1.5 text-[9px] font-medium text-white">3</span>
                  )}
                </div>
              );
            })}
          </nav>
          <p className="mt-4 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Channels</p>
          <div className="mt-1 space-y-0.5 px-1">
            {["general", "engineering", "design"].map((ch) => (
              <div
                key={ch}
                className={`truncate rounded-md px-2 py-1 text-[11px] ${
                  ch === "engineering" ? "bg-accent font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                # {ch}
              </div>
            ))}
          </div>
        </aside>

        {/* Main + AI */}
        <div className="flex min-w-0 flex-1">
          <div
            className={`min-w-0 flex-1 flex flex-col ${
              aiPanel && mobileView === "ai" ? "hidden lg:flex" : "flex"
            }`}
          >
            {children}
          </div>

          {showAi && aiPanel && (
            <aside
              className={`flex w-full min-h-0 flex-shrink-0 flex-col overflow-hidden border-l border-border bg-background lg:w-64 xl:w-72 ${
                mobileView === "ai" ? "flex" : "hidden lg:flex"
              }`}
            >
              {aiPanel}
            </aside>
          )}
        </div>
      </div>

      <p className="sr-only">Preview of OneCamp at {path}</p>
    </div>
  );
}