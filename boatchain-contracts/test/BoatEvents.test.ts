import { ethers } from "hardhat";
import { expect } from "chai";

enum EventKind {
  Sale,
  Repair,
  Incident,
  Inspection,
}

describe("BoatEvents", () => {
  let passport: any;
  let registry: any;
  let events: any;
  let deployer: any;
  let minter: any;
  let owner: any;
  let pro: any;
  let insurer: any;

  beforeEach(async () => {
    [deployer, minter, owner, pro, insurer] = await ethers.getSigners();

    // Déploiement du passeport + mint
    const Passport = await ethers.getContractFactory("BoatPassport");
    passport = await Passport.deploy();
    await passport.waitForDeployment();
    await passport.connect(deployer).grantRole(await passport.MINTER_ROLE(), minter.address);
    await passport.connect(minter).mint(owner.address, "ipfs://boat");

    // Déploiement du registre de rôles + attribution
    const Registry = await ethers.getContractFactory("RoleRegistry");
    registry = await Registry.deploy();
    await registry.waitForDeployment();
    await registry.connect(deployer).certifyProfessional(pro.address, "ipfs://cert");
    const INSURER_ROLE = await registry.INSURER_ROLE();
    await registry.connect(deployer).grantRole(INSURER_ROLE, insurer.address);

    // Déploiement du journal d'événements
    const Events = await ethers.getContractFactory("BoatEvents");
    events = await Events.deploy(passport.target, registry.target);
    await events.waitForDeployment();
  });

  it("autorise un professionnel à enregistrer une réparation", async () => {
    await expect(
      events.connect(pro).addEvent(1, EventKind.Repair, "ipfs://repair")
    )
      .to.emit(events, "BoatEventLogged")
      .withArgs(1, EventKind.Repair, pro.address, "ipfs://repair");

    expect(await events.eventCount(1)).to.equal(1);
  });

  it("refuse une réparation par un non‑professionnel", async () => {
    await expect(
      events.connect(owner).addEvent(1, EventKind.Repair, "ipfs://repair")
    ).to.be.revertedWith("Only certified pro");
  });

  it("autorise le propriétaire à enregistrer une vente", async () => {
    await expect(
      events.connect(owner).addEvent(1, EventKind.Sale, "ipfs://sale")
    ).to.emit(events, "BoatEventLogged");
  });

  it("autorise l'assureur à enregistrer un incident", async () => {
    await expect(
      events.connect(insurer).addEvent(1, EventKind.Incident, "ipfs://incident")
    ).to.emit(events, "BoatEventLogged");
  });
});
