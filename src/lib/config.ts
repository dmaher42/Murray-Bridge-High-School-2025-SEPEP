export type SepepConfig = { apiUrl?: string; staffFormUrl?: string };

function validateConfig(data: any): SepepConfig {
  if (data && typeof data === 'object') {
    const cfg: SepepConfig = {};
    if (typeof data.apiUrl === 'string') cfg.apiUrl = data.apiUrl;
    if (typeof data.staffFormUrl === 'string') cfg.staffFormUrl = data.staffFormUrl;
    return cfg;
  }
  throw new Error('Invalid config format');
}

export async function loadConfig(): Promise<SepepConfig> {
  const url = ((import.meta as any).env?.BASE_URL || '/') + 'sepep.config.json';
  try {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`Config ${r.status}`);
    const data = await r.json();
    return validateConfig(data);
  } catch (e) {
    console.error('Failed to load config', e);
    throw e;
  }
}
