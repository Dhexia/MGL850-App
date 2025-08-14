import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Funding dev accounts with deployer:", deployer.address);
  
  // Dev accounts addresses (from backend/src/lib/dev-accounts.ts)
  const devAccounts = [
    {
      address: "0x766fe3DED655D3318000A10aEB7422BC5f210835",
      name: "Alex Martin (Propriétaire)"
    },
    {
      address: "0x48f4F0Dff2faaA97767d9e93A03C3849f94E6Cf8", 
      name: "Sophie Durand (Acheteuse)"
    },
    {
      address: "0xD3bdEb48c0b454AAF25f58FFB3c8e15efAAE30d9",
      name: "Bureau Veritas Marine (Certificateur)"
    },
  ];
  
  // Amount to fund each account (0.1 ETH)
  const fundAmount = ethers.parseEther("0.1");
  
  console.log("Funding each account with 0.1 ETH...\n");
  
  for (const account of devAccounts) {
    console.log(`Funding ${account.name}...`);
    console.log(`Address: ${account.address}`);
    
    // Check current balance
    const currentBalance = await ethers.provider.getBalance(account.address);
    console.log(`Current balance: ${ethers.formatEther(currentBalance)} ETH`);
    
    if (currentBalance < ethers.parseEther("0.05")) {
      try {
        const tx = await deployer.sendTransaction({
          to: account.address,
          value: fundAmount
        });
        
        await tx.wait();
        
        const newBalance = await ethers.provider.getBalance(account.address);
        console.log(`✅ Funded! New balance: ${ethers.formatEther(newBalance)} ETH`);
      } catch (error) {
        console.error(`❌ Failed to fund ${account.address}:`, error.message);
      }
    } else {
      console.log(`✅ Account already has sufficient funds`);
    }
    
    console.log("");
  }
  
  console.log("🎉 Dev accounts funding complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });