import "./doc.css"

import type { ReactNode } from "react"
import { ArrowLeft, Bold, ChevronDown, ChevronRight, Code, Ellipsis, Globe, Italic, Link, MessageCircle, MessageSquarePlus, Strikethrough, Underline } from "lucide-react"

import type { CampHue } from "@/lib/campHue"

import { Ico, Spark } from "./parts"
import type { Person } from "./data"

/**
 * A doc (components/views/DocView, components/docEditor, the editor's
 * styles; design v3 content.md D05 to D15), drawn without the editor: the
 * 52px header with the breadcrumb, the save dot, who is here, Comments, More
 * and Share; then the reading column with the title, the meta line and the
 * body. The body is the blocks below (DocP, DocH2, DocList, DocItem), and a
 * collaborator's Caret, a Selection with its bar, or the block handle go
 * inside them, where the app draws them.
 */

/** Who has the doc open: a person, in the hue the doc gives them. */
export type Here = { person: Person; hue?: CampHue }

/** One face in the stack (ActiveUsersBar): 24px, two initials at 9px, a 6px status. */
function HereFace({ here }: { here: Here }) {
  return (
    <span className="doc-face">
      <span className="sc-av" data-hue={here.hue ?? here.person.hue} style={{ width: 24, height: 24 }}>
        {here.person.initials}
      </span>
      <i />
    </span>
  )
}

function Stack({ here }: { here: Here[] }) {
  return (
    <span className="doc-stack">
      {here.map((h) => (
        <HereFace key={h.person.name} here={h} />
      ))}
    </span>
  )
}

/** The line under the title (DocMeta): "Sam Rivera · Edited 6 hours ago · 1 min read". */
function Meta({ parts }: { parts: string[] }) {
  return (
    <div className="doc-meta t-ui-sm" data-sc-enter="">
      {parts.map((p, i) => (
        <span key={p} className="contents">
          {i > 0 && <span>·</span>}
          <span>{p}</span>
        </span>
      ))}
    </div>
  )
}

/** The title and the meta line (docInput's title block). */
function TitleBlock({ title, meta }: { title: string; meta: string[] }) {
  return (
    <div className="doc-titleblock">
      <div className="doc-title t-doc-title" data-sc-enter="">
        {title}
      </div>
      <Meta parts={meta} />
    </div>
  )
}

export function DocPage({ title, meta, here, children }: { title: string; meta: string[]; here: Here[]; children: ReactNode }) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      {/* DocHeader (D05). */}
      <div className="doc-head">
        <div className="doc-crumb t-ui">
          <span>Docs</span>
          <Ico icon={ChevronRight} size={14} />
          <span className="truncate">{title}</span>
        </div>
        <span className="doc-save">
          <i />
        </span>
        <div className="flex-1" />
        <Stack here={here} />
        <span className="doc-hbtn">
          <Ico icon={MessageCircle} />
        </span>
        <span className="doc-hbtn">
          <Ico icon={Ellipsis} />
        </span>
        <span className="doc-hdiv" />
        <span className="sc-btn sc-btn-14" data-variant="secondary">
          <Ico icon={Globe} size={14} />
          Share
        </span>
      </div>
      <div className="doc-scroll">
        <div className="doc-measure">
          <TitleBlock title={title} meta={meta} />
          <div className="doc-body t-body-lg">{children}</div>
        </div>
      </div>
    </div>
  )
}

/**
 * The same doc on a phone: the app bar names it (Back, the title, Comments and
 * More), who else is here sits on a row of its own when anyone is, and the
 * column is 20px in with the phone's title and headings.
 */
