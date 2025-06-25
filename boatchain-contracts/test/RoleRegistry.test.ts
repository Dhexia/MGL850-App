import { ethers } from "hardhat";
import { expect } from "chai";

describe("RoleRegistry", () => {
  let registry: any;
  let deployer: any;
  let pro: any;

  beforeEach(async () => {
    [deployer, pro] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("RoleRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();
  });

  it("certifie puis vérifie un professionnel", async () => {
    await registry.connect(deployer).certifyProfessional(pro.address, "ipfs://licence");
    expect(await registry.isProfessional(pro.address)).to.be.true;
  });

  it("révoque le rôle de professionnel", async () => {
    await registry.connect(deployer).certifyProfessional(pro.address, "ipfs://licence");
    await registry.connect(deployer).revokeProfessional(pro.address);
    expect(await registry.isProfessional(pro.address)).to.be.false;
  });

  it("empêche un non‑admin de certifier", async () => {
    await expect(
      registry.connect(pro).certifyProfessional(pro.address, "ipfs://licence")
    ).to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
  });
});
