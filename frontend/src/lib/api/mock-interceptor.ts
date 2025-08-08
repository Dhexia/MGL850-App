import type { UIBoat } from '@/lib/boat.types';
import { TEST_ACCOUNTS } from '../test-accounts';

// Mock boats data pour les tests de permissions
const MOCK_BOATS: UIBoat[] = [
  // Bateau 1 - Alex Martin (peut modifier)
  {
    id: 22,
    specification: {
      owner_id: TEST_ACCOUNTS[0].address, // Alex Martin
      status: 'validated',
      is_for_sale: true,
      title: 'Sun Odyssey 380 - Alex',
      year: '2019',
      length: '11.27m',
      beam: '3.99m',
      draft: '1.90m',
      engine: 'Yanmar 30CV',
      fuel: 'Diesel',
      sleeps: 6,
      price: '125000',
      currency: 'EUR',
      location: 'Port-Grimaud, France',
      description: 'Magnifique voilier parfaitement entretenu. ALEX PEUT MODIFIER CE BATEAU.'
    },
    images: [
      { uri: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800' },
      { uri: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800' }
    ],
    events: [
      {
        id: 'evt_001',
        type: 'maintenance',
        title: 'Révision moteur complète',
        description: 'Vidange, filtres, contrôle général du moteur Yanmar',
        date: '2024-03-15',
        status: 'validated',
        certifier_id: TEST_ACCOUNTS[1].address, // Bureau Veritas
        documents: []
      }
    ],
    certificates: [
      {
        id: 'cert_001',
        type: 'safety',
        title: 'Certificat de sécurité',
        description: 'Équipements de sécurité conformes - Catégorie B',
        issue_date: '2024-01-10',
        expiry_date: '2025-01-10',
        status: 'validated',
        certifier_id: TEST_ACCOUNTS[1].address // Bureau Veritas
      }
    ]
  },

  // Bateau 2 - Alex Martin (peut modifier)
  {
    id: 23,
    specification: {
      owner_id: TEST_ACCOUNTS[0].address, // Alex Martin
      status: 'pending',
      is_for_sale: true,
      title: 'Lagoon 380 - Alex',
      year: '2020',
      length: '11.55m',
      beam: '6.53m',
      draft: '1.15m',
      engine: '2x Yanmar 30CV',
      fuel: 'Diesel',
      sleeps: 8,
      price: '280000',
      currency: 'EUR',
      location: 'Antibes, France',
      description: 'Catamaran spacieux, parfait pour croisière. ALEX PEUT MODIFIER CE BATEAU.'
    },
    images: [
      { uri: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800' },
      { uri: 'https://images.unsplash.com/photo-1582719366301-6b6071a01a1f?w=800' }
    ],
    events: [
      {
        id: 'evt_002',
        type: 'inspection',
        title: 'Inspection annuelle',
        description: 'Inspection complète en cours',
        date: '2024-07-20',
        status: 'pending',
        certifier_id: TEST_ACCOUNTS[1].address,
        documents: []
      }
    ],
    certificates: [
      {
        id: 'cert_002',
        type: 'registration',
        title: 'Certificat d\'immatriculation',
        description: 'En cours de renouvellement',
        issue_date: '2023-06-15',
        expiry_date: '2024-06-15',
        status: 'suspicious',
        certifier_id: TEST_ACCOUNTS[1].address
      }
    ]
  },

  // Bateau 3 - Autre propriétaire (Sophie ne peut PAS modifier)
  {
    id: 24,
    specification: {
      owner_id: '0x1234567890123456789012345678901234567890', // Autre propriétaire
      status: 'validated',
      is_for_sale: false,
      title: 'Bavaria 46 - Autre',
      year: '2018',
      length: '14.27m',
      beam: '4.35m',
      draft: '1.85m',
      engine: 'Volvo Penta 75CV',
      fuel: 'Diesel',
      sleeps: 8,
      price: '180000',
      currency: 'EUR',
      location: 'Nice, France',
      description: 'Voilier familial en excellent état. SOPHIE NE PEUT PAS MODIFIER CE BATEAU.'
    },
    images: [
      { uri: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800' }
    ],
    events: [
      {
        id: 'evt_003',
        type: 'certification',
        title: 'Certification complète',
        description: 'Tous systèmes vérifiés et approuvés',
        date: '2024-05-10',
        status: 'validated',
        certifier_id: TEST_ACCOUNTS[1].address,
        documents: []
      }
    ],
    certificates: [
      {
        id: 'cert_003',
        type: 'insurance',
        title: 'Assurance maritime',
        description: 'Couverture complète navigation côtière',
        issue_date: '2024-01-01',
        expiry_date: '2024-12-31',
        status: 'validated',
        certifier_id: TEST_ACCOUNTS[1].address
      }
    ]
  }
];

// Fonction pour obtenir les bateaux mock
export function getMockBoats(): UIBoat[] {
  console.log('🧪 Using MOCK boats data for testing');
  return MOCK_BOATS;
}

// Fonction pour vérifier si un bateau appartient à l'utilisateur connecté
export function canUserEditBoat(boatId: number, userAddress: string): boolean {
  const boat = MOCK_BOATS.find(b => b.id === boatId);
  if (!boat) return false;
  
  return boat.specification.owner_id?.toLowerCase() === userAddress.toLowerCase();
}

// Fonction pour obtenir les permissions d'un utilisateur
export function getUserPermissions(userAddress: string) {
  const testAccount = TEST_ACCOUNTS.find(
    account => account.address.toLowerCase() === userAddress.toLowerCase()
  );
  
  if (!testAccount) {
    return {
      canAddBoats: true, // par défaut
      canEditOwnBoats: true,
      canCertify: false,
      role: 'standard_user' as const
    };
  }
  
  return {
    canAddBoats: testAccount.role === 'standard_user', // certificateur ne peut pas ajouter
    canEditOwnBoats: testAccount.role === 'standard_user',
    canCertify: testAccount.role === 'certifier',
    role: testAccount.role
  };
}