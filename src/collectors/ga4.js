// GA4 Data API collector: 7d active users + week-over-week change (anomaly hint).
// Gated on GCP_SA_JSON + a configured ga4PropertyId per project. Lazy-imports googleapis.
import { getGcpServiceAccount } from '../lib/env.js';

export const id = 'ga4';
export const label = 'Traffic (GA4)';
export const requires = ['GCP_SA_JSON'];

export async function collect({ projects }) {
  const sa = getGcpServiceAccount();
  if (!sa) return { configured: false, note: 'GCP_SA_JSON not set', perProject: {} };
  const withProp = projects.filter((p) => p.ga4PropertyId);
  if (withProp.length === 0) {
    return { configured: false, note: 'no ga4PropertyId set on any project yet', perProject: {} };
  }
  let google;
  try {
    ({ google } = await import('googleapis'));
  } catch {
    return { configured: false, note: 'googleapis not installed', perProject: {} };
  }
  const auth = new google.auth.GoogleAuth({
    credentials: sa,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
  const perProject = {};
  for (const p of projects) {
    if (!p.ga4PropertyId) {
      perProject[p.key] = { level: 'na', summary: 'no GA4 property', detail: {} };
      continue;
    }
    try {
      const res = await analyticsdata.properties.runReport({
        property: `properties/${p.ga4PropertyId}`,
        requestBody: {
          dateRanges: [
            { startDate: '7daysAgo', endDate: 'yesterday' },
            { startDate: '14daysAgo', endDate: '8daysAgo' },
          ],
          metrics: [{ name: 'activeUsers' }],
        },
      });
      const rows = res.data.rows || [];
      const cur = Number(rows[0]?.metricValues?.[0]?.value || 0);
      const prev = Number(rows[1]?.metricValues?.[0]?.value || 0);
      const pct = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null;
      const level = pct != null && pct <= -30 ? 'bad' : pct != null && pct <= -15 ? 'warn' : 'ok';
      perProject[p.key] = {
        level,
        summary: `${cur} users (7d)${pct != null ? `, ${pct >= 0 ? '+' : ''}${pct}% WoW` : ''}`,
        detail: { cur, prev, pct },
      };
    } catch (e) {
      perProject[p.key] = { level: 'na', summary: `error: ${e?.code || e.message}`, detail: {} };
    }
  }
  return { configured: true, perProject };
}
