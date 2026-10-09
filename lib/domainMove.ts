import type { PortalDomainChange, PortalDomainPlan } from "./portalApi";

/**
 * What the "Use my own domain" panel tells a customer, worked out the way the
 * backend works it out (onemana-backend business/onecamp/domainChange*.go).
 */

/**
 * Where the ownership TXT record goes: _onecamp-verify. followed by the whole
 * domain the customer entered, which is the name the backend looks up
 * (VerificationTXTName).
 *
 * The panel used to show _onecamp-verify. followed by the domain's last two
 * labels. For team.acme.com that is _onecamp-verify.acme.com while the backend
 * looks at _onecamp-verify.team.acme.com, and for acme.co.uk it is
 * _onecamp-verify.co.uk, a name nobody but the registry can create. Either
 * way the record was never found.
 */
export function verificationTxtHost(domain: string): string {
  return `_onecamp-verify.${domain.trim().toLowerCase()}`;
}

/**
 * The address people will open after the move: the workspace's own record,
 * onecamp.<domain> (serviceHosts, "Workspace (what people open)"). The panel
 * used to name the bare domain, which none of the records points anywhere.
 */
export function workspaceHost(plan: Pick<PortalDomainPlan, "to_domain" | "dns_records">): string {
  const host = `onecamp.${plan.to_domain}`;
  return plan.dns_records?.some((r) => r.host === host) ? host : plan.to_domain;
}

export interface CheckVerdict {
  tone: "done" | "waiting" | "failed";
  text: string;
}

function sentence(s: string): string {
  const t = s.trim().replace(/\.$/, "");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) + "." : "";
}

/**
 * What a press of "Check records" found, from the change the backend returns.
 *
 * The panel used to show the response's `msg`, which the check endpoint never
 * sends, so every press said "Checked." in green whether the records were there
 * or not. The answer is in the change's state and state_detail.
 */
export function checkVerdict(change: Pick<PortalDomainChange, "state" | "state_detail">): CheckVerdict {
  const detail = sentence(change.state_detail);
  switch (change.state) {
    case "applied":
      return { tone: "done", text: "Done. Your workspace has moved to its new address." };
    case "applying":
      return {
        tone: "done",
        text: "Your records check out, and the move has started. Your current address keeps working until the new one is live.",
      };
    case "failed":
      // Not the detail: for a failed move it is the raw error from the server
      // work (ApplyDomainChange), which is ours to read, not the customer's.
      return {
        tone: "failed",
        text: "The move stopped. Your current address still works. Write to support@onemana.dev and we will finish it with you.",
      };
    case "cancelled":
      return { tone: "failed", text: "This move was cancelled. Your current address still works." };
    case "":
      // A 200 without the change in it: say nothing about the records.
      return { tone: "waiting", text: "The check did not come back with an answer. Try again in a minute." };
    default:
      // pending_dns or verifying: the records are not all there yet.
      return {
        tone: "waiting",
        text: `${detail || "Your records are not all there yet."} New DNS records can take a while to appear; check again later.`,
      };
  }
}
