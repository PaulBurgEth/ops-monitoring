// Weekly report entry point: run all collectors, build the report, email it.
import { loadConfig } from './lib/config.js';
import { sendEmail } from './lib/email.js';
import { buildWeekly } from './report/build-weekly.js';

import * as github from './collectors/github.js';
import * as vercel from './collectors/vercel.js';
import * as uptime from './collectors/uptime.js';
import * as sentry from './collectors/sentry.js';
import * as pagespeed from './collectors/pagespeed.js';
import * as gsc from './collectors/gsc.js';
import * as ga4 from './collectors/ga4.js';
import * as ahrefs from './collectors/ahrefs-email.js';

const COLLECTORS = [github, vercel, uptime, sentry, pagespeed, gsc, ga4, ahrefs];

async function run(mod, ctx) {
  try {
    const r = await mod.collect(ctx);
    return { id: mod.id, label: mod.label, ...r };
  } catch (e) {
    console.error(`[${mod.id}] failed:`, e.message);
    return { id: mod.id, label: mod.label, configured: false, note: `error: ${e.message}`, perProject: {} };
  }
}

async function main() {
  const { cfg, projects } = loadConfig();
  const ctx = { cfg, projects };
  const sources = [];
  for (const mod of COLLECTORS) sources.push(await run(mod, ctx));

  const report = buildWeekly({ projects, sources });
  console.log(report.text);

  const result = await sendEmail({
    from: cfg.reportFrom,
    to: cfg.reportTo,
    subject: report.subject,
    html: report.html,
    text: report.text,
  });
  console.log('[weekly] email:', JSON.stringify(result));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
