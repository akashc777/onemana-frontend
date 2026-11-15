// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PortalInstance, PortalOverview, PortalSubscription } from "@/lib/portalApi";
import { defaultPricing, type Pricing } from "@/lib/pricing";
import { PEOPLE } from "@/lib/freePlan";

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

// The page's one pricing answer. A test that wants the card before it lands holds it here.
const day = vi.hoisted(() => ({ held: null as Promise<Pricing> | null }));
vi.mock("@/hooks/useDayPricing", async (orig) => {
  const m = await orig<typeof import("@/hooks/useDayPricing")>();
  return { ...m, livePricing: vi.fn(() => day.held ?? m.livePricing()) };
});

const { AccountDashboard } = await import("@/components/account/AccountDashboard");
const { WorkspaceSection } = await import("@/components/account/WorkspaceSection");
const { livePricing } = await import("@/hooks/useDayPricing");

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
  backups_nightly: false, offsite_configured: false, storage_addon_gb: 0, storage_addon_state: "",
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

describe("the workspace card past Team's number", () => {
  afterEach(() => {
    day.held = null;
  });

  it("names no Business size and no link until the page's one pricing answer lands, then the live size and the link", async () => {
    let answer!: (p: Pricing) => void;
    day.held = new Promise<Pricing>((r) => (answer = r));
    const past: PortalInstance = { ...moving, move: undefined, seats_used: 34 };
    api.instances.mockResolvedValue([past]);
    await mount(<WorkspaceSection onReload={() => {}} subscriptions={[team]} initial={[past]} />);
    const line = () => [...document.querySelectorAll("p")].find((p) => p.textContent?.startsWith("34 people"));
    const upgrade = () => document.querySelector('a[href="?tab=subscription"]');

    expect(line()?.textContent).toBe(`34 people. Your plan is ${PEOPLE.cloud(30)}.`);
    expect(line()?.textContent).not.toContain("Business");
    expect(upgrade()).toBeNull();
    expect(line()?.querySelector("a"), "no step is drawn while the answer is out").toBeNull();
    expect(livePricing).toHaveBeenCalled();

    await act(async () => answer({ ...defaultPricing, business_seats: 150 }));
    expect(line()?.textContent).toContain(`Business is ${PEOPLE.cloud(150)}.`);
    expect(line()?.textContent).not.toContain(PEOPLE.cloud(defaultPricing.business_seats));
    expect(upgrade()?.textContent).toBe("Upgrade to Business");
  });
});

// Each money confirm pressed every way a hurried hand or a stray key can: Tab stays inside, leaving the page
// while it is open, a double tap, a double Enter and a second ask. None acts by mistake; the action acts once.
const { useConfirm } = await import("@/components/account/ConfirmSheet");

let asked: ((a: { title: string; body: string; yes: string; no?: string }) => Promise<boolean>) | null = null;
function AskHarness() {
  const [confirm, sheet] = useConfirm();
  asked = confirm;
  return <>{sheet}</>;
}

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });

type Case = { name: string; mountIt: () => Promise<void>; trigger: () => HTMLElement | null; yes: string; safe: string; action: ReturnType<typeof vi.fn> };
const cases: Case[] = [
  {
    name: "upgrade",
    mountIt: async () => {
      window.history.replaceState(null, "", "/account?tab=subscription");
      await mount(<AccountDashboard overview={overview} instances={[]} onLogout={() => {}} onReload={() => {}} />);
    },
    trigger: () => button(/^Upgrade to Business/) as HTMLElement | null,
    yes: "Go ahead",
    safe: "Not now",
    action: api.changePlan as unknown as ReturnType<typeof vi.fn>,
  },
  {
    name: "cancel",
    mountIt: async () => {
      window.history.replaceState(null, "", "/account?tab=subscription");
      await mount(<AccountDashboard overview={overview} instances={[]} onLogout={() => {}} onReload={() => {}} />);
    },
    trigger: () => button("Cancel subscription") as HTMLElement | null,
    yes: "Cancel subscription",
    safe: "Keep subscription",
    action: api.cancelSubscription as unknown as ReturnType<typeof vi.fn>,
  },
  {
    name: "move",
    mountIt: async () => {
      await mount(<WorkspaceSection onReload={() => {}} subscriptions={[team]} initial={[moving]} />);
    },
    trigger: () => button("Move now") as HTMLElement | null,
    yes: "Move now",
    safe: "Not now",
    action: api.moveNow as unknown as ReturnType<typeof vi.fn>,
  },
];

