# BoatChain API Reference - Frontend Team

Documentation complete des APIs backend pour l'equipe frontend. Ce guide contient tous les types, endpoints, et exemples necessaires pour creer des pages edit-boat, add-certificate, add-event, etc.

## Configuration de Base

```typescript
const API_BASE_URL = 'http://localhost:8080'

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${jwtToken}`
}
```

---

## Types Partages (Enums)

```typescript
export enum EventKind {
  SALE = 0,        // Vente/transfert de propriete
  REPAIR = 1,      // Reparations et maintenance
  INCIDENT = 2,    // Declaration d'incidents
  INSPECTION = 3   // Inspections techniques
}

export enum Status {
  VALIDATED = 'validated',   // Valide
  PENDING = 'pending',       // En attente
  REJECTED = 'rejected',     // Rejete
  SUSPICIOUS = 'suspicious'  // Suspect
}

export enum CertificateType {
  SAFETY = 'safety',         // Securite maritime
  INSURANCE = 'insurance',   // Assurance bateau
  TECHNICAL = 'technical',   // Technique/Mecanique
  INSPECTION = 'inspection'  // Inspection officielle
}
```

---

## Authentification

### GET /auth/nonce

**Description:** Obtenir un nonce pour la signature wallet

**Query Parameters:**
```typescript
interface NonceQuery {
  address: string; // Adresse Ethereum (0x...)
}
```

**Response:**
```typescript
interface NonceResponse {
  nonce: string; // Nonce hexadecimal a signer
}
```

**Exemple:**
```typescript
// Request
GET /auth/nonce?address=0x742d35Cc6634C0532925a3b8D10B5bB4c5C9b

// Response
{
  "nonce": "0x1a2b3c4d5e6f..."
}
```

### POST /auth/login

**Description:** Authentification avec signature wallet

**Request Body:**
```typescript
interface LoginRequest {
  nonce: string;     // Nonce obtenu via /auth/nonce
  signature: string; // Signature du nonce par le wallet
}
```

**Response:**
```typescript
interface LoginResponse {
  token: string;     // JWT token pour les requetes suivantes
  address: string;   // Adresse utilisateur
  role: 'standard_user' | 'certifier';
}
```

**Exemple:**
```typescript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nonce: "0x1a2b3c4d...",
    signature: "0xabcdef..."
  })
});

const { token, address, role } = await response.json();
```

### GET /auth/profile

**Description:** Obtenir le profil utilisateur authentifie

**Headers Required:** Authorization: Bearer {token}

**Response:**
```typescript
interface ProfileResponse {
  address: string;   // Adresse Ethereum
  role: 'standard_user' | 'certifier';
  isVerified: boolean; // true si role === 'certifier'
}
```

---

## Bateaux (Boats)

### DTO Types

```typescript
interface CreateBoatDto {
  to: string;   // Adresse Ethereum du proprietaire (format: 0x...)
  uri: string;  // URI IPFS des metadonnees du bateau
}

interface BoatListItemDto {
  id: number;
  owner: string;        // Adresse Ethereum du proprietaire
  tokenURI?: string;    // URI IPFS des metadonnees
  mintedAt?: string;    // Date de mint (ISO)
  blockNumber?: number; // Numero de bloc blockchain
  txHash?: string;      // Hash de transaction
}

interface BoatResponseDto {
  exists: boolean;      // Si le bateau existe
  id: number;
  owner?: string;
  tokenURI?: string;
  mintedAt?: string;
  blockNumber?: number;
  txHash?: string;
}

// Metadonnees IPFS du bateau (structure complete)
interface BoatIPFSData {
  specification: BoatSpecification;
  certificates: BoatCertificate[];
  events: BoatEvent[];
  images: BoatImage[];
}

interface BoatSpecification {
  price: number;
  title: string;
  name: string;
  city: string;
  postal_code: string;
  year: number;
  overall_length: number;
  width: number;
  draft: number;
  engine: string;
  fresh_water_capacity: number;
  fuel_capacity: number;
  cabins: number;
  beds: number;
  boat_type: string;
  navigation_category: string;
  description: string;
  summary: string;
  status: 'validated' | 'pending' | 'rejected' | 'suspicious';
}

interface BoatImage {
  uri: string; // URL de l'image (Cloudinary, IPFS, etc.)
}

interface BoatAttachment {
  title: string;
  uri: string;
}

interface BoatCertificate {
  person: string;
  date: string;
  title: string;
  expires?: string;
  status: 'validated' | 'pending' | 'rejected' | 'suspicious';
  description: string;
  attachments: BoatAttachment[];
}

