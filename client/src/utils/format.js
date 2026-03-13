export function fNum(n) {
  if (n == null) return '—';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString('it-IT');
}

export function fPct(n) {
  if (n == null) return '—';
  return (n * 100).toFixed(2) + '%';
}

export function fDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fDateShort(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

export function platformIcon(type) {
  const map = { ig: 'Instagram', tt: 'TikTok', yt: 'YouTube' };
  return map[type] || type;
}

export function platformColor(type) {
  const map = { ig: '#E4405F', tt: '#00f2ea', yt: '#FF0000' };
  return map[type] || '#6b7280';
}

export function platformBadgeClass(type) {
  const map = { ig: 'badge-ig', tt: 'badge-tt', yt: 'badge-yt' };
  return map[type] || 'badge-low';
}

export function changeIndicator(val) {
  if (val == null) return { text: '—', cls: '' };
  const n = parseFloat(val);
  if (n > 0) return { text: `+${n}%`, cls: 'stat-up' };
  if (n < 0) return { text: `${n}%`, cls: 'stat-down' };
  return { text: '0%', cls: '' };
}
