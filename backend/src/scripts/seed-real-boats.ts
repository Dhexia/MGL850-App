import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { DocumentService } from '../modules/document/document.service';
import { ChainService } from '../modules/chain/chain.service';

// Load .env file
config({ path: join(__dirname, '../../.env') });

async function seedRealBoats() {
  // Setup services
  const configService = new ConfigService();
  const documentService = new DocumentService(configService);
  const chainService = new ChainService(configService);

  // Path to boat mock data
  const mockDataDir = join(__dirname, '../../../boatchain/backend_mock/data/boat');
  
  try {
    console.log('🚢 Starting boat seeding process...');
    
    // Read boat JSON files
    const files = readdirSync(mockDataDir).filter(f => f.endsWith('.json'));
    console.log(`📁 Found ${files.length} boat files`);

    for (const file of files) {
      console.log(`\n🔄 Processing ${file}...`);
      
      const filePath = join(mockDataDir, file);
      const boatData = JSON.parse(readFileSync(filePath, 'utf-8'));
      
      // Upload to IPFS
      console.log('📤 Uploading to IPFS...');
      const ipfsHash = await documentService.uploadJson({ boatData });
      const uri = `ipfs://${ipfsHash}`;
      console.log(`✅ Uploaded: ${uri}`);
      
      // Mint NFT with real data
      console.log('⛓️  Minting NFT...');
      // Use your address as the owner
      const ownerAddress = '0xdf560ba3b1f4c75588a84a454ce79d84c886e6f8';
      const result = await chainService.mintPassport(ownerAddress, uri);
      
      console.log(`🎉 Minted NFT #${result.tokenId} - TX: ${result.txHash}`);
      console.log(`🔗 IPFS: https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    }

    console.log('\n🎊 All boats seeded successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding boats:', error);
    process.exit(1);
  }
}

// Run the script
seedRealBoats();