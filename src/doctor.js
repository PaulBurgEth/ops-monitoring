// Diagnostics: prints which secrets are present (never the values) and the project list.
import { loadConfig } from './lib/config.js';
import { hasSecret } from './lib/env.js';

const SECRETS = [
  'GH_MONITOR_PAT',
  'VERCEL_TOKEN',
  'PAGESPEED_API_KEY',
  'SENTRY_AUTH_TOKEN',
  'BETTERSTACK_API_TOKEN',
  'RESEND_API_KEY',
  'GCP_SA_JSON',
  'GMAIL_OAUTH',
];

const { cfg, projects } = loadConfig();
console.log('Secrets present:');
for (const s of SECRETS) console.log(`  ${hasSecret(s) ? '✅' : '— '} ${s}`);
console.log(`\nReport: ${cfg.reportFrom} -> ${cfg.reportTo}`);
console.log(`Projects (${projects.length}): ${projects.map((p) => p.key).join(', ')}`);
