// Idempotently create Sentry projects + alert rules for all configured projects under one org/team.
// Requires SENTRY_AUTH_TOKEN in env. Safe to re-run (handles "already exists").
// Usage: SENTRY_AUTH_TOKEN=... node scripts/setup-sentry.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(__dirname, '../src/config/projects.json'), 'utf8'));
const TOKEN = process.env.SENTRY_AUTH_TOKEN;
if (!TOKEN) {
  console.error('SENTRY_AUTH_TOKEN not set');
  process.exit(1);
}
const ORG = cfg.sentryOrg;
const TEAM = cfg.sentryTeam;
const REPORT_TO = cfg.reportTo;
const API = 'https://sentry.io/api/0';
const H = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'ops-monitoring' };

const PLATFORM = {
  regenbazaar: 'javascript-nextjs',
  vitacrypt: 'javascript-nextjs',
  helprentphangan: 'python-django',
  paulburg: 'javascript-nextjs',
  ecosynthesisx: 'javascript',
  degencurecenter: 'javascript',
  decleanup: 'javascript-react',
};

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  return { status: res.status, json };
}

async function ensureProject(slug, platform) {
  const get = await api('GET', `/projects/${ORG}/${slug}/`);
  if (get.status === 200) return { created: false };
  const create = await api('POST', `/teams/${ORG}/${TEAM}/projects/`, { name: slug, slug, platform });
  if (create.status === 201) return { created: true };
  if (create.status === 409) return { created: false };
  throw new Error(`create ${slug}: ${create.status} ${JSON.stringify(create.json).slice(0, 200)}`);
}

async function getDsn(slug) {
  const keys = await api('GET', `/projects/${ORG}/${slug}/keys/`);
  return keys.json?.[0]?.dsn?.public || null;
}

async function ensureRules(slug) {
  const existing = await api('GET', `/projects/${ORG}/${slug}/rules/`);
  const names = Array.isArray(existing.json) ? existing.json.map((r) => r.name) : [];
  const mail = { id: 'sentry.mail.actions.NotifyEmailAction', targetType: 'IssueOwners', fallthroughType: 'ActiveMembers' };
  if (!names.includes('New issue → email')) {
    await api('POST', `/projects/${ORG}/${slug}/rules/`, {
      name: 'New issue → email',
      actionMatch: 'all', filterMatch: 'all', frequency: 30,
      conditions: [{ id: 'sentry.rules.conditions.first_seen_event.FirstSeenEventCondition' }],
      actions: [mail], filters: [],
    });
  }
  if (!names.includes('Error spike → email')) {
    await api('POST', `/projects/${ORG}/${slug}/rules/`, {
      name: 'Error spike → email',
      actionMatch: 'all', filterMatch: 'all', frequency: 60,
      conditions: [{ id: 'sentry.rules.conditions.event_frequency.EventFrequencyCondition', interval: '1h', value: 50, comparisonType: 'count' }],
      actions: [mail], filters: [],
    });
  }
}

const out = [];
for (const p of cfg.projects) {
  const slug = p.sentryProject;
  const platform = PLATFORM[slug] || 'other';
  try {
    const r = await ensureProject(slug, platform);
    await ensureRules(slug);
    const dsn = await getDsn(slug);
    out.push({ project: p.key, sentry: slug, created: r.created, dsn });
    console.log(`${r.created ? 'created' : 'exists '} ${slug.padEnd(16)} dsn=${dsn ? dsn.slice(0, 40) + '…' : 'n/a'}`);
  } catch (e) {
    console.error(`FAIL ${slug}: ${e.message}`);
  }
}
console.log('\nDSNs (for per-app SENTRY_DSN secrets):');
for (const o of out) console.log(`  ${o.project}: ${o.dsn || 'n/a'}`);
console.log(`\nAlert emails go to org members; ensure ${REPORT_TO} is an org member with mail alerts on.`);
