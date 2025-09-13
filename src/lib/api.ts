const getBase = () => {
  const env = (import.meta as any).env?.VITE_SEPEP_API_URL || '';
  const saved = localStorage.getItem('sepep_api_url') || '';
  const base = (saved || env || '').replace(/\/exec.*$/, '');
  return base ? base + '/exec' : '';
};

export async function fetchSummary() {
  const base = getBase();
  if (!base) throw new Error('Missing SEPEP API URL');
  const r = await fetch(`${base}?action=summary`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}
