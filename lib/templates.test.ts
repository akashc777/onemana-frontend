import { describe, expect, it } from "vitest";
import { byWeek, dayLabel, demoTemplateUrl, descriptionBlocks, groupLists, taskCount, templateBySlug, templateFile, templates, weeksLong } from "./templates";

describe("the template data", () => {
  it("has the built-in templates, each with a slug a demo link accepts", () => {
    expect(templates.length).toBeGreaterThanOrEqual(7);
    for (const t of templates) {
      // The shape the demo's link takes a template id in (onecamp-fe isTemplateId).
      expect(t.id).toMatch(/^[a-z][a-z0-9-]{0,59}$/);
      // The pages promise every task says what done looks like.
      for (const task of t.tasks) expect(task.description, `${t.id}: ${task.name}`).toBeTruthy();
      // A plan reads in date order, so weeks never repeat on the page.
      const days = t.tasks.flatMap((task) => (task.due_day === undefined ? [] : [task.due_day]));
      expect(days, t.id).toEqual([...days].sort((a, b) => a - b));
      expect(t.tasks.length).toBeGreaterThan(4);
      expect(t.description.length).toBeGreaterThan(20);
    }
    expect(new Set(templates.map((t) => t.id)).size).toBe(templates.length);
    expect(templateBySlug("client-project")?.name).toBe("Client project");
    expect(templateBySlug("nope")).toBeUndefined();
  });

  it("counts tasks with their subtasks, and weeks from day 0", () => {
    const t = { id: "x", name: "X", description: "", tasks: [{ name: "a", due_day: 0, subtasks: [{ name: "s" }] }, { name: "b", due_day: 13 }] };
    expect(taskCount(t)).toBe(3);
    expect(weeksLong(t)).toBe(2);
    expect(byWeek(t).map((w) => [w.week, w.tasks.map((x) => x.name).join()])).toEqual([[1, "a"], [2, "b"]]);
  });

  it("keeps an undated task in the week before it", () => {
    const t = { id: "x", name: "X", description: "", tasks: [{ name: "a", due_day: 8 }, { name: "b" }, { name: "c", due_day: 20 }] };
    expect(byWeek(t).map((w) => w.tasks.map((x) => x.name).join())).toEqual(["a,b", "c"]);
  });

  it("reads descriptions as text, never markup", () => {
    expect(descriptionBlocks("<p>One &amp; two</p><ul><li>Logo&#39;s files</li><li>Fonts</li></ul><p>a<br>b</p>")).toEqual([
      { kind: "p", text: "One & two" },
      { kind: "li", text: "Logo's files" },
      { kind: "li", text: "Fonts" },
      { kind: "p", text: "a\nb" },
    ]);
    expect(descriptionBlocks("<p><script>x</script>hi</p>")).toEqual([{ kind: "p", text: "xhi" }]);
    expect(descriptionBlocks(undefined)).toEqual([]);
  });

  it("keeps text and lists in the order written, each run of items one list", () => {
    expect(groupLists(descriptionBlocks("<p>Ask:</p><ul><li>Logo</li><li>Fonts</li></ul><p>By Friday.</p><ul><li>Copy</li></ul>"))).toEqual([
      "Ask:",
      ["Logo", "Fonts"],
      "By Friday.",
      ["Copy"],
    ]);
  });

  it("makes a file the app reads, and a demo link that opens on the template", () => {
    const t = templateBySlug("client-project")!;
    const file = JSON.parse(templateFile(t));
    expect(file.onecamp_template).toBe(1);
    expect(file.id).toBeUndefined();
    expect(file.tasks.length).toBe(t.tasks.length);
    expect(demoTemplateUrl("client-project")).toMatch(/[?&]start_demo=template-client-project$/);
    expect(dayLabel(0)).toBe("Day 1");
  });
});
