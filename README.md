# Mise en place du projet

Dans chaque repository, il faudra lancer la commande `npm install` pour installer les dépendances.

Dans le repository boatchain-contracts, il faudra également lancer la commande `npx hardhat compile` pour compiler les contrats. Pour les tests, il faudra lancer la commande `npx hardhat test`. Le dossier ignition contient les modules de déploiement des contrats. Il renvoie les adresses des contrats déployés dans le fichier `ignition/deployments/{chain}/deployed_addresses.json`. Ce fichier évite à l'équipe backend et frontend de devoir récupérer les adresses des contrats déployés manuellement.

À chaque fois qu'un contrat est modifié, il faut recompiler les contrats et redéployer les modules de déploiement. Il faudra également mettre à jour le fichier `ignition/deployments/{chain}/deployed_addresses.json` pour que l'équipe backend et frontend puisse récupérer les nouvelles adresses des contrats avec la commande `npx hardhat ignition`. 

Si le temps le permet, on pourrait même héberger les contrats dans un package privé npm pour faciliter la gestion des versions et des dépendances. Cela permettrait à l'équipe backend et frontend de récupérer les contrats directement depuis le package npm sans avoir à se soucier de la compilation et du déploiement. Mais cela nécessiterait une configuration supplémentaire et un peu plus de temps pour mettre en place.
Mais pour le moment on récupère les dossier typechain et les adresses des contrats déployés dans le dossier `ignition/deployments/{chain}/deployed_addresses.json` pour que l'équipe backend et frontend puisse les utiliser. (J'ai copié le dossier typechain-types dans le repository backend pour que l'équipe backend puisse l'utiliser directement.)

La monnaie de test utilisée est l'ETH sur le réseau de test Sepolia. Créez un compte sur le réseau de test Sepolia et récupérez des ETH de test via un faucet. Vous pouvez utiliser le compte créé pour déployer les contrats et interagir avec eux. (Il faudra instancier un .env avec les variables d'environnement nécessaires pour se connecter au réseau Sepolia, comme la clé privée du compte et l'URL du fournisseur de nœud Ethereum, par exemple Infura ou Alchemy.)


Le fichier chain.service.ts du backend correspond à la configuration de l'Adapter Web3.



Je vous donne aussi les étapes que j'ai suivi pour mettre en place le projet. 
Il faut savoir que par exemple, dans certains contrats notamment celui pour les events et les rôles, j'ai pas pris en compte TOUS les rôles et TOUS les events. On pourra les améliorer par la suite.


# Roadmap du projet BoatChain

## 1 – Définir les contrats
1.1 Écrire BoatPassport, RoleRegistry, BoatEvents  
1.2 Compiler et tester localement avec Hardhat  
1.3 Corriger supportsInterface et déployer sur Sepolia avec Ignition  

## 2 – Initialiser le dépôt backend NestJS
2.1 npx nest new boatchain-backend  
2.2 Créer ChainModule pour la connexion Web3  
2.3 Injecter RPC_URL et les adresses des contrats via .env  

## 3 – Lire la chaîne
3.1 Ajouter getHistory, boatExists dans ChainService  
3.2 BoatsModule : GET /boats/:id/events retourne un tableau  

## 4 – Frapper un premier passeport (Pour tester la route GET /boats/:id/events)
4.1 Hardhat console → passport.mint(owner, "ipfs://example")  
4.2 Vérifier ownerOf(1) et la route GET qui renvoie []  

## 5 – Écriture on-chain
5.1 Ajouter signer, mintPassport, addEventTx dans ChainService  
5.2 Exposer POST /boats et POST /boats/:id/events  
5.3 Vérifier en Postman que les transactions partent  

## 6 – Authentification wallet
6.1 AuthModule : GET /auth/nonce, POST /auth/login -> JWT  
6.2 JwtAuthGuard global : protège uniquement les POST  

## 7 – Contrôles métier
7.1 BoatsService.addEvent vérifie owner, assureur, professionnel  
7.2 Rejette 403 si rôle manquant  

## 8 – Upload IPFS
8.1 DocumentModule reçoit un fichier, pousse sur IPFS, récupère le CID  
8.2 Appelle addEvent avec le hash IPFS  

## 9 – Indexer PostgreSQL (option performance)
9.1 Worker WebSocket écoute BoatEventLogged  
9.2 INSERT boat_id, kind, timestamp, ipfs_hash dans la table events  
9.3 BoatsService lit la base avant la chaîne

## 10 – Frontend minimal
10.1 React + wagmi Connect Wallet  
10.2 Page bateau : GET events, formulaire upload → POST events  

## 11 – Tests end-to-end
11.1 Jest Supertest côté backend (mock ChainService)  
11.2 Playwright côté frontend  

## 12 – CI / CD
12.1 Workflow backend : lint, tests, Docker push, deploy staging  
12.2 Workflow contrats : compile, Ignition deploy, publier ABI  
12.3 Workflow frontend : lint, tests, build, CDN deploy  

## 13 – Monitoring
13.1 Alchemy Webhooks pour erreurs tx  
13.2 Prometheus ou Grafana Loki pour latence API et taille events  

