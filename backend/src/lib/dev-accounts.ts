export interface DevAccount {
  address: string;
  privateKey: string;
  role: 'standard_user' | 'certifier';
  name: string;
  description: string;
}

// Comptes de développement avec vraies clés privées pour accès blockchain complet
export const DEV_ACCOUNTS: DevAccount[] = [
  {
    address: '0x766fe3DED655D3318000A10aEB7422BC5f210835',
    privateKey: '0x914e250ef45feac6a713bcd2ff73dae0abb1bf7727a0ed70cac55e50a6d2f9c3',
    role: 'standard_user',
    name: 'Alex Martin - Propriétaire',
    description: 'Propriétaire de 2 bateaux - Peut modifier ses bateaux'
  },
  {
    address: '0xD3bdEb48c0b454AAF25f58FFB3c8e15efAAE30d9',
    privateKey: '0x15c0a93eb9879bab920d60740a05cb5792971475f8eade928a504f0ca3ccadb7',
    role: 'certifier',
    name: 'Bureau Veritas Marine',
    description: 'Certificateur officiel - Peut valider/révoquer'
  },
  {
    address: '0x48f4F0Dff2faaA97767d9e93A03C3849f94E6Cf8',
    privateKey: '0x094509609fab075507e9937dbfb2b6150b85b647115c4a4c2f776e79aa3e9a15',
    role: 'standard_user',
    name: 'Sophie Durand - Acheteuse',
    description: 'Utilisatrice sans bateaux - Peut voir mais PAS modifier'
  }
];

export function getDevAccountByAddress(address: string): DevAccount | undefined {
  return DEV_ACCOUNTS.find(account => 
    account.address.toLowerCase() === address.toLowerCase()
  );
}

export function isDevAccount(address: string): boolean {
  return DEV_ACCOUNTS.some(account => 
    account.address.toLowerCase() === address.toLowerCase()
  );
}

export function isDevMode(): boolean {
  // En développement local, on accepte si NODE_ENV n'est pas 'production'
  return process.env.NODE_ENV !== 'production';
}