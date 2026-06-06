# EcoSynthesisX — status

- **Repo:** PaulBurgEth/ecosynthesisx (Next.js 16 portfolio, Tailwind v4)
- **Live:** https://ecosynthesisx.com (Cloudflare → Vercel, project `ecosynthesisx-github-io`, CLI-direct deploy)
- **Sentry:** project `ecosynthesisx` + alert rules exist, but the SDK was **reverted** (PR #11) — the
  `@sentry/nextjs` integration is on hold until deploys are green. DSN env already set in Vercel.
- **Dependabot:** ✅ config merged; alerts + auto-fixes enabled (surfacing ~32 advisories)
- **⚠️ Build fix (PR #13, open):** the committed `package-lock.json` was pruned to darwin-only, so the
  Linux `@tailwindcss/oxide` native binding wasn't installed → Vercel Turbopack build failed.
  PR #13 regenerates the lockfile with all platform nodes — **verified via a Vercel preview build**.
  Merge #13, then `vercel --prod` to deploy cleanly. Re-add Sentry in a follow-up PR afterwards.
- **Uptime:** ✅ HTTP 200 (live site unaffected throughout — old deploy kept serving)
- **Next:** merge #13 → deploy → re-add Sentry SDK (build-verified).
