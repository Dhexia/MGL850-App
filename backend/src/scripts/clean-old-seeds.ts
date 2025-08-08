import { config } from 'dotenv';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ChainService } from '../modules/chain/chain.service';

// Load .env file
config({ path: join(__dirname, '../../.env') });

async function cleanOldSeeds() {
  const configService = new ConfigService();
  const chainService = new ChainService(configService);

  console.log('🧹 Nettoyage des anciens NFTs de test...\n');

  try {
    console.log('📊 Vérification des NFTs existants...');
    
    // Test some token IDs to see what exists
    const existingTokens = [];
    for (let i = 1; i <= 10; i++) {
      try {
        const owner = await chainService.getOwner(i);
        const uri = await chainService.tokenURI(i);
        existingTokens.push({ id: i, owner, uri });
        console.log(`  - NFT #${i}: Propriétaire ${owner.slice(0, 6)}...${owner.slice(-4)}`);
        console.log(`    URI: ${uri.slice(0, 50)}...`);
      } catch (error) {
        // Token doesn't exist, stop checking
        break;
      }
    }

    if (existingTokens.length === 0) {
      console.log('✅ Aucun NFT trouvé');
      process.exit(0);
    }

    console.log(`\n📊 ${existingTokens.length} NFTs trouvés`);
    console.log('\n⚠️  Pour nettoyer les NFTs:');

    console.log('\n🔄 Suppression en cours...');

    // Note: Il n'y a généralement pas de fonction "burn" dans les contrats ERC721 basiques
    // Cette étape dépend de votre contrat. Si vous avez une fonction burn, utilisez-la:
    
    /*
    for (let i = 1; i <= totalSupply; i++) {
      try {
        await chainService.burnPassport(i);
        console.log(`🔥 NFT #${i} supprimé`);
      } catch (error) {
        console.log(`❌ Erreur suppression NFT #${i}: ${error.message}`);
      }
    }
    */

    console.log('\n⚠️  INFO: Fonction de suppression non implémentée');
    console.log('📝 Pour nettoyer complètement:');
    console.log('  1. Redéployer le contrat BoatPassport');
    console.log('  2. Ou implémenter une fonction burn() dans le contrat');
    console.log('  3. Ou lancer le seeding sur un réseau de test vierge\n');
    
    console.log('💡 Conseil: Utilisez un réseau de test local (Hardhat) pour les tests complets');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

// Run the script
cleanOldSeeds();