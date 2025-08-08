import { config } from 'dotenv';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { DocumentService } from '../modules/document/document.service';
import { ChainService } from '../modules/chain/chain.service';

// Load .env file
config({ path: join(__dirname, '../../.env') });

// Comptes de test alignés avec l'app frontend
const TEST_ACCOUNTS = {
  ALEX_MARTIN: '0xdf560ba3b1f4c75588a84a454ce79d84c886e6f8',    // Propriétaire avec bateaux
  BUREAU_VERITAS: '0x742d35Cc6635Bb0C73f71F3E5De8Dd7b2Ba8cF9E',  // Certificateur
  SOPHIE_DURAND: '0x8ba1f109551bD432803012645Hac136c30000000'     // Acheteuse sans bateaux
};

async function seedTestPermissions() {
  const configService = new ConfigService();
  const documentService = new DocumentService(configService);
  const chainService = new ChainService(configService);

  console.log('🧪 Seeding bateaux pour tester les permissions...\n');

  try {
    // 🚢 BATEAU 1 - Alex Martin (Propriétaire)
    console.log('🚢 Bateau 1: Sun Odyssey 380 - Alex Martin');
    const boat1Data = {
      id: 'boat_001',
      title: 'Sun Odyssey 380',
      specification: {
        owner_id: TEST_ACCOUNTS.ALEX_MARTIN,
        status: 'validated',
        is_for_sale: true,
        year: '2019',
        length: '11.27m',
        beam: '3.99m',
        draft: '1.90m',
        engine: 'Yanmar 30CV',
        fuel: 'Diesel',
        sleeps: 6,
        price: '125000',
        currency: 'EUR',
        location: 'Port-Grimaud, France'
      },
      description: 'Magnifique voilier parfaitement entretenu, idéal pour navigation familiale en Méditerranée.',
      images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        'https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800'
      ],
      events: [
        {
          id: 'evt_001',
          type: 'maintenance',
          title: 'Révision moteur complète',
          description: 'Vidange, filtres, contrôle général du moteur Yanmar',
          date: '2024-03-15',
          status: 'validated',
          certifier_id: TEST_ACCOUNTS.BUREAU_VERITAS,
          documents: ['maintenance_report_2024.pdf']
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
          certifier_id: TEST_ACCOUNTS.BUREAU_VERITAS
        }
      ]
    };

    const ipfsHash1 = await documentService.uploadJson(boat1Data);
    const result1 = await chainService.mintPassport(TEST_ACCOUNTS.ALEX_MARTIN, `ipfs://${ipfsHash1}`);
    console.log(`✅ NFT #${result1.tokenId} créé - Propriétaire peut modifier\n`);

    // 🚢 BATEAU 2 - Alex Martin (Propriétaire - 2ème bateau)  
    console.log('🚢 Bateau 2: Lagoon 380 - Alex Martin');
    const boat2Data = {
      id: 'boat_002', 
      title: 'Lagoon 380 Catamaran',
      specification: {
        owner_id: TEST_ACCOUNTS.ALEX_MARTIN,
        status: 'pending',
        is_for_sale: true,
        year: '2020',
        length: '11.55m',
        beam: '6.53m', 
        draft: '1.15m',
        engine: '2x Yanmar 30CV',
        fuel: 'Diesel',
        sleeps: 8,
        price: '280000',
        currency: 'EUR',
        location: 'Antibes, France'
      },
      description: 'Catamaran spacieux, parfait pour croisière en famille ou location.',
      images: [
        'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800',
        'https://images.unsplash.com/photo-1582719366301-6b6071a01a1f?w=800'
      ],
      events: [
        {
          id: 'evt_002',
          type: 'inspection',
          title: 'Inspection annuelle',
          description: 'Inspection complète en cours',
          date: '2024-07-20',
          status: 'pending',
          certifier_id: TEST_ACCOUNTS.BUREAU_VERITAS,
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
          certifier_id: TEST_ACCOUNTS.BUREAU_VERITAS
        }
      ]
    };

    const ipfsHash2 = await documentService.uploadJson(boat2Data);
    const result2 = await chainService.mintPassport(TEST_ACCOUNTS.ALEX_MARTIN, `ipfs://${ipfsHash2}`);
    console.log(`✅ NFT #${result2.tokenId} créé - Propriétaire peut modifier\n`);

    // 🚢 BATEAU 3 - Autre propriétaire (Sophie ne peut PAS modifier)
    console.log('🚢 Bateau 3: Bavaria 46 - Autre propriétaire');
    const boat3Data = {
      id: 'boat_003',
      title: 'Bavaria 46 Cruiser',
      specification: {
        owner_id: '0x1234567890123456789012345678901234567890', // Autre propriétaire
        status: 'validated',
        is_for_sale: false,
        year: '2018',
        length: '14.27m',
        beam: '4.35m',
        draft: '1.85m', 
        engine: 'Volvo Penta 75CV',
        fuel: 'Diesel',
        sleeps: 8,
        price: '180000',
        currency: 'EUR',
        location: 'Nice, France'
      },
      description: 'Voilier familial en excellent état, non à vendre actuellement.',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
      ],
      events: [
        {
          id: 'evt_003',
          type: 'certification',
          title: 'Certification complète',
          description: 'Tous systèmes vérifiés et approuvés',
          date: '2024-05-10',
          status: 'validated',
          certifier_id: TEST_ACCOUNTS.BUREAU_VERITAS,
          documents: ['full_inspection_2024.pdf']
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
          certifier_id: TEST_ACCOUNTS.BUREAU_VERITAS
        }
      ]
    };

    const ipfsHash3 = await documentService.uploadJson(boat3Data);
    const result3 = await chainService.mintPassport(
      '0x1234567890123456789012345678901234567890', 
      `ipfs://${ipfsHash3}`
    );
    console.log(`✅ NFT #${result3.tokenId} créé - Sophie ne peut PAS modifier\n`);

    console.log('🎉 Seeding terminé avec succès!\n');
    console.log('📊 RÉSUMÉ DES PERMISSIONS DE TEST:\n');
    console.log('👤 Alex Martin (0xdf56...6f8):');
    console.log('  ✅ Propriétaire de 2 bateaux');
    console.log('  ✅ Peut modifier ses bateaux');
    console.log('  ✅ Bouton "Modifier" visible');
    console.log('  ✅ Peut ajouter de nouveaux bateaux\n');
    
    console.log('🏛️ Bureau Veritas (0x742d...F9E):');
    console.log('  ❌ N\'a pas de bateaux');
    console.log('  ❌ Ne peut PAS ajouter de bateaux');
    console.log('  ✅ Peut certifier/révoquer');
    console.log('  ✅ Boutons certification visibles\n');
    
    console.log('👩 Sophie Durand (0x8ba1...000):'); 
    console.log('  ❌ N\'a pas de bateaux');
    console.log('  ❌ Bouton "Modifier" invisible');
    console.log('  ✅ Peut voir tous les bateaux');
    console.log('  ✅ Peut ajouter ses propres bateaux\n');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

// Run the script
seedTestPermissions();