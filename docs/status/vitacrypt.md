# VitaCrypt — status

- **Repos:** VitaCrypt-Labs/VitaCrypt (private, primary; TS frontend + Python FastAPI), VitaCrypt-Labs/vitacrypt-landing
- **Live:** https://vitacrypt.xyz (Vercel, project `vitacrypt-landing`)
- **CI:** ✅ `deploy.yml` green on main (monitored)
- **Sentry:** ✅ project `vitacrypt` (pre-existing) + alert rules — SDK install pending (PR)
- **Deploy:** Vercel `vitacrypt-landing` (needs `VERCEL_TOKEN`)
- **Uptime:** ✅ HTTP 200
- **Dependabot / secret scanning:** ❌ to enable + `dependabot.yml` PR
- **SEO / CWV:** pending keys
- **Next:** PR — `@sentry/nextjs` (landing) + `sentry-sdk[fastapi]` (backend, gated on SENTRY_DSN) + `dependabot.yml`.
