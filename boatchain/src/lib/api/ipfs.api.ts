import Constants from 'expo-constants';
import { getCachedData, setCachedData } from './cache.api';

const EX = (Constants.expoConfig?.extra ?? {}) as {
  ipfsGateway?: string;
};
const IPFS_GATEWAY = EX.ipfsGateway ?? 'https://ipfs.io/ipfs/';

const CACHE_KEY_IPFS = 'ipfs_cache_';

export function ipfsToHttp(uri?: string): string | undefined {
  if (!uri) return undefined;
  if (uri.startsWith('ipfs://')) {
    const path = uri.replace('ipfs://', '');
    return `${IPFS_GATEWAY.replace(/\/+$/, '')}/${path}`;
  }
  return uri;
}

export async function fetchJson<T = any>(url?: string): Promise<T | undefined> {
  if (!url) return undefined;
  try {
    const r = await fetch(url);
    if (!r.ok) return undefined;
    return (await r.json()) as T;
  } catch {
    return undefined;
  }
}

export async function fetchJsonWithCache<T = any>(url?: string): Promise<T | undefined> {
  if (!url) return undefined;
  
  // Try cache first
  const cacheKey = CACHE_KEY_IPFS + btoa(url).replace(/[^a-zA-Z0-9]/g, '');
  const cached = await getCachedData<T>(cacheKey);
  if (cached) {
    console.log(`🚀 Cache hit for ${url}`);
    return cached;
  }
  
  // Fetch from network
  console.log(`🌐 Fetching from network: ${url}`);
  const data = await fetchJson<T>(url);
  
  // Cache the result
  if (data) {
    await setCachedData(cacheKey, data);
  }
  
  return data;
}