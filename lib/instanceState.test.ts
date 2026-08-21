import { describe, expect, it } from "vitest";
import { stateTone, stateBadgeClass, isWorkingState } from "./instanceState";

describe("workspace state presentation", () => {
  // ONE VOCABULARY, TWO VIEWS. The customer's page and the operator's panel each
  // had their own copy of this and had already begun to differ over which states
  // they knew about. A drifted copy still renders, which is why nobody notices.
  it("gives every real state a deliberate tone", () => {
    const states = [
      "awaiting_setup", "awaiting_hardware", "adopting", "provisioning",
      "verifying", "live", "failed", "suspended", "exporting", "terminated",
    ];
    for (const s of states) {
      expect(stateBadgeClass(s), s).toBeTruthy();
    }
    expect(stateTone("live")).toBe("good");
    expect(stateTone("failed")).toBe("bad");
    expect(stateTone("awaiting_hardware")).toBe("waiting");
    expect(stateTone("terminated")).toBe("done");
  });

  // A state nobody has taught this about is far more likely to be a new step in the
  // middle of the flow than a new ending, and treating it as "working" keeps a view
  // polling rather than declaring something finished that is not.
  it("treats an unknown state as still working", () => {
    expect(stateTone("some_new_step")).toBe("working");
    expect(isWorkingState("some_new_step")).toBe(true);
  });

  // Polling must stop on the states where nothing more happens on its own.
  it("stops polling once nothing is moving", () => {
    for (const s of ["live", "failed", "terminated", "exporting", "awaiting_setup", "awaiting_hardware"]) {
      expect(isWorkingState(s), s).toBe(false);
    }
    for (const s of ["adopting", "provisioning", "verifying", "migrating"]) {
      expect(isWorkingState(s), s).toBe(true);
    }
  });
});
