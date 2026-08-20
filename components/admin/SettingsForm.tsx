"use client";

import { useState } from "react";
import { adminApi } from "@/lib/adminApi";
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
    group: "Pricing (admin-editable)",
    fields: [
      { key: "onecamp_price", label: "Lifetime price (paise)", type: "number", hint: "200000 = ₹2,000 - the amount charged in INR (GST-inclusive)" },
      { key: "onecamp_price_usd", label: "Lifetime price (USD)", type: "number", hint: "Display only, shown prominently. e.g. 19" },
      { key: "cloud_price", label: "Cloud price (paise/mo)", type: "number", hint: "1000000 = ₹10,000 - invoice amount (charge follows the Razorpay plan)" },
      { key: "cloud_price_usd", label: "Cloud price (USD/mo)", type: "number", hint: "Display only. e.g. 99" },
      { key: "cloud_seats", label: "Cloud seats", type: "number", hint: "Users included in the Cloud plan, e.g. 30" },
      { key: "cloud_plan_id", label: "Razorpay Cloud Plan ID", hint: "plan_… created in Razorpay (INR). Required for Cloud checkout." },
      { key: "owner_email", label: "Owner alert email", hint: "Where new-Cloud-order notifications are sent." },
      { key: "gst_rate", label: "GST Rate (%)", type: "number" },
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
    group: "Managed hosting - Servers (OVH)",
    fields: [
      { key: "ovh_app_key", label: "Application key", hint: "Create at eu.api.ovh.com/createToken, restricted to GET/POST /dedicated/server/*." },
      { key: "ovh_app_secret", label: "Application secret", type: "password" },
      { key: "ovh_consumer_key", label: "Consumer key", type: "password" },
      { key: "ovh_ssh_key_name", label: "SSH key name", hint: "The NAME of a key OVH already holds on the account - not the key itself. OVH installs it during reinstall, which is why no root password is ever needed." },
      { key: "ovh_endpoint", label: "API endpoint", hint: "Default https://eu.api.ovh.com/1.0" },
      { key: "ovh_os_template", label: "OS template", hint: "The image reinstalled onto each machine. Leave blank for the default." },
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
