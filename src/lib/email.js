// Email sender via Resend REST API. If RESEND_API_KEY is absent, falls back to printing
// the message to stdout (so dry-runs and key-less environments never crash).
import { getSecret, hasSecret } from './env.js';

export async function sendEmail({ from, to, subject, html, text }) {
  if (!hasSecret('RESEND_API_KEY')) {
    console.log(`\n[email:dry-run] no RESEND_API_KEY — would send:\n  to: ${to}\n  subj: ${subject}\n`);
    return { dryRun: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getSecret('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html, text: text || undefined }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}
