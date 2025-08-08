import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { DocumentService } from '../modules/document/document.service';
import { ChainService } from '../modules/chain/chain.service';

// Load .env file
config({ path: join(__dirname, '../../.env') });

async function seedUpdatedBoats() {
  // Setup services
  const configService = new ConfigService();
  const documentService = new DocumentService(configService);
  const chainService = new ChainService(configService);

  // Path to boat mock data
  const mockDataDir = join(__dirname, '../../../boatchain/backend_mock/data/boat');
  
  try {
    console.log('🚢 Seeding avec les nouvelles données (statuts + vraies images)...');
    
    // Read boat JSON files
    const files = readdirSync(mockDataDir).filter(f => f.endsWith('.json'));
    console.log(`📁 Found ${files.length} boat files avec nouveaux statuts`);

    for (const file of files) {
      console.log(`\n🔄 Processing ${file}...`);
      
      const filePath = join(mockDataDir, file);
      const boatData = JSON.parse(readFileSync(filePath, 'utf-8'));
      
      // Log le statut pour info
      console.log(`📊 Statut bateau: ${boatData.specification.status}`);
      console.log(`👤 Propriétaire: ${boatData.specification.owner_id}`);
      console.log(`🏷️ À vendre: ${boatData.specification.is_for_sale ? 'Oui' : 'Non'}`);
      
      // Count status distribution in events/certificates
      const eventStatuses = boatData.events?.map(e => e.status) || [];
      const certStatuses = boatData.certificates?.map(c => c.status) || [];
      console.log(`📋 Événements: ${JSON.stringify([...new Set(eventStatuses)])}`);
      console.log(`🎖️ Certificats: ${JSON.stringify([...new Set(certStatuses)])}`);
      
      // Upload to IPFS
      console.log('📤 Uploading to IPFS...');
      const ipfsHash = await documentService.uploadJson(boatData);
      const uri = `ipfs://${ipfsHash}`;
      console.log(`✅ Uploaded: ${uri}`);
      
      // Mint NFT with owner from data
      console.log('⛓️  Minting NFT...');
      const ownerAddress = boatData.specification.owner_id;
      const result = await chainService.mintPassport(ownerAddress, uri);
      
      console.log(`🎉 Minted NFT #${result.tokenId} - TX: ${result.txHash}`);
      console.log(`🔗 IPFS: https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
      console.log(`📸 Images Unsplash: Oui`);
    }

    console.log('\n🎊 Seeding terminé avec succès!');
    console.log('\n📊 Résumé des données de test:');
    console.log('- Bateau #1: Statuts mixtes (validated + pending)');
    console.log('- Bateau #2: Tous les statuts (validated + suspicious + rejected)');  
    console.log('- Bateau #3: En attente (pending)');
    console.log('\n🧪 Comptes pour les tests:');
    console.log('👤 User standard: 0xdf560ba3b1f4c75588a84a454ce79d84c886e6f8');
    console.log('🏛️ Certificateur: 0x742d35Cc6635Bb0C73f71F3E5De8Dd7b2Ba8cF9E');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding boats:', error);
    process.exit(1);
  }
}

// Run the script
seedUpdatedBoats();