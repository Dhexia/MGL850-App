import { ethers } from "hardhat";

// Adresse d'Alex Martin
const ALEX_MARTIN_ADDRESS = "0x766fe3DED655D3318000A10aEB7422BC5f210835";

// Données complètes des bateaux (comme dans les JSON mock)
const boatsMetadata = [
  // Boat #2
  {
    id: 2,
    specification: {
      price: 125000,
      title: "Beneteau Oceanis 40.1 à vendre",
      name: "Beneteau Oceanis 40.1",
      city: "Saint-Malo",
      postal_code: "35400",
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
      status: "pending",
      owner_id: ALEX_MARTIN_ADDRESS,
      is_for_sale: true
    },
    certificates: [],
    events: [],
    images: [
      {
        uri: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"
      }
    ]
  },
  // Boat #3
  {
    id: 3,
    specification: {
      price: 78000,
      title: "Jeanneau Sun Fast 3200 - Prix négociable",
      name: "Jeanneau Sun Fast 3200",
      city: "Lorient",
      postal_code: "56100",
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
      status: "pending",
      owner_id: ALEX_MARTIN_ADDRESS,
      is_for_sale: true
    },
    certificates: [],
    events: [],
    images: [
      {
        uri: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80"
      }
    ]
  },
  // Boat #4
  {
    id: 4,
    specification: {
      price: 195000,
      title: "Bavaria Cruiser 37 - État impeccable",
      name: "Bavaria Cruiser 37",
      city: "Cannes",
      postal_code: "06400",
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
      status: "pending",
      owner_id: ALEX_MARTIN_ADDRESS,
      is_for_sale: true
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

async function uploadToIPFS(data: any): Promise<string> {
  // Simulate IPFS upload by calling the backend API
  const response = await fetch('http://localhost:8080/documents/upload-json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ boatData: data }),
  });
  
  if (!response.ok) {
    throw new Error(`IPFS upload failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.ipfsHash;
}

async function main() {
  console.log("Uploading boat metadata to IPFS and updating tokenURIs...");
  
  // Get deployed contract address
  const boatPassportAddress = process.env.BOAT_PASSPORT_ADDRESS || "0xad490ec1C585AC18c3f2279E4186339619dBe679";
  
  // Connect to BoatPassport contract
  const BoatPassport = await ethers.getContractFactory("BoatPassport");
  const boatPassport = BoatPassport.attach(boatPassportAddress);
  
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer:", deployer.address);
  
  for (const boat of boatsMetadata) {
    try {
      console.log(`\nProcessing boat #${boat.id}: ${boat.specification.name}`);
      
      // 1. Upload metadata to IPFS via backend
      console.log("Uploading to IPFS...");
      const ipfsHash = await uploadToIPFS(boat);
      const ipfsUri = `ipfs://${ipfsHash}`;
      console.log(`✅ IPFS uploaded: ${ipfsUri}`);
      
      // 2. Update tokenURI on blockchain
      console.log("Updating tokenURI on blockchain...");
      const tx = await boatPassport.setTokenURI(boat.id, ipfsUri);
      await tx.wait();
      
      console.log(`✅ Boat #${boat.id} updated successfully!`);
      console.log(`TX Hash: ${tx.hash}`);
      console.log(`New URI: ${ipfsUri}`);
      console.log(`Name: ${boat.specification.name}`);
      console.log(`Price: €${boat.specification.price.toLocaleString()}`);
      console.log(`Status: ${boat.specification.status}`);
      
      // Wait between transactions
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error(`❌ Failed to process boat #${boat.id}:`, error.message);
    }
  }
  
  console.log("\n🎉 Boat metadata upload complete!");
  console.log("Alex Martin now has 3 boats for sale in pending status:");
  console.log("- Beneteau Oceanis 40.1 (€125,000)");
  console.log("- Jeanneau Sun Fast 3200 (€78,000)");
  console.log("- Bavaria Cruiser 37 (€195,000)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });