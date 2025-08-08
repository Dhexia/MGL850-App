# Comptes de Développement avec Accès Blockchain Complet

## Résumé

Ce système permet de tester votre DApp sur simulateur iOS avec des comptes ayant un **accès blockchain complet** (mint NFT, ajout événements, certification) sans passer par MetaMask.

## Comptes Générés

### 1. Alex Martin - Propriétaire
- **Adresse** : `0x766fe3DED655D3318000A10aEB7422BC5f210835`
- **Rôle** : `standard_user` 
- **Capacités** : Peut ajouter des bateaux, les modifier, créer des événements

### 2. Bureau Veritas Marine - Certificateur  
- **Adresse** : `0xD3bdEb48c0b454AAF25f58FFB3c8e15efAAE30d9`
- **Rôle** : `certifier`
- **Capacités** : Peut valider/révoquer des certificats, mais ne peut PAS ajouter de bateaux

### 3. Sophie Durand - Acheteuse
- **Adresse** : `0x48f4F0Dff2faaA97767d9e93A03C3849f94E6Cf8`
- **Rôle** : `standard_user`
- **Capacités** : Peut voir les bateaux, ajouter les siens

## Comment Utiliser

1. **Lancez le simulateur iOS** dans Xcode
2. **Démarrez votre app** BoatChain
3. **Naviguez vers** l'écran de comptes de développement
4. **Sélectionnez un compte** (tous ont maintenant l'accès blockchain complet)
5. **Testez les fonctionnalités** :
   - Ajouter des bateaux (Alex/Sophie)
   - Certifier des bateaux (Bureau Veritas)
   - Créer des événements de maintenance

## Fonctionnalités

### Avantages
- **Pas de MetaMask** requis sur simulateur
- **Transactions blockchain réelles** sur Sepolia
- **Rôles et permissions** respectés
- **Authentification JWT** valide
- **Compatible avec toutes** les fonctionnalités de l'app

### Fonctionnement
1. **Frontend** - Sélection du compte dev
2. **Backend** - Endpoint `/auth/dev-login` (mode dev uniquement)
3. **ChainService** - Utilise la clé privée du compte sélectionné
4. **Blockchain** - Transactions signées avec la bonne identité

## Fichiers Modifiés

### Backend
- `src/lib/dev-accounts.ts` - Comptes avec clés privées
- `src/modules/auth/auth.service.ts` - Endpoint dev login
- `src/modules/auth/auth.controller.ts` - Route `/auth/dev-login`
- `src/modules/chain/chain.service.ts` - Multi-signers selon le compte
- `src/modules/boats/boats.service.ts` - Support multi-signers

### Frontend  
- `src/lib/test-accounts.ts` - Comptes dev nettoyés
- `src/contexts/AuthContext.tsx` - Support comptes blockchain nettoyé
- `src/app/(auth)/mock-accounts.tsx` - Interface simplifiée

### Nettoyage Effectué
- Supprimés les scripts de seeding périmés (`src/scripts/`)
- Supprimés les anciens comptes mock frontend-only
- Nettoyé les commentaires et code temporaire
- Simplifié l'architecture pour ne garder que les comptes dev

## Sécurité

- **Mode développement uniquement** - Les endpoints dev sont désactivés en production
- **Clés privées en dur** - Uniquement pour le développement, JAMAIS en production
- **Détection automatique** - Le système s'active seulement sur simulateur/dev

## Prochaines Étapes

1. **Testez chaque compte** pour vérifier les permissions
2. **Ajoutez des bateaux** avec Alex Martin
3. **Certifiez-les** avec Bureau Veritas
4. **Vérifiez** que Sophie ne peut pas certifier

Votre DApp est maintenant prête pour un développement fluide sur simulateur iOS.