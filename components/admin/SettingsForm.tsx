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

const isSecret = (key: string) => key.endsWith("secret") || key.endsWith("api_key") || key.endsWith("password");

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
