import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '@/lib/api';
import {
  BoatRow,
  BlockchainEventRow,
  BoatIPFSData,
  UIBoat,
  NewBoatFormData,
  BoatSpecification,
  BoatEvent,
} from './boat.types';

const EX = (Constants.expoConfig?.extra ?? {}) as {
  apiBase?: string;
  ipfsGateway?: string; // ex: "https://ipfs.io/ipfs/"
};
const IPFS_GATEWAY = EX.ipfsGateway ?? 'https://ipfs.io/ipfs/';

// Cache configuration
const CACHE_KEY_BOATS = 'boats_cache';
const CACHE_KEY_IPFS = 'ipfs_cache_';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/* ------------------ Helpers IPFS ------------------ */
function ipfsToHttp(uri?: string): string | undefined {
  if (!uri) return undefined;
  if (uri.startsWith('ipfs://')) {
    const path = uri.replace('ipfs://', '');
    return `${IPFS_GATEWAY.replace(/\/+$/, '')}/${path}`;
  }
  return uri;
}

async function fetchJson<T = any>(url?: string): Promise<T | undefined> {
  if (!url) return undefined;
  try {
    const r = await fetch(url);
    if (!r.ok) return undefined;
    return (await r.json()) as T;
  } catch {
    return undefined;
  }
}

/* ------------------ Cache helpers ------------------ */
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;
    
    const item: CacheItem<T> = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - item.timestamp > CACHE_EXPIRY_MS) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  } catch {
    return null;
  }
}

async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
  } catch {
    // Ignore cache errors
  }
}

async function fetchJsonWithCache<T = any>(url?: string): Promise<T | undefined> {
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

/* ------------------ Utilitaires de conversion ------------------ */

// Convertir form data → IPFS data structure
export function formDataToIPFSData(formData: NewBoatFormData): BoatIPFSData {
  const specification: BoatSpecification = {
    price: formData.price,
    title: formData.title,
    name: formData.name,
    city: formData.port || '',
    postal_code: formData.postalCode || '',
    year: formData.year,
    description: `Bateau ${formData.name} de ${formData.year}`,
    summary: `${formData.boat_type} - ${formData.port}`,
    status: 'validated',
    // Convert string inputs to numbers
    overall_length: Number(formData.overall_length || 0),
    width: Number(formData.width || 0),
    draft: Number(formData.draft || 0),
    engine: formData.engine || '',
    fresh_water_capacity: Number(formData.fresh_water_capacity || 0),
    fuel_capacity: Number(formData.fuel_capacity || 0),
    cabins: Number(formData.cabins || 0),
    beds: Number(formData.beds || 0),
    boat_type: formData.boat_type || 'sailboat',
    navigation_category: formData.navigation_category || 'C - inshore navigation',
  };

  return {
    specification,
    certificates: [],
    events: [],
    images: [],
  };
}

// Heuristique pour mapper des métadonnées standards de NFT si présentes (fallback)
function mapMetadataToSpec(meta: any, fallback: Partial<any>): BoatSpecification {
  // Beaucoup de JSON NFT ont { name, description, image, attributes: [{trait_type, value}] }
  const attributes: Record<string, any> = {};
  if (Array.isArray(meta?.attributes)) {
    for (const att of meta.attributes) {
      if (att?.trait_type && att?.value != null) {
        attributes[String(att.trait_type).toLowerCase()] = att.value;
      }
    }
  }

  // On essaye d'enrichir avec ce qu'on trouve, sinon fallback.
  return {
    price: Number(meta?.price ?? fallback.price ?? 0),
    title: meta?.name ?? fallback.title ?? `Bateau #${fallback.id ?? ''}`,
    name: meta?.name ?? fallback.name ?? `Bateau #${fallback.id ?? ''}`,
    city: meta?.city ?? fallback.city ?? '',
    postal_code: meta?.postal_code ?? fallback.postal_code ?? '',
    year: Number(meta?.year ?? attributes['year'] ?? fallback.year ?? new Date().getFullYear()),
    description: meta?.description ?? fallback.description ?? '',
    summary: meta?.description ?? fallback.summary ?? '',
    status: 'validated' as 'validated' | 'pending' | 'rejected',
    overall_length: Number(meta?.overall_length ?? attributes['overall_length'] ?? fallback.overall_length ?? 0),
    width: Number(meta?.width ?? attributes['width'] ?? fallback.width ?? 0),
    draft: Number(meta?.draft ?? attributes['draft'] ?? fallback.draft ?? 0),
    engine: meta?.engine ?? attributes['engine'] ?? fallback.engine ?? '',
    fresh_water_capacity: Number(meta?.fresh_water_capacity ?? attributes['fresh_water_capacity'] ?? fallback.fresh_water_capacity ?? 0),
    fuel_capacity: Number(meta?.fuel_capacity ?? attributes['fuel_capacity'] ?? fallback.fuel_capacity ?? 0),
    cabins: Number(meta?.cabins ?? attributes['cabins'] ?? fallback.cabins ?? 0),
    beds: Number(meta?.beds ?? attributes['beds'] ?? fallback.beds ?? 0),
    boat_type: meta?.boat_type ?? attributes['type'] ?? fallback.boat_type ?? 'sailboat',
    navigation_category: meta?.navigation_category ?? attributes['navigation_category'] ?? fallback.navigation_category ?? 'C - inshore navigation',
  };
}

// Convertir événement blockchain → événement UI
function blockchainEventToUIEvent(event: BlockchainEventRow, boatId: number): BoatEvent {
  const kindMap = {
    0: { short: 'Vente', title: 'Changement de propriétaire' },
    1: { short: 'Réparation', title: 'Intervention atelier' },
    2: { short: 'Incident', title: 'Déclaration d\'incident' },
    3: { short: 'Inspection', title: 'Inspection / Contrôle' },
  };

  const kind = kindMap[event.kind as keyof typeof kindMap] || { short: 'Événement', title: 'Historique' };
  
  return {
    boatName: `Bateau #${boatId}`,
    date: new Date(event.ts).toLocaleDateString('fr-FR'),
    shortTitle: kind.short,
    title: kind.title,
    description: 'Événement blockchain enregistré',
    attachments: event.ipfs_hash ? [{
      title: 'Données blockchain',
      uri: ipfsToHttp(event.ipfs_hash) || ''
    }] : [],
  };
}

/* ------------------ Appels backend ------------------ */

export async function listBoats(): Promise<BoatRow[]> {
  return (await apiFetch('/boats')) as BoatRow[];
}

export async function uploadBoatDataToIPFS(boatData: BoatIPFSData): Promise<{ ipfsHash: string }> {
  return await apiFetch('/documents/upload-json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(boatData),
  }) as { ipfsHash: string };
}

