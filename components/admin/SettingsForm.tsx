"use client";

import { useState } from "react";
import { adminApi, type PlanCheck, type StorageCheck } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { AsyncState } from "./ui";

type FieldType = "text" | "password" | "number" | "select" | "textarea";
interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  hint?: string;
}

const GROUPS: { group: string; fields: FieldDef[] }[] = [
  {
    group: "Payments (Razorpay)",
    fields: [
      { key: "razorpay_key_id", label: "Key ID", hint: "rzp_live_… (public, safe to expose)" },
      { key: "razorpay_key_secret", label: "Key Secret", type: "password", hint: "Stored securely; shown masked." },
      { key: "razorpay_webhook_secret", label: "Webhook Secret", type: "password", hint: "Must match Razorpay → Webhooks." },
    ],
  },
  {
    group: "Email",
    fields: [
      { key: "email_provider", label: "Provider", type: "select", options: ["resend", "brevo"] },
      { key: "email_from", label: "From", hint: 'e.g. "OneMana <noreply@onemana.dev>"' },
      { key: "resend_api_key", label: "Resend API Key", type: "password" },
      { key: "brevo_api_key", label: "Brevo API Key", type: "password" },
    ],
  },
  {
    group: "Blog import",
    fields: [
      {
        key: "blog_import_repo",
        label: "Source repository",
        hint: 'owner/name of a public Jekyll repo, e.g. "akashc777/akashc777.github.io". Posts are then imported from Blog → Import.',
      },
      {
        key: "blog_import_branch",
        label: "Branch",
        hint: 'The branch those posts live on. GitHub Pages repos are often "master" rather than "main".',
      },
      {
        key: "blog_import_dir",
        label: "Posts directory",
        hint: 'Where the .md files are, normally "_posts".',
      },
      {
        key: "blog_import_token",
        label: "GitHub token (optional)",
        type: "password",
        hint: "Not needed for access, only for headroom: unauthenticated GitHub allows 60 requests an hour, and importing an archive with images uses more. Stored encrypted.",
      },
    ],
  },
  {
    group: "Pricing (admin-editable)",
    fields: [
      { key: "onecamp_price", label: "Lifetime price (paise)", type: "number", hint: "2499900 = ₹24,999 - the amount charged in INR (GST-inclusive)" },
      { key: "usd_inr_rate_override", label: "Pin the dollar rate (optional)", type: "number", hint: "Leave empty: every dollar price is worked out from the rupee price at the day's exchange rate, fetched automatically. Set rupees per dollar, e.g. 95.5, only to hold the dollar figures steady for a launch or a sale." },
      { key: "cloud_price", label: "Cloud price (paise/mo)", type: "number", hint: "999900 = ₹9,999 - invoice amount. Must equal what the Razorpay plan charges; use the check under the plan id." },
      { key: "cloud_seats", label: "Cloud seats", type: "number", hint: "Users included in the Cloud plan, e.g. 30" },
      { key: "cloud_plan_id", label: "Razorpay Cloud Plan ID", hint: "plan_… created in Razorpay (INR). Required for Cloud checkout." },
      { key: "cloud_plan_id_yearly", label: "Razorpay Cloud Plan ID (yearly)", hint: "plan_… for the yearly plan. Empty means yearly is not offered: the pricing page hides it and checkout refuses it. Set this and the option appears." },
      { key: "cloud_price_yearly", label: "Cloud price (paise/yr)", type: "number", hint: "Invoice amount per year. Blank means ten months of the monthly price, which is the \"two months free\" the page then says. The saving shown is derived from the two prices." },
      { key: "cloud_plan_id_business", label: "Razorpay plan ID (Business)", hint: "plan_… for Business, monthly. Empty means Business is not offered: the pricing page, the buy page and the account page hide it and checkout refuses it. Must charge exactly the Business price below; use the check under it." },
      { key: "cloud_price_business", label: "Business price (paise/mo)", type: "number", hint: "2499900 = ₹24,999 a month. Must equal what the Razorpay plan charges. Keep it at least five times what a Business machine costs, so the margin holds." },
      { key: "cloud_business_seats", label: "Business users included", type: "number", hint: "Default 100. Shown on the pricing page and the account page; nothing counts people at the door." },
      { key: "cloud_business_min_ram_mb", label: "Business machine: RAM at least (MB)", type: "number", hint: "Default 60000, what a \"64 GB\" machine reports. A spare smaller than this is never given to a Business workspace." },
      { key: "cloud_business_min_disk_gb", label: "Business machine: disk at least (GB)", type: "number", hint: "Default 400." },
      { key: "cloud_move_window_utc", label: "Move window (UTC hours)", hint: "When workspaces move between machines unless the owner presses Move now, e.g. 20-24 (the default) is 01:30 to 05:30 in India. A move pauses the workspace for the copy, usually 10 to 30 minutes." },
      { key: "cloud_plan_id_storage", label: "Razorpay plan ID (extra storage)", hint: "plan_… for the monthly extra-storage add-on. Empty means storage is not offered: the pricing page hides it and the portal shows no button. Must charge exactly the price below; use the check under it." },
      { key: "cloud_price_storage", label: "Extra storage price (paise/mo)", type: "number", hint: "299900 = ₹2,999 a month. Must equal what the Razorpay plan charges." },
      { key: "cloud_storage_addon_gb", label: "Extra storage size (GB)", type: "number", hint: "What the add-on buys. Default 500. Priced at least five times what the object store costs us, so the margin holds." },
      { key: "cloud_seats_nudge_pct", label: "Seat nudge at (%)", type: "number", hint: "Email the customer once when their people reach this share of the included seats. Default 80: 24 of 30. Monthly at most while over. Nothing is enforced." },
      { key: "owner_email", label: "Owner alert email", hint: "Where new-Cloud-order notifications are sent." },
      { key: "support_reply_to", label: "Support reply-to", hint: "The Reply-To on every email we send a customer, e.g. support@onemana.dev. A reply to a nudge lands here." },
      { key: "gst_rate", label: "GST Rate (%)", type: "number" },
      { key: "gst_monthly_returns", label: "GST returns filed", hint: "Comma-separated. Default GSTR-1,GSTR-3B. Drives the filing checklist." },
      {
        key: "tax_export_policy",
        label: "Foreign-sale tax",
        type: "select",
        options: ["never", "auto", "always"],
        hint: "never = charge GST to everyone (safe). auto = zero-rate as export only when Razorpay flags the payment international (recommended if you have an LUT). always = zero-rate every non-India sale.",
      },
    ],
  },
  {
    group: "OneCamp distribution",
    fields: [
      { key: "onecamp_latest_version", label: "Latest version", type: "number", hint: "Major version minted on each purchase, e.g. 2 (license unlocks v2.x.x)." },
      { key: "onecamp_github_url", label: "Release repo URL", hint: "Private OneCamp repo cloned + built per customer, e.g. https://github.com/you/OneCamp" },
      { key: "github_username", label: "GitHub username", hint: "Account that can read the release repo." },
      { key: "github_password", label: "GitHub token", type: "password", hint: "Personal access token (repo read). Stored securely; shown masked." },
    ],
  },
  {
    group: "Managed hosting - DNS (Cloudflare)",
    fields: [
      { key: "cloudflare_api_token", label: "API token", type: "password", hint: "Needs Zone:DNS:Edit + Zone:Zone:Read, scoped to this one zone. Stored securely; shown masked." },
      { key: "cloudflare_zone_id", label: "Zone ID", hint: "From the domain's Overview page in Cloudflare." },
      { key: "managed_zone", label: "Managed zone", hint: "The domain customer workspaces live under. Default onemana.dev." },
      { key: "frontend_cname_target", label: "Frontend CNAME target", hint: "Where a workspace hostname points. Default cname.vercel-dns.com - leave alone unless Vercel changes it." },
    ],
  },
  {
    group: "Managed hosting - Off-site backups",
    fields: [
      { key: "backup_s3_endpoint", label: "S3 endpoint", hint: "Any S3-compatible store. OVH Object Storage: s3.gra.io.cloud.ovh.net (or your region). Until the four S3 fields are set, workspaces are backed up on their own machine only and the portal says so." },
      { key: "backup_s3_region", label: "Region", hint: "As the store names it, e.g. gra. Leave blank if the endpoint does not need one." },
      { key: "backup_s3_bucket", label: "Bucket", hint: "Created by you in the store, private. Copies live under backups/<workspace id>/. Turn on the store's at-rest encryption for the bucket (OVH: SSE-OMK)." },
      { key: "backup_s3_access_key", label: "Access key", type: "password", hint: "An S3 user limited to this bucket. Customer machines never see these keys; copies are pulled from here." },
      { key: "backup_s3_secret_key", label: "Secret key", type: "password" },
      { key: "backup_offsite_keep", label: "Copies kept per workspace", type: "number", hint: "Default 30. The newest is never removed." },
    ],
  },
  {
    group: "Managed hosting - Servers (OVH)",
    fields: [
      { key: "ovh_app_key", label: "Application key", hint: "Create at eu.api.ovh.com/createToken, restricted to GET/POST /dedicated/server/*." },
      { key: "ovh_app_secret", label: "Application secret", type: "password" },
      { key: "ovh_consumer_key", label: "Consumer key", type: "password" },
      { key: "ovh_ssh_key_name", label: "SSH key name", hint: "The NAME of a key OVH already holds on the account - not the key itself. OVH installs it during reinstall, which is why no root password is ever needed." },
      { key: "ovh_endpoint", label: "API endpoint", hint: "MUST match the region you created the token in, or every call returns 403 with no hint why. EU: https://eu.api.ovh.com/1.0 (the default) · Canada: https://ca.api.ovh.com/1.0 · US: https://api.us.ovhcloud.com/1.0. If you signed in at auth.ca.ovhcloud.com, you need the Canada one." },
      { key: "ovh_os_template", label: "OS template", hint: "The image reinstalled onto each machine. Leave blank for the default." },
      { key: "ovh_cloud_project", label: "Public Cloud project id", hint: "The Public Cloud project (its service name, a 32-character id) that holds customers' extra-storage buckets. Free to have; storage is billed per GB as used, and a bucket is created only after a customer has paid. The API token must also cover GET/POST/DELETE /cloud/project/*. Empty means extra storage is attached by hand." },
      { key: "ovh_auto_order", label: "Buy servers automatically", hint: "Empty = off. \"preview\" prices what would be bought and buys nothing; \"on\" buys. A machine is ordered only when a paying customer is waiting (awaiting_hardware) and no delivered server is spare, one per pass, within the caps below. The customer has already paid by then, so nothing is bought before money arrives. Run preview for a day first; the orders table shows what it would have done." },
      { key: "ovh_auto_order_plans", label: "Plans to buy for Team", hint: "* (recommended) = any plan: every in-stock machine that fits is priced from the account's own OVH catalogue and the cheapest that keeps the margin floor is bought. Or list plan codes to limit the choice, e.g. 24sk102,24sys01-v1." },
      { key: "cloud_margin_floor", label: "Margin floor (%)", type: "number", hint: "Default 50. A machine leaving less than this share of a plan's revenue (after GST, Razorpay's international fee and ₹150 overhead) is never bought; the customer waits and you are told. The admin preview shows each machine's margin." },
      { key: "cloud_margin_target", label: "Margin target (%)", type: "number", hint: "Default 80. What the business aims for; shown beside the preview so you can see how far the machines in stock are from it." },
      { key: "ovh_auto_order_datacenters", label: "Datacenters", hint: "e.g. gra,rbx,sbg,bhs. Only these are considered." },
      { key: "ovh_auto_order_max_price", label: "Most to pay per Team order (optional)", hint: "Tax included, first month and setup fee, in the account's currency. Empty: the margin floor decides, and the checkout may never cost more than the catalogue says. Set it only to cap below that." },
      { key: "ovh_auto_order_max_open", label: "Orders placed but not delivered, at most", type: "number", hint: "Default 1." },
      { key: "ovh_auto_order_monthly_cap", label: "Orders in any 30 days, at most", type: "number", hint: "Default 3. The ceiling on what a bug could cost." },
      { key: "ovh_auto_order_plans_business", label: "Plans to buy for Business", hint: "* (recommended) = any plan that fits the Business minimums (64 GB class), cheapest first within the margin floor. Or list plan codes, e.g. 24sys01-v1." },
      { key: "ovh_auto_order_max_price_business", label: "Most to pay per Business order (optional)", hint: "Tax included, first month and setup fee. Empty: the margin floor decides." },
      { key: "ovh_end_idle_servers", label: "End idle machines with their paid month", hint: "Default on: a machine nobody uses is set to end when its paid month runs out, and switched back if a customer takes it first. Set off to keep every pool machine renewing." },
      { key: "ovh_keep_spare", label: "Spare machines to keep renewing", type: "number", hint: "Default 0: no machine is paid for before a customer pays. Set 1 to always have one ready (faster setup, costs a machine a month)." },
      { key: "ovh_cloud_region", label: "Object storage region", hint: "Where buckets are made, e.g. GRA, SBG, BHS. Default GRA. The bucket's endpoint follows from it (s3.gra.io.cloud.ovh.net)." },
      { key: "ovh_min_ram_mb", label: "Smallest machine: RAM (MB)", type: "number", hint: "A pooled server below this is refused before it is wiped. Default 7500, which is what an \"8 GB\" machine reports. 0 accepts anything." },
      { key: "ovh_min_disk_gb", label: "Smallest machine: disk (GB)", type: "number", hint: "Same check for disk. Default 40." },
      {
        key: "ovh_pool_servers",
        label: "Server pool",
        type: "textarea",
        hint: "DANGEROUS. Only servers named here can be claimed and REINSTALLED, which wipes them. Empty means none, and that is the safe default - your production machine is not in this list unless you put it there. Add a server's OVH name (like ns3143552.ip-51-83-42.eu) after you buy it for a waiting customer. One per line.",
      },
    ],
  },
  {
    group: "Managed hosting - Provisioning (SSH)",
    fields: [
      { key: "ssh_private_key", label: "Private key", type: "textarea", hint: "PEM, including the BEGIN and END lines. This key gets root on every customer machine. Stored securely; shown masked." },
      { key: "ssh_public_key", label: "Public key", type: "textarea", hint: "The matching public key, installed on each machine during adoption. Must be the same pair OVH holds under the SSH key name above." },
      { key: "ssh_admin_user", label: "Admin user", hint: "The unprivileged account created on each machine. Default onecamp. Root login is disabled once it exists." },
      { key: "traefik_password", label: "Dashboard password", type: "password", hint: "Protects the Traefik dashboard on every managed machine." },
    ],
  },
  {
    group: "Managed hosting - Frontend (Vercel)",
    fields: [
      { key: "vercel_api_token", label: "API token", type: "password", hint: "One Vercel project per customer workspace." },
      { key: "vercel_team_id", label: "Team ID", hint: "Leave EMPTY on a Hobby account - a team ID there makes every call fail." },
      { key: "vercel_fe_repo", label: "Frontend repo", hint: "Default OneMana-Soft/OneCamp-fe, the public OneCamp frontend." },
      { key: "vercel_fe_ref", label: "Default branch", hint: "Overridden per workspace by its edition: v2 builds the ai branch, v1 builds main." },
    ],
  },
  {
    group: "Managed hosting - Advanced",
    fields: [
      { key: "onecamp_backend_url", label: "Build download URL", hint: "Where a new machine fetches its build. Default https://backend.onemana.dev" },
      { key: "onecamp_install_dir", label: "Install directory", hint: "Where OneCamp is unpacked on a customer machine. Default /opt/onecamp" },
      { key: "build_cache_dir", label: "Build cache directory", hint: "Where built zips are kept. Leave blank to use the mounted volume - a path outside it is wiped on every deploy." },
    ],
  },
  {
    group: "Company / GST",
    fields: [
      { key: "company_name", label: "Legal Name" },
      { key: "company_gstin", label: "GSTIN" },
      { key: "company_address", label: "Address" },
      { key: "company_state", label: "State" },
      { key: "company_state_code", label: "State Code", hint: "e.g. 29 (Karnataka)" },
      { key: "company_sac", label: "SAC Code", hint: "e.g. 997331" },
      { key: "company_email", label: "Support Email" },
      { key: "company_phone", label: "Phone" },
      { key: "invoice_prefix", label: "Invoice number prefix", hint: "Default OM, e.g. OM/2026-27/0001. Max 3 chars (GST caps the full number at 16)." },
      { key: "credit_note_prefix", label: "Credit note prefix", hint: "Default CN, e.g. CN/2026-27/0001. Max 3 chars." },
    ],
  },
  {
    group: "Products (catalog)",
    fields: [
      {
        key: "product_catalog",
        label: "Product catalog",
        type: "textarea",
        hint:
          'Optional JSON for multi-product support, keyed by plan_code. Each field is optional and falls back to the company defaults above. ' +
          'Example: {"onecamp_lifetime":{"description":"OneCamp Lifetime License","sac":"997331","gst_rate":18,"price_paise":200000}}. ' +
          "Leave blank while OneCamp is the only product.",
      },
      { key: "gstr1_hsn_desc", label: "Default HSN/SAC label", hint: 'GSTR-1 HSN summary description for any SAC without a catalog entry. Default "Software/SaaS services".' },
      { key: "gstr1_hsn_uqc", label: "HSN/SAC unit code", hint: "GSTR-1 Unit Quantity Code for the HSN summary. Services use OTH. Default OTH." },
      { key: "gstr1_b2cl_threshold_paise", label: "B2C large cutoff (paise)", type: "number", hint: "GSTR-1 inter-state B2C invoices at or above this go in the B2CL table. Default 25000000 = ₹2,50,000; change only if the rule changes." },
    ],
  },
];

