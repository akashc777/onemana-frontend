import type { ReactNode } from "react";

/** A column: its heading, and what a row shows in it. */
export interface StackColumn<R> {
  key: string;
  label: string;
  cell: (row: R) => ReactNode;
}

/**
 * The site's one wide table (storefront audit C1, C2): a table where it fits,
 * and below that one card per row, its first column as the card's title and
 * the others under it, each under its heading. Nothing scrolls sideways: on a
 * phone the comparison tables scrolled a 768 px table in a 390 px box, the
 * row that mattered cut mid-sentence behind a 16 px fade.
 *
 * `from` is the width from which the table fits (Tailwind's md or lg). A
 * `featured` row is raised in both forms (the raised surface and a 2 px brand
 * edge), as OneCamp's row is among its rivals.
 */
export function StackTable<R>({
  caption,
  columns,
  rows,
  rowKey,
  featured,
  rowHeader = true,
  from = "md",
  minWidth,
}: {
  caption: string;
  columns: readonly StackColumn<R>[];
  rows: readonly R[];
  rowKey: (row: R) => string;
  featured?: (row: R) => boolean;
  /** The first column names the row (a <th scope="row">). */
  rowHeader?: boolean;
  from?: "md" | "lg";
  /** The table's least width, where it is shown, so its cells keep a measure. */
  minWidth?: string;
}) {
  const [first, ...rest] = columns;
  const tableShown = from === "lg" ? "hidden lg:table" : "hidden md:table";
  const cardsShown = from === "lg" ? "lg:hidden" : "md:hidden";
  return (
    <>
      <table className={`${tableShown} w-full border-collapse text-left text-small`} style={minWidth ? { minWidth } : undefined}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((c) => (
              <th key={c.key} scope="col" className="px-4 py-3 text-caption font-[510] text-muted-foreground">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const lifted = featured?.(r) ?? false;
            return (
              <tr key={rowKey(r)} className={lifted ? "bg-card shadow-e1" : "border-b border-border last:border-0"}>
                {columns.map((c, i) =>
                  i === 0 && rowHeader ? (
                    <th key={c.key} scope="row" className={`px-4 py-4 align-top font-semibold text-foreground ${lifted ? "rounded-l-xl border-l-2 border-brand" : ""}`}>
                      {c.cell(r)}
                    </th>
                  ) : (
                    <td
                      key={c.key}
                      className={`px-4 py-4 align-top ${lifted ? "text-foreground" : "text-muted-foreground"} ${lifted && i === columns.length - 1 ? "rounded-r-xl font-[510]" : ""}`}
                    >
                      {c.cell(r)}
                    </td>
                  ),
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Below the table's width: one card per row, nothing sideways. */}
      <ul aria-label={caption} className={`${cardsShown} m-0 grid list-none gap-3 p-0`}>
        {rows.map((r) => {
          const lifted = featured?.(r) ?? false;
          return (
            <li
              key={rowKey(r)}
              className={`rounded-xl bg-card p-4 ${lifted ? "shadow-e2 ring-1 ring-brand/45" : "shadow-e1"}`}
            >
              {first && <p className="m-0 text-body font-[590] text-foreground">{first.cell(r)}</p>}
              <dl className="m-0 mt-3 grid gap-3">
                {rest.map((c) => (
                  <div key={c.key}>
                    <dt className="text-caption font-[510] text-muted-foreground">{c.label}</dt>
                    <dd className={`m-0 mt-0.5 text-small ${lifted ? "text-foreground" : "text-muted-foreground"}`}>{c.cell(r)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </>
  );
}