interface BoatEvent {
  boatName: string;
  date: string;
  shortTitle: string;
  title: string;
  description: string;
  attachments: BoatAttachment[];
}

interface ImageUploadResponse {
  images: Array<{
    url: string;      // URL Cloudinary
    public_id: string; // ID Cloudinary
  }>;
}
```

### GET /boats

**Description:** Liste de tous les bateaux indexes

**Response:** `BoatListItemDto[]`

**Exemple:**
```typescript
const boats = await fetch('/boats', { headers });
const boatsList: BoatListItemDto[] = await boats.json();
```

### GET /boats/:id

**Description:** Details d'un bateau specifique

**Path Parameters:**
- `id: number` - ID du bateau

**Response:** `BoatResponseDto`

**Exemple:**
```typescript
const boat = await fetch('/boats/1', { headers });
const boatDetails: BoatResponseDto = await boat.json();
```

### POST /boats

**Description:** Creer un nouveau bateau (mint NFT)

**Request Body:** `CreateBoatDto`

**Response:**
```typescript
interface MintResponse {
  tokenId: number;  // ID du nouveau bateau
  txHash: string;   // Hash de la transaction de mint
  success: boolean;
}
```

**Exemple pour page add-boat:**
```typescript
// 1. Preparer les metadonnees du bateau
const boatMetadata: BoatIPFSData = {
  specification: {
    price: 50000,
    title: "Voilier de plaisance",
    name: "Mon Bateau",
    city: "Nice",
    postal_code: "06000",
    year: 2020,
    overall_length: 12.5,
    width: 3.8,
    draft: 2.1,
    engine: "Volvo Penta 30HP",
    fresh_water_capacity: 200,
    fuel_capacity: 100,
    cabins: 2,
    beds: 4,
    boat_type: "Voilier",
    navigation_category: "Hauturier",
    description: "Magnifique voilier en excellent etat...",
    summary: "Voilier 12m parfait pour croisieres familiales",
    status: "pending"
  },
  images: [
    { uri: "https://res.cloudinary.com/.../image1.jpg" },
    { uri: "https://res.cloudinary.com/.../image2.jpg" }
  ],
  certificates: [],
  events: []
};

// 2. Upload metadonnees vers IPFS
const ipfsResponse = await fetch('/documents/upload-json', {
  method: 'POST',
  headers,
  body: JSON.stringify({ boatData: boatMetadata })
});
const { ipfsHash } = await ipfsResponse.json();

// 3. Mint le NFT
const mintResponse = await fetch('/boats', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    to: "0x742d35Cc6634C0532925a3b8D10B5bB4c5C9b",
    uri: `ipfs://${ipfsHash}`
  })
});

const result = await mintResponse.json();
// { tokenId: 42, txHash: "0x...", success: true }
```

### POST /boats/upload/images

**Description:** Upload d'images pour un bateau

**Request Body:** FormData avec fichiers images

**Response:** `ImageUploadResponse`

**Exemple:**
```typescript
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);

const response = await fetch('/boats/upload/images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // Pas de Content-Type pour FormData
  },
  body: formData
});

const result: ImageUploadResponse = await response.json();
// { images: [{ url: "https://...", public_id: "..." }] }
```

---

## Evenements (Events)

### DTO Types

```typescript
interface CreateEventDto {
  boatId: number;     // ID du bateau
  kind: EventKind;    // Type d'evenement (0-3)
  ipfsHash: string;   // Hash IPFS des details
}

interface EventResponseDto {
  id: number;
  boat_id: number;
  kind: EventKind;
  ts: string;           // Date ISO
  author: string;       // Adresse createur
  ipfs_hash: string;    // Hash IPFS des donnees
  tx_hash: string;      // Hash transaction blockchain
  block_number: number;
  status: Status;
  validated_by?: string;  // Adresse validateur
  validated_at?: string;  // Date validation ISO
}

interface CreateEventResponse {
  success: boolean;
  txHash?: string;    // Hash transaction si succes
  message?: string;   // Message d'erreur si echec
}
```

### GET /events/boat/:id

**Description:** Liste des evenements d'un bateau

**Path Parameters:**
- `id: number` - ID du bateau

**Response:** `EventResponseDto[]`

**Exemple:**
```typescript
const events = await fetch('/events/boat/1', { headers });
const eventsList: EventResponseDto[] = await events.json();
```

### POST /events

**Description:** Creer un nouvel evenement

**Request Body:** `CreateEventDto`

**Response:** `CreateEventResponse`

**Exemple pour page add-event:**
```typescript
// 1. Preparer les metadonnees de l'evenement
const eventMetadata = {
  description: "Revision moteur complete",
  timestamp: new Date().toISOString(),
  location: "Port de Nice",
  technician: "Jean Dupont",
  details: "Changement huile, filtre air, bougies...",
  attachments: []
};