// Mirrors IsSecretConfigKey in the backend, and MUST keep mirroring it.
//
// The two disagreeing is not cosmetic. The backend returns a masked hint like
// "••••7f2a" for anything it considers secret; a field this side does not also
// consider secret is rendered with that hint as its VALUE, and the next Save writes
// the literal string of dots over the real credential. The old rule matched only
// keys ENDING in secret/api_key/password, so cloudflare_api_token, vercel_api_token,
// ovh_consumer_key and ssh_private_key were each one click away from being
// destroyed by the form meant to manage them.
// The explicit half, mirroring secretConfigKeys. A pattern alone is not enough:
// ovh_consumer_key contains none of the fragments below and is very much a
// credential, and the backend only knows that because it is named outright.
const ALWAYS_SECRET = new Set([
  "razorpay_key_secret",
  "razorpay_webhook_secret",
  "resend_api_key",
  "brevo_api_key",
  "github_password",
  "cloudflare_api_token",
  "vercel_api_token",
  "ovh_app_secret",
  "ovh_consumer_key",
  "ssh_private_key",
  "traefik_password",
]);
const SECRETISH = ["secret", "password", "token", "credential", "private_key", "api_key"];
const NOT_SECRET = new Set(["ovh_ssh_key_name", "ovh_pool_servers", "ovh_app_key", "ssh_public_key"]);

