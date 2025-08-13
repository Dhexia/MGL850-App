const { createClient } = require('@supabase/supabase-js');

// Mock data basé sur les fichiers JSON, adaptée avec de vraies images de tortues et les bons comptes
const boatsData = [
  {
    specification: {
      price: 146000,
      title: "Selling Sun Odyssey 380",
      name: "Sun Odyssey 380",
      city: "La Rochelle",
      postal_code: "17000",
      year: 2020,
      overall_length: 13.00,
      width: 4.29,
      draft: 2.20,
      engine: "Yanmar 4JH57 - 57CV",
      fresh_water_capacity: 530,
      fuel_capacity: 200,
      cabins: 3,
      beds: 8,
      boat_type: "sailboat",
      navigation_category: "A - offshore navigation",
      description: "Le Sun Odyssey 440 est un voilier de croisière signé Jeanneau, conçu pour allier performance en mer et habitabilité à bord. Grâce à son pont en pente douce, la circulation est sécurisée et fluide du cockpit jusqu'à l'avant. Son design contemporain offre une belle luminosité intérieure, un carré spacieux, et plusieurs configurations de cabines. Parfait pour les navigations côtières comme hauturières, en famille ou entre amis.",
      summary: "Voilier moderne avec pont en circulation fluide et intérieur lumineux.",
      status: "validated",
      owner_id: "0x766fe3DED655D3318000A10aEB7422BC5f210835", // Alex Martin
      is_for_sale: true
    },
    certificates: [
      {
        id: "cert_1_1",
        person: "Maxime Dubois - Expert Maritime",
        date: "2025-03-17",
        title: "Expertise structurelle complète",
        expires: "2026-03-17",
        status: "validated",
        description: "Inspection complète de la coque, du pont, du mât, du safran et des appendices. Aucun défaut structurel relevé. Rapport signé et cacheté.",
        attachments: [
          {
            title: "expertise_struct_mars25.pdf",
            uri: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          }
        ]
      }
    ],
    events: [
      {
        id: "event_1_1",
        boatName: "Sun Odyssey 380",
        date: "2025-01-20",
        shortTitle: "Mécanique",
        title: "Remplacement inverseur moteur",
        status: "validated",
        description: "L'ancien inverseur présentait des signes de patinage. Installation d'un modèle neuf compatible Yanmar avec garantie constructeur.",
        attachments: [
          {
            title: "facture_inverseur_jan25.pdf",
            uri: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          }
        ]
      }
    ],
    images: [
      {
        uri: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
      },
      {
        uri: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&q=80"
      },
      {
        uri: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800&q=80"
      }
    ]
  },
  {
    specification: {
      price: 89000,
      title: "Beau Catamaran Lagoon 380",
      name: "Lagoon 380",
      city: "Marseille",
      postal_code: "13000",
      year: 2018,
      overall_length: 11.50,
      width: 6.63,
      draft: 1.20,
      engine: "2x Yanmar 3YM20 - 20CV",
      fresh_water_capacity: 600,
      fuel_capacity: 300,
      cabins: 4,
      beds: 8,
      boat_type: "catamaran",
      navigation_category: "A - offshore navigation",
      description: "Magnifique catamaran Lagoon 380 parfait pour la croisière en famille. Spacieux et confortable, il offre une stabilité remarquable et de nombreux espaces de vie. Cuisine équipée, carré panoramique et cabines ventilées. Idéal pour découvrir la Méditerranée en toute sécurité.",
      summary: "Catamaran spacieux et stable, parfait pour la croisière familiale.",
      status: "validated",
      owner_id: "0x766fe3DED655D3318000A10aEB7422BC5f210835", // Alex Martin
      is_for_sale: true
    },
    certificates: [
      {
        id: "cert_2_1",
        person: "Bureau Veritas Marine",
        date: "2024-11-20",
        title: "Expertise technique complète",
        expires: "2025-11-20",
        status: "validated",
        description: "Contrôle technique approfondi des coques, ponts, moteurs et équipements de sécurité. Conforme aux normes CE et classification.",
        attachments: [
          {
            title: "rapport_technique_nov24.pdf",
            uri: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          }
        ]
      }
    ],
    events: [
      {
        id: "event_2_1",
        boatName: "Lagoon 380",
        date: "2024-08-15",
        shortTitle: "Incident",
        title: "Collision mineure au port",
        status: "validated",
        description: "Léger frottement contre le ponton lors d'une manœuvre par vent fort. Rayure superficielle sur coque bâbord réparée.",
        attachments: [
          {
            title: "rapport_incident_aout24.pdf",
            uri: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          }
        ]
      }
    ],
    images: [
      {
        uri: "https://images.unsplash.com/photo-1570650044200-75dd7c7b2aa8?w=800&q=80"
      },
      {
        uri: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&q=80"
      },
      {
        uri: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&q=80"
      }
    ]
  },
  {
    specification: {
      price: 65000,
      title: "Yacht Bavaria 46 Cruiser",
      name: "Bavaria 46 Cruiser",
      city: "Nice",
      postal_code: "06000",
      year: 2015,
      overall_length: 14.27,
      width: 4.35,
      draft: 1.85,
      engine: "Volvo Penta D3-110 - 110CV",
      fresh_water_capacity: 480,
      fuel_capacity: 320,
      cabins: 4,
      beds: 10,
      boat_type: "yacht",
      navigation_category: "A - offshore navigation", 
      description: "Élégant yacht Bavaria 46 Cruiser en excellent état. Très bien entretenu par propriétaire unique. Cockpit spacieux, carré lumineux et finitions de qualité. Équipé pour la navigation hauturière avec gréement récent et électronique moderne. Parfait pour grandes croisières.",
      summary: "Yacht élégant bien entretenu, idéal pour grandes croisières.",
      status: "pending",
      owner_id: "0x766fe3DED655D3318000A10aEB7422BC5f210835", // Alex Martin
      is_for_sale: false
    },
    certificates: [
      {
        id: "cert_3_1",
        person: "Lloyd's Register Marine",
        date: "2024-09-30",
        title: "Inspection de coque annuelle",
        expires: "2025-09-30",
        status: "pending",
        description: "Inspection complète de la coque, hélice et appendices. En cours de traitement par l'organisme certificateur.",
        attachments: [
          {
            title: "inspection_coque_sept24.pdf",
            uri: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          }
        ]
      }
    ],
    events: [
      {
        id: "event_3_1",
        boatName: "Bavaria 46 Cruiser",
        date: "2024-07-22",
        shortTitle: "Maintenance",
        title: "Changement Grand Voile",
        status: "pending",
        description: "Remplacement de la grand-voile par un modèle neuf en Dacron. Nouvelle voile North Sails avec système de ris intégré. En attente de validation.",
        attachments: [
          {
            title: "facture_grand_voile_juil24.pdf",
            uri: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          }
        ]
      }
    ],
    images: [
      {
        uri: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"
      },
      {
        uri: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80"
      },
      {
        uri: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80"
      }
    ]
  }
];

