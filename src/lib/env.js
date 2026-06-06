// Secret/env access helpers. Secrets come ONLY from process.env (GitHub Actions secrets).
// A collector with a missing secret must no-op gracefully, never throw.

export function getSecret(name) {
  const v = process.env[name];
  return v && String(v).trim() ? String(v).trim() : null;
}

export function hasSecret(name) {
  return getSecret(name) !== null;
}

export function hasAll(names) {
  return names.every(hasSecret);
}

// Load and parse the GCP service-account JSON from env (raw JSON or base64).
export function getGcpServiceAccount() {
  const raw = getSecret('GCP_SA_JSON');
  if (!raw) return null;
  try {
    const text = raw.trim().startsWith('{')
      ? raw
      : Buffer.from(raw, 'base64').toString('utf8');
    return JSON.parse(text);
  } catch {
    return null;
  }
}
