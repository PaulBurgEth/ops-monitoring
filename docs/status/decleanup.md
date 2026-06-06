# decleanup.net — status

- **Org:** DeCleanup-Network (⚠️ this account has **member**, not admin/owner access)
- **Repo:** DeCleanup-Network/decleanup-landing-standalone *(production repo to confirm with an owner)*
- **Live:** https://www.decleanup.net (Vercel). ⚠️ apex `https://decleanup.net` currently fails TLS
  (cert SAN mismatch) — monitoring uses the `www.` canonical host.
- **CI:** to confirm per repo
- **Sentry:** ✅ project `decleanup` + alert rules — SDK install pending (PR; needs owner to merge)
- **Deploy:** Vercel `decleanup-network` (needs `VERCEL_TOKEN`)
- **Uptime:** ✅ www HTTP 200
- **Dependabot / secret scanning:** ❌ — **requires a DeCleanup-Network owner** to enable + accept PRs
- **Next:** owner to confirm prod repo + canonical host + TLS fix; then Sentry SDK + `dependabot.yml` PR (fork if no write).
