# Sources map — what is monitored by what

| Signal | Source | Secret | Delivery | Status |
|---|---|---|---|---|
| CI red/green on `main` | GitHub Actions API | `GH_MONITOR_PAT` | weekly report + `ci-watch` alert | ✅ live |
| Dependabot / secret scanning | GitHub API | `GH_MONITOR_PAT` | weekly report | ✅ live |
| Production deploy status | Vercel API | `VERCEL_TOKEN` | weekly report + `deploy-watch` alert | ☐ needs token |
| Uptime (site down) | direct HTTP probe + Better Stack | `BETTERSTACK_API_TOKEN` | weekly report + Better Stack email | 🟡 probe live; BS needs token |
| Runtime errors | Sentry API + native rules | `SENTRY_AUTH_TOKEN` | weekly report + Sentry email | ✅ live (7 projects, alert rules set) |
| Core Web Vitals | PageSpeed Insights API | `PAGESPEED_API_KEY` | weekly report | ☐ needs key |
| SEO indexing / clicks | Search Console API | `GCP_SA_JSON` | weekly report | ☐ needs service account |
| Traffic + anomaly | GA4 Data API | `GCP_SA_JSON` + `ga4PropertyId` | weekly report | ☐ needs SA + property ids |
| SEO Site Audit | Ahrefs weekly email (Gmail API) | `GMAIL_OAUTH` | weekly report | ☐ Phase 2 |
| Report + alert delivery | Resend | `RESEND_API_KEY` | email to `reportTo` / `REPORT_TO` | ✅ key provided |

## Per-project coverage

| Project | Repo(s) | Live URL monitored | Vercel project | Sentry project |
|---|---|---|---|---|
| Regen-Bazaar | Regen-Bazaar/regenbazaar-beta (+landing, .github) | regenbazaar.com | regenbazaar | regenbazaar |
| VitaCrypt | VitaCrypt-Labs/VitaCrypt (+vitacrypt-landing) | vitacrypt.xyz | vitacrypt-landing | vitacrypt |
| helprentphangan | PaulBurgEth/helprentphangan.com | helprentphangan.com | — (Django) | helprentphangan |
| paulburg.com | PaulBurgEth/paulburg-com | paulburg.com | paulburg-com | paulburg |
| EcoSynthesisX | PaulBurgEth/ecosynthesisx | ecosynthesisx.com | ecosynthesisx-github-io | ecosynthesisx |
| DegenCureCenter | PaulBurgEth/degen-cure-center | degencurecenter.com | degen-cure-center | degencurecenter |
| decleanup.net | DeCleanup-Network/decleanup-landing-standalone* | www.decleanup.net | decleanup-network | decleanup |

\* decleanup production repo to confirm with a DeCleanup-Network owner.
