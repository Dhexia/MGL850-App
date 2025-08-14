# BoatChain - DApp de gestion, achat et vente de bateaux

BoatChain est une application décentralisée (DApp) basée sur la blockchain Ethereum qui permet la gestion, l'achat et la vente de bateaux avec un système de passeports numériques, de traçabilité complète et de communication intégrée.

## Architecture du projet

### 🏗️ Structure des composants

1. **boatchain-contracts/** - Smart contracts Solidity avec Hardhat
2. **backend/** - API NestJS avec architecture modulaire et DTOs typés
3. **frontend/** - Application mobile React Native/Expo

### 📋 Smart Contracts déployés (Sepolia)

| Contrat | Adresse | Description | Fonctionnalités |
|---------|---------|-------------|-----------------|
| **BoatPassport** | `0x7b2D3E97A153d62e8306e14D690469C3e99BB468` | ERC721 pour passeports bateaux | NFT propriété, métadonnées IPFS |
| **BoatEvents** | `0x4AF1C8F15065c47eA26A02B4930035Cce2Ff5ecA` | Historique événements | Réparations, inspections, ventes |
| **RoleRegistry** | `0xf0B2598Ea8e0EF26b32D0eF344160217bBbA44D8` | Gestion des rôles | Certification des certificateurs |
| **BoatCertificate** | `0x3cE92d6D7e33399f2780FAd77aedD32411532970` | **NOUVEAU** - Certificats blockchain | Émission, validation, révocation |

---

## 🏗️ Architecture modulaire backend

### Structure organisée par domaine métier

```
backend/src/
├── modules/
│   ├── auth/               # Authentification JWT + wallet
│   ├── boats/              # Gestion bateaux + NFT
│   ├── events/             # Gestion événements + validation
│   ├── certificates/       # Gestion certificats + validation
│   ├── chat/               # Système de messagerie P2P
│   ├── chain/              # Intégration blockchain
│   ├── cloudinary/         # Upload images
│   ├── document/           # Upload IPFS
│   └── indexer/            # Indexation PostgreSQL
├── health/                 # Endpoints de santé + nettoyage
└── common/                 # Interceptors et utilitaires
```

### Responsabilités séparées

- **Auth** : Authentification wallet + JWT
- **Boats** : Mint NFT, liste, détails, upload images
- **Events** : CRUD événements, workflow validation
- **Certificates** : CRUD certificats, validation professionnelle
- **Chat** : Messagerie P2P, offres d'achat, négociation
- **Chain** : Intégration smart contracts
- **Health** : Monitoring + endpoints de nettoyage

---

## 🔐 Système de rôles et validation

### Types d'événements (EventKind)

| Valeur | Nom | Qui peut créer | Description |
|--------|-----|----------------|-------------|
| **0** | **SALE** | Propriétaires uniquement | Vente/transfert de propriété |
| **1** | **REPAIR** | Tous les utilisateurs | Réparations et maintenance → validation certificateur |
| **2** | **INCIDENT** | Propriétaires uniquement | Déclaration d'incidents |
| **3** | **INSPECTION** | Tous les utilisateurs | Inspections techniques → validation certificateur |

### Types de certificats (CertificateType)

| Type | Description | Validateurs |
|------|-------------|-------------|
| **safety** | Sécurité maritime | Professionnels certifiés |
| **insurance** | Assurance bateau | Compagnies d'assurance |
| **technical** | Technique/Mécanique | Techniciens certifiés |
| **inspection** | Inspection officielle | Inspecteurs agréés |

### Statuts de validation (Status)

| Statut | Description | Icône |
|--------|-------------|-------|
| **validated** | Validé par certificateur | ✅ |
| **pending** | En attente de validation | ⏳ |
| **rejected** | Rejeté par certificateur | ❌ |
| **suspicious** | Marqué comme suspect | ⚠️ |

### Workflow de validation

1. **Utilisateur Standard** :
   - Peut créer tous les types d'événements et certificats
   - Statut initial : `pending` (en attente)

2. **Certificateur** (PROFESSIONAL_ROLE) :
   - Reçoit notifications pour éléments `pending`
   - Peut valider/rejeter → change statut à `validated/rejected/suspicious`

---

## 🌐 API Backend modulaire

### Routes d'authentification
```typescript
GET  /auth/nonce?address=0x...     → { "nonce": "<hex>" }
POST /auth/login                   → { "token": "<JWT>" }
GET  /auth/profile                 → { "address": "0x...", "role": "standard_user|certifier" }
```

### Routes bateaux (module boats)
```typescript
GET  /boats                        → BoatListItemDto[]
GET  /boats/:id                    → BoatResponseDto
POST /boats                        → CreateBoatDto { to: string, uri: string }
POST /boats/upload/images          → { images: Array<{ url: string, public_id: string }> }
```

### Routes événements (module events)
```typescript
GET  /events/boat/:id                   → Liste événements d'un bateau
POST /events                            → CreateEventDto { boatId, kind, ipfsHash }
PUT  /events/:boatId/:txHash/validate   → ValidateDto { status: Status }
GET  /events/pending                    → Événements en attente de validation
```

### Routes certificats (module certificates)
```typescript
GET  /certificates/boat/:id         → Liste certificats d'un bateau
POST /certificates                  → CreateCertificateDto (complet avec type, expiration)
PUT  /certificates/:id/validate     → ValidateDto { status: Status }
GET  /certificates/pending          → Certificats en attente de validation
```

### Routes chat (module chat)
```typescript
POST /chat/conversations           → Créer conversation P2P
GET  /chat/conversations           → Liste conversations utilisateur
GET  /chat/conversations/:id       → Détails conversation
POST /chat/messages                → Envoyer message
POST /chat/conversations/:id/offer → Envoyer offre d'achat
POST /chat/conversations/:id/offer/accept → Accepter offre
```

### Routes documents et santé
```typescript
POST /documents/upload-json        → Upload JSON vers IPFS
GET  /health                       → Status système + contrats
DELETE /health/chat-all            → Nettoyer toutes les conversations
DELETE /health/chat-messages       → Nettoyer messages uniquement
GET  /health/chat-stats            → Statistiques chat
```

---

## 📊 Structure des DTOs

### DTOs par module

| Module | DTOs | Responsabilité |
|--------|------|----------------|
| **boats/** | CreateBoatDto, BoatResponseDto | Gestion bateaux + NFT |
| **events/** | CreateEventDto, EventResponseDto | Événements + workflow validation |
| **certificates/** | CreateCertificateDto, CertificateResponseDto | Certificats + validation pro |
| **chat/** | CreateConversationDto, ConversationResponseDto, SendMessageDto | Messages P2P + offres |

### Validation automatique
- **class-validator** pour validation stricte
- **Types TypeScript** auto-générés depuis smart contracts
- **Nested validation** pour structures complexes
- **Enums** pour cohérence frontend/backend

---

## 🔗 Intégration blockchain (ChainService)

### Méthodes par contrat

**BoatPassport** :
- `mintPassport()` - Créer NFT bateau
- `getOwner()`, `tokenURI()` - Lecture propriété

**BoatEvents** :
- `addEventTx()` - Ajouter événement on-chain
- `getHistory()` - Historique événements

**RoleRegistry** :
- `isCertifiedProfessional()` - Vérification rôles
- `isOwner()` - Vérification propriété

**BoatCertificate** (NOUVEAU) :
- `issueCertificate()` - Émettre certificat on-chain
- `validateCertificateOnChain()` - Valider on-chain
- `getCertificate()`, `getBoatCertificates()` - Lecture
- `isCertificateValid()` - Vérification validité

---

## 📱 Frontend Mobile (React Native/Expo)

### Stack technique
- **React Native / Expo** - Cross-platform mobile avec support iOS/Android/Web
- **WalletConnect** - Intégration Web3 pour connexion wallets
- **Expo Router v5** - Navigation file-based avec typed routes
- **TypeScript** - Typage complet avec interfaces synchronisées backend
- **AsyncStorage** - Cache intelligent avec TTL 5 minutes
- **Cloudinary** - Upload et optimisation d'images

### ✅ Architecture Frontend Intégrée

**API Layer Modulaire** :
```typescript
frontend/src/lib/api/
├── boats.api.ts        # CRUD bateaux + mint NFT
├── events.api.ts       # Événements avec nouveaux endpoints
├── certificates.api.ts # NOUVEAU - Gestion certificats
├── ipfs.api.ts        # Upload IPFS + cache
├── cache.api.ts       # Cache AsyncStorage avec TTL
└── transformers.api.ts # Transformation blockchain ↔ UI
```

**State Management** :
```typescript
src/contexts/
├── AuthContext.tsx      # JWT + authentification wallet
├── WalletContext.tsx    # WalletConnect intégration
└── RightDrawerContext.tsx # Navigation drawer
```

**Intégration API Complète** :
```typescript
// ✅ INTÉGRÉ - Nouveaux endpoints utilisés
GET /events/boat/:id              # Liste événements bateau
POST /events                      # Créer événement
PUT /events/:boatId/:txHash/validate # Validation certificateur

// ✅ INTÉGRÉ - Module certificats
GET /certificates/boat/:id        # Liste certificats bateau  
POST /certificates               # Créer certificat
PUT /certificates/:id/validate   # Validation certificat
```

### Architecture des Composants UI

**Structure Modulaire** :
```typescript
src/components/boat/
├── BoatHeader.tsx           # En-tête détail bateau
├── BoatImageSection.tsx     # Carrousel images
├── BoatMainInfo.tsx         # Infos principales  
├── BoatTechnicalSpecs.tsx   # Spécifications techniques
├── BoatCertificatesSection.tsx # Liste certificats avec statuts
└── BoatEventsSection.tsx    # Historique événements
```

**Navigation & Routing** :
```typescript
src/app/
├── (tabs)/                  # Navigation tabs principale
│   ├── boat.tsx            # Liste bateaux avec cache
│   ├── profile.tsx         # Profil utilisateur
│   └── _layout.tsx         # Layout tabs
├── boats/
│   ├── boat-detail-screen.tsx # Détail bateau complet
│   └── new-boat.tsx        # Création nouveau bateau
└── _layout.tsx             # Layout racine + drawer
```

### Performance & Cache

**Système de Cache Intelligent** :
- **Cache Level 1** : AsyncStorage avec TTL 5 minutes pour données API
- **Cache Level 2** : Cache IPFS dédié pour métadonnées blockchain  
- **Mock Mode** : Données de test automatiques en développement
- **Background Sync** : Rafraîchissement automatique des données expirées

**Optimisations** :
```typescript
// Cache avec invalidation intelligente  
const cachedBoats = await getCachedData<UIBoat[]>('boats_cache');
if (cachedBoats) {
  return cachedBoats; // Réponse instantanée
}

// Transformation blockchain → UI avec mémoisation
const blockchainEvents = evts.map(evt => blockchainEventToUIEvent(evt, boatId));
const allEvents = [...(ipfsData.events || []), ...blockchainEvents];
```

### Types & Data Flow

**Synchronisation Backend ↔ Frontend** :
```typescript
// DTOs backend synchronisés
interface BlockchainEventRow {        # Backend response
interface BoatEvent {                 # Frontend UI
interface BlockchainCertificateRow {  # Backend response  
interface BoatCertificate {           # Frontend UI
```

**Pipeline de Données** :
```
1. API Backend → BlockchainEventRow[]
2. Transform → blockchainEventToUIEvent() 
3. Merge → IPFS events + Blockchain events
4. Cache → AsyncStorage avec TTL
5. UI → BoatEvent[] dans composants React
```

---

## 🔧 Configuration et déploiement

### Variables d'environnement Backend
```env
# Blockchain
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<API_KEY>
WEBSOCKET_RPC=wss://eth-sepolia.g.alchemy.com/v2/<API_KEY>
PRIVATE_KEY=0x<wallet_private_key>

# Contrats (Sepolia) - TOUTES LES ADRESSES MISES À JOUR
BOAT_PASSPORT_ADDRESS=0x7b2D3E97A153d62e8306e14D690469C3e99BB468
BOAT_EVENTS_ADDRESS=0x4AF1C8F15065c47eA26A02B4930035Cce2Ff5ecA
ROLE_REGISTRY_ADDRESS=0xf0B2598Ea8e0EF26b32D0eF344160217bBbA44D8
BOAT_CERTIFICATE_ADDRESS=0x3cE92d6D7e33399f2780FAd77aedD32411532970

# Authentification
JWT_SECRET=<random_32_bytes>

# IPFS
PINATA_JWT=<scoped_jwt_token>

# Base de données
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
```

### Base de données Supabase

**Tables mises à jour** :
```sql
-- Table events (mise à jour avec validation)
ALTER TABLE events ADD COLUMN status text DEFAULT 'pending';
ALTER TABLE events ADD COLUMN validated_by text;
ALTER TABLE events ADD COLUMN validated_at timestamptz;

-- Table certificates (nouvelle)
CREATE TABLE certificates (
  id bigserial primary key,
  boat_id bigint not null,
  person text not null,
  date timestamptz not null,
  title text not null,
  expires timestamptz,
  certificate_type text default 'technical',
  status text default 'pending',
  description text not null,
  ipfs_hash text not null,
  validated_by text,
  validated_at timestamptz,
  created_at timestamptz default now()
);
```

### Commandes de développement

#### Smart Contracts
```bash
cd boatchain-contracts
npm install
npx hardhat compile                           # Génère types TypeScript
npx hardhat ignition deploy ignition/modules/BoatCertificate.js --network sepolia
```

#### Backend (port 8080)
```bash
cd backend
npm install
npm run start:dev    # Démarre sur http://localhost:8080
npm run build       # Build production
npm run lint        # ESLint avec auto-fix
npm run test        # Tests unitaires Jest
npm run seed:boats  # Peuple la DB avec vrais données bateaux
```

#### Frontend React Native/Expo
```bash
cd frontend
npm install
npm start           # Serveur Expo dev
npm run android     # Build Android
npm run ios         # Build iOS 
npm run web         # Version web
npm run lint        # ESLint Expo
```

#### Endpoints utiles
```bash
# Health checks
curl http://localhost:8080/health                    # Status système
curl http://localhost:8080/health/chat-stats         # Stats chat

# Nettoyage développement  
curl -X DELETE http://localhost:8080/health/chat-all # Vider conversations
curl -X DELETE http://localhost:8080/health/all-boats # Vider bateaux
```

---

## 🧪 Tests et validation

### Endpoints testables (Postman)

**API Complète** :
1. ✅ `POST /boats` - Mint NFT avec CreateBoatDto
2. ✅ `POST /events` - Événements avec EventKind validation  
3. ✅ `POST /certificates` - Certificats avec CertificateType
4. ✅ `POST /chat/conversations` - Conversations P2P
5. ✅ `POST /chat/messages` - Messages + offres d'achat
6. ✅ `PUT /events/:boatId/:txHash/validate` - Validation par certificateurs
7. ✅ `DELETE /health/chat-all` - Nettoyage développement

### Base de données Supabase
- ✅ Tables : boats, events, certificates, conversations, messages
- ✅ Indexation temps réel via IndexerService
- ✅ Types synchronisés backend ↔ frontend

---

## 🎯 État actuel - Architecture enterprise

### ✅ Architecture production-ready
- **4 smart contracts** déployés sur Sepolia
- **Architecture modulaire** backend avec séparation des responsabilités  
- **Frontend React Native** intégré avec nouveaux endpoints modulaires
- **DTOs typés** avec validation automatique frontend ↔ backend
- **Workflow de validation** complet utilisateurs ↔ certificateurs
- **Types TypeScript** auto-générés depuis blockchain
- **Base de données** structurée avec indexation temps réel
- **Cache intelligent** frontend avec AsyncStorage + TTL
- **Performance optimisée** avec mock mode et background sync

### 📅 Prochaines étapes recommandées
1. **Frontend** - Suite complète frontend avec nouveaux DTOs
2. **Documentation Swagger** - Auto-génération depuis DTOs
3. **Interface certificateurs** - Dashboard validation pending
4. **Optimisations performance** - React.memo, React Query, expo-image

---

*BoatChain - Architecture enterprise full-stack avec blockchain Ethereum, backend modulaire NestJS, frontend React Native intégré et validation automatique DTOs. Production-ready pour la traçabilité maritime décentralisée.*