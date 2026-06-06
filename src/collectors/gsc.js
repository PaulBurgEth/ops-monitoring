// Google Search Console collector: index coverage + clicks/impressions (last 28d).
// Gated on GCP_SA_JSON; lazy-imports googleapis so a missing dep/key never breaks the run.
import { getGcpServiceAccount, hasSecret } from '../lib/env.js';

export const id = 'gsc';
export const label = 'SEO (Search Console)';
export const requires = ['GCP_SA_JSON'];

export async function collect({ projects }) {
  const sa = getGcpServiceAccount();
  if (!sa) return { configured: false, note: 'GCP_SA_JSON not set', perProject: {} };
  let google;
  try {
    ({ google } = await import('googleapis'));
  } catch {
    return { configured: false, note: 'googleapis not installed', perProject: {} };
  }
  const auth = new google.auth.GoogleAuth({
    credentials: sa,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const webmasters = google.webmasters({ version: 'v3', auth });
  const end = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10);
  const start = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const perProject = {};
  for (const p of projects) {
    if (!p.gscSiteUrl) {
      perProject[p.key] = { level: 'na', summary: 'no GSC property', detail: {} };
      continue;
    }
    try {
      const res = await webmasters.searchanalytics.query({
        siteUrl: p.gscSiteUrl,
        requestBody: { startDate: start, endDate: end, dimensions: ['date'], rowLimit: 1 },
      });
      const rows = res.data.rows || [];
      const clicks = rows.reduce((a, r) => a + (r.clicks || 0), 0);
      const impressions = rows.reduce((a, r) => a + (r.impressions || 0), 0);
      perProject[p.key] = {
        level: 'ok',
        summary: `${clicks} clicks · ${impressions} impr (28d)`,
        detail: { clicks, impressions },
      };
    } catch (e) {
      const code = e?.code || e?.response?.status || e.message;
      perProject[p.key] = {
        level: 'na',
        summary: code === 403 ? 'SA lacks access to property' : `error: ${code}`,
        detail: {},
      };
    }
  }
  return { configured: true, perProject };
}
