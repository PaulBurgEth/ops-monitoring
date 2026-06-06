// Sentry collector: unresolved issues + new-in-7d count per project (org-scoped).
import { getSecret, hasSecret } from '../lib/env.js';
import { getJson } from '../lib/http.js';

export const id = 'sentry';
export const label = 'Errors (Sentry)';
export const requires = ['SENTRY_AUTH_TOKEN'];

function sHeaders() {
  return { Authorization: `Bearer ${getSecret('SENTRY_AUTH_TOKEN')}`, 'User-Agent': 'ops-monitoring' };
}

export async function projectIssues(org, project) {
  // Unresolved issues seen in the last 14 days; we then split new-in-7d locally.
  const q = new URLSearchParams({ query: 'is:unresolved', statsPeriod: '14d', limit: '100' });
  const url = `https://sentry.io/api/0/projects/${org}/${project}/issues/?${q}`;
  return getJson(url, { headers: sHeaders() });
}

export async function collect({ projects, cfg }) {
  if (!hasSecret('SENTRY_AUTH_TOKEN')) return { configured: false, note: 'SENTRY_AUTH_TOKEN not set', perProject: {} };
  const org = cfg.sentryOrg;
  const weekAgo = Date.now() - 7 * 864e5;
  const perProject = {};
  for (const p of projects) {
    try {
      const issues = await projectIssues(org, p.sentryProject);
      if (!Array.isArray(issues)) {
        perProject[p.key] = { level: 'na', summary: 'project not found', detail: {} };
        continue;
      }
      const newCount = issues.filter((i) => i.firstSeen && Date.parse(i.firstSeen) >= weekAgo).length;
      const total = issues.length;
      const level = newCount > 0 ? 'warn' : total > 0 ? 'warn' : 'ok';
      perProject[p.key] = {
        level: newCount >= 5 ? 'bad' : level,
        summary: `${newCount} new / ${total} open (7–14d)`,
        detail: { newCount, total, top: issues.slice(0, 3).map((i) => ({ title: i.title, count: i.count, url: i.permalink })) },
      };
    } catch (e) {
      const code = e.status || e.message;
      perProject[p.key] = { level: 'na', summary: code === 404 ? 'project not created yet' : `error: ${code}`, detail: {} };
    }
  }
  return { configured: true, perProject };
}
