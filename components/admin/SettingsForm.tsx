"use client";

import { useState } from "react";
import { adminApi } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { AsyncState } from "./ui";

type FieldType = "text" | "password" | "number" | "select";
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
    group: "Pricing",
    fields: [
      { key: "onecamp_price", label: "Price (paise)", type: "number", hint: "149900 = ₹1,499 (GST-inclusive)" },
      { key: "gst_rate", label: "GST Rate (%)", type: "number" },
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
    ],
  },
];

const isSecret = (key: string) => key.endsWith("secret") || key.endsWith("api_key");

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
      <h2 className="mb-4 font-semibold text-ink">{group}</h2>
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
      <label htmlFor={field.key} className="pt-2 text-sm font-medium text-slate-700">{field.label}</label>
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
        ) : (
          <input
            id={field.key}
            type={field.type === "password" ? "password" : field.type === "number" ? "number" : "text"}
            value={value}
            placeholder={secret && stored ? `${stored} — leave blank to keep` : ""}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            className={inputCls}
          />
        )}
        {field.hint && <p className="mt-1 text-xs text-slate-400">{field.hint}</p>}
        {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
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
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
