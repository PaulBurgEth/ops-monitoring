// Vercel collector: latest production deployment state per project.
import { getSecret, hasSecret } from '../lib/env.js';
import { getJson } from '../lib/http.js';

export const id = 'vercel';
export const label = 'Deploy (Vercel)';
export const requires = ['VERCEL_TOKEN'];

function vHeaders() {
  return { Authorization: `Bearer ${getSecret('VERCEL_TOKEN')}`, 'User-Agent': 'ops-monitoring' };
}

let _teamId = null;
async function teamId(slug) {
  if (_teamId !== null) return _teamId;
  try {
    const data = await getJson(`https://api.vercel.com/v2/teams?slug=${encodeURIComponent(slug)}`, {
      headers: vHeaders(),
    });
    _teamId = data?.id || data?.teams?.[0]?.id || '';
  } catch {
    _teamId = '';
  }
  return _teamId;
}

export async function latestProdDeployment(project, teamSlug) {
  const tid = await teamId(teamSlug);
  const q = new URLSearchParams({ app: project, target: 'production', limit: '1' });
  if (tid) q.set('teamId', tid);
  const data = await getJson(`https://api.vercel.com/v6/deployments?${q}`, { headers: vHeaders() });
  const d = data?.deployments?.[0];
  if (!d) return null;
  return { state: d.state || d.readyState, url: d.url, created: d.created, uid: d.uid };
}

export async function collect({ projects, cfg }) {
  if (!hasSecret('VERCEL_TOKEN')) return { configured: false, note: 'VERCEL_TOKEN not set', perProject: {} };
  const perProject = {};
  for (const p of projects) {
    if (!p.vercelProject) {
      perProject[p.key] = { level: 'na', summary: 'not on Vercel', detail: {} };
      continue;
    }
    try {
      const d = await latestProdDeployment(p.vercelProject, cfg.vercelTeam);
      if (!d) {
        perProject[p.key] = { level: 'na', summary: 'no deployments', detail: {} };
        continue;
      }
      const level = d.state === 'READY' ? 'ok' : d.state === 'ERROR' ? 'bad' : 'warn';
      perProject[p.key] = { level, summary: `prod ${d.state}`, detail: d };
    } catch (e) {
      perProject[p.key] = { level: 'na', summary: `error: ${e.status || e.message}`, detail: {} };
    }
  }
  return { configured: true, perProject };
}
