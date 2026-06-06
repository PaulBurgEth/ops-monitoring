export function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function statusEmoji(level) {
  return { ok: '🟢', warn: '🟡', bad: '🔴', na: '⚪️' }[level] || '⚪️';
}

export function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
