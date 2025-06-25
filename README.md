# Mise en place du projet

Dans chaque repository, il faudra lancer la commande `npm install` pour installer les dépendances.

Dans le repository boatchain-contracts, il faudra également lancer la commande `npx hardhat compile` pour compiler les contrats. Pour les tests, il faudra lancer la commande `npx hardhat test`. Le dossier ignition contient les modules de déploiement des contrats. Il renvoie les adresses des contrats déployés dans le fichier `ignition/deployments/{chain}/deployed_addresses.json`. Ce fichier évite à l'équipe backend et frontend de devoir récupérer les adresses des contrats déployés manuellement.

À chaque fois qu'un contrat est modifié, il faut recompiler les contrats et redéployer les modules de déploiement. Il faudra également mettre à jour le fichier `ignition/deployments/{chain}/deployed_addresses.json` pour que l'équipe backend et frontend puisse récupérer les nouvelles adresses des contrats avec la commande `npx hardhat ignition`. 

Si le temps le permet, on pourrait même héberger les contrats dans un package privé npm pour faciliter la gestion des versions et des dépendances. Cela permettrait à l'équipe backend et frontend de récupérer les contrats directement depuis le package npm sans avoir à se soucier de la compilation et du déploiement. Mais cela nécessiterait une configuration supplémentaire et un peu plus de temps pour mettre en place.
Mais pour le moment on récupère les dossier typechain et les adresses des contrats déployés dans le dossier `ignition/deployments/{chain}/deployed_addresses.json` pour que l'équipe backend et frontend puisse les utiliser. (J'ai copié le dossier typechain-types dans le repository backend pour que l'équipe backend puisse l'utiliser directement.)

La monnaie de test utilisée est l'ETH sur le réseau de test Sepolia. Créez un compte sur le réseau de test Sepolia et récupérez des ETH de test via un faucet. Vous pouvez utiliser le compte créé pour déployer les contrats et interagir avec eux. (Il faudra instancier un .env avec les variables d'environnement nécessaires pour se connecter au réseau Sepolia, comme la clé privée du compte et l'URL du fournisseur de nœud Ethereum, par exemple Infura ou Alchemy.)


Le fichier chain.service.ts du backend correspond à la configuration de l'Adapter Web3.
