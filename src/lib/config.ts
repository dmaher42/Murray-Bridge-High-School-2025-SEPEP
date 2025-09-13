export type SepepConfig = { apiUrl?: string; staffFormUrl?: string };
export async function loadConfig(): Promise<SepepConfig> {
  try {
    const url = ((import.meta as any).env?.BASE_URL || '/') + 'sepep.config.json';
    const r = await fetch(url, { cache: 'no-store' });
    if (r.ok) return r.json();
  } catch {}
  return {};
}
