import Constants from 'expo-constants';

// Configuration courante (mutable) du client
let cfg: {
  baseUrl?: string;
  getToken?: () => string | undefined;
  onUnauthorized?: () => void;
} = {};

export function configureApi(opts: {
  baseUrl?: string;
  getToken?: () => string | undefined;
  onUnauthorized?: () => void;
}) {
  cfg = {
    baseUrl:
      opts.baseUrl ?? (Constants.expoConfig?.extra as any)?.apiBase ?? '',
    getToken: opts.getToken,
    onUnauthorized: opts.onUnauthorized,
  };
  console.log('[api] configured baseUrl=', cfg.baseUrl);
}

export async function apiFetch(path: string, init: RequestInit & { parseJson?: boolean } = {}) {
  const base = (cfg.baseUrl || '').replace(/\/+$/, '');
  const url = /^https?:\/\//i.test(path)
    ? path
    : `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.headers as any),
  };

  // Ajout du token s'il existe
  const token = cfg.getToken?.();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Content-Type par défaut si body string
  if (init.body && typeof init.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  console.log('[api] →', init.method || 'GET', url, {
    hasAuth: Boolean(token),
    authLen: token?.length || 0,
  });

  const res = await fetch(url, { ...init, headers });

  console.log('[api] ←', res.status, res.ok ? 'OK' : 'ERR', url);

  if (res.status === 401) {
    // Option: lire body pour debug
    const body = await res.text().catch(() => '');
    console.log('[api] 401 body=', body);
    cfg.onUnauthorized?.();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (init.parseJson === false) return res;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

