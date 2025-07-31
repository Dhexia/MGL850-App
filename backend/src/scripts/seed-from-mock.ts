/**
 * scripts/seed-from-mock.ts
 *
 * Node 18+ requis (fetch, FormData, Blob, File natifs).
 *
 * ENV attendues:
 *  - API_BASE       (ex: http://192.168.1.91:3000)
 *  - AUTH_TOKEN     (JWT obtenu via l'app mobile)
 *  - MOCK_BASE      (ex: http://192.168.1.91:5000  -> ton app.py)
 *  - MINT_TO        (adresse EOA à qui minter les passeports)
 *  - PINATA_JWT     (OPTIONNEL: si présent, upload image + metadata sur IPFS et mint avec tokenURI ipfs://CID)
 *  - IPFS_GATEWAY   (OPTIONNEL: pour debug; par défaut https://ipfs.io/ipfs/)
 *
 * Usage:
 *   ts-node scripts/seed-from-mock.ts
 *   # ou transpile TS → JS puis: node scripts/seed-from-mock.js
 */

type MockBoat = {
  id?: number; // facultatif dans les mocks
  specification?: any;
  images?: Array<{ uri: string }>;
  certificates?: any[];
  events?: Array<{
    title?: string;
    shortTitle?: string;
    description?: string;
    attachments?: Array<{ title?: string; uri: string }>;
  }>;
};

type BoatRow = {
  id: number;
  owner: string;
  tokenURI?: string;
  mintedAt?: string | null;
  blockNumber?: number | null;
  txHash?: string | null;
};

type MintResponse = { txHash: string; tokenId?: string };

const API_BASE = requiredEnv('API_BASE');
const AUTH_TOKEN = requiredEnv('AUTH_TOKEN');
const MOCK_BASE = requiredEnv('MOCK_BASE');
const MINT_TO = requiredEnv('MINT_TO');
const PINATA_JWT = process.env.PINATA_JWT; // optionnel
const IPFS_GATEWAY = process.env.IPFS_GATEWAY ?? 'https://ipfs.io/ipfs/';
const SEED_FORCE_KIND_RAW = process.env.SEED_FORCE_KIND;
const SEED_FORCE_KIND = (
  SEED_FORCE_KIND_RAW !== undefined && SEED_FORCE_KIND_RAW !== ''
    ? Number(SEED_FORCE_KIND_RAW)
    : undefined
);

const log = (...a: any[]) => console.log('[seed]', ...a);

