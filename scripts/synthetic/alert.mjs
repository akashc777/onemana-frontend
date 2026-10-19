#!/usr/bin/env node
// alert.mjs <result.json> <state.json>: decides whether a synthetic run is news,
// emails it through Resend when it is, and records what was sent.
//
// News is: the first failing run, the same failure again every REMIND_MIN
// minutes while it lasts, and the first passing run after a failure. A passing
// run after a passing run is not news. That keeps a long outage to a handful of
// emails (Resend's free tier is 100 a day, shared with every customer email).
//
// Exit 1 when this run is news and failing, so the workflow goes red at exactly
// those runs and GitHub's own failed-run email is a second channel that needs no
// secret at all. Exit 0 otherwise, including "still failing, already told".
//
// Environment (repository secrets; without them only GitHub's email goes out):
//   RESEND_API_KEY   a Resend key that can send from onemana.dev
//   ALERT_EMAIL_TO   where alerts go
//   ALERT_EMAIL_FROM default "OneMana <noreply@onemana.dev>"
//   REMIND_MIN       default 30
import fs from 'node:fs';

const [resultPath, statePath] = process.argv.slice(2);
const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
let state = {};
try { state = JSON.parse(fs.readFileSync(statePath, 'utf8')); } catch { /* first run */ }

const now = Date.now();
const remindMs = Number(process.env.REMIND_MIN || 30) * 60_000;
const failing = result.failed > 0;
const failedNames = result.results.filter((r) => !r.ok).map((r) => r.name);

let notice = '';
if (failing && !state.failing) notice = 'failed';
else if (failing && now - (state.alertedAt || 0) >= remindMs) notice = 'still failing';
else if (!failing && state.failing) notice = 'recovered';

const next = {
  failing,
  since: failing ? (state.failing ? state.since : result.at) : null,
  alertedAt: notice ? now : state.alertedAt || 0,
  last: result.at,
};
fs.writeFileSync(statePath, JSON.stringify(next));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : '';
let subject = '';
let html = '';
if (notice === 'recovered') {
  subject = `✅ onemana.dev works again (${result.passed} checks passed)`;
  html = `<p>Every check passed at ${esc(result.at)}. It had been failing since ${esc(state.since || 'an earlier run')}.</p>`;
} else if (notice) {
  subject = `❌ onemana.dev: ${failedNames.length} of ${result.results.length} checks ${notice === 'failed' ? 'failed' : 'still failing'}: ${failedNames.slice(0, 3).join(', ')}`.slice(0, 180);
  html = `<p>${notice === 'failed' ? 'A visitor would see this now.' : `Still failing since ${esc(next.since)}.`} Each check failed twice, 20 seconds apart.</p><ul>` +
    result.results.filter((r) => !r.ok).map((r) => `<li><strong>${esc(r.name)}</strong>: ${esc(r.detail)}</li>`).join('') + '</ul>';
}
if (runUrl && html) html += `<p><a href="${runUrl}">The run</a></p>`;

if (notice) {
  console.log(`notice: ${notice}: ${subject}`);
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;
  if (key && to) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: process.env.ALERT_EMAIL_FROM || 'OneMana <noreply@onemana.dev>',
        to: [to],
        subject,
        html,
        tags: [{ name: 'kind', value: 'synthetic_alert' }],
      }),
    });
    console.log(`resend: HTTP ${res.status}`);
    if (!res.ok) console.log((await res.text()).slice(0, 200));
  } else {
    console.log('resend: not configured (RESEND_API_KEY, ALERT_EMAIL_TO); GitHub\'s failed-run email is the alert');
  }
} else {
  console.log(failing ? `still failing since ${next.since}; told at ${new Date(next.alertedAt).toISOString()}` : 'all passed');
}
process.exit(failing && notice ? 1 : 0);
