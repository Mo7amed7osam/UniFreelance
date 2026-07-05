interface ImportMeta {
  readonly env: {
    readonly VITE_API_URL?: string;
  };
}

const getAssetOrigin = () => {
  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  if (apiBase.endsWith('/api')) return apiBase.slice(0, -4);
  return apiBase;
};

export const buildAssetUrl = (value?: string) => {
  if (!value) return '';
  if (/^(https?:|blob:|data:)/i.test(value)) return value;

  const normalized = value.replace(/^\/api(?=\/uploads\/)/, '');
  const origin = getAssetOrigin();

  if (normalized.startsWith('/')) return `${origin}${normalized}`;
  if (normalized.startsWith('uploads/')) return `${origin}/${normalized}`;
  return normalized;
};
