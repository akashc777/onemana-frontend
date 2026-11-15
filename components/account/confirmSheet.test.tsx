// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PortalInstance, PortalOverview, PortalSubscription } from "@/lib/portalApi";

// The account page's money confirms (an upgrade or a switch, Cancel subscription,
// Move now) are the house's own dialog, never the browser's window.confirm: a
// phone draws that itself, light over a dark page, with no name of ours. Each is
// mounted in jsdom and pressed: dismissing it never acts, confirming acts once.

const api = vi.hoisted(() => ({
  changePlan: vi.fn(async () => ({ detail: "Your plan changes in the next quiet hours." })),
  cancelSubscription: vi.fn(async () => {}),
  subscriptions: vi.fn(async () => [] as PortalSubscription[]),
  moveNow: vi.fn(async () => "The move has started."),
  instances: vi.fn(async () => [] as PortalInstance[]),
  invoices: vi.fn(async () => []),
}));
vi.mock("@/lib/portalApi", async (orig) => ({ ...(await orig<typeof import("@/lib/portalApi")>()), portalApi: api }));

const { AccountDashboard } = await import("@/components/account/AccountDashboard");
const { WorkspaceSection } = await import("@/components/account/WorkspaceSection");

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const team: PortalSubscription = {
  id: "s1", plan_code: "onecamp_cloud_team", label: "Cloud Team", switch_options: ["business"], status: "active",
  seats: 30, next_due_date: "2026-12-14", cancel_at_period_end: false, can_cancel: true, created_at: "2026-10-14T09:00:00Z",
};

const overview: PortalOverview = {
  customer: {
    id: "c", email: "meera@example.com", name: "Meera Iyer", gstin: "", phone: "", address_line: "", city: "",
    state: "", state_code: "", country: "India", created_at: "2026-07-14T09:12:00Z",
  },
  licenses: [],
  order_count: 1,
  invoice_count: 1,
  subscriptions: [team],
};

const moving: PortalInstance = {
  id: "i1", address: "camp.example.com", state: "live", status: "Live", needs_name: false, region: "in", tier: "cloud",
  edition: "", has_ai: false, working: false, terminal: false, seats_included: 30, size: "team",
  move: { to_size: "business", label: "a larger machine is ready", can_move_now: true },
};

let root: Root | null = null;
let host: HTMLElement;
const nativeConfirm = vi.fn(() => false);

beforeEach(() => {
  vi.clearAllMocks();
  api.subscriptions.mockResolvedValue([team]);
  vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 404 })));
  window.confirm = nativeConfirm;
  host = document.body.appendChild(document.createElement("div"));
});

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  root = null;
  document.body.innerHTML = "";
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
});

async function mount(node: ReactNode) {
  await act(async () => {
    root = createRoot(host);
    root.render(node);
  });
}

function dialog() {
  const el = document.querySelector<HTMLElement>('[role="alertdialog"]');
  if (!el) return null;
  const words = (ids: string | null) =>
    (ids ?? "").split(" ").map((id) => document.getElementById(id)?.textContent ?? "").join(" ").trim();
  return {
    el,
    modal: el.getAttribute("aria-modal"),
    name: words(el.getAttribute("aria-labelledby")),
    description: words(el.getAttribute("aria-describedby")),
  };
}

const button = (words: string | RegExp, scope: ParentNode = document) =>
  [...scope.querySelectorAll("button")].find((b) =>
    typeof words === "string" ? b.textContent?.trim() === words : words.test(b.textContent ?? ""),
  ) ?? null;

async function press(el: Element | null) {
  expect(el).toBeTruthy();
  await act(async () => (el as HTMLElement).click());
}

async function key(k: string) {
  await act(async () => {
    (document.activeElement ?? document.body).dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
  });
}

/** Opens the confirm from its trigger (focused first, as a keyboard or a tap leaves it). */
async function open(trigger: HTMLElement | null) {
  trigger?.focus();
  await press(trigger);
  const d = dialog();
  expect(nativeConfirm).not.toHaveBeenCalled();
  expect(d, "the house dialog, by role alertdialog").not.toBeNull();
  return d!;
}

