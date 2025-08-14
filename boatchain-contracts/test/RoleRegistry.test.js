"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const chai_1 = require("chai");
describe("RoleRegistry", () => {
    let registry;
    let deployer;
    let pro;
    beforeEach(async () => {
        [deployer, pro] = await hardhat_1.ethers.getSigners();
        const Registry = await hardhat_1.ethers.getContractFactory("RoleRegistry");
        registry = await Registry.deploy();
        await registry.waitForDeployment();
    });
    it("certifie puis vérifie un professionnel", async () => {
        await registry.connect(deployer).certifyProfessional(pro.address, "ipfs://licence");
        (0, chai_1.expect)(await registry.isProfessional(pro.address)).to.be.true;
    });
    it("révoque le rôle de professionnel", async () => {
        await registry.connect(deployer).certifyProfessional(pro.address, "ipfs://licence");
        await registry.connect(deployer).revokeProfessional(pro.address);
        (0, chai_1.expect)(await registry.isProfessional(pro.address)).to.be.false;
    });
    it("empêche un non‑admin de certifier", async () => {
        await (0, chai_1.expect)(registry.connect(pro).certifyProfessional(pro.address, "ipfs://licence")).to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
    });
});
