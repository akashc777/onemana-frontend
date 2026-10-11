// landing-diet: product-mock
import { agentsPhone } from "./scenes/agents"
import { boardPhone } from "./scenes/board"
import { calendarPhone } from "./scenes/calendar"
import { chatPhone } from "./scenes/chat"
import { docPhone } from "./scenes/doc"
import type { SceneSpec } from "./scenes/types"

/** The surface nearest a /for or /alternatives page's subject. */
export type AudienceSceneKind = "chat" | "docs" | "tasks" | "calendar" | "agents"

/**
 * The phone's own scene for each surface: a /for or /alternatives page shows
 * the product as a phone window beside its claim, the same scenes the home
 * page plays on a phone (one system).
 */
export const AUDIENCE_SCENES: Record<AudienceSceneKind, SceneSpec> = {
  chat: chatPhone,
  docs: docPhone,
  tasks: boardPhone,
  calendar: calendarPhone,
  agents: agentsPhone,
}
