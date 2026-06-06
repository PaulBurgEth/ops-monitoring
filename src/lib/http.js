// Small fetch wrappers with timeout + JSON handling. Uses native fetch (Node >= 20).

export async function httpGet(url, { headers = {}, timeoutMs = 25000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal, redirect: 'follow' });
    return res;
  } finally {
    clearTimeout(t);
  }
}

export async function getJson(url, opts = {}) {
  const res = await httpGet(url, opts);
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = typeof body === 'object' && body ? JSON.stringify(body).slice(0, 300) : String(body).slice(0, 300);
    const err = new Error(`HTTP ${res.status} ${url} :: ${msg}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

// Returns the final HTTP status of a HEAD/GET, or 0 on network/TLS failure.
export async function probeStatus(url, timeoutMs = 20000) {
  try {
    const res = await httpGet(url, { timeoutMs });
    return res.status;
  } catch {
    return 0;
  }
}
