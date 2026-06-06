// Urgent alert: CI red on main. Stateless de-dupe — only alerts on failing runs created
// within WINDOW_MIN (matches the cron interval), so a persistent failure isn't re-sent every run.
import { loadConfig } from './lib/config.js';
import { hasSecret } from './lib/env.js';
import { sendEmail } from './lib/email.js';
import { escapeHtml } from './lib/format.js';
import { latestMainRun } from './collectors/github.js';

const WINDOW_MIN = Number(process.env.WINDOW_MIN || 20);

async function main() {
  if (!hasSecret('GH_MONITOR_PAT')) {
    console.log('[ci-watch] GH_MONITOR_PAT not set — skipping');
    return;
  }
  const { cfg, projects } = loadConfig();
  const cutoff = Date.now() - WINDOW_MIN * 60000;
  const failing = [];
  for (const p of projects) {
    try {
      const run = await latestMainRun(p.primaryRepo);
      const failed = run.conclusion === 'failure' || run.conclusion === 'timed_out';
      const recent = run.createdAt && Date.parse(run.createdAt) >= cutoff;
      if (failed && recent) failing.push({ project: p.name, repo: p.primaryRepo, run });
    } catch (e) {
      console.error(`[ci-watch] ${p.primaryRepo}: ${e.message}`);
    }
  }
  if (!failing.length) {
    console.log('[ci-watch] no new failures');
    return;
  }
  const html = `<h3>🔴 CI failed on main</h3><ul>${failing
    .map((f) => `<li><b>${escapeHtml(f.project)}</b> (${escapeHtml(f.repo)}) — ${escapeHtml(f.run.name || 'CI')} <a href="${f.run.url}">run ${f.run.sha}</a></li>`)
    .join('')}</ul>`;
  await sendEmail({
    from: cfg.reportFrom,
    to: cfg.reportTo,
    subject: `🔴 CI red on main — ${failing.map((f) => f.project).join(', ')}`,
    html,
    text: failing.map((f) => `${f.project} (${f.repo}): ${f.run.url}`).join('\n'),
  });
  console.log(`[ci-watch] alerted on ${failing.length} failure(s)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
