"use client";

// landing-diet: product-mock -- the text below is simulated PRODUCT UI (channel
// posts, table rows, board cards), not marketing copy, so it is outside the
// homepage word budget. See app/landingWordBudget.test.ts.
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

// Monochrome, as in the product: the icon names the place, the colour said nothing.
const NAV: { key: ShowcaseNavKey; label: string; Icon: typeof IconHome }[] = [
  { key: "home", label: "Home", Icon: IconHome },
  { key: "channels", label: "Channels", Icon: IconHash },
  { key: "dms", label: "DMs", Icon: IconMessage },
  { key: "tasks", label: "My Tasks", Icon: IconTasks },
  { key: "calendar", label: "Calendar", Icon: IconCalendar },
  { key: "activity", label: "Activity", Icon: IconBell },
];

/** The current item is a piece of the page's paper, as in the app's sidebar. */
const ACTIVE = "bg-background text-foreground shadow-[0_0_0_1px_rgb(var(--border)),0_1px_2px_rgb(0_0_0/0.04)] dark:bg-accent dark:shadow-none";

type MobileView = "main" | "ai";

/**
 * App chrome mirroring OneCamp FE: the sidebar and top bar sit on one canvas
 * and the page is a single sheet on it, with an optional AI panel inside the
 * sheet. Mobile uses Channel | AI tabs.
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
    <div className={`flex flex-col overflow-hidden rounded-xl border border-border bg-muted/60 text-left ${heightClass}`}>
      {/* Desktop-style top bar (matches desktopNavigationTopBar) */}
      <div className="flex h-11 flex-shrink-0 items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <OneCampLogo className="h-5 w-5 flex-shrink-0 rounded" />
          <span className="status-pulse h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" aria-hidden />
          <span className="truncate text-xs font-semibold text-foreground sm:text-sm">Acme Inc</span>
        </div>
        <div className="hidden max-w-[12rem] flex-1 items-center gap-2 rounded-md border border-border/70 bg-background/60 px-2.5 py-1.5 text-xs text-muted-foreground sm:flex lg:max-w-xs">
          <IconSearch className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">Search workspace…</span>
        </div>
        <div className="flex items-center gap-1">
          {aiPanel && (
            <button
              type="button"
              onClick={() => setMobileView("ai")}
              className={`grid h-8 w-8 place-items-center rounded-md transition-colors lg:pointer-events-none ${
                aiActive ? "bg-brand/10 text-brand" : "text-muted-foreground"
              }`}
              aria-label="AI Assistant"
            >
              <IconSparkles className="h-4 w-4" />
            </button>
          )}
          <span className="hidden h-7 w-7 rounded-full bg-background text-[10px] font-semibold leading-7 text-foreground ring-1 ring-border sm:grid sm:place-items-center">
            AK
          </span>
        </div>
      </div>

      {/* Mobile: Channel | AI (OneCamp opens AI full-screen on mobile) */}
      {aiPanel && (
        <div className="mx-2 flex border-b border-border/60 lg:hidden">
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

      <div className="flex min-h-0 flex-1 pb-2 pr-2 max-md:pl-2">
        {/* Sidebar - matches desktopSideNavigationBar primary items */}
        <aside className="hidden w-[11.5rem] flex-shrink-0 flex-col p-2 pt-0 md:flex">
          <nav className="space-y-0.5" aria-label="OneCamp navigation">
            {NAV.map(({ key, label, Icon }) => {
              const active = key === activeNav;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium ${
                    active ? ACTIVE : "text-foreground/75"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{label}</span>
                  {key === "channels" && active && (
                    <span className="ml-auto rounded-full bg-brand px-1.5 text-[9px] font-medium text-white">3</span>
                  )}
                </div>
              );
            })}
          </nav>
          <p className="mt-4 px-2 text-[11px] font-medium text-muted-foreground">Channels</p>
          <div className="mt-1 space-y-0.5 px-1">
            {["general", "engineering", "design"].map((ch) => (
              <div
                key={ch}
                className={`truncate rounded-md px-2 py-1 text-[11px] ${
                  ch === "engineering" ? `${ACTIVE} font-medium` : "text-foreground/75"
                }`}
              >
                # {ch}
              </div>
            ))}
          </div>
        </aside>

        {/* Main + AI */}
        <div className="flex min-w-0 flex-1 overflow-hidden rounded-lg border border-border/70 bg-background shadow-[0_1px_3px_rgb(0_0_0/0.04)] dark:shadow-none">
          <div
            className={`min-w-0 flex-1 flex flex-col ${
              aiPanel && mobileView === "ai" ? "hidden lg:flex" : "flex"
            }`}
          >
            {children}
          </div>

          {showAi && aiPanel && (
            <aside
              className={`flex w-full min-h-0 flex-shrink-0 flex-col overflow-hidden border-l border-border/70 bg-background lg:w-64 xl:w-72 ${
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