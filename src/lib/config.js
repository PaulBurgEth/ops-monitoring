import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadConfig() {
  const raw = JSON.parse(readFileSync(join(__dirname, '../config/projects.json'), 'utf8'));
  return {
    cfg: {
      reportTo: raw.reportTo,
      reportFrom: raw.reportFrom,
      sentryOrg: raw.sentryOrg,
      sentryTeam: raw.sentryTeam,
      vercelTeam: raw.vercelTeam,
    },
    projects: raw.projects,
  };
}
