import type { ReactNode } from "react"
import { Hash, House, Inbox, MessageCircle, MoreHorizontal } from "lucide-react"

import { Ico } from "./parts"

/**
 * The app's window (desktopNavigationBar, LayoutContent; DESIGN_V3 §3.2):
 * the neutral frame with the campfire glow from the top left, the sidebar on
 * it, and the page on its own sheet 8px off the frame on every side but the
 * sidebar's (the seam is the sidebar's last 8px). Without a sidebar the sheet
 * sits 8px in all round, as a split pane does.
 *
 * `split` is the same page with a panel open beside it (a thread), laid out
 * whole over it and out of sight until a scene turns it on (`item`) and the
 * single page off (`sheetItem`): the app snaps the page narrower when a panel
 * opens, so the scene swaps the two at once rather than re-laying anything
 * out.
 */
export function AppFrame({
  sidebar,
  children,
  className,
  sheetItem,
  split,
}: {
  sidebar?: ReactNode
  children: ReactNode
  className?: string
  sheetItem?: string
  split?: { page: ReactNode; panel: ReactNode; item: string }
}) {
  // The glow lives behind the workspace mark at the frame's top left. A sheet
  // shown on its own is the app's right-hand part, where the frame is plain
  // graphite: drawn there, the glow was a peach rim round the sheet's corner.
  return (
    <div className={["sc sc-frame flex h-full w-full", className].filter(Boolean).join(" ")} data-grain="" data-glow={sidebar ? "" : undefined}>
      {sidebar}
      {sidebar ? <span aria-hidden="true" className="sc-seam w-2 flex-none" /> : null}
      <div className={["sc-main relative z-[1] flex min-w-0 flex-1 flex-col py-2 pr-2", sidebar ? "" : "pl-2"].join(" ")}>
        <div className="sc-sheet flex h-full min-h-0 flex-col" data-sc-item={sheetItem} data-sc-swap={sheetItem ? "" : undefined}>
          {children}
        </div>
        {split && (
          <div className="sc-split" data-sc-item={split.item} data-sc-state="off" data-sc-swap="">
            <div className="sc-sheet flex h-full min-w-0 flex-1 flex-col">{split.page}</div>
            {split.panel}
          </div>
        )}
      </div>
    </div>
  )
}

export type PhoneTab = "home" | "channels" | "dms" | "inbox" | "more"

/**
 * The app on a phone (components/navigationBar/mobile): the page on the
 * sheet, with the tab bar (mobileBottomNavigationBar: Home, Channels, DMs,
 * Inbox and More) under it on a page that has one; a conversation has its
 * composer there instead.
 */
export function PhoneFrame({ children, tab }: { children: ReactNode; tab?: PhoneTab }) {
  const tabs: { id: PhoneTab; label: string; icon: typeof House }[] = [
    { id: "home", label: "Home", icon: House },
    { id: "channels", label: "Channels", icon: Hash },
    { id: "dms", label: "DMs", icon: MessageCircle },
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "more", label: "More", icon: MoreHorizontal },
  ]
  return (
    <div className="sc sc-phone h-full w-full">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {tab && (
        <div className="sc-tabbar">
          {tabs.map((t) => (
            <span key={t.id} data-active={t.id === tab ? "" : undefined}>
              <span className="sc-tabcap">
                <Ico icon={t.icon} size={22} />
              </span>
              {t.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
