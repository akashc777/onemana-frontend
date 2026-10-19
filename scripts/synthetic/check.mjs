#!/usr/bin/env node
// om-synthetic.mjs: is onemana.dev working for a visitor right now?
//
// Two kinds of check, both read-only (nothing is submitted, nobody is signed in,
// no customer data is read):
//   http    the key pages and API routes answer, AND carry their real content:
//           the price the API quotes is the price the pricing page shows, the docs
//           and blog list their entries, the API's gates answer 401, CORS lets the
//           storefront in, www.onemana.dev reaches the site.
//   render  key pages in Chromium at 390 px (a phone) and 1280 px, light and dark:
//           no page error, the main heading is visible in the first screen and is
//           the element actually on top at its centre (an open menu or overlay
//           covering the page fails this; HTTP 200 does not), its text is readable
//           against its background, and nothing scrolls sideways on a phone.
//
// Usage:
//   node om-synthetic.mjs [--base URL] [--api URL] [--no-http] [--no-api] [--render]
//                         [--pages /,/pricing] [--retry SECONDS] [--json FILE]
// --render needs Playwright: PLAYWRIGHT_MODULE=<path to playwright/index.mjs>, or
// `playwright` resolvable from here. Exit 0 = all passed, 1 = a check failed,
// 2 = the checker itself could not run.
//
// A failed check is retried once after --retry seconds (default 20) before it
// counts, so a single dropped request does not page anyone; a real outage
// fails both times.

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : dflt;
};
const flag = (name) => args.includes(`--${name}`);
const BASE = opt('base', 'https://onemana.dev').replace(/\/$/, '');
const API = opt('api', 'https://backend.onemana.dev').replace(/\/$/, '');
const DO_HTTP = !flag('no-http');
const DO_API = !flag('no-api');
const DO_RENDER = flag('render');
const RETRY_S = Number(opt('retry', '20'));
const JSON_OUT = opt('json', '');
const RENDER_PAGES = opt('pages', '/,/pricing,/buy,/docs').split(',').filter(Boolean);
const UA = 'onemana-synthetic/1 (+https://onemana.dev; uptime check)';
const isProd = /^https:\/\/onemana\.dev$/.test(BASE);

async function get(url, init = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20000);
  try {
    const res = await fetch(url, { redirect: 'manual', ...init, signal: ctl.signal, headers: { 'user-agent': UA, ...(init.headers || {}) } });
    const body = init.method === 'OPTIONS' || init.method === 'HEAD' ? '' : await res.text();
    return { status: res.status, headers: res.headers, body };
  } finally {
    clearTimeout(t);
  }
}

const must = (cond, msg) => { if (!cond) throw new Error(msg); };
const count = (s, re) => (s.match(re) || []).length;
const json = (r) => { try { return JSON.parse(r.body); } catch { throw new Error(`not JSON (${r.status}): ${r.body.slice(0, 80)}`); } };

