# ops-monitoring

Unified monitoring & weekly reporting across all projects: CI/CD, production deploys, runtime
errors (Sentry), SEO (Search Console + Ahrefs), Core Web Vitals, and uptime — one **weekly email**
plus **immediate alerts** to the maintainer's inbox. Free tiers only.

## How it works
- Scheduled **GitHub Actions** run small Node scripts (no servers to host).
- Each data source is a **collector** in `src/collectors/`. A collector **no-ops gracefully** if its
  API key is missing — it shows up as "not configured" in the report and never breaks the run.
- The weekly job aggregates everything into one HTML email (via **Resend**).
- Two fast watchers send urgent alerts: **CI red on main** and **prod deploy failure**.
- **Uptime** + **Sentry** alerts are delivered natively by Better Stack and Sentry.

## Layout
```
src/collectors/   one file per source (github, vercel, uptime, sentry, pagespeed, gsc, ga4, ahrefs)
src/report/       weekly HTML report builder
src/lib/          shared helpers (config, env, http, email, format)
src/weekly.js     weekly report entry      (npm run weekly)
src/ci-watch.js   CI failure alert         (npm run ci-watch)
src/deploy-watch.js prod deploy alert      (npm run deploy-watch)
src/doctor.js     show which secrets are present (npm run doctor)
.github/workflows/ schedules for the above
docs/             architecture, sources map, manual setup steps, per-project status
scripts/          one-off setup (Sentry projects, Better Stack monitors)
```

## Secrets (set in repo → Settings → Secrets and variables → Actions)
See `docs/MANUAL_ACTIONS.md`. Nothing sensitive lives in code; all keys come from Actions secrets.

Delivery address: `reportTo` in `src/config/projects.json`, overridden by the
`REPORT_TO` environment variable or Actions secret when set.

## Run locally
```
npm install
GH_MONITOR_PAT=… SENTRY_AUTH_TOKEN=… node src/weekly.js   # omit RESEND_API_KEY → prints, no email
npm run doctor                                            # which secrets are set
```