/** Every way out but the action: the safe button, Esc and the backdrop. None acts; focus goes home. */
async function dismissEveryWay(trigger: () => HTMLElement | null, safe: string, action: () => unknown) {
  for (const way of ["safe", "Escape", "backdrop"] as const) {
    const d = await open(trigger());
    expect(d.el.contains(document.activeElement), `focus moves into the dialog (${way})`).toBe(true);
    if (way === "safe") await press(button(safe, d.el));
    else if (way === "Escape") await key("Escape");
    else await press(d.el.parentElement);
    expect(dialog(), `closed by ${way}`).toBeNull();
    expect(action, `not acted on by ${way}`).not.toHaveBeenCalled();
    expect(document.activeElement, `focus back on the trigger after ${way}`).toBe(trigger());
  }
}

describe("the account page's money confirms", () => {
  it("asks before an upgrade in the house dialog, named by the button pressed and saying what it costs", async () => {
    window.history.replaceState(null, "", "/account?tab=subscription");
    await mount(<AccountDashboard overview={overview} instances={[]} onLogout={() => {}} onReload={() => {}} />);
    const trigger = () => button(/^Upgrade to Business/) as HTMLElement | null;
    const label = trigger()?.textContent?.trim() ?? "";
    expect(label).toMatch(/^Upgrade to Business, sized for \d+ people$/);

    const d = await open(trigger());
    expect(d.modal).toBe("true");
    expect(d.name).toBe(label);
    expect(d.description).toContain("for a larger machine sized for");
    expect(d.description).toContain("Payments are final; we do not offer refunds. Go ahead?");
    await key("Escape");

    await dismissEveryWay(trigger, "Not now", api.changePlan);
    await open(trigger());
    await press(button("Go ahead", dialog()!.el));
    expect(dialog()).toBeNull();
    expect(api.changePlan).toHaveBeenCalledTimes(1);
    expect(api.changePlan).toHaveBeenCalledWith("s1", "business");
  });

  it("asks before Cancel subscription, with an action that reads as destructive", async () => {
    window.history.replaceState(null, "", "/account?tab=subscription");
    await mount(<AccountDashboard overview={overview} instances={[]} onLogout={() => {}} onReload={() => {}} />);
    const trigger = () => button("Cancel subscription") as HTMLElement | null;

    const d = await open(trigger());
    expect(d.name).toBe("Cancel this subscription?");
    expect(d.description).toBe("It stays active until the current period ends, then will not renew. You can keep it from this page until then.");
    const act0 = button("Cancel subscription", d.el);
    expect(act0?.className).toContain("bg-danger");
    await key("Escape");

    await dismissEveryWay(trigger, "Keep subscription", api.cancelSubscription);
    await open(trigger());
    await press(button("Cancel subscription", dialog()!.el));
    expect(dialog()).toBeNull();
    expect(api.cancelSubscription).toHaveBeenCalledTimes(1);
    expect(api.cancelSubscription).toHaveBeenCalledWith("s1");
  });

  it("asks before Move now, saying the workspace pauses", async () => {
    await mount(<WorkspaceSection onReload={() => {}} subscriptions={[team]} initial={[moving]} />);
    const trigger = () => button("Move now") as HTMLElement | null;

    const d = await open(trigger());
    expect(d.name).toBe("Move now?");
    expect(d.description).toBe(
      "Your workspace pauses while the last backup is copied and restored, usually 10 to 30 minutes, then carries on at the same address.",
    );
    await key("Escape");

    await dismissEveryWay(trigger, "Not now", api.moveNow);
    await open(trigger());
    await press(button("Move now", dialog()!.el));
    expect(dialog()).toBeNull();
    expect(api.moveNow).toHaveBeenCalledTimes(1);
    expect(api.moveNow).toHaveBeenCalledWith("i1");
  });

  it("keeps the tab row scrolling by touch and keyboard, with no classic scrollbar at its end", async () => {
    await mount(<AccountDashboard overview={overview} instances={[]} onLogout={() => {}} onReload={() => {}} />);
    const row = document.querySelector<HTMLElement>('[role="tablist"]');
    expect(row?.className).toContain("overflow-x-auto");
    expect(row?.className).toContain("[scrollbar-width:none]");
    expect(row?.className).toContain("[&::-webkit-scrollbar]:hidden");
  });
});
