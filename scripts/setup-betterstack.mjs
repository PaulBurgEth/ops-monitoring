// Idempotently create Better Stack HTTP uptime monitors for all configured sites.
// Requires BETTERSTACK_API_TOKEN. Safe to re-run (skips hosts already monitored).
// Usage: BETTERSTACK_API_TOKEN=... node scripts/setup-betterstack.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(__dirname, '../src/config/projects.json'), 'utf8'));
const TOKEN = process.env.BETTERSTACK_API_TOKEN;
if (!TOKEN) { console.error('BETTERSTACK_API_TOKEN not set'); process.exit(1); }
const API = 'https://uptime.betterstack.com/api/v2';
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'ops-monitoring' };

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: res.status, json };
}

const existing = await api('GET', '/monitors?per_page=50');
const have = new Set((existing.json?.data || []).map((m) => m.attributes?.url));

for (const p of cfg.projects) {
  const url = p.uptimeUrl || p.site;
  if (have.has(url)) { console.log(`exists  ${url}`); continue; }
  const r = await api('POST', '/monitors', {
    monitor_type: 'status',          // expect 2xx/3xx
    url,
    pronounceable_name: p.name,
    email: true,                     // email on down (to the account's on-call email)
    check_frequency: 180,            // 3 min (free tier)
    request_timeout: 15,
    confirmation_period: 60,
    regions: ['us', 'eu'],
  });
  console.log(`${r.status === 201 ? 'created' : 'FAIL ' + r.status} ${url}`);
}
console.log(`\nEnsure the Better Stack account's notification email is ${cfg.reportTo} (or add it as an on-call contact).`);
