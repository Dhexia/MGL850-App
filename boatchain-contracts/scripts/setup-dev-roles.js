"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    // Get deployed addresses from ignition deployment
    const boatPassportAddress = "0xad490ec1C585AC18c3f2279E4186339619dBe679";
    // Connect to BoatPassport contract
    const BoatPassport = await hardhat_1.ethers.getContractFactory("BoatPassport");
    const boatPassport = BoatPassport.attach(boatPassportAddress);
    // Dev accounts addresses (from backend/src/lib/dev-accounts.ts)
    const devAccounts = [
        "0x766fe3DED655D3318000A10aEB7422BC5f210835", // Alex Martin (Propriétaire)
        "0x48f4F0Dff2faaA97767d9e93A03C3849f94E6Cf8", // Sophie Durand (Acheteuse)
        "0xD3bdEb48c0b454AAF25f58FFB3c8e15efAAE30d9", // Bureau Veritas Marine (Certificateur)
    ];
    // MINTER_ROLE from contract
    const MINTER_ROLE = await boatPassport.MINTER_ROLE();
    console.log("MINTER_ROLE:", MINTER_ROLE);
    console.log("Granting MINTER_ROLE to all dev accounts...");
    for (const account of devAccounts) {
        console.log(`\nChecking role for ${account}...`);
        const hasRole = await boatPassport.hasRole(MINTER_ROLE, account);
        console.log(`Has MINTER_ROLE: ${hasRole}`);
        if (!hasRole) {
            console.log(`Granting MINTER_ROLE to ${account}...`);
            const tx = await boatPassport.grantRole(MINTER_ROLE, account);
            await tx.wait();
            console.log(`✅ MINTER_ROLE granted to ${account}`);
        }
        else {
            console.log(`✅ ${account} already has MINTER_ROLE`);
        }
    }
    console.log("\n🎉 All dev accounts now have MINTER_ROLE!");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