// 2. Upload vers IPFS
const ipfsResponse = await fetch('/documents/upload-json', {
  method: 'POST',
  headers,
  body: JSON.stringify({ boatData: eventMetadata })
});
const { ipfsHash } = await ipfsResponse.json();

// 3. Creer l'evenement
const eventResponse = await fetch('/events', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    boatId: 1,
    kind: EventKind.REPAIR, // 1
    ipfsHash: ipfsHash
  })
});

const result: CreateEventResponse = await eventResponse.json();
```

### PUT /events/:boatId/:txHash/validate

**Description:** Valider un evenement (certificateurs seulement)

**Path Parameters:**
- `boatId: number` - ID du bateau
- `txHash: string` - Hash de la transaction

**Request Body:**
```typescript
interface ValidateDto {
  status: Status; // 'validated' | 'rejected' | 'suspicious'
}
```

**Response:** `CreateEventResponse`

**Exemple pour dashboard certificateur:**
```typescript
const validateEvent = async (boatId: number, txHash: string, status: Status) => {
  const response = await fetch(`/events/${boatId}/${txHash}/validate`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status })
  });
  
  return await response.json();
};

// Usage
await validateEvent(1, "0xabc123...", Status.VALIDATED);
```

### GET /events/pending

**Description:** Liste des evenements en attente de validation

**Response:** `EventResponseDto[]` avec `status: 'pending'`

---

## Certificats (Certificates)

### DTO Types

```typescript
interface CreateCertificateDto {
  boatId: number;
  person: string;               // Nom du certificateur
  date: string;                 // Date emission (ISO)
  title: string;                // Titre certificat
  expires?: string;             // Date expiration optionnelle (ISO)
  certificateType: CertificateType;
  description: string;
  ipfsHash: string;            // Hash IPFS des donnees
  attachments: AttachmentDto[];   // Pieces jointes
}

interface AttachmentDto {
  title: string;  // Nom du fichier/document
  uri: string;    // URI du fichier (IPFS, HTTP, etc.)
}

interface CertificateResponseDto {
  id: number;
  boat_id: number;
  person: string;               // Nom du certificateur/emetteur
  date: string;                 // Date d'emission (ISO)
  title: string;                // Titre du certificat
  expires?: string;             // Date d'expiration (ISO)
  certificateType: CertificateType;
  status: Status;
  description: string;
  ipfs_hash: string;
  validated_by?: string;        // Adresse validateur
  validated_at?: string;        // Date validation
  created_at: string;          // Date creation
}

interface CreateCertificateResponse {
  success: boolean;
  certificateId?: number;
  txHash?: string;
  message?: string;
}
```

### GET /certificates/boat/:id

**Description:** Liste des certificats d'un bateau

**Path Parameters:**
- `id: number` - ID du bateau

**Response:** `CertificateResponseDto[]`

### POST /certificates

**Description:** Creer un nouveau certificat

**Request Body:** `CreateCertificateDto`

**Response:** `CreateCertificateResponse`

**Exemple pour page add-certificate:**
```typescript
// 1. Preparer les donnees du certificat
const certificateData = {
  boatId: 1,
  person: "Inspecteur Maritime Jean Dupont",
  date: "2024-01-15T10:00:00Z",
  title: "Certificat de securite maritime",
  expires: "2025-01-15T10:00:00Z",
  certificateType: CertificateType.SAFETY,
  description: "Inspection complete de securite conforme aux normes...",
  attachments: [
    {
      title: "Rapport d'inspection",
      uri: "ipfs://QmReportHash..."
    },
    {
      title: "Photos du bateau",
      uri: "https://cloudinary.com/photos..."
    }
  ]
};

// 2. Upload metadonnees vers IPFS
const ipfsResponse = await fetch('/documents/upload-json', {
  method: 'POST',
  headers,
  body: JSON.stringify({ boatData: certificateData })
});
const { ipfsHash } = await ipfsResponse.json();

// 3. Creer le certificat
const certResponse = await fetch('/certificates', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    ...certificateData,
    ipfsHash: ipfsHash
  })
});