async function main() {
  log('config', {
    API_BASE,
    MOCK_BASE,
    hasToken: Boolean(AUTH_TOKEN),
    hasPinata: Boolean(PINATA_JWT),
  });

  // 1) Lire les mocks depuis app.py
  const mocks = await fetchMockBoats();
  if (mocks.length === 0) {
    log('Aucun mock trouvé. Vérifie MOCK_BASE/app.py et les JSON.');
    return;
  }
  log(`Mocks trouvés: ${mocks.length}`);

  for (const [idx, mock] of mocks.entries()) {
    log(`\n--- Bateau mock #${idx + 1} --------------------------------------`);

    // 2) (optionnel) Upload image principale + metadata vers IPFS si PINATA_JWT fourni
    let tokenURI = 'ipfs://example'; // fallback simple
    const mainImageHttp = mock.images?.[0]?.uri;
    if (PINATA_JWT && mainImageHttp) {
      try {
        const fileImage = await fetchAsFile(
          mainImageHttp,
          `boat_${idx + 1}.jpg`,
        );
        const imageCid = await pinataUploadFile(fileImage);
        const imageIpfs = `ipfs://${imageCid}`;

        const metadata = makeNftMetadataFromMock(mock, imageIpfs);
        const metaBlob = new Blob([JSON.stringify(metadata, null, 2)], {
          type: 'application/json',
        });
        const metaFile = new File([metaBlob], `boat_${idx + 1}.json`, {
          type: 'application/json',
        });
        const metaCid = await pinataUploadFile(metaFile);
        tokenURI = `ipfs://${metaCid}`;

        log('IPFS upload OK', { imageCid, metaCid });
      } catch (e) {
        log('IPFS upload KO (fallback ipfs://example)', e);
      }
    }

    // 3) Mint on-chain via le vrai back
    const mintRes = await postMint(MINT_TO, tokenURI);
    log('mint →', mintRes);

    // 4) Attendre que l’indexer pousse le mint dans Supabase, puis récupérer l’id via txHash
    const boatId = await waitBoatIdFromTxHash(mintRes.txHash, 90_000, 3_000); // timeout 90s, step 3s
    if (!boatId) {
      log(
        'Impossible de retrouver l’id du bateau (indexer trop lent ?). On continue sur le suivant.',
      );
      continue;
    }
    log('indexer → boatId =', boatId);

    // 5) Ajouter des évènements
    //    Si PINATA_JWT absent, on passe par POST /boats/:id/events (ipfsHash=ipfs://example)
    //    Sinon, si attachments dispo: POST /documents/boats/:id/events (multipart) pour upload réel IPFS
    const evts = mock.events ?? [];
    if (evts.length === 0) {
      // Ajoute au moins un incident par défaut
      await addEventSimple(boatId, 2 /* Incident */, 'ipfs://example');
      log('event (incident) ajouté par défaut');
    } else {
      for (const ev of evts) {
        const kind = mapEventKind(ev);
        const firstAttachment = ev.attachments?.[0]?.uri;

        if (PINATA_JWT && firstAttachment) {
          // Upload de la pièce jointe via le back (Pinata côté serveur)
          try {
            await addEventWithFile(boatId, kind, firstAttachment);
            log(`event + file OK (${kind})`);
          } catch (e) {
            log('event + file KO -> fallback simple', e);
            await addEventSimple(boatId, kind, 'ipfs://example');
          }
        } else {
          await addEventSimple(boatId, kind, 'ipfs://example');
        }
      }
    }
  }

  // 6) Récapitulatif
  const boats = await listBoats();
  log('\nSeed terminé. Bateaux en base:');
  for (const b of boats) {
    log(
      `- id=${b.id} owner=${b.owner} tokenURI=${b.tokenURI ?? ''} tx=${b.txHash ?? ''}`,
    );
  }
}

/* --------------------------------- Helpers --------------------------------- */

function requiredEnv(key: string): string {
  const v = process.env[key];
  if (!v) {
    console.error(`ENV manquante: ${key}`);
    process.exit(1);
  }
  return v;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`GET ${url} → ${r.status}`);
  return (await r.json()) as T;
}

async function postJSON<T>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`POST ${url} → ${r.status} ${txt}`);
  }
  return (await r.json()) as T;
}

async function fetchAsFile(
  httpUrl: string,
  filename: string,
  contentType?: string,
): Promise<File> {
  const r = await fetch(httpUrl);
  if (!r.ok) throw new Error(`GET file ${httpUrl} → ${r.status}`);
  const buf = await r.arrayBuffer();
  const type =
    contentType ?? r.headers.get('content-type') ?? 'application/octet-stream';
  return new File([buf], filename, { type });
}

function makeNftMetadataFromMock(mock: MockBoat, imageIpfs: string) {
  const spec = mock.specification ?? {};
  const name = spec.title ?? `Boat #${spec.id ?? ''}`;
  const description = spec.summary ?? '';
  const attributes: Array<{ trait_type: string; value: string | number }> = [];

  const push = (k: string, v: any) => {
    if (v === undefined || v === null || v === '') return;
    attributes.push({ trait_type: k, value: v });
  };

  push('price', spec.price);
  push('status', spec.status);
  push('city', spec.city);
  push('postal_code', spec.postal_code);
  push('boat_type', spec.boat_type);
  push('year', spec.year);
  push('overall_length', spec.overall_length);
  push('width', spec.width);
  push('draft', spec.draft);
  push('engine', spec.engine);
  push('fresh_water_capacity', spec.fresh_water_capacity);
  push('fuel_capacity', spec.fuel_capacity);
  push('cabins', spec.cabins);
  push('beds', spec.beds);
  push('navigation_category', spec.navigation_category);

  return {
    name,
    description,
    image: imageIpfs, // ipfs://CID
    attributes,
  };
}

