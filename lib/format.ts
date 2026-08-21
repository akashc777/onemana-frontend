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
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

/** Formats an ISO timestamp as a short, deterministic date, e.g. "10 Jun 2026". */
export function formatDate(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** "3m ago". For timelines, where the gap matters more than the clock time.
 *
 *  Beside the other formatters rather than inside a component, because the second
 *  view that needed it wrote its own and they had already begun to differ. */
export function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (!Number.isFinite(secs)) return "";
  // A clock a little behind the server should not read as the future.
  if (secs < 0) return "just now";
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}