async function createBoats() {
  console.log('🚀 Creating 3 boats for Alex Martin...\n');
  
  for (let i = 0; i < boatsData.length; i++) {
    const boatData = boatsData[i];
    console.log(`Creating boat ${i + 1}: ${boatData.specification.name}...`);
    
    try {
      // 1. Upload metadata to IPFS
      console.log('  📤 Uploading metadata to IPFS...');
      const ipfsResponse = await fetch('http://localhost:8080/documents/upload-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + await getDevToken('0x766fe3DED655D3318000A10aEB7422BC5f210835')
        },
        body: JSON.stringify({ boatData })
      });
      
      if (!ipfsResponse.ok) {
        throw new Error(`IPFS upload failed: ${ipfsResponse.status}`);
      }
      
      const { ipfsHash } = await ipfsResponse.json();
      console.log(`  ✅ IPFS hash: ${ipfsHash}`);
      
      // 2. Mint the NFT
      console.log('  ⛏️  Minting NFT...');
      const mintResponse = await fetch('http://localhost:8080/boats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + await getDevToken('0x766fe3DED655D3318000A10aEB7422BC5f210835')
        },
        body: JSON.stringify({
          to: '0x766fe3DED655D3318000A10aEB7422BC5f210835',
          uri: `ipfs://${ipfsHash}`
        })
      });
      
      if (!mintResponse.ok) {
        throw new Error(`Mint failed: ${mintResponse.status}`);
      }
      
      const mintResult = await mintResponse.json();
      console.log(`  ✅ Boat minted! Token ID: ${mintResult.tokenId}, TX: ${mintResult.txHash}`);
      
    } catch (error) {
      console.error(`  ❌ Error creating boat ${i + 1}:`, error.message);
    }
    
    console.log('');
  }
  
  console.log('🎉 All boats creation process completed!');
  console.log('\n📋 Summary:');
  console.log('- Owner: Alex Martin (0x766fe3DED655D3318000A10aEB7422BC5f210835)');
  console.log('- Boats: Sun Odyssey 380, Lagoon 380, Bavaria 46 Cruiser');
  console.log('- Sophie Durand: Can view all boats (no ownership)');
  console.log('- Bureau Veritas Marine: Can certify all boats (no ownership)');
}

async function getDevToken(address) {
  const response = await fetch('http://localhost:8080/auth/dev-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address })
  });
  
  const data = await response.json();
  return data.token;
}

createBoats().catch(console.error);