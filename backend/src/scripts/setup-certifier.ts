import { config } from 'dotenv';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ChainService } from '../modules/chain/chain.service';
import { DocumentService } from '../modules/document/document.service';

// Load .env file
config({ path: join(__dirname, '../../.env') });

async function setupCertifier() {
  // Setup services
  const configService = new ConfigService();
  const chainService = new ChainService(configService);
  const documentService = new DocumentService(configService);

  // Adresse qui sera certificateur (utilise une autre adresse que celle du propriétaire)
  const CERTIFIER_ADDRESS = '0x742d35Cc6635Bb0C73f71F3E5De8Dd7b2Ba8cF9E';
  
  try {
    console.log('🏛️ Configuration du certificateur...');
    console.log(`📍 Adresse certificateur: ${CERTIFIER_ADDRESS}`);

    // 1. Upload du certificat IPFS (preuve de certification)
    console.log('\n📤 Upload du certificat de certification...');
    const certificationProof = {
      organization: "Bureau Veritas Marine Certification",
      certificate_type: "Professional Marine Inspector",
      issued_date: "2024-01-15",
      expires_date: "2027-01-15",
      license_number: "BVM-2024-001",
      scope: [
        "Structural inspections",
        "Safety equipment validation", 
        "Navigation systems certification",
        "Engine and machinery inspection"
      ],
      accreditation: "ISO 17025 accredited",
      contact: {
        email: "certifier@bureauveritas-marine.com",
        phone: "+33 4 91 xx xx xx"
      }
    };

    const ipfsHash = await documentService.uploadJson(certificationProof);
    const proofUri = `ipfs://${ipfsHash}`;
    console.log(`✅ Certificat uploadé: ${proofUri}`);

    // 2. Certifier l'adresse comme professionnel 
    console.log('\n⛓️ Certification de l\'adresse sur la blockchain...');
    
    // Note: Cette opération doit être faite par le propriétaire du contrat RoleRegistry
    // (celui qui a le DEFAULT_ADMIN_ROLE)
    console.log(`🔗 Exécution de certifyProfessional(${CERTIFIER_ADDRESS}, "${proofUri}")`);
    
    // Dans un vrai déploiement, vous devriez avoir accès à la clé privée de l'admin
    // Pour les tests, vous pouvez utiliser Hardhat console:
    console.log('\n📝 Commandes à exécuter dans Hardhat console:');
    console.log('npx hardhat console --network sepolia');
    console.log('');
    console.log('const RoleRegistry = await ethers.getContractFactory("RoleRegistry");');
    console.log(`const registry = await RoleRegistry.attach("${process.env.ROLE_REGISTRY_ADDRESS}");`);
    console.log(`await registry.certifyProfessional("${CERTIFIER_ADDRESS}", "${proofUri}");`);
    console.log('');

    // 3. Vérifier la certification
    console.log('🔍 Vérification du statut...');
    const isNowProfessional = await chainService.isCertifiedProfessional(CERTIFIER_ADDRESS);
    
    if (isNowProfessional) {
      console.log('✅ Le certificateur est maintenant validé!');
    } else {
      console.log('⚠️  Le certificateur n\'est pas encore validé.');
      console.log('   Exécutez les commandes Hardhat ci-dessus pour finaliser.');
    }

    console.log('\n🎉 Configuration terminée!');
    console.log('\n📋 Résumé des comptes de test:');
    console.log(`👤 Utilisateur standard: 0xdf560ba3b1f4c75588a84a454ce79d84c886e6f8`);
    console.log(`🏛️ Certificateur: ${CERTIFIER_ADDRESS}`);
    console.log(`📄 Preuve IPFS: ${proofUri}`);

    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

// Run the script
setupCertifier();