"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    // Get deployed addresses
    const boatPassportAddress = "0xad490ec1C585AC18c3f2279E4186339619dBe679";
    // Connect to BoatPassport contract
    const BoatPassport = await hardhat_1.ethers.getContractFactory("BoatPassport");
    const boatPassport = BoatPassport.attach(boatPassportAddress);
    // Check tokens 22, 23, 24
    const tokenIds = [22, 23, 24];
    console.log("Checking tokens on chain:", tokenIds);
    for (const tokenId of tokenIds) {
        try {
            const owner = await boatPassport.ownerOf(tokenId);
            const tokenURI = await boatPassport.tokenURI(tokenId);
            console.log(`Token ${tokenId}: owner=${owner}, URI=${tokenURI}`);
        }
        catch (error) {
            console.log(`Token ${tokenId}: DOES NOT EXIST (${error.reason})`);
        }
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
