import Constants from 'expo-constants';
import { apiFetch } from '@/lib/api';

const EX = (Constants.expoConfig?.extra ?? {}) as {
  apiBase?: string;
  ipfsGateway?: string; // ex: "https://ipfs.io/ipfs/"
};
const API = EX.apiBase ?? 'http://localhost:3000';
const IPFS_GATEWAY = EX.ipfsGateway ?? 'https://ipfs.io/ipfs/';

const log = (...a: any[]) => console.log('[boats.api]', ...a);

/* ------------------ Types backend bruts ------------------ */
type BoatRow = {
  id: number;
  owner: string;
  tokenURI?: string;
  mintedAt?: string | null;
  blockNumber?: number | null;
  txHash?: string | null;
};

type EventRow = {
  boat_id: number;
  kind: number; // 0 Sale, 1 Repair, 2 Incident, 3 Inspection
  ts: string;   // ISO date
  author: string;
  ipfs_hash: string; // ipfs://CID
  tx_hash: string;
  block_number: number;
};

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

/* ------------------ Mapping vers la forme UI ------------------ */
// L’UI attend un objet du type :
// {
//   id,
//   specification: {
//     title, summary, price, status, city, postal_code, boat_type, year, ...
//   },
//   images: [{ uri }],
//   certificates: [], // (placeholder pour l’instant)
//   events: [ ... ]   // si on veut embarquer un aperçu
// }

type UiBoat = {
  id: number;
  specification?: any;
  images?: Array<{ uri: string }>;
  certificates?: any[];
  events?: any[];
};

// Heuristique pour mapper des métadonnées standards de NFT si présentes
function mapMetadataToSpec(meta: any, fallback: Partial<any>) {
  // Beaucoup de JSON NFT ont { name, description, image, attributes: [{trait_type, value}] }
  const attributes: Record<string, any> = {};
  if (Array.isArray(meta?.attributes)) {
    for (const att of meta.attributes) {
      if (att?.trait_type && att?.value != null) {
        attributes[String(att.trait_type).toLowerCase()] = att.value;
      }
    }
  }

  // On essaye d’enrichir avec ce qu’on trouve, sinon fallback.
  return {
    title: meta?.name ?? fallback.title ?? `Bateau #${fallback.id ?? ''}`,
    summary: meta?.description ?? fallback.summary ?? '',
    price: Number(meta?.price ?? fallback.price ?? 0),
    status: fallback.status ?? 'VERIFIED',
    city: meta?.city ?? fallback.city ?? '',
    postal_code: meta?.postal_code ?? fallback.postal_code ?? '',
    boat_type: meta?.boat_type ?? attributes['type'] ?? fallback.boat_type ?? 'Inconnu',
    year: Number(meta?.year ?? attributes['year'] ?? fallback.year ?? new Date().getFullYear()),
    overall_length: meta?.overall_length ?? attributes['overall_length'] ?? fallback.overall_length,
    width: meta?.width ?? attributes['width'] ?? fallback.width,
    draft: meta?.draft ?? attributes['draft'] ?? fallback.draft,
    engine: meta?.engine ?? attributes['engine'] ?? fallback.engine,
    fresh_water_capacity: meta?.fresh_water_capacity ?? attributes['fresh_water_capacity'] ?? fallback.fresh_water_capacity,
    fuel_capacity: meta?.fuel_capacity ?? attributes['fuel_capacity'] ?? fallback.fuel_capacity,
    cabins: meta?.cabins ?? attributes['cabins'] ?? fallback.cabins,
    beds: meta?.beds ?? attributes['beds'] ?? fallback.beds,
    navigation_category: meta?.navigation_category ?? attributes['navigation_category'] ?? fallback.navigation_category,
  };
}

function mapEventKind(kind: number): { short: string; title: string } {
  switch (kind) {
    case 0: return { short: 'Vente', title: 'Changement de propriétaire' };
    case 1: return { short: 'Réparation', title: 'Intervention atelier' };
    case 2: return { short: 'Incident', title: 'Déclaration d’incident' };
    case 3: return { short: 'Inspection', title: 'Inspection / Contrôle' };
    default: return { short: 'Événement', title: 'Historique' };
  }
}

/* ------------------ Appels backend ------------------ */

export async function listBoats(): Promise<BoatRow[]> {
  return (await apiFetch('/boats')) as BoatRow[];
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

export async function getBoatEvents(id: number): Promise<EventRow[]> {
  return (await apiFetch(`/boats/${id}/events`)) as EventRow[];
}

/* ------------------ Fonction utilisée par l’écran (forme UI) ------------------ */

export async function fetchBoatsFromBackend(): Promise<UiBoat[]> {
  const boats = await listBoats();

  // On résout en parallèle les métadonnées + 1er batch d’events (optionnel)
  const out = await Promise.all(
    boats.map(async (b) => {
      let meta: any | undefined;
      let imageHttp: string | undefined;

      // Résolution éventuelle du tokenURI ipfs:// → JSON
      if (b.tokenURI) {
        const metaUrl = ipfsToHttp(b.tokenURI);
        meta = await fetchJson(metaUrl);
        // Si l’image est dans le metadata
        imageHttp = ipfsToHttp(meta?.image);
      }

      const spec = mapMetadataToSpec(meta, { id: b.id });

      // (Option) on récupère les events pour chaque bateau pour alimenter la section
      // Tu peux enlever ce bloc si tu veux charger les events au détail uniquement.
      let eventsUi: any[] = [];
      try {
        const evts = await getBoatEvents(b.id);
        eventsUi = evts.map((e) => {
          const m = mapEventKind(Number(e.kind));
          const dateStr = new Date(e.ts).toLocaleDateString('fr-FR');
          return {
            boatName: `Bateau #${b.id}`,
            date: dateStr,
            shortTitle: m.short,
            title: m.title,
            description: '',
            attachments: e.ipfs_hash ? [{ title: 'Pièce jointe', uri: ipfsToHttp(e.ipfs_hash) }] : [],
          };
        });
      } catch (e) {
        // pas bloquant
      }

      const uiBoat: UiBoat = {
        id: b.id,
        specification: spec,
        images: imageHttp ? [{ uri: imageHttp }] : [],
        certificates: [], // tu pourras alimenter ça plus tard côté back
        events: eventsUi,
      };

      return uiBoat;
    }),
  );

  return out;
}