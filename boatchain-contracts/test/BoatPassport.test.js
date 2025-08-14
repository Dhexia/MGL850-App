"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const chai_1 = require("chai");
describe("BoatPassport", () => {
    let passport;
    let deployer;
    let minter;
    let alice;
    beforeEach(async () => {
        [deployer, minter, alice] = await hardhat_1.ethers.getSigners();
        const Passport = await hardhat_1.ethers.getContractFactory("BoatPassport");
        passport = await Passport.deploy();
        await passport.waitForDeployment();
        // Autorise le minter
        await passport.connect(deployer).grantRole(await passport.MINTER_ROLE(), minter.address);
    });
    it("autorise le minter à créer un passeport et fixe l'URI", async () => {
        await (0, chai_1.expect)(passport.connect(minter).mint(alice.address, "ipfs://hash"))
            .to.emit(passport, "Transfer")
            .withArgs(hardhat_1.ethers.ZeroAddress, alice.address, 1);
        (0, chai_1.expect)(await passport.ownerOf(1)).to.equal(alice.address);
        (0, chai_1.expect)(await passport.tokenURI(1)).to.equal("ipfs://hash");
    });
    it("refuse la création si l'appelant n'est pas minter", async () => {
        await (0, chai_1.expect)(passport.connect(alice).mint(alice.address, "ipfs://hash")).to.be.revertedWithCustomError(passport, "AccessControlUnauthorizedAccount");
    });
    it("annonce les interfaces ERC721 et AccessControl", async () => {
        const IERC721 = "0x80ac58cd"; // ERC‑721
        const IAccessControl = "0x7965db0b"; // AccessControl
        (0, chai_1.expect)(await passport.supportsInterface(IERC721)).to.be.true;
        (0, chai_1.expect)(await passport.supportsInterface(IAccessControl)).to.be.true;
    });
});
