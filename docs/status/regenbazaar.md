# Regen-Bazaar — status

- **Repos:** Regen-Bazaar/regenbazaar-beta (private, primary), Regen-Bazaar/landing, Regen-Bazaar/.github
- **Live:** https://regenbazaar.com (Cloudflare → Vercel, project `regenbazaar`)
- **CI:** ✅ `ci.yml` green on main (monitored)
- **Sentry:** ✅ project `regenbazaar` created, alert rules set — SDK install pending (PR)
- **Deploy:** Vercel `regenbazaar` (needs `VERCEL_TOKEN` to track)
- **Uptime:** ✅ HTTP 200 (direct probe; Better Stack monitor pending token)
- **Dependabot / secret scanning:** ❌ to enable (admin OK) + `dependabot.yml` PR
- **SEO / CWV:** pending `GCP_SA_JSON` / `PAGESPEED_API_KEY`
- **Next:** PR — add `@sentry/nextjs` (SENTRY_DSN secret) + `.github/dependabot.yml`; enable security features.