export function PhoneDocPage({ title, meta, here, children }: { title: string; meta: string[]; here: Here[]; children: ReactNode }) {
  return (
    <div className="doc-phone flex h-full w-full min-w-0 flex-col">
      <div className="doc-pbar">
        <div className="flex min-w-0 items-center justify-start">
          <span className="doc-pbtn">
            <Ico icon={ArrowLeft} />
          </span>
        </div>
        <div className="flex min-w-0 items-center justify-center px-2">
          <span className="truncate t-base w-semibold ink">{title}</span>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-1">
          <span className="doc-pbtn">
            <Ico icon={MessageCircle} />
          </span>
          <span className="doc-pbtn">
            <Ico icon={Ellipsis} />
          </span>
        </div>
      </div>
      {here.length > 1 && (
        <div className="doc-prow">
          <Stack here={here} />
        </div>
      )}
      <div className="doc-scroll">
        <div className="doc-measure">
          <TitleBlock title={title} meta={meta} />
          <div className="doc-body t-body-lg">{children}</div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- the blocks */

/** A paragraph; `handle` draws the block handle beside it, as under a resting pointer. */
export function DocP({ children, handle }: { children: ReactNode; handle?: boolean }) {
  return (
    <div className="doc-p" data-sc-enter="">
      {handle && <BlockHandle />}
      {children}
    </div>
  )
}

export function DocH2({ children }: { children: ReactNode }) {
  return (
    <div className="doc-h2" data-sc-enter="">
      {children}
    </div>
  )
}

export function DocList({ children }: { children: ReactNode }) {
  return (
    <div className="doc-ul" data-sc-enter="">
      {children}
    </div>
  )
}

/** A list item; `item` and `state` let a scene bring it in (SceneDirector). */
export function DocItem({ children, item, state }: { children: ReactNode; item?: string; state?: "off" | "on" }) {
  return (
    <div className="doc-li" data-sc-item={item} data-sc-state={state}>
      {children}
    </div>
  )
}

/** Words a collaborator types, brought in by a scene a few at a time. */
export function Typed({ children, item, state }: { children: ReactNode; item: string; state?: "off" | "on" }) {
  return (
    <span className="doc-typed" data-sc-item={item} data-sc-state={state}>
      {children}
    </span>
  )
}

/**
 * Someone else's caret (collaboratorCaret, D14): 2px in their avatar's first
 * stop, with their first name on a flag in their avatar colour. A scene can
 * fold the flag to the 6px dot (`fold`: the flag's and the dot's item names
 * and states), as the app does once they stop typing.
 */
export function Caret({
  person,
  item,
  state,
  fold,
}: {
  person: Person
  item?: string
  state?: "off" | "on"
  fold?: { flag: string; flagState?: "off" | "on"; dot: string; dotState?: "off" | "on" }
}) {
  return (
    <span className="doc-caret" data-hue={person.hue} data-sc-item={item} data-sc-state={state}>
      <span data-sc-item={fold?.flag} data-sc-state={fold?.flagState}>
        {person.name.split(" ")[0]}
      </span>
      {fold && <i data-sc-item={fold.dot} data-sc-state={fold.dotState} />}
    </span>
  )
}

/** The block handle (block-handle.ts): "+" and the grip, 24px each. */
function BlockHandle() {
  return (
    <span className="doc-handle">
      <span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.875" strokeLinecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          {[3, 7, 11].flatMap((y) => [4.5, 9.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.25" fill="currentColor" />))}
        </svg>
      </span>
    </span>
  )
}

/**
 * Selected words, and the selection bar over them (SelectionBar, D08): Ask
 * AI, Turn into, the six marks, the text colour and Comment.
 */
export function Selection({ children, block = "Text" }: { children: ReactNode; block?: string }) {
  return (
    <span className="doc-sel">
      <span className="doc-sel-text">{children}</span>
      <span className="doc-bar t-ui-sm">
        <span className="doc-bar-ai">
          <Spark size={14} />
          Ask AI
        </span>
        <span className="doc-bar-rule" />
        <span className="doc-bar-turn">
          {block}
          <Ico icon={ChevronDown} size={12} />
        </span>
        <span className="doc-bar-rule" />
        {[Bold, Italic, Underline, Strikethrough, Code, Link].map((I, i) => (
          <span key={i}>
            <Ico icon={I} />
          </span>
        ))}
        <span className="doc-bar-rule" />
        <span>
          <span className="doc-bar-a">
            A
            <i />
          </span>
        </span>
        <span>
          <Ico icon={MessageSquarePlus} />
        </span>
      </span>
    </span>
  )
}

/* ---------------------------------------------------------- the content */

/** The demo's "Q4 launch plan" (DemoSeed workspace.go CuratedDocs), as the visitor Sam reads it. */
export const Q4_PLAN = { title: "Q4 launch plan", meta: ["Sam Rivera", "Edited 6 hours ago", "1 min read"] }

export function Q4PlanBody({ handle, selection }: { handle?: boolean; selection?: boolean }) {
  return (
    <>
      <DocP handle={handle}>
        We launch on {selection ? <Selection>the last Tuesday of the month</Selection> : "the last Tuesday of the month"}. This page is the single source of
        truth; the tasks live in the <b>Q4 launch</b> project.
      </DocP>
      <DocH2>Goals</DocH2>
      <DocList>
        <DocItem>Every pilot customer signs in with their own SSO on day one.</DocItem>
        <DocItem>The walkthrough video and the announcement go out together.</DocItem>
        <DocItem>Support has the answers to the ten questions we already know are coming.</DocItem>
      </DocList>
      <DocH2>Owners</DocH2>
      <DocList>
        <DocItem>Announcement and pricing page: Sam</DocItem>
        <DocItem>SSO and pilot onboarding: Maya</DocItem>
        <DocItem>Walkthrough and checklist: Jonas</DocItem>
      </DocList>
      <DocH2>Risks</DocH2>
      <DocP>The pilot&apos;s SAML certificate expires the week before launch. Maya has the new one; we switch on the Monday.</DocP>
    </>
  )
}