// Each check returns a short detail on success and throws with the reason on failure.
let pricing = null;
const httpChecks = [];
if (DO_API) {
  httpChecks.push(
    ['api pricing quotes a lifetime price in rupees', async () => {
      const r = await get(`${API}/onecamp/pricing`);
      must(r.status === 200, `HTTP ${r.status}`);
      const d = json(r).data || {};
      must(Number(d.lifetime_inr) > 0, 'no lifetime_inr');
      pricing = d;
      return `₹${d.lifetime_inr}`;
    }],
    ['api docs lists published guides', async () => {
      const r = await get(`${API}/onecamp/docs`);
      must(r.status === 200, `HTTP ${r.status}`);
      const n = (json(r).data || []).length;
      must(n >= 5, `${n} guides`);
      return `${n} guides`;
    }],
    ['api blog lists posts', async () => {
      const r = await get(`${API}/onecamp/blog`);
      must(r.status === 200, `HTTP ${r.status}`);
      const n = (json(r).data || []).length;
      must(n >= 3, `${n} posts`);
      return `${n} posts`;
    }],
    ['api releases names the newest of each line', async () => {
      const r = await get(`${API}/onecamp/releases`);
      must(r.status === 200, `HTTP ${r.status}`);
      const l = (json(r).data || {}).latest_by_line || {};
      must(/^v2\./.test(l.v2 || ''), `v2 is ${l.v2}`);
      return `${l.v2} ${l.v1 || ''}`.trim();
    }],
    ['api portal editions (public)', async () => {
      const r = await get(`${API}/onecamp/portal/editions`);
      must(r.status === 200 && (json(r).data || []).length > 0, `HTTP ${r.status}`);
      return 'ok';
    }],
    // 401, not 503: the session gate read the database and found nobody.
    ['api portal refuses a visitor with no session (401)', async () => {
      const r = await get(`${API}/onecamp/portal/me`);
      must(r.status === 401, `HTTP ${r.status}, want 401`);
      return '401';
    }],
    ['api admin refuses without the token (401)', async () => {
      const r = await get(`${API}/onecamp/admin/whoami`);
      must(r.status === 401, `HTTP ${r.status}, want 401`);
      return '401';
    }],
    ['api CORS lets the storefront sign in', async () => {
      const r = await get(`${API}/onecamp/portal/request-code`, { method: 'OPTIONS', headers: { origin: 'https://onemana.dev', 'access-control-request-method': 'POST', 'access-control-request-headers': 'content-type' } });
      must(r.headers.get('access-control-allow-origin') === 'https://onemana.dev', `allow-origin ${r.headers.get('access-control-allow-origin')}`);
      must(r.headers.get('access-control-allow-credentials') === 'true', 'no credentials');
      return 'ok';
    }],
  );
}
// clientOnly: the page draws its heading in the browser (the account screen).
const page = (path, test, clientOnly = false) => [`page ${path}`, async () => {
  const r = await get(`${BASE}${path}`);
  must(r.status === 200, `HTTP ${r.status}`);
  must(!/<title>[^<]*(Application error|404|500)/i.test(r.body), 'error title');
  must(clientOnly || /<h1[\s>]/.test(r.body), 'no <h1> in the HTML');
  return test(r.body) || 'ok';
}];
const priceShown = (html) => {
  if (!pricing) return 'price not compared (no API read)';
  const inr = Number(pricing.lifetime_inr).toLocaleString('en-IN');
  must(html.includes(inr), `the API's ₹${inr} is not on the page`);
  return `shows ₹${inr}`;
};
httpChecks.push(
  page('/', (h) => { must(count(h, /href="\/docs\//g) >= 3, 'no docs links'); }),
  page('/pricing', priceShown),
  page('/buy', priceShown),
  page('/free', () => {}),
  page('/docs', (h) => { const n = count(h, /href="\/docs\/[a-z0-9-]+"/g); must(n >= 10, `${n} guide links`); return `${n} guide links`; }),
  page('/docs/installation', (h) => { must(/curl|install/i.test(h), 'no install text'); }),
  page('/blog', (h) => { const n = count(h, /href="\/blog\/[a-z0-9-]+"/g); must(n >= 5, `${n} post links`); return `${n} post links`; }),
  page('/changelog', (h) => { const n = count(h, /href="\/changelog\/20/g); must(n >= 3, `${n} entries`); return `${n} entries`; }),
  page('/compare', () => {}),
  page('/for/india', () => {}),
  page('/account', (h) => { must(/<title>[^<]*Account/i.test(h), 'not the account page'); }, true),
);
if (isProd) {
  httpChecks.push(['www.onemana.dev reaches the site', async () => {
    const r = await get('https://www.onemana.dev/pricing');
    must([301, 308].includes(r.status), `HTTP ${r.status}${r.status === 526 ? ' (Cloudflare: no valid certificate at the origin)' : ''}`);
    must((r.headers.get('location') || '').startsWith('https://onemana.dev/pricing'), `sent to ${r.headers.get('location')}`);
    return `${r.status} → ${r.headers.get('location')}`;
  }]);
}

async function runHttp() {
  const out = [];
  for (const [name, fn] of httpChecks) {
    const t0 = Date.now();
    try { const detail = String(await fn()); out.push({ kind: 'http', name, ok: true, ms: Date.now() - t0, detail }); }
    catch (e) { out.push({ kind: 'http', name, ok: false, ms: Date.now() - t0, detail: e.name === 'AbortError' ? 'timed out after 20 s' : e.message }); }
  }
  return out;
}

async function loadPlaywright() {
  const p = process.env.PLAYWRIGHT_MODULE;
  try { return p ? await import(p) : await import('playwright'); }
  catch (e) { console.error(`render: cannot load Playwright (${e.message}); set PLAYWRIGHT_MODULE`); process.exit(2); }
}

// Runs in the page: is the main heading what a visitor sees?
function headingVisible() {
  const h = document.querySelector('main h1') || document.querySelector('h1');
  if (!h) return { ok: false, why: 'no h1' };
  const r = h.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  if (r.width < 4 || r.height < 4) return { ok: false, why: `h1 is ${Math.round(r.width)}x${Math.round(r.height)}` };
  if (r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return { ok: false, why: `h1 is outside the first screen (top ${Math.round(r.top)} of ${vh})` };
  const cs = getComputedStyle(h);
  if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.1) return { ok: false, why: `h1 visibility ${cs.visibility} opacity ${cs.opacity}` };
  // What is on top at points across the heading's first line.
  const y = Math.min(Math.max(r.top + Math.min(r.height, 40) / 2, 1), vh - 1);
  const xs = [0.2, 0.5, 0.8].map((f) => Math.min(Math.max(r.left + r.width * f, 1), vw - 1));
  const covered = [];
  for (const x of xs) {
    const top = document.elementFromPoint(x, y);
    if (!top || !(h === top || h.contains(top) || top.contains(h))) {
      covered.push(top ? `${top.tagName.toLowerCase()}${top.id ? '#' + top.id : ''}${typeof top.className === 'string' && top.className ? '.' + top.className.trim().split(/\s+/).slice(0, 3).join('.') : ''}` : 'nothing');
    }
  }
  if (covered.length >= 2) return { ok: false, why: `h1 is covered by ${[...new Set(covered)].join(', ')}` };
  // Readable: text colour against the first opaque background behind it.
  const rgba = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const fg = rgba(cs.color);
  let bg = null;
  let gradient = false;
  for (let el = h; el; el = el.parentElement) {
    const s = getComputedStyle(el);
    if (s.backgroundImage && s.backgroundImage !== 'none') gradient = true;
    const c = rgba(s.backgroundColor);
    if (c && c.a > 0.9) { bg = c; break; }
  }
  bg = bg || rgba(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  let contrast = null;
  if (fg && fg.a > 0.5 && !gradient) {
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    contrast = (a + 0.05) / (b + 0.05);
    if (contrast < 2) return { ok: false, why: `h1 contrast ${contrast.toFixed(2)} (${cs.color} on ${JSON.stringify(bg)})` };
  }
  const sideways = document.documentElement.scrollWidth - vw;
  if (vw < 600 && sideways > 2) return { ok: false, why: `the page scrolls sideways by ${sideways}px` };
  return { ok: true, why: `"${h.innerText.trim().slice(0, 40)}"${contrast ? ` contrast ${contrast.toFixed(1)}` : ''}` };
}

async function runRender() {
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch();
  const out = [];
  const shapes = [
    { tag: '390', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    { tag: '1280', viewport: { width: 1280, height: 860 } },
  ];
  try {
    for (const scheme of ['light', 'dark']) {
      for (const s of shapes) {
        const { tag, ...shape } = s;
        const ctx = await browser.newContext({ ...shape, colorScheme: scheme, userAgent: undefined });
        for (const path of RENDER_PAGES) {
          const name = `render ${path} ${tag} ${scheme}`;
          const t0 = Date.now();
          const pg = await ctx.newPage();
          const errors = [];
          pg.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
          try {
            const resp = await pg.goto(BASE + path, { waitUntil: 'load', timeout: 45000 });
            must(resp && resp.status() === 200, `HTTP ${resp && resp.status()}`);
            await pg.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
            await pg.waitForTimeout(500); // hydration and the theme script settle
            const v = await pg.evaluate(headingVisible);
            must(v.ok, v.why);
            must(errors.length === 0, `page error: ${errors[0]}`);
            if (path === '/buy') {
              // The hand-off to payment: Razorpay's script must be there before anyone presses Pay.
              const rzp = await pg.waitForFunction(() => typeof window.Razorpay === 'function', null, { timeout: 10000 }).then(() => 'function', () => 'missing');
              must(rzp === 'function', 'Razorpay checkout.js did not load: Pay would do nothing');
            }
            out.push({ kind: 'render', name, ok: true, ms: Date.now() - t0, detail: v.why });
          } catch (e) {
            out.push({ kind: 'render', name, ok: false, ms: Date.now() - t0, detail: e.message.split('\n')[0].slice(0, 200) });
          }
          await pg.close();
        }
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }
  return out;
}

async function runAll() {
  const results = [];
  if (DO_HTTP) results.push(...(await runHttp()));
  if (DO_RENDER) results.push(...(await runRender()));
  return results;
}

let results = await runAll();
let failed = results.filter((r) => !r.ok);
if (failed.length && RETRY_S > 0) {
  console.log(`${failed.length} failed; checking again in ${RETRY_S} s`);
  await new Promise((r) => setTimeout(r, RETRY_S * 1000));
  const again = await runAll();
  // A check fails only if it failed both times.
  const second = new Map(again.map((r) => [r.name, r]));
  results = results.map((r) => (r.ok ? r : second.get(r.name) || r));
  failed = results.filter((r) => !r.ok);
}
for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name} (${r.ms} ms): ${r.detail}`);
const summary = { base: BASE, api: DO_API ? API : null, at: new Date().toISOString(), passed: results.length - failed.length, failed: failed.length, results };
if (JSON_OUT) (await import('node:fs')).writeFileSync(JSON_OUT, JSON.stringify(summary, null, 2));
console.log(`${failed.length ? 'FAILED' : 'PASSED'}: ${summary.passed} of ${results.length} checks passed against ${BASE}`);
process.exit(failed.length ? 1 : 0);
