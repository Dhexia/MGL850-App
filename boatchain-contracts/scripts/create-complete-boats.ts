import { ethers } from "hardhat";
import axios from "axios";

// Config
const BACKEND_URL = "http://localhost:8080";
const ALEX_MARTIN_ADDRESS = "0x766fe3DED655D3318000A10aEB7422BC5f210835";

// Données complètes des bateaux
const boatsData = [
  {
    specification: {
      price: 125000,
      title: "Beneteau Oceanis 40.1 à vendre",
      name: "Beneteau Oceanis 40.1",
      city: "Saint-Malo",
      postal_code: "35400",
      for_sale: true,
      year: 2019,
      overall_length: 12.87,
      width: 4.18,
      draft: 2.27,
      engine: "Yanmar 4JH57 - 57CV",
      fresh_water_capacity: 300,
      fuel_capacity: 160,
      cabins: 3,
      beds: 6,
      boat_type: "sailboat",
      navigation_category: "A - offshore navigation",
      description: "Magnifique voilier Beneteau Oceanis 40.1 en excellent état. Parfait pour la croisière côtière et hauturière. Cockpit ergonomique, carré spacieux et finitions soignées. Entretenu régulièrement par propriétaire expérimenté.",
      summary: "Voilier moderne parfait pour la croisière côtière et hauturière.",
      status: "pending"
    },
    certificates: [],
    events: [],
    images: [
      {
        uri: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"
      }
    ]
  },
  {
    specification: {
      price: 78000,
      title: "Jeanneau Sun Fast 3200 - Prix négociable",
      name: "Jeanneau Sun Fast 3200", 
      city: "Lorient",
      postal_code: "56100",
      for_sale: true,
      year: 2016,
      overall_length: 10.20,
      width: 3.50,
      draft: 1.90,
      engine: "Volvo Penta D1-20 - 20CV",
      fresh_water_capacity: 150,
      fuel_capacity: 90,
      cabins: 2,
      beds: 4,
      boat_type: "sailboat",
      navigation_category: "A - offshore navigation",
      description: "Voilier de sport-croisière Jeanneau Sun Fast 3200. Conçu pour la performance avec un excellent compromis habitabilité. Idéal pour la régate et les sorties en famille. Plan d'eau moderne et voiles récentes.",
      summary: "Voilier sport-croisière performant, parfait régate et famille.",
      status: "pending"
    },
    certificates: [],
    events: [],
    images: [
      {
        uri: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80"
      }
    ]
  },
  {
    specification: {
      price: 195000,
      title: "Bavaria Cruiser 37 - État impeccable", 
      name: "Bavaria Cruiser 37",
      city: "Cannes",
      postal_code: "06400",
      for_sale: true,
      year: 2021,
      overall_length: 11.40,
      width: 3.99,
      draft: 1.75,
      engine: "Volvo Penta D2-55 - 55CV",
      fresh_water_capacity: 340,
      fuel_capacity: 150,
      cabins: 3,
      beds: 7,
      boat_type: "sailboat",
      navigation_category: "A - offshore navigation",
      description: "Bavaria Cruiser 37 récent en parfait état. Voilier moderne alliant performance et confort. Équipements complets, électronique moderne et intérieur lumineux. Très peu navigué, quasi neuf.",
      summary: "Voilier récent quasi neuf, parfait équilibre performance/confort.",
      status: "pending"
    },
    certificates: [],
    events: [],
    images: [
      {
        uri: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
      }
    ]
  }
];

// Se connecter au backend et récupérer un JWT
async function getAuthToken(): Promise<string> {
  try {
    console.log("🔐 Getting auth token for Alex Martin...");
    const response = await axios.post(`${BACKEND_URL}/auth/dev-login`, {
      address: ALEX_MARTIN_ADDRESS
    });
    console.log("✅ Auth token obtained");
    return response.data.token;
  } catch (error) {
    throw new Error(`Failed to get auth token: ${error.message}`);
  }
}

// Uploader vers IPFS via le backend
async function uploadToIPFS(boatData: any, token: string): Promise<string> {
  try {
    console.log("📦 Uploading to IPFS...");
    const response = await axios.post(
      `${BACKEND_URL}/documents/upload-json`, 
      { boatData },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("✅ IPFS upload successful");
    return response.data.ipfsHash;
  } catch (error) {
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

// Créer le NFT 
async function mintBoat(to: string, ipfsUri: string, token: string): Promise<any> {
  try {
    console.log("🚢 Minting boat NFT...");
    const response = await axios.post(
      `${BACKEND_URL}/boats`,
      { to, uri: ipfsUri },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("✅ Boat minted successfully");
    return response.data;
  } catch (error) {
    throw new Error(`Boat minting failed: ${error.message}`);
  }
}

async function main() {
  console.log("🚀 Creating complete boats for Alex Martin automatically...");
  console.log(`Owner: ${ALEX_MARTIN_ADDRESS}`);
  
  // 1. Get auth token
  const token = await getAuthToken();
  
  let boatCounter = 1;
  
  for (const boatData of boatsData) {
    try {
      console.log(`\n🔧 Creating boat #${boatCounter}: ${boatData.specification.name}`);
      
      // 2. Upload to IPFS
      const ipfsHash = await uploadToIPFS(boatData, token);
      const ipfsUri = `ipfs://${ipfsHash}`;
      console.log(`📎 IPFS URI: ${ipfsUri}`);
      
      // 3. Mint NFT
      const mintResult = await mintBoat(ALEX_MARTIN_ADDRESS, ipfsUri, token);
      
      console.log(`🎉 Boat #${boatCounter} created successfully!`);
      console.log(`   Name: ${boatData.specification.name}`);
      console.log(`   Price: €${boatData.specification.price.toLocaleString()}`);
      console.log(`   Status: ${boatData.specification.status} (pending - jaune)`);
      console.log(`   For sale: ${boatData.specification.for_sale}`);
      console.log(`   TX Hash: ${mintResult.txHash}`);
      console.log(`   Token ID: ${mintResult.tokenId}`);
      
      boatCounter++;
      
      // Attendre entre les créations
      console.log("⏳ Waiting 5 seconds...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error(`❌ Failed to create boat #${boatCounter}:`, error.message);
    }
  }
  
  console.log("\n🎊 ALL BOATS CREATED SUCCESSFULLY!");
  console.log("\n📱 Maintenant dans l'app :");
  console.log("1. Connectez-vous avec Alex Martin pour voir ses bateaux");
  console.log("2. Connectez-vous avec Bureau Veritas pour les certifier");
  console.log("3. Les bateaux sont en statut PENDING (jaune) et À VENDRE");
  console.log("\n🚤 Alex Martin a maintenant 3 beaux bateaux à vendre !");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 SCRIPT FAILED:", error);
    process.exit(1);
  });