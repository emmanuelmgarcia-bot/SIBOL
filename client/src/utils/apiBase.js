export function getApiBase() {
  let apiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();

  // Local dev convenience (matches existing behavior)
  if (!apiBase && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }

  // If not set in prod, use relative URLs so the same origin serves /api/*
  if (!apiBase) {
    return '';
  }

  // Normalize: drop trailing slashes
  apiBase = apiBase.replace(/\/+$/, '');

  // Common misconfig: people set VITE_API_BASE_URL to "/portal" or ".../portal"
  if (apiBase === '/portal') {
    return '';
  }
  if (apiBase.endsWith('/portal')) {
    apiBase = apiBase.slice(0, -'/portal'.length);
    apiBase = apiBase.replace(/\/+$/, '');
  }

  return apiBase;
}


