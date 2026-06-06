// PageSpeed Insights collector: Core Web Vitals + performance score per live site.
import { getSecret, hasSecret } from '../lib/env.js';
import { getJson } from '../lib/http.js';

export const id = 'pagespeed';
export const label = 'Core Web Vitals';
export const requires = ['PAGESPEED_API_KEY'];

export async function measure(url, strategy = 'mobile') {
  const key = getSecret('PAGESPEED_API_KEY');
  const q = new URLSearchParams({ url, strategy, category: 'PERFORMANCE' });
  if (key) q.set('key', key);
  const data = await getJson(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`, {
    timeoutMs: 60000,
  });
  const lh = data?.lighthouseResult;
  const score = lh?.categories?.performance?.score != null ? Math.round(lh.categories.performance.score * 100) : null;
  const a = lh?.audits || {};
  const field = data?.loadingExperience?.metrics || {};
  return {
    score,
    lcp: a['largest-contentful-paint']?.displayValue ?? null,
    cls: a['cumulative-layout-shift']?.displayValue ?? null,
    tbt: a['total-blocking-time']?.displayValue ?? null,
    fieldLcpMs: field?.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null,
    overallField: data?.loadingExperience?.overall_category ?? null,
  };
}

export async function collect({ projects }) {
  if (!hasSecret('PAGESPEED_API_KEY')) {
    return { configured: false, note: 'PAGESPEED_API_KEY not set (works without key but rate-limited)', perProject: {} };
  }
  const perProject = {};
  for (const p of projects) {
    try {
      const m = await measure(p.uptimeUrl || p.site);
      let level = 'na';
      if (m.score != null) level = m.score >= 90 ? 'ok' : m.score >= 50 ? 'warn' : 'bad';
      perProject[p.key] = {
        level,
        summary: m.score != null ? `perf ${m.score}/100 · LCP ${m.lcp ?? '—'}` : 'no data',
        detail: m,
      };
    } catch (e) {
      perProject[p.key] = { level: 'na', summary: `error: ${e.status || e.message}`, detail: {} };
    }
  }
  return { configured: true, perProject };
}