// remplace ta fonction mapEventKind actuelle par :
function mapEventKind(ev: MockBoat['events'][number]): number {
  if (SEED_FORCE_KIND !== undefined && [0, 1, 2, 3].includes(SEED_FORCE_KIND)) {
    return SEED_FORCE_KIND; // force tous les events pendant le seed
  }
  const title = `${ev.title ?? ''} ${ev.shortTitle ?? ''}`.toLowerCase();
  if (/\b(inspection|contrôle|expertise)\b/.test(title)) return 3; // Inspection
  if (/\b(répar|atelier|maintenance|mécanique)\b/.test(title)) return 1; // Repair
  if (/\b(vente|cession)\b/.test(title)) return 0; // Sale
  return 2; // Incident (défaut)
}

async function pinataUploadFile(file: File): Promise<string> {
  if (!PINATA_JWT) throw new Error('PINATA_JWT manquant');

  // API Pinata v2 (upload public)
  const url = 'https://uploads.pinata.cloud/v2/files';
  const form = new FormData();
  form.set('file', file);

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: form,
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`Pinata upload → ${r.status} ${txt}`);
  }
  const resp = (await r.json()) as any;
  // selon la réponse (v2) → { cid: '...' } attendu
  const cid = resp?.cid ?? resp?.IpfsHash ?? resp?.data?.cid;
  if (!cid) throw new Error('Pinata: CID introuvable dans la réponse');
  return cid;
}

async function postMint(to: string, uri: string): Promise<MintResponse> {
  const url = `${API_BASE}/boats`;
  return postJSON<MintResponse>(url, { to, uri });
}

async function listBoats(): Promise<BoatRow[]> {
  const url = `${API_BASE}/boats`;
  return fetchJSON<BoatRow[]>(url);
}

async function waitBoatIdFromTxHash(
  txHash: string,
  timeoutMs = 60_000,
  stepMs = 3_000,
): Promise<number | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const list = await listBoats().catch(() => [] as BoatRow[]);
    const match = list.find(
      (b) => (b.txHash ?? '').toLowerCase() === txHash.toLowerCase(),
    );
    if (match?.id) return Number(match.id);
    await sleep(stepMs);
  }
  return null;
}

async function addEventSimple(boatId: number, kind: number, ipfsHash: string) {
  const url = `${API_BASE}/boats/${boatId}/events`;
  return postJSON(url, { kind, ipfsHash });
}

async function addEventWithFile(
  boatId: number,
  kind: number,
  fileHttpUrl: string,
) {
  const url = `${API_BASE}/documents/boats/${boatId}/events`;
  const fileName = fileHttpUrl.split('/').pop() || `attachment_${boatId}`;
  const file = await fetchAsFile(fileHttpUrl, fileName);

  const form = new FormData();
  form.set('file', file);
  form.set('kind', String(kind));

  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    body: form,
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`POST ${url} → ${r.status} ${txt}`);
  }
  return r.json();
}

async function fetchMockBoats(): Promise<MockBoat[]> {
  const base = MOCK_BASE.replace(/\/+$/, '');

  // Petit helper pour logguer chaque essai
  const tryGet = async (url: string) => {
    try {
      const r = await fetch(url);
      console.log('[seed]   GET', url, '→', r.status);
      if (!r.ok) return undefined;
      return await r.json();
    } catch (e) {
      console.log('[seed]   GET', url, '→ ERR', (e as Error)?.message);
      return undefined;
    }
  };

  // 1) Essaye l’agrégat /boats (ton Flask peut renvoyer un objet { "1.json": {...}, ... } ou un tableau)
  const agg = await tryGet(`${base}/boats`);
  if (agg) {
    if (Array.isArray(agg)) return agg as MockBoat[];
    if (typeof agg === 'object') {
      const arr = Object.values(agg).filter(Boolean);
      if (arr.length) return arr as MockBoat[];
    }
  }

  // 2) Fallback: plusieurs emplacements possibles pour 1.json, 2.json, 3.json
  const names = ['1.json', '2.json', '3.json'];
  const prefixes = [
    '',               // http://host/1.json
    '/data',          // http://host/data/1.json
    '/data/boat',     // http://host/data/boat/1.json  <-- ton cas actuel
    '/static',        // au cas où
  ];

  const out: MockBoat[] = [];
  for (const name of names) {
    let found: MockBoat | undefined;
    for (const p of prefixes) {
      const url = `${base}${p}/${name}`.replace(/\/{2,}/g, '/').replace(':/', '://');
      const one = await tryGet(url);
      if (one) {
        found = one as MockBoat;
        break;
      }
    }
    if (found) out.push(found);
  }

  return out;
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