const result: CreateCertificateResponse = await certResponse.json();
```

### PUT /certificates/:id/validate

**Description:** Valider un certificat (certificateurs seulement)

**Path Parameters:**
- `id: number` - ID du certificat

**Request Body:** `ValidateDto`

**Response:** `CreateCertificateResponse`

### GET /certificates/pending

**Description:** Liste des certificats en attente de validation

**Response:** `CertificateResponseDto[]` avec `status: 'pending'`

---

## Documents & IPFS

### POST /documents/upload-json

**Description:** Upload de donnees JSON vers IPFS

**Request Body:**
```typescript
interface IPFSUploadRequest {
  boatData: any; // Objet JSON a stocker
}
```

**Response:**
```typescript
interface IPFSUploadResponse {
  ipfsHash: string;  // Hash IPFS du fichier uploade
}
```

**Exemple:**
```typescript
const data = {
  description: "Donnees quelconques",
  timestamp: new Date().toISOString(),
  // ... autres donnees
};

const response = await fetch('/documents/upload-json', {
  method: 'POST',
  headers,
  body: JSON.stringify({ boatData: data })
});

const { ipfsHash } = await response.json();
// ipfsHash: "QmHash123..."
```

### POST /documents/boats/:id/events

**Description:** DEPRECATED - Utiliser /events a la place

---

## Exemples d'Implementation Frontend

### Page EditBoat

```typescript
interface EditBoatProps {
  boatId: number;
}

