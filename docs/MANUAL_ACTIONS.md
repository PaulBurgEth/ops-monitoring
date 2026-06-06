# Manual actions — what Paul needs to do

Status as of the rollout. The monitoring system itself is **live** (weekly email + CI/deploy/uptime
watchers running). The items below either need a key only you can create, or a deploy only you can run.

> **Note on deploys:** Vercel projects here are deployed **directly via the Vercel CLI** (not synced
> to GitHub). So merging a PR does **not** deploy anything — you must run your normal `vercel --prod`
> for the app to pick up merged changes (e.g. the Sentry integration).

---

## 1. Just provide an API token (easiest — paste it, or add as a repo secret)
Add each in **GitHub → PaulBurgEth/ops-monitoring → Settings → Secrets and variables → Actions**.
Each one lights up a section of the weekly report; missing ones simply show "not configured".

| Secret | Where to get it | Unlocks |
|---|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create | prod-deploy status + deploy-failure alerts |
| `PAGESPEED_API_KEY` | Google Cloud Console → enable *PageSpeed Insights API* → API key | Core Web Vitals |
| `BETTERSTACK_API_TOKEN` | Better Stack (free account) → API token | uptime monitors + real-time down alerts |
| `GCP_SA_JSON` | Google Cloud service account JSON (GA4 Data API + Search Console API enabled) | SEO indexing + traffic/anomaly |

✅ Already provided & set: `GH_MONITOR_PAT`, `SENTRY_AUTH_TOKEN`, `RESEND_API_KEY`.

## 2. Deploys you run (CLI-direct — only you know each project's correct context)
- **paulburg.com** — already deployed with Sentry. ✅ Done.
- **ecosynthesisx** — merge PR #13 (lockfile fix) first, then `vercel --prod`. (Sentry was reverted; re-add later once green.)
- **regenbazaar** — Sentry code is on `main`; run your normal `vercel --prod` to activate it.
- **VitaCrypt** — Sentry already in the code; deploy frontend + backend after setting env (below).
- **helprentphangan** — deploys via its own pipeline (already ran green on merge); set `SENTRY_DSN` then redeploy.

## 3. Set Sentry DSN env vars (where I couldn't)
I already set the DSN in Vercel for paulburg, ecosynthesisx, regenbazaar. You set these:
- **VitaCrypt**: `SENTRY_DSN` (backend) + `VITE_SENTRY_DSN` (frontend) =
  `https://359d39ff7e063fce16f638989503b4ce@o4510747696431104.ingest.us.sentry.io/4510747724087296`
- **helprentphangan**: `SENTRY_DSN` in the prod server `.env` =
  `https://335e1f8cc39f56496b575cd76c073cee@o4510747696431104.ingest.us.sentry.io/4511516193128448`

## 4. Security (dashboard tasks only you can do)
- **Rotate** the keys that were shared in chat: GitHub PAT (→ a least-privilege fine-grained PAT),
  Sentry token, Resend key, and the 2 WasenderAPI keys.
- Merge the open security PR: `helprentphangan.com#1` (WasenderAPI key redaction).

## 5. Other
- **decleanup.net**: the apex `https://decleanup.net` currently fails TLS (cert SAN mismatch) — fix the
  cert (we monitor `www.decleanup.net` in the meantime). You have repo `admin`, so no cofounder needed.
- **GA4 properties**: only helprentphangan.com has a GA4 tag. For traffic on the other sites, create
  GA4 properties + install tags, then I'll fill `ga4PropertyId` in `src/config/projects.json`.

---

## What I'll do once you provide the tokens above
- `BETTERSTACK_API_TOKEN` → I run `node scripts/setup-betterstack.mjs` (creates the 7 uptime monitors + down-alert policy).
- `GCP_SA_JSON` → GA4 + Search Console data flows into the weekly report automatically.
- `VERCEL_TOKEN` + `PAGESPEED_API_KEY` → deploy + CWV columns populate automatically.
