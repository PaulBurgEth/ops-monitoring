# decleanup.net — status

- **Org:** DeCleanup-Network (✅ this account has repo **admin** on `decleanup-landing-standalone`
  and `decleanup-main-celo` — enough for PRs, Dependabot, secret-scanning; no cofounder needed)
- **Repo:** DeCleanup-Network/decleanup-landing-standalone *(confirm this is the decleanup.net prod repo)*
- **Live:** https://www.decleanup.net (Vercel). ⚠️ apex `https://decleanup.net` currently fails TLS
  (cert SAN mismatch) — monitoring uses the `www.` canonical host.
- **Sentry:** ✅ project `decleanup` + alert rules (static site — SDK optional, low value)
- **Deploy:** Vercel `decleanup-network` (CLI-direct; needs `VERCEL_TOKEN` for the report's deploy column)
- **Uptime:** ✅ www HTTP 200
- **Dependabot:** ✅ config PR merged (#1); alerts + auto-fixes enabled
- **Next:** fix the apex TLS cert; confirm prod repo.
