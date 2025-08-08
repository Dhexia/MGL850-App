export interface TestAccount {
  address: string;
  role: 'standard_user' | 'certifier';
  name: string;
  description: string;
}

export const TEST_ACCOUNTS: TestAccount[] = [
  {
    address: '0xdf560ba3b1f4c75588a84a454ce79d84c886e6f8',
    role: 'standard_user',
    name: 'Alex Martin - Propriétaire',
    description: 'Propriétaire de 2 bateaux à vendre - Peut modifier ses bateaux'
  },
  {
    address: '0x742d35Cc6635Bb0C73f71F3E5De8Dd7b2Ba8cF9E', 
    role: 'certifier',
    name: 'Bureau Veritas Marine',
    description: 'Certificateur officiel - Peut valider/révoquer, PAS ajouter de bateaux'
  },
  {
    address: '0x8ba1f109551bD432803012645Hac136c30000000',
    role: 'standard_user', 
    name: 'Sophie Durand - Acheteuse',
    description: 'Utilisatrice sans bateaux - Peut voir mais PAS modifier'
  }
];

export function getTestAccountByAddress(address: string): TestAccount | undefined {
  return TEST_ACCOUNTS.find(account => 
    account.address.toLowerCase() === address.toLowerCase()
  );
}

export function isTestMode(): boolean {
  // Détecte si on est en mode test (iOS Simulator ou développement)
  return __DEV__ || process.env.NODE_ENV === 'development';
}

// Rôles et permissions pour les tests
export const TEST_PERMISSIONS = {
  ALEX_MARTIN: {
    address: '0xdf560ba3b1f4c75588a84a454ce79d84c886e6f8',
    canAddBoats: true,
    canEditOwnBoats: true,
    canCertify: false,
    hasBoats: true
  },
  BUREAU_VERITAS: {
    address: '0x742d35Cc6635Bb0C73f71F3E5De8Dd7b2Ba8cF9E',
    canAddBoats: false,
    canEditOwnBoats: false,
    canCertify: true,
    hasBoats: false
  },
  SOPHIE_DURAND: {
    address: '0x8ba1f109551bD432803012645Hac136c30000000',
    canAddBoats: true,
    canEditOwnBoats: false, // n'a pas de bateaux
    canCertify: false,
    hasBoats: false
  }
};