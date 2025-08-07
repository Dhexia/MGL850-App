# BoatChain - DApp de gestion, achat et vente de bateaux

BoatChain est une application décentralisée (DApp) basée sur la blockchain Ethereum qui permet la gestion, l'achat et la vente de bateaux avec un système de passeports numériques et de traçabilité complète.

## Architecture du projet

### 🏗️ Structure des composants

1. **boatchain-contracts/** - Smart contracts Solidity avec Hardhat
2. **backend/** - API NestJS avec intégration blockchain  
3. **boatchain/** - Application mobile React Native/Expo

### 📋 Smart Contracts déployés

| Contrat | Description | Fonctionnalités |
|---------|-------------|-----------------|
| **BoatPassport** | ERC721 pour passeports bateaux | NFT propriété, métadonnées IPFS |
| **BoatEvents** | Historique événements | Réparations, inspections, ventes |
| **RoleRegistry** | Gestion des rôles | Certification des certificateurs |

---

## 🔐 Système de rôles et validation

### Rôles disponibles

1. **Utilisateur Standard** (vendeur/acheteur/propriétaire)
   - **Détection** : Aucun rôle spécial on-chain
   - **Permissions** : Gérer ses propres bateaux, déposer documents
   - **Workflow** : Soumet documents → statut "pending" → attend validation

2. **Certificateur** (PROFESSIONAL_ROLE)
   - **Détection** : Possède le rôle PROFESSIONAL_ROLE on-chain + certification IPFS
   - **Permissions** : Valider/rejeter événements, révoquer certifications
   - **Workflow** : Reçoit notifications → examine documents → valide ou rejette

### Workflow de validation

1. **Utilisateur** dépose document (réparation, incident, expertise) → statut `pending`
2. **Certificateur** reçoit notification pour examen
3. **Validation** : document approuvé → statut `validated` → visible publiquement
4. **Rejet** : document non conforme → statut `rejected` → masqué

### Contrôles d'accès on-chain

| Action | Utilisateur Standard | Certificateur |
|--------|---------------------|---------------|
| Créer bateau | ✅ | ❌ |
| Modifier bateau | ✅ (propriétaire) | ❌ |
| Event Sale | ✅ (propriétaire) | ❌ |
| Event Repair/Inspection | 📤 Dépôt (pending) | ✅ Validation |
| Event Incident | ✅ (propriétaire) | ❌ |
| Valider documents | ❌ | ✅ |

---

## 🌐 API Backend (NestJS)

### Routes d'authentification
```
GET  /auth/nonce?address=0x...     → { "nonce": "<hex>" }
POST /auth/login                   → { "token": "<JWT>" }
GET  /auth/profile                 → { "address": "0x...", "role": "standard_user|certifier" }
```

### Routes bateaux
```
GET  /boats                        → Liste tous les bateaux
GET  /boats/:id                    → Détails d'un bateau
GET  /boats/:id/events             → Historique événements bateau
POST /boats                        → Créer nouveau bateau (mint NFT)
POST /boats/:id/events             → Ajouter événement
POST /boats/upload/images          → Upload images vers IPFS
```

### Routes documents
```
POST /documents/boats/:id/events   → Upload document + créer événement
POST /documents/upload-json        → Upload JSON vers IPFS
```

### Sécurité et authentification
- **JWT** requis pour tous les `POST`
- **Signature wallet** pour authentification (nonce)
- **Contrôles de rôles** on-chain pour actions sensibles

---

## 📱 Frontend Mobile (React Native/Expo)

### Stack technique
- **React Native / Expo** - Cross-platform mobile
- **WalletConnect** - Connexion wallets Web3
- **Expo Router** - Navigation file-based
- **TypeScript** - Typage statique

### Composants développés

| Composant | Statut | Description |
|-----------|--------|-------------|
| **WalletContext** | ✅ | Gestion connexion wallet |
| **AuthContext** | ✅ | JWT + session utilisateur |
| **BoatDetailScreen** | ✅ | Vue détaillée bateau |
| **NewBoatScreen** | ✅ | Formulaire création bateau |
| **ImageCarousel** | ✅ | Galerie d'images |
| **ImagePicker** | ✅ | Sélection photos/documents |
| **Boat Components** | ✅ | Sections modulaires UI |

### Écrans disponibles

| Écran | Statut | Features |
|-------|--------|----------|
| **Dashboard** | ✅ | Liste bateaux, navigation |
| **Boat Detail** | ✅ | Infos, événements, certificats |
| **New Boat** | ✅ | Création + upload images |
| **Chat** | 🚧 | Messaging (en développement) |
| **Resources** | ✅ | FAQ, lexique, support |

### APIs intégrées

- ✅ **boats.api** - CRUD bateaux, mint passeports
- ✅ **events.api** - Gestion événements
- ✅ **ipfs.api** - Upload documents IPFS
- ✅ **transformers** - Données UI

---

## 🔧 Configuration et déploiement

### Variables d'environnement Backend
```env
# Blockchain
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<API_KEY>
WEBSOCKET_RPC=wss://eth-sepolia.g.alchemy.com/v2/<API_KEY>
PRIVATE_KEY=0x<wallet_private_key>

# Contrats (Sepolia)
BOAT_PASSPORT_ADDRESS=0x...
BOAT_EVENTS_ADDRESS=0x...
ROLE_REGISTRY_ADDRESS=0x...

# Authentification
JWT_SECRET=<random_32_bytes>

# IPFS
PINATA_JWT=<scoped_jwt_token>

# Base de données
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
```

### Commandes de développement

#### Smart Contracts
```bash
cd boatchain-contracts
npm install
npx hardhat compile         # Compilation + génération types
npx hardhat test           # Tests unitaires
npx hardhat ignition       # Déploiement Sepolia
```

#### Backend  
```bash
cd backend
npm install
npm run start:dev          # Serveur de développement
npm run build             # Build production
npm run test              # Tests unitaires
```

#### Frontend Mobile
```bash
cd boatchain
npm install
npm start                 # Serveur Expo
npm run android           # Android
npm run ios              # iOS
npm run web              # Version web
```

---

## 🧪 Tests et validation

### Backend testé (Postman)
1. ✅ Authentification wallet (nonce → signature → JWT)
2. ✅ Création bateaux avec mint NFT
3. ✅ Ajout événements avec contrôles de rôles
4. ✅ Upload documents IPFS + événements
5. ✅ Lecture événements depuis indexer PostgreSQL

### Indexer temps réel
- ✅ WebSocket Sepolia → événements en base
- ✅ Lecture prioritaire PostgreSQL (≈15s latence)
- ✅ Fallback on-chain si données manquantes

---

## 🗺️ Roadmap de développement

### ✅ Phase 1 - Fondations (Terminé)
- Smart contracts déployés sur Sepolia
- Backend NestJS avec Web3 + authentification
- Frontend mobile avec WalletConnect
- Upload IPFS et indexation événements

### 🚧 Phase 2 - Finalisation (En cours)
- **Interface rôles** : Adaptation UI selon certificateur/vendeur
- **Validation certificats** : Interface certificateur
- **Amélioration UX** : Loading, error handling
- **Tests e2e** : Collection Postman automatisée

### 📋 Phase 3 - Production (Planifié)
- **Tests complets** : Unitaires + intégration
- **Optimisations** : Performance, sécurité
- **Déploiement mainnet** : Migration Ethereum
- **CI/CD** : Pipelines automatisés
- **Monitoring** : Métriques et alertes

---

## 🎯 État actuel et prochaines étapes

### ✅ Fonctionnalités opérationnelles
- Authentification wallet → JWT
- Mint passeports bateaux (NFT ERC721)
- Ajout événements avec contrôles de rôles
- Upload documents/images → IPFS
- Historique temps réel via indexer PostgreSQL
- Interface mobile complète

### 🔄 En développement
- Gestion des rôles dans l'interface utilisateur
- Interface spécialisée pour certificateurs
- Validation et attestation de certificats
- Tests automatisés complets

### 📅 Priorités immédiates
1. **GET /auth/profile** - Détection rôle utilisateur
2. **Interface conditionnelle** - UI selon rôle (vendeur vs certificateur)
3. **Tests e2e** - Validation complète du workflow
4. **Optimisation UX** - États de chargement et gestion d'erreurs

---

*BoatChain révolutionne la traçabilité maritime avec la blockchain - Première DApp complète de gestion de bateaux avec passeports numériques NFT.*