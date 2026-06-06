# Manual actions — what Paul needs to do

Everything in this list needs a human (account access, billing, domain ownership). Add each key in
**GitHub → this repo → Settings → Secrets and variables → Actions → New repository secret** using the
exact secret name shown. The system already works with whatever is set; missing keys just show as
"not configured" in the weekly email.

## Already done ✅
- `GH_MONITOR_PAT`, `SENTRY_AUTH_TOKEN`, `RESEND_API_KEY` — provided and stored as secrets.
- 7 Sentry projects exist with "New issue → email" and "Error spike → email" alert rules; alerts go
  to yanapshu@gmail.com (org owner).

## To add (free)
1. **`VERCEL_TOKEN`** — Vercel → Account Settings → Tokens → Create. Scope: team
   `paulburgeths-projects`, read access. Enables deploy status + prod-deploy-failure alerts.
2. **`PAGESPEED_API_KEY`** — Google Cloud Console → APIs & Services → enable *PageSpeed Insights API*
   → Credentials → API key. Enables weekly Core Web Vitals.
3. **`GCP_SA_JSON`** — Google Cloud Console:
   - Enable *Google Analytics Data API* and *Search Console API*.
   - Create a **service account**, create a JSON key, paste the whole JSON as this secret.
   - In **Search Console**, add the service-account email as a user on each verified property.
   - In **GA4** (Admin → Property Access), add the service-account email as **Viewer** on each property.
   - Then fill each project's `ga4PropertyId` in `src/config/projects.json` (Admin → Property Settings →
     Property ID, a number like `123456789`). GA4 traffic only reports where a property id is set.
4. **`BETTERSTACK_API_TOKEN`** — Better Stack → free account → API token. Then run
   `node scripts/setup-betterstack.mjs` (creates 7 HTTP monitors + email-on-down policy).
5. **`GMAIL_OAUTH`** *(Phase 2, optional)* — a Gmail OAuth refresh-token JSON so the report can parse
   the weekly `sa@ahrefs.com` Site Audit emails. Alternatively set a Gmail filter that forwards them.

## Owner / account actions (no secret)
6. **Rotate the 3 pasted secrets** after you've confirmed everything works — they were shared in chat.
   Replace `GH_MONITOR_PAT` with a **fine-grained PAT** limited to the 4 orgs' repos, read-only on
   contents/metadata/actions (plus repo-creation if you want me to manage repos).
7. **decleanup.net** — you only have *member* access to `DeCleanup-Network`. A DeCleanup **owner**
   must (a) confirm which repo/Vercel project serves the live site, (b) enable Dependabot + secret
   scanning, (c) allow the monitoring PRs (or grant write so no fork is needed). Also: the apex
   `decleanup.net` has a TLS certificate mismatch — fix the cert or confirm `www.` is canonical.
8. **GA4 properties** — for the 6 sites without a GA4 tag, create a GA4 property + install the tag if
   you want traffic monitoring (helprentphangan.com already has `G-MDEKMMMN2F`). This is a GA UI step.

## Out-of-scope security note
`PaulBurgEth/helprentphangan.com/.env.example` contains real-looking WasenderAPI keys. Consider
rotating them and replacing with placeholders.
