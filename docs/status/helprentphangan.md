# helprentphangan — status

- **Repo:** PaulBurgEth/helprentphangan.com (private, Django/Channels/Celery)
- **Live:** https://helprentphangan.com (Cloudflare; **not on Vercel**)
- **CI:** ✅ `CI/CD Pipeline` green on main (monitored)
- **Sentry:** ✅ project `helprentphangan` + alert rules — SDK install pending (PR, `sentry-sdk[django]`, gated on SENTRY_DSN so it no-ops without the key)
- **Deploy:** no Vercel — deploy tracking via CI status only
- **Uptime:** ✅ HTTP 200; GA4 tag `G-MDEKMMMN2F` already live
- **Email:** sends app email via Django SMTP; this repo reuses the same Resend domain (helprentphangan.com)
- **Dependabot / secret scanning:** ❌ to enable + `dependabot.yml` (pip) PR
- **Next:** PR — `sentry-sdk[django]` init behind `SENTRY_DSN` + `dependabot.yml`. Do NOT touch the magic-link email path.