const EditBoat: React.FC<EditBoatProps> = ({ boatId }) => {
  const [boat, setBoat] = useState<BoatResponseDto | null>(null);
  const [events, setEvents] = useState<EventResponseDto[]>([]);
  const [certificates, setCertificates] = useState<CertificateResponseDto[]>([]);
  
  useEffect(() => {
    const loadBoat = async () => {
      // Charger details bateau
      const boatResponse = await fetch(`/boats/${boatId}`, { headers });
      const boatData: BoatResponseDto = await boatResponse.json();
      setBoat(boatData);
      
      // Charger evenements
      const eventsResponse = await fetch(`/events/boat/${boatId}`, { headers });
      const eventsData: EventResponseDto[] = await eventsResponse.json();
      setEvents(eventsData);
      
      // Charger certificats
      const certsResponse = await fetch(`/certificates/boat/${boatId}`, { headers });
      const certsData: CertificateResponseDto[] = await certsResponse.json();
      setCertificates(certsData);
    };
    
    loadBoat();
  }, [boatId]);
  
  return (
    <div>
      <h1>Edition Bateau #{boatId}</h1>
      {boat && (
        <div>
          <p>Proprietaire: {boat.owner}</p>
          <p>URI: {boat.tokenURI}</p>
          
          <h2>Evenements ({events.length})</h2>
          {events.map(event => (
            <div key={event.id}>
              <p>{EventKind[event.kind]} - {event.ts}</p>
              <p>Status: {event.status}</p>
            </div>
          ))}
          
          <h2>Certificats ({certificates.length})</h2>
          {certificates.map(cert => (
            <div key={cert.id}>
              <p>{cert.title} - {cert.person}</p>
              <p>Status: {cert.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Page AddEvent

```typescript
interface AddEventProps {
  boatId: number;
}

const AddEvent: React.FC<AddEventProps> = ({ boatId }) => {
  const [eventKind, setEventKind] = useState<EventKind>(EventKind.REPAIR);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Preparer metadonnees
      const metadata = {
        description,
        timestamp: new Date().toISOString(),
        eventType: EventKind[eventKind],
        boatId: boatId
      };
      
      // 2. Upload vers IPFS
      const ipfsResponse = await fetch('/documents/upload-json', {
        method: 'POST',
        headers,
        body: JSON.stringify({ boatData: metadata })
      });
      
      const { ipfsHash } = await ipfsResponse.json();
      
      // 3. Creer l'evenement
      const eventResponse = await fetch('/events', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          boatId,
          kind: eventKind,
          ipfsHash
        })
      });
      
      const result: CreateEventResponse = await eventResponse.json();
      
      if (result.success) {
        alert('Evenement cree avec succes!');
        // Redirection ou reset form
      } else {
        alert('Erreur: ' + result.message);
      }
    } catch (error) {
      console.error('Erreur creation evenement:', error);
      alert('Erreur lors de la creation');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h1>Ajouter Evenement - Bateau #{boatId}</h1>
      
      <div>
        <label>Type d'evenement:</label>
        <select 
          value={eventKind} 
          onChange={e => setEventKind(Number(e.target.value) as EventKind)}
        >
          <option value={EventKind.SALE}>Vente</option>
          <option value={EventKind.REPAIR}>Reparation</option>
          <option value={EventKind.INCIDENT}>Incident</option>
          <option value={EventKind.INSPECTION}>Inspection</option>
        </select>
      </div>
      
      <div>
        <label>Description:</label>
        <textarea 
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description detaillee de l'evenement..."
          required
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creation...' : 'Creer Evenement'}
      </button>
    </form>
  );
};
```

### Dashboard Certificateur

```typescript
const CertificatorDashboard: React.FC = () => {
  const [pendingEvents, setPendingEvents] = useState<EventResponseDto[]>([]);
  const [pendingCerts, setPendingCerts] = useState<CertificateResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPendingItems();
  }, []);
  
  const loadPendingItems = async () => {
    try {
      const [eventsResponse, certsResponse] = await Promise.all([
        fetch('/events/pending', { headers }),
        fetch('/certificates/pending', { headers })
      ]);
      
      const events: EventResponseDto[] = await eventsResponse.json();
      const certs: CertificateResponseDto[] = await certsResponse.json();
      
      setPendingEvents(events);
      setPendingCerts(certs);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const validateEvent = async (boatId: number, txHash: string, status: Status) => {
    try {
      const response = await fetch(`/events/${boatId}/${txHash}/validate`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });
      
      const result = await response.json();
      if (result.success) {
        await loadPendingItems(); // Recharger la liste
      }
    } catch (error) {
      console.error('Erreur validation:', error);
    }
  };
  
  const validateCertificate = async (certId: number, status: Status) => {
    try {
      const response = await fetch(`/certificates/${certId}/validate`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status })
      });
      
      const result = await response.json();
      if (result.success) {
        await loadPendingItems();
      }
    } catch (error) {
      console.error('Erreur validation:', error);
    }
  };
  
  if (loading) return <div>Chargement...</div>;
  
  return (
    <div>
      <h1>Dashboard Certificateur</h1>
      
      <section>
        <h2>Evenements en attente ({pendingEvents.length})</h2>
        {pendingEvents.map(event => (
          <div key={event.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>Bateau #{event.boat_id} - {EventKind[event.kind]}</h3>
            <p>Auteur: {event.author}</p>
            <p>Date: {new Date(event.ts).toLocaleDateString()}</p>
            <p>IPFS: {event.ipfs_hash}</p>
            
            <div>
              <button onClick={() => validateEvent(event.boat_id, event.tx_hash, Status.VALIDATED)}>
                Valider
              </button>
              <button onClick={() => validateEvent(event.boat_id, event.tx_hash, Status.REJECTED)}>
                Rejeter
              </button>
              <button onClick={() => validateEvent(event.boat_id, event.tx_hash, Status.SUSPICIOUS)}>
                Marquer Suspect
              </button>
            </div>
          </div>
        ))}
      </section>
      
      <section>
        <h2>Certificats en attente ({pendingCerts.length})</h2>
        {pendingCerts.map(cert => (
          <div key={cert.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
            <h3>{cert.title}</h3>
            <p>Bateau: #{cert.boat_id}</p>
            <p>Emetteur: {cert.person}</p>
            <p>Type: {cert.certificateType}</p>
            <p>Description: {cert.description}</p>
            
            <div>
              <button onClick={() => validateCertificate(cert.id, Status.VALIDATED)}>
                Valider
              </button>
              <button onClick={() => validateCertificate(cert.id, Status.REJECTED)}>
                Rejeter
              </button>
              <button onClick={() => validateCertificate(cert.id, Status.SUSPICIOUS)}>
                Marquer Suspect
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
```

## Gestion d'Erreurs

```typescript
const makeApiCall = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });
    
    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error('Donnees invalides - verifiez les champs requis');
        case 401:
          throw new Error('Token expire - reconnectez-vous');
        case 403:
          throw new Error('Acces interdit - role insuffisant');
        case 404:
          throw new Error('Ressource non trouvee');
        case 500:
          throw new Error('Erreur serveur');
        default:
          throw new Error(`Erreur HTTP: ${response.status}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};
```

## Status Codes

- 200: Succes
- 400: Donnees invalides (validation DTO echouee)
- 401: Non authentifie (token JWT invalide/manquant)
- 403: Non autorise (role insuffisant)
- 404: Ressource non trouvee
- 500: Erreur serveur

Cette documentation est synchronisee avec les DTOs backend. Tous les types correspondent exactement aux interfaces definies dans le backend.