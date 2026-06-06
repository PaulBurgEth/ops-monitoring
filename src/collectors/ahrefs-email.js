// Ahrefs Site Audit collector: parses the weekly sa@ahrefs.com emails via Gmail API.
// Gated on GMAIL_OAUTH (refresh-token JSON). Until provided, returns "not configured" with
// a pointer so the weekly report links the latest Ahrefs email instead of parsing it.
import { getSecret } from '../lib/env.js';

export const id = 'ahrefs';
export const label = 'SEO (Ahrefs Site Audit)';
export const requires = ['GMAIL_OAUTH'];

export async function collect({ projects }) {
  const oauth = getSecret('GMAIL_OAUTH');
  if (!oauth) {
    return {
      configured: false,
      note: 'GMAIL_OAUTH not set — Ahrefs weekly emails (sa@ahrefs.com) not parsed yet (Phase 2). See docs/MANUAL_ACTIONS.md.',
      perProject: {},
    };
  }
  // Phase 2: implement Gmail API search for from:sa@ahrefs.com newer_than:8d and parse health/errors.
  const perProject = {};
  for (const p of projects) perProject[p.key] = { level: 'na', summary: 'pending Gmail parse', detail: {} };
  return { configured: false, note: 'Gmail parsing stub — implement in Phase 2', perProject };
}