const isSecret = (key: string) => {
  const k = key.toLowerCase().trim();
  if (ALWAYS_SECRET.has(k)) return true;
  if (NOT_SECRET.has(k)) return false;
  return SECRETISH.some((frag) => k.includes(frag));
};

export function SettingsForm() {
  const { data, loading, error, reload } = useAsync<Record<string, string>>(() => adminApi.config());

  if (loading || error || !data)
    return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      {GROUPS.map((g) => (
        <SettingsGroup key={g.group} group={g.group} fields={g.fields} stored={data} />
      ))}
    </div>
  );
}

function SettingsGroup({ group, fields, stored }: { group: string; fields: FieldDef[]; stored: Record<string, string> }) {
  return (
    <section className="card">
      <h2 className="mb-4 font-semibold text-foreground">{group}</h2>
      <div className="space-y-4">
        {fields.map((f) => (
          <SettingField key={f.key} field={f} initial={stored[f.key] ?? ""} />
        ))}
      </div>
    </section>
  );
}

function SettingField({ field, initial }: { field: FieldDef; initial: string }) {
  const secret = isSecret(field.key);
  const [stored, setStored] = useState(initial);
  // For secrets the input starts empty (the stored value is masked); a blank
  // submit means "keep current".
  const [value, setValue] = useState(secret ? "" : initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setSaving(true);
    setErr("");
    setSaved(false);
    try {
      await adminApi.setConfig(field.key, value);
      setSaved(true);
      if (secret) {
        setStored(value ? `••••${value.slice(-4)}` : stored);
        setValue("");
      } else {
        setStored(value);
      }
      setDirty(false);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      setErr("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const onChange = (v: string) => {
    setValue(v);
    setDirty(true);
  };

  return (
    <div className="grid items-start gap-2 sm:grid-cols-[180px_1fr_auto]">
      <label htmlFor={field.key} className="pt-2 text-sm font-medium text-foreground/80">{field.label}</label>
      <div>
        {field.type === "select" ? (
          <select
            id={field.key}
            value={dirty ? value : stored || field.options?.[0] || ""}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls}
          >
            {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            id={field.key}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            spellCheck={false}
            autoComplete="off"
            // A secret textarea starts empty, exactly like a secret input, so
            // without this an already-configured private key looks unset and
            // invites someone to paste it again.
            placeholder={secret && stored ? `${stored} - leave blank to keep` : ""}
            className={`${inputCls} font-mono`}
          />
        ) : (
          <input
            id={field.key}
            type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
            value={value}
            placeholder={secret && stored ? `${stored} - leave blank to keep` : ""}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            className={inputCls}
          />
        )}
        {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
        {err && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{err}</p>}
        {(field.key === "cloud_plan_id" || field.key === "cloud_plan_id_yearly" || field.key === "cloud_plan_id_storage" || field.key === "cloud_plan_id_business") && (
          <PlanCheckLine setting={field.key} saved={saved || (!dirty && Boolean(stored || value))} />
        )}
        {field.key === "ovh_cloud_project" && <StorageCheckLine saved={saved || (!dirty && Boolean(stored || value))} />}
      </div>
      <button
        onClick={save}
        disabled={!dirty || saving}
        className="btn-ghost px-3 py-2 text-xs disabled:opacity-40"
      >
        {saving ? "…" : saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";


/**
 * Asks Razorpay what a saved plan id actually bills, and says whether that is
 * what the page describes. A plan id is an opaque string; every way it can be
 * wrong is otherwise discovered by the first customer, in the payment modal.
 */
/** Under the Public Cloud project id: can the token see it, and where would buckets go. */
function StorageCheckLine({ saved }: { saved: boolean }) {
  const [state, setState] = useState<{ kind: "idle" } | { kind: "busy" } | { kind: "ok"; check: StorageCheck } | { kind: "err"; msg: string }>({ kind: "idle" });
  if (!saved) return null;
  return (
    <div className="mt-1 text-xs">
      <button
        type="button"
        onClick={async () => {
          setState({ kind: "busy" });
          try {
            setState({ kind: "ok", check: await adminApi.checkStorage() });
          } catch (e) {
            setState({ kind: "err", msg: e instanceof Error ? e.message : "could not check" });
          }
        }}
        className="underline underline-offset-2 text-muted-foreground hover:text-foreground"
      >
        {state.kind === "busy" ? "Asking OVH…" : "Check the token can reach this project"}
      </button>
      {state.kind === "ok" && (
        <p className={`mt-1 ${state.check.problems.length ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
          {state.check.problems.length
            ? state.check.problems.join("; ")
            : `Ready: buckets will be made in ${state.check.region} (${state.check.endpoint}). Projects the token sees: ${state.check.visible_projects.join(", ") || "none"}.`}
        </p>
      )}
      {state.kind === "ok" && (state.check.key_missing?.length ?? 0) > 0 && (
        <p className="mt-1 text-amber-700 dark:text-amber-400">
          The key cannot yet {state.check.awaiting_approval ? "(approval pending) " : ""}buy or retire machines. Missing:{" "}
          {state.check.key_missing?.join(", ")}.
        </p>
      )}
      {state.kind === "ok" && (!state.check.configured || (state.check.key_missing?.length ?? 0) > 0) && (
        <button
          type="button"
          onClick={async () => {
            try {
              const link = await adminApi.requestCloudAccess();
              window.open(link, "_blank", "noopener");
              setState({ kind: "err", msg: "Approve the request in the OVH tab that opened, then press the check again. The backend switches to the new key on its own." });
            } catch (e) {
              setState({ kind: "err", msg: e instanceof Error ? e.message : "could not ask OVH" });
            }
          }}
          className="mt-1 block underline underline-offset-2 text-foreground"
        >
          Grant OVH access: storage, buying and retiring machines (one click at OVH)
        </button>
      )}
      {state.kind === "err" && <p className="mt-1 text-red-600 dark:text-red-400">{state.msg}</p>}
    </div>
  );
}

function PlanCheckLine({ setting, saved }: { setting: "cloud_plan_id" | "cloud_plan_id_yearly" | "cloud_plan_id_storage" | "cloud_plan_id_business"; saved: boolean }) {
  const [state, setState] = useState<{ kind: "idle" } | { kind: "busy" } | { kind: "ok"; check: PlanCheck } | { kind: "err"; msg: string }>({ kind: "idle" });
  if (!saved) return null;
  return (
    <div className="mt-1 text-xs">
      <button
        type="button"
        onClick={async () => {
          setState({ kind: "busy" });
          try {
            setState({ kind: "ok", check: await adminApi.checkPlan(setting) });
          } catch (e) {
            setState({ kind: "err", msg: e instanceof Error ? e.message : "could not check the plan" });
          }
        }}
        className="underline underline-offset-2 text-muted-foreground hover:text-foreground"
      >
        {state.kind === "busy" ? "Asking Razorpay…" : "Check this plan against the page"}
      </button>
      {state.kind === "ok" && (
        <p className={`mt-1 ${state.check.problems.length ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
          {state.check.summary}
          {state.check.problems.length ? ` · ${state.check.problems.join("; ")}` : " · matches the page"}
        </p>
      )}
      {state.kind === "err" && <p className="mt-1 text-red-600 dark:text-red-400">{state.msg}</p>}
    </div>
  );
}