export async function mintPassport(to: string, uri: string) {
  // apiFetch injecte le JWT et parse le JSON
  return await apiFetch('/boats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, uri }),
  });
}

export async function getBoat(id: number): Promise<BoatRow & { exists?: boolean }> {
  return (await apiFetch(`/boats/${id}`)) as any;
}

export async function getBoatEvents(id: number): Promise<BlockchainEventRow[]> {
  return (await apiFetch(`/boats/${id}/events`)) as BlockchainEventRow[];
}

/* ------------------ Fonction utilisée par l’écran (forme UI) ------------------ */

export async function fetchBoatsFromBackend(): Promise<UIBoat[]> {
  // Check cache first
  const cachedBoats = await getCachedData<UIBoat[]>(CACHE_KEY_BOATS);
  if (cachedBoats) {
    console.log('🚀 Using cached boats data');
    return cachedBoats;
  }

  console.log('🌐 Fetching boats from backend...');
  const boats = await listBoats();
  
  // Filter out boats with fake IPFS URIs (old test boats)
  const realBoats = boats.filter(b => b.tokenURI && b.tokenURI !== 'ipfs://example');

  // Résolvons la structure complète IPFS pour chaque bateau
  const out = await Promise.all(
    realBoats.map(async (b) => {
      let ipfsData: any | undefined;

      // Récupérer la structure complète depuis IPFS avec cache
      if (b.tokenURI) {
        const metaUrl = ipfsToHttp(b.tokenURI);
        ipfsData = await fetchJsonWithCache(metaUrl);
      }

      // Si les données IPFS ont la structure avec "boatData"
      if (ipfsData && ipfsData.boatData) {
        const boatData = ipfsData.boatData;
        
        // Récupérer les événements blockchain
        let blockchainEvents: BoatEvent[] = [];
        try {
          const evts = await getBoatEvents(b.id);
          blockchainEvents = evts.map(evt => blockchainEventToUIEvent(evt, b.id));
        } catch {
          // pas bloquant
        }

        // Combiner événements IPFS + blockchain
        const allEvents = [...(boatData.events || []), ...blockchainEvents];

        const uiBoat: UIBoat = {
          id: b.id,
          specification: boatData.specification,
          images: boatData.images || [],
          certificates: boatData.certificates || [],
          events: allEvents,
        };

        return uiBoat;
      }
      
      // Si les données IPFS ont la nouvelle structure modulaire directe, les utiliser directement
      if (ipfsData && ipfsData.specification) {
        // Récupérer les événements blockchain en plus des événements IPFS
        let blockchainEvents: BoatEvent[] = [];
        try {
          const evts = await getBoatEvents(b.id);
          blockchainEvents = evts.map(evt => blockchainEventToUIEvent(evt, b.id));
        } catch {
          // pas bloquant
        }

        // Combiner événements IPFS + blockchain
        const allEvents = [...(ipfsData.events || []), ...blockchainEvents];

        const uiBoat: UIBoat = {
          id: b.id,
          specification: ipfsData.specification,
          images: ipfsData.images || [],
          certificates: ipfsData.certificates || [],
          events: allEvents,
        };

        return uiBoat;
      }

      // Fallback pour les anciens bateaux sans structure modulaire
      const spec = mapMetadataToSpec(ipfsData, { id: b.id });
      const imageHttp = ipfsToHttp(ipfsData?.image);

      const fallbackBoat: UIBoat = {
        id: b.id,
        specification: spec,
        images: imageHttp ? [{ uri: imageHttp }] : [],
        certificates: [],
        events: [],
      };

      return fallbackBoat;
    }),
  );

  // Cache the final result
  await setCachedData(CACHE_KEY_BOATS, out);
  console.log(`💾 Cached ${out.length} boats`);

  return out;
}

// Function to clear boats cache (useful for refresh)
export async function clearBoatsCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY_BOATS);
    // Also clear all IPFS caches
    const keys = await AsyncStorage.getAllKeys();
    const ipfsCacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_IPFS));
    await AsyncStorage.multiRemove(ipfsCacheKeys);
    console.log('🗑️ Cache cleared');
  } catch {
    // Ignore errors
  }
}