import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * GitHub's release webhook, checked (app/api/revalidate/releases/route.ts).
 * GitHub signs each delivery's body with the webhook's secret and sends
 * "sha256=<hex>" in X-Hub-Signature-256; anything that does not match is
 * refused before its body is read as JSON.
 */
export function signatureValid(secret: string | undefined, body: string, signature: string | null): boolean {
  if (!secret || !signature?.startsWith("sha256=")) return false;
  const expected = Buffer.from(`sha256=${createHmac("sha256", secret).update(body, "utf8").digest("hex")}`);
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** The repository a release event is about, or "" when the body says none. */
export function eventRepository(body: string): string {
  try {
    return String((JSON.parse(body) as { repository?: { full_name?: unknown } }).repository?.full_name ?? "");
  } catch {
    return "";
  }
}
