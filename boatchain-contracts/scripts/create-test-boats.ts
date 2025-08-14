import { ethers } from "hardhat";

// Adresse d'Alex Martin depuis dev-accounts.ts
const ALEX_MARTIN_ADDRESS = "0x766fe3DED655D3318000A10aEB7422BC5f210835";

// Données des bateaux de test avec statut pending et à vendre
const testBoats = [
  {
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
  {
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
  {
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

async function main() {
  console.log("Creating test boats for Alex Martin...");
  
  // Get deployed contract addresses
  const boatPassportAddress = process.env.BOAT_PASSPORT_ADDRESS || "0xad490ec1C585AC18c3f2279E4186339619dBe679";
  
  // Connect to BoatPassport contract
  const BoatPassport = await ethers.getContractFactory("BoatPassport");
  const boatPassport = BoatPassport.attach(boatPassportAddress);
  
  // Get Alex Martin's signer
  const [deployer] = await ethers.getSigners();
  console.log("Using deployer:", deployer.address);
  
  let boatCounter = 2; // Start from boat #2 since #1 already exists
  
  for (const boatData of testBoats) {
    try {
      console.log(`\nCreating boat #${boatCounter}: ${boatData.specification.name}`);
      
      // 1. Upload boat data to IPFS (simulate with a dummy hash for now)
      const dummyIpfsHash = `ipfs://test-boat-${boatCounter}-${Date.now()}`;
      console.log(`Mock IPFS upload: ${dummyIpfsHash}`);
      
      // 2. Mint the NFT passport for Alex Martin
      console.log(`Minting NFT for ${ALEX_MARTIN_ADDRESS}...`);
      const tx = await boatPassport.mint(ALEX_MARTIN_ADDRESS, dummyIpfsHash);
      const receipt = await tx.wait();
      
      console.log(`✅ Boat #${boatCounter} minted successfully!`);
      console.log(`TX Hash: ${tx.hash}`);
      console.log(`Owner: ${ALEX_MARTIN_ADDRESS}`);
      console.log(`Name: ${boatData.specification.name}`);
      console.log(`Price: €${boatData.specification.price.toLocaleString()}`);
      console.log(`Status: ${boatData.specification.status}`);
      console.log(`For sale: ${boatData.specification.is_for_sale}`);
      
      boatCounter++;
      
      // Wait a bit between transactions
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to create boat #${boatCounter}:`, error.message);
    }
  }
  
  console.log("\n🎉 Test boats creation complete!");
  console.log(`Alex Martin (${ALEX_MARTIN_ADDRESS}) now owns multiple boats for testing.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });