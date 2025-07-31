# BoatChain — Plan de tests (monorepo)

Ce dépôt Git contient trois sous‑dossiers :

```
boatchain-contracts/   # Hardhat & Solidity
backend/               # NestJS + indexer + tests API
frontend/              # React + wagmi + Playwright
```

Les workflows CI sont déclarés dans **.github/workflows/**, un YAML par domaine, mais tous vivent au **même niveau racine**.

| N°    | Couche testée         | Sous‑dossier          | Outil / cadre             | Script npm             | Vérifications clés                                                                                                                                       |
| ----- | --------------------- | --------------------- | ------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | Smart‑contracts       | `boatchain-contracts` | Hardhat + Chai            | `npm run test`         | • Rôles `isProfessional`, `INSURER_ROLE`, `MINTER_ROLE`  \• Reverts (`onlyOwner`, `AccessControl`)  \• Événement `BoatEventLogged` émis  \• Gas snapshot |
| **2** | Services Node (unit)  | `backend`             | Jest                      | `npm test`             | • `ChainService.boatExists`  \• `BoatsService.addEvent` → 403 si rôle manquant  \• `mintPassport` renvoie `txHash`                                       |
| **3** | Indexer + Supabase    | `backend`             | Jest (int) + Supabase CLI | `npm run test:indexer` | • Insert `events`, update `cursor`  \• Reprise bloc après restart                                                                                        |
| **4** | API Nest (Supertest)  | `backend`             | Supertest                 | `npm run test:api`     | • `POST /auth/login` 201 + JWT  \• `POST /boats` crée NFT  \• `POST /boats/:id/events` respecte rôles  \• `GET /boats/:id/events` retourne tableau JSON  |
| **5** | Flux complet API      | `backend`             | Newman                    | `npm run test:postman` | Nonce → login → mint → upload → addEvent → GET events  \• Vérifie codes & champs `txHash`, `ipfsHash`                                                    |
| **6** | Front React unitaires | `frontend`            | RTL + Jest                | `npm test`             | • Composant Timeline rend événements  \• Hook `useEvents` fetch & met à jour état                                                                        |
| **7** | Front E2E             | `frontend`            | Playwright                | `npm run test:e2e`     | • Connect wallet → signer login → ajouter événement → timeline mise à jour                                                                               |

---

## Workflows CI (racine `.github/workflows/`)

| Fichier YAML      | Jobs                                   | Déclenchement                             |
| ----------------- | -------------------------------------- | ----------------------------------------- |
| **contracts.yml** | `test-contracts`                       | push / PR touchant `boatchain-contracts/` |
| **backend.yml**   | `unit` → `indexer` → `api` → `postman` | push / PR touchant `backend/` ou global   |
| **frontend.yml**  | `react-unit` → `e2e`                   | push / PR touchant `frontend/` ou global  |

Chaque job installe Node 20, exécute `npm ci`, puis le script indiqué. Les tests Postman tournent **après** le build Nest lancé en arrière‑plan.

---

## Variables CI (GitHub secrets)

| Secret                                  | Utilisé par                | Description                 |
| --------------------------------------- | -------------------------- | --------------------------- |
| `RPC_URL`                               | backend jobs               | Hardhat fork + ChainService |
| `PRIVATE_KEY`                           | backend jobs               | signer test sur fork        |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | indexer & tests int.       |                             |
| `PINATA_JWT`                            | tests Postman ➜ upload doc |                             |
| `JWT_SECRET`                            | backend build              |                             |

Les secrets sont injectés via `env:` ou `--env-var` pour Newman.

---

## Exécution locale

```bash
# 1. contrats
cd boatchain-contracts && npm test
# 2. backend (unit + api)
cd ../backend && npm test && npm run test:api
# 3. front (unit)
cd ../frontend && npm test
```

Pour le flux complet :

```bash
# démarrer backend + indexer
cd backend && npm run start:dev &
# lancer Newman
eval "$(jq -r '.variables[] | "export " + .key + "=" + .value' tests/postman/env.local.json)"
newman run tests/postman/boatchain.collection.json -e tests/postman/env.local.json
```