describe("the money confirms, pressed every way", () => {
  for (const c of cases) {
    it(`${c.name}: Esc never acts; focus home; scroll lock released`, async () => {
      await c.mountIt();
      const d = await open(c.trigger());
      expect(document.body.style.overflow).toBe("hidden");
      expect(d.el.getAttribute("role")).toBe("alertdialog");
      expect(d.modal).toBe("true");
      expect(d.name.length).toBeGreaterThan(0);
      expect(d.description.length).toBeGreaterThan(0);
      await key("Escape");
      await flush();
      expect(dialog()).toBeNull();
      expect(c.action).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(c.trigger());
      expect(document.body.style.overflow).toBe("");
    });

    it(`${c.name}: backdrop never acts; a press on the panel itself does not close`, async () => {
      await c.mountIt();
      const d = await open(c.trigger());
      await press(d.el);
      expect(dialog(), "a press on the panel keeps it open").not.toBeNull();
      await press(d.el.parentElement);
      await flush();
      expect(dialog()).toBeNull();
      expect(c.action).not.toHaveBeenCalled();
    });

    it(`${c.name}: the safe button never acts, and is where focus starts`, async () => {
      await c.mountIt();
      const d = await open(c.trigger());
      expect(document.activeElement).toBe(button(c.safe, d.el));
      await press(button(c.safe, d.el));
      await flush();
      expect(dialog()).toBeNull();
      expect(c.action).not.toHaveBeenCalled();
    });

    it(`${c.name}: unmount (navigation) while open never acts and releases the page`, async () => {
      await c.mountIt();
      await open(c.trigger());
      await act(async () => root?.unmount());
      root = null;
      await flush();
      expect(dialog()).toBeNull();
      expect(c.action).not.toHaveBeenCalled();
      expect(document.body.style.overflow).toBe("");
    });

    it(`${c.name}: a double tap on the action (same frame, and next frame) acts exactly once`, async () => {
      await c.mountIt();
      const d = await open(c.trigger());
      const yes = button(c.yes, d.el) as HTMLElement;
      await act(async () => { yes.click(); yes.click(); });
      await act(async () => { yes.click(); });
      await flush();
      expect(dialog()).toBeNull();
      expect(c.action).toHaveBeenCalledTimes(1);
    });

    it(`${c.name}: a double Enter (activation lands on whatever has focus) acts exactly once`, async () => {
      await c.mountIt();
      const d = await open(c.trigger());
      (button(c.yes, d.el) as HTMLElement).focus();
      const enter = () => act(async () => { (document.activeElement as HTMLElement).click(); });
      await enter();
      await flush();
      await enter();
      await flush();
      await enter();
      await flush();
      expect(c.action).toHaveBeenCalledTimes(1);
    });

    it(`${c.name}: Tab and Shift+Tab stay inside`, async () => {
      await c.mountIt();
      const d = await open(c.trigger());
      const safe = button(c.safe, d.el) as HTMLElement;
      const yes = button(c.yes, d.el) as HTMLElement;
      const tab = (shiftKey: boolean) =>
        act(async () => { (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", shiftKey, bubbles: true, cancelable: true })); });
      expect(document.activeElement).toBe(safe);
      await tab(true);
      expect(document.activeElement, "Shift+Tab from the first goes to the last").toBe(yes);
      await tab(false);
      expect(document.activeElement, "Tab from the last goes to the first").toBe(safe);
      d.el.focus();
      await tab(true);
      expect(document.activeElement, "Shift+Tab from the panel goes to the last").toBe(yes);
    });
  }

  it("a double tap on the opener opens one dialog and never acts", async () => {
    await cases[2].mountIt();
    const t = cases[2].trigger() as HTMLElement;
    t.focus();
    await act(async () => { t.click(); t.click(); });
    expect(document.querySelectorAll('[role="alertdialog"]').length).toBe(1);
    await key("Escape");
    await flush();
    expect(api.moveNow).not.toHaveBeenCalled();
  });

  it("useConfirm: a second ask answers the first false; unmount answers the open one false", async () => {
    await mount(<AskHarness />);
    let p1!: Promise<boolean>, p2!: Promise<boolean>;
    await act(async () => { p1 = asked!({ title: "One", body: "b", yes: "Y" }); });
    await act(async () => { p2 = asked!({ title: "Two", body: "b", yes: "Y" }); });
    await expect(p1).resolves.toBe(false);
    expect(dialog()?.name).toBe("Two");
    await act(async () => root?.unmount());
    root = null;
    await expect(p2).resolves.toBe(false);
    expect(dialog()).toBeNull();
  });

  it("useConfirm: Esc, backdrop and safe answer false; the action answers true once", async () => {
    await mount(<AskHarness />);
    const results: boolean[] = [];
    for (const way of ["Escape", "backdrop", "safe"] as const) {
      let p!: Promise<boolean>;
      await act(async () => { p = asked!({ title: way, body: "b", yes: "Do it", no: "Leave it" }); });
      if (way === "Escape") await key("Escape");
      else if (way === "backdrop") await press(dialog()!.el.parentElement);
      else await press(button("Leave it", dialog()!.el));
      results.push(await p);
    }
    let runs = 0;
    let p!: Promise<boolean>;
    await act(async () => { p = asked!({ title: "go", body: "b", yes: "Do it" }); });
    void p.then((ok) => { if (ok) runs++; });
    const yes = button("Do it", dialog()!.el) as HTMLElement;
    await act(async () => { yes.click(); yes.click(); });
    await flush();
    expect(results).toEqual([false, false, false]);
    expect(await p).toBe(true);
    expect(runs).toBe(1);
  });
});
