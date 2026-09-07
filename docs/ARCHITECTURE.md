# Architecture

## What this is
A lightweight, serverless monitoring system. It watches 7 projects and sends Paul one weekly
summary email plus immediate alerts when something breaks. There is no server to maintain — every
job runs on a schedule inside GitHub Actions in this public repo (public = unlimited free minutes).

## How data flows
1. A scheduled GitHub Action starts (weekly, or every 15 min for the watchers).
2. It runs a Node script that asks each external service for status, using API keys stored as
   **GitHub Actions secrets** (never in code).
3. Results are turned into an HTML email and sent through **Resend** from
   `reports@helprentphangan.com` to the address in `reportTo`
   (override with the `REPORT_TO` secret).

```
GitHub Actions (cron)
   └─ node src/weekly.js
        ├─ collectors/github.js     → GitHub API   (CI status, Dependabot, secret scanning)
        ├─ collectors/vercel.js     → Vercel API   (prod deploy state)
        ├─ collectors/uptime.js     → direct probe + Better Stack (site up/down)
        ├─ collectors/sentry.js     → Sentry API   (new/open errors)
        ├─ collectors/pagespeed.js  → PageSpeed API (Core Web Vitals)
        ├─ collectors/gsc.js        → Search Console API (indexing, clicks)
        ├─ collectors/ga4.js        → GA4 Data API (traffic, week-over-week drop)
        └─ collectors/ahrefs-email.js → Gmail API  (parse Ahrefs weekly emails) [Phase 2]
        → report/build-weekly.js → lib/email.js (Resend) → inbox
```

## Design decisions
- **Public repo** so GitHub Actions minutes are unlimited (a private Free repo only gets 2,000/mo,
  which 15-minute polling would exceed). No secret is ever committed; only project config is public.
- **Graceful degradation:** every collector returns "not configured" if its key is missing, so the
  system works from day one and gets richer as keys are added. The weekly job always exits 0.
- **Stateless alert de-dupe:** the watchers only alert on failures that happened within the last
  ~20 minutes (the cron window), so a long-standing failure is not re-emailed every 15 minutes.
- **Native alerting where it's better:** uptime alerts come from Better Stack, error alerts from
  Sentry's own rules — we don't reinvent those.

## Fragile / to revisit
- **Ahrefs** parsing needs a Gmail OAuth token (a scheduled job can't use an interactive login).
  Until that's provided, the report links the latest Ahrefs email instead of parsing it.
- **helprentphangan.com** is a Django app, not on Vercel, so it has CI status but no Vercel deploy
  tracking.
- **decleanup.net**: this repo's owner only has *member* access to the DeCleanup-Network org, so
  enabling security features / merging PRs there needs a DeCleanup owner. The apex `decleanup.net`
  currently has a TLS certificate mismatch; we monitor `www.decleanup.net`.
- The provided GitHub token is a broad classic PAT — it should be rotated to a least-privilege
  fine-grained token (read-only on the monitored repos).
