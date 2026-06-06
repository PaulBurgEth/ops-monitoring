// Urgent alert: production deploy failure on Vercel. Same window-based de-dupe as ci-watch.
import { loadConfig } from './lib/config.js';
import { hasSecret } from './lib/env.js';
import { sendEmail } from './lib/email.js';
import { escapeHtml } from './lib/format.js';
import { latestProdDeployment } from './collectors/vercel.js';

const WINDOW_MIN = Number(process.env.WINDOW_MIN || 20);

async function main() {
  if (!hasSecret('VERCEL_TOKEN')) {
    console.log('[deploy-watch] VERCEL_TOKEN not set — skipping');
    return;
  }
  const { cfg, projects } = loadConfig();
  const cutoff = Date.now() - WINDOW_MIN * 60000;
  const failed = [];
  for (const p of projects) {
    if (!p.vercelProject) continue;
    try {
      const d = await latestProdDeployment(p.vercelProject, cfg.vercelTeam);
      if (d && d.state === 'ERROR' && d.created && d.created >= cutoff) {
        failed.push({ project: p.name, vercelProject: p.vercelProject, d });
      }
    } catch (e) {
      console.error(`[deploy-watch] ${p.vercelProject}: ${e.message}`);
    }
  }
  if (!failed.length) {
    console.log('[deploy-watch] no new prod deploy failures');
    return;
  }
  const html = `<h3>🔴 Production deploy failed</h3><ul>${failed
    .map((f) => `<li><b>${escapeHtml(f.project)}</b> — ${escapeHtml(f.vercelProject)} (state ERROR) <a href="https://${f.d.url}">${escapeHtml(f.d.url || '')}</a></li>`)
    .join('')}</ul>`;
  await sendEmail({
    from: cfg.reportFrom,
    to: cfg.reportTo,
    subject: `🔴 Prod deploy failed — ${failed.map((f) => f.project).join(', ')}`,
    html,
    text: failed.map((f) => `${f.project}: ${f.vercelProject} ERROR`).join('\n'),
  });
  console.log(`[deploy-watch] alerted on ${failed.length} failure(s)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
