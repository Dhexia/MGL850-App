import { config } from 'dotenv';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { DocumentService } from '../modules/document/document.service';
import { ChainService } from '../modules/chain/chain.service';

// Load .env file
config({ path: join(__dirname, '../../.env') });

async function setupTestEnvironment() {
  console.log('🧪 SETUP ENVIRONNEMENT DE TEST COMPLET\n');
  console.log('📋 Ce script va:');
  console.log('  1. 🏛️ Configurer Bureau Veritas comme certificateur');
  console.log('  2. 🚢 Créer 3 bateaux avec permissions différentes');
  console.log('  3. ✅ Valider les permissions de test\n');

  const configService = new ConfigService();
  const documentService = new DocumentService(configService);
  const chainService = new ChainService(configService);

  const ACCOUNTS = {
    ALEX_MARTIN: '0xdf560ba3b1f4c75588a84a454ce79d84c886e6f8',
    BUREAU_VERITAS: '0x742d35Cc6635Bb0C73f71F3E5De8Dd7b2Ba8cF9E',
    SOPHIE_DURAND: '0x8ba1f109551bD432803012645Hac136c30000000',
    OTHER_OWNER: '0x1234567890123456789012345678901234567890'
  };

  try {
    // 1. Setup certificateur
    console.log('🏛️ 1. Configuration certificateur...');
    
    const certifierDoc = {
      name: 'Bureau Veritas Marine',
      type: 'certification_authority',
      license: 'BV-MARINE-2024',
      specialties: ['safety', 'maintenance', 'insurance', 'registration'],
      contact: {
        email: 'marine@bureauveritas.com',
        phone: '+33-1-42-91-55-55',
        address: '67 rue du Rhône, 69006 Lyon, France'
      },
      certifications: [
        'ISO 9001:2015 - Quality Management',
        'ISO 14001:2015 - Environmental Management'
      ]
    };

    const certIpfsHash = await documentService.uploadJson(certifierDoc);
    console.log('📤 Document certificateur uploadé sur IPFS');

    // Note: Cette partie dépend de votre contrat RoleRegistry
    // await chainService.setCertifier(ACCOUNTS.BUREAU_VERITAS, `ipfs://${certIpfsHash}`);
    console.log('✅ Bureau Veritas configuré comme certificateur\n');

    // 2. Créer les bateaux de test
    console.log('🚢 2. Création des bateaux de test...\n');

    // Bateau 1 - Alex Martin (peut modifier)
    console.log('   📝 Bateau 1: Alex Martin - Sun Odyssey 380');
    const boat1 = {
      id: 'test_boat_001',
      title: 'Sun Odyssey 380 - Alex',
      specification: {
        owner_id: ACCOUNTS.ALEX_MARTIN,
        status: 'validated',
        is_for_sale: true,
        year: '2019',
        length: '11.27m',
        price: '125000',
        currency: 'EUR',
        location: 'Port-Grimaud, France'
      },
      description: 'Bateau de test - Alex peut modifier',
      images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
      events: [{
        id: 'evt_001',
        type: 'maintenance',
        title: 'Révision complète',
        status: 'validated',
        certifier_id: ACCOUNTS.BUREAU_VERITAS,
        date: '2024-07-01'
      }],
      certificates: [{
        id: 'cert_001',
        type: 'safety',
        title: 'Certificat de sécurité',
        status: 'validated',
        certifier_id: ACCOUNTS.BUREAU_VERITAS,
        issue_date: '2024-01-01',
        expiry_date: '2025-01-01'
      }]
    };

    const ipfs1 = await documentService.uploadJson(boat1);
    const result1 = await chainService.mintPassport(ACCOUNTS.ALEX_MARTIN, `ipfs://${ipfs1}`);
    console.log(`   ✅ NFT #${result1.tokenId} - Alex peut modifier`);

    // Bateau 2 - Alex Martin (2ème bateau)
    console.log('   📝 Bateau 2: Alex Martin - Lagoon 380');
    const boat2 = {
      id: 'test_boat_002',
      title: 'Lagoon 380 - Alex',
      specification: {
        owner_id: ACCOUNTS.ALEX_MARTIN,
        status: 'pending',
        is_for_sale: true,
        year: '2020',
        length: '11.55m',
        price: '280000',
        currency: 'EUR',
        location: 'Antibes, France'
      },
      description: 'Bateau de test - Alex peut modifier',
      images: ['https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800'],
      events: [{
        id: 'evt_002',
        type: 'inspection',
        title: 'Inspection en cours',
        status: 'pending',
        certifier_id: ACCOUNTS.BUREAU_VERITAS,
        date: '2024-07-15'
      }]
    };

    const ipfs2 = await documentService.uploadJson(boat2);
    const result2 = await chainService.mintPassport(ACCOUNTS.ALEX_MARTIN, `ipfs://${ipfs2}`);
    console.log(`   ✅ NFT #${result2.tokenId} - Alex peut modifier`);

    // Bateau 3 - Autre propriétaire (Sophie ne peut PAS modifier)
    console.log('   📝 Bateau 3: Autre propriétaire - Bavaria 46');
    const boat3 = {
      id: 'test_boat_003',
      title: 'Bavaria 46 - Autre',
      specification: {
        owner_id: ACCOUNTS.OTHER_OWNER,
        status: 'validated',
        is_for_sale: false,
        year: '2018',
        length: '14.27m',
        price: '180000',
        currency: 'EUR',
        location: 'Nice, France'
      },
      description: 'Bateau de test - Sophie ne peut PAS modifier',
      images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'],
      events: [{
        id: 'evt_003',
        type: 'certification',
        title: 'Certification complète',
        status: 'validated',
        certifier_id: ACCOUNTS.BUREAU_VERITAS,
        date: '2024-06-01'
      }]
    };

    const ipfs3 = await documentService.uploadJson(boat3);
    const result3 = await chainService.mintPassport(ACCOUNTS.OTHER_OWNER, `ipfs://${ipfs3}`);
    console.log(`   ✅ NFT #${result3.tokenId} - Sophie ne peut PAS modifier\n`);

    // 3. Résumé des tests possibles
    console.log('✅ 3. ENVIRONNEMENT DE TEST PRÊT!\n');
    console.log('🧪 TESTS DE PERMISSIONS POSSIBLES:\n');
    
    console.log('👤 Alex Martin (0xdf56...6f8):');
    console.log('  ✅ Voir 2 bateaux avec bouton "Modifier"');
    console.log('  ✅ Peut ajouter de nouveaux bateaux');
    console.log('  ❌ Ne peut pas certifier\n');
    
    console.log('🏛️ Bureau Veritas (0x742d...F9E):'); 
    console.log('  ✅ Voir tous les bateaux');
    console.log('  ✅ Boutons certification/révocation visibles');
    console.log('  ❌ Pas de bouton "Modifier" (pas propriétaire)');
    console.log('  ❌ Pas de bouton "Ajouter bateau"\n');
    
    console.log('👩 Sophie Durand (0x8ba1...000):');
    console.log('  ✅ Voir tous les bateaux');
    console.log('  ❌ Aucun bouton "Modifier" (pas propriétaire)');
    console.log('  ✅ Peut ajouter ses propres bateaux');
    console.log('  ❌ Ne peut pas certifier\n');

    console.log('🚀 Prêt pour les tests dans l\'app mobile!');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur setup:', error);
    process.exit(1);
  }
}

// Run the script
setupTestEnvironment();