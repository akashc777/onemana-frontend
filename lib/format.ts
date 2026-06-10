// Formatting helpers. Money is always handled in the smallest currency unit
// (paise) and only formatted for display here.

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a paise amount as an INR currency string, e.g. 149900 → "₹1,499.00". */
export function formatINR(paise: number): string {
  return inrFormatter.format((paise || 0) / 100);
}

/** Formats an ISO timestamp as a locale date-time, with a graceful dash. */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

/** Formats an ISO timestamp as a short date. */
export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}
