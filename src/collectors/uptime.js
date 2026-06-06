// Uptime collector: direct HTTP probe of each site (always free, no key) +
// enriches with Better Stack monitor status/SLA when BETTERSTACK_API_TOKEN is set.
import { getSecret, hasSecret } from '../lib/env.js';
import { getJson, probeStatus } from '../lib/http.js';

export const id = 'uptime';
export const label = 'Uptime';
export const requires = [];

async function betterStackMonitors() {
  if (!hasSecret('BETTERSTACK_API_TOKEN')) return null;
  try {
    const data = await getJson('https://uptime.betterstack.com/api/v2/monitors?per_page=50', {
      headers: { Authorization: `Bearer ${getSecret('BETTERSTACK_API_TOKEN')}`, 'User-Agent': 'ops-monitoring' },
    });
    return data?.data || [];
  } catch {
    return null;
  }
}

function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export async function collect({ projects }) {
  const monitors = await betterStackMonitors();
  const perProject = {};
  for (const p of projects) {
    const url = p.uptimeUrl || p.site;
    const status = await probeStatus(url);
    let level = status >= 200 && status < 400 ? 'ok' : status === 0 ? 'bad' : status >= 500 ? 'bad' : 'warn';
    let bs = null;
    if (monitors) {
      const m = monitors.find((x) => hostOf(x?.attributes?.url || '') === hostOf(url));
      if (m) bs = { status: m.attributes.status, availability: m.attributes?.availability ?? null };
    }
    perProject[p.key] = {
      level,
      summary: status === 0 ? 'unreachable (TLS/network)' : `HTTP ${status}${bs ? ` · BS ${bs.status}` : ''}`,
      detail: { url, status, betterStack: bs },
    };
  }
  return { configured: true, note: monitors ? 'Better Stack linked' : 'direct probe only (no Better Stack token)', perProject };
}
