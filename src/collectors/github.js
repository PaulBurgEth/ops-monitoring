// GitHub collector: latest CI conclusion on main + Dependabot/secret-scanning state per project.
import { getSecret } from '../lib/env.js';
import { getJson } from '../lib/http.js';

export const id = 'github';
export const label = 'CI / GitHub';
export const requires = ['GH_MONITOR_PAT'];

function ghHeaders() {
  return {
    Authorization: `Bearer ${getSecret('GH_MONITOR_PAT')}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'ops-monitoring',
  };
}

export async function latestMainRun(repo) {
  const data = await getJson(
    `https://api.github.com/repos/${repo}/actions/runs?branch=main&per_page=1`,
    { headers: ghHeaders() }
  );
  const run = data?.workflow_runs?.[0];
  if (!run) return { conclusion: null, status: null, name: null, url: null, sha: null };
  return {
    conclusion: run.conclusion,
    status: run.status,
    name: run.name,
    url: run.html_url,
    sha: (run.head_sha || '').slice(0, 7),
    createdAt: run.created_at,
  };
}

async function securityState(repo) {
  const out = { dependabot: null, secretScanning: null };
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/vulnerability-alerts`, {
      headers: ghHeaders(),
    });
    out.dependabot = res.status === 204 ? 'enabled' : res.status === 404 ? 'disabled' : `http_${res.status}`;
  } catch {
    out.dependabot = 'unknown';
  }
  try {
    const repoData = await getJson(`https://api.github.com/repos/${repo}`, { headers: ghHeaders() });
    out.secretScanning = repoData?.security_and_analysis?.secret_scanning?.status ?? 'unknown';
  } catch {
    out.secretScanning = 'unknown';
  }
  return out;
}

export async function collect({ projects }) {
  const perProject = {};
  for (const p of projects) {
    try {
      const run = await latestMainRun(p.primaryRepo);
      const sec = await securityState(p.primaryRepo);
      let level = 'ok';
      if (run.conclusion === 'failure' || run.conclusion === 'timed_out') level = 'bad';
      else if (run.status && run.status !== 'completed') level = 'warn';
      else if (!run.conclusion) level = 'na';
      perProject[p.key] = {
        level,
        summary: run.conclusion
          ? `CI ${run.conclusion} (${run.name || 'main'})`
          : 'no CI runs',
        detail: {
          repo: p.primaryRepo,
          run,
          dependabot: sec.dependabot,
          secretScanning: sec.secretScanning,
        },
      };
    } catch (e) {
      perProject[p.key] = { level: 'na', summary: `error: ${e.status || e.message}`, detail: {} };
    }
  }
  return { configured: true, perProject };
}
