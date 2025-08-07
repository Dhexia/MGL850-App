import { listBoats, getBoatEvents } from './boats.api';
import { ipfsToHttp, fetchJsonWithCache } from './ipfs.api';
import { mapMetadataToSpec } from './transformers.api';
import { blockchainEventToUIEvent } from './events.api';
import { getCachedData, setCachedData, clearCache } from './cache.api';
import type { UIBoat, BoatEvent } from '@/lib/boat.types';

const CACHE_KEY_BOATS = 'boats_cache';

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

export async function clearBoatsCache(): Promise<void> {
  try {
    await clearCache('boats_cache');
    await clearCache('ipfs_cache');
    console.log('🗑️ Boats cache cleared');
  } catch {
    // Ignore errors
  }
}