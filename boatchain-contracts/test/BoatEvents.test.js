"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const chai_1 = require("chai");
var EventKind;
(function (EventKind) {
    EventKind[EventKind["Sale"] = 0] = "Sale";
    EventKind[EventKind["Repair"] = 1] = "Repair";
    EventKind[EventKind["Incident"] = 2] = "Incident";
    EventKind[EventKind["Inspection"] = 3] = "Inspection";
})(EventKind || (EventKind = {}));
describe("BoatEvents", () => {
    let passport;
    let registry;
    let events;
    let deployer;
    let minter;
    let owner;
    let pro;
    let insurer;
    beforeEach(async () => {
        [deployer, minter, owner, pro, insurer] = await hardhat_1.ethers.getSigners();
        // Déploiement du passeport + mint
        const Passport = await hardhat_1.ethers.getContractFactory("BoatPassport");
        passport = await Passport.deploy();
        await passport.waitForDeployment();
        await passport.connect(deployer).grantRole(await passport.MINTER_ROLE(), minter.address);
        await passport.connect(minter).mint(owner.address, "ipfs://boat");
        // Déploiement du registre de rôles + attribution
        const Registry = await hardhat_1.ethers.getContractFactory("RoleRegistry");
        registry = await Registry.deploy();
        await registry.waitForDeployment();
        await registry.connect(deployer).certifyProfessional(pro.address, "ipfs://cert");
        const INSURER_ROLE = await registry.INSURER_ROLE();
        await registry.connect(deployer).grantRole(INSURER_ROLE, insurer.address);
        // Déploiement du journal d'événements
        const Events = await hardhat_1.ethers.getContractFactory("BoatEvents");
        events = await Events.deploy(passport.target, registry.target);
        await events.waitForDeployment();
    });
    it("autorise un professionnel à enregistrer une réparation", async () => {
        await (0, chai_1.expect)(events.connect(pro).addEvent(1, EventKind.Repair, "ipfs://repair"))
            .to.emit(events, "BoatEventLogged")
            .withArgs(1, EventKind.Repair, pro.address, "ipfs://repair");
        (0, chai_1.expect)(await events.eventCount(1)).to.equal(1);
    });
    it("refuse une réparation par un non‑professionnel", async () => {
        await (0, chai_1.expect)(events.connect(owner).addEvent(1, EventKind.Repair, "ipfs://repair")).to.be.revertedWith("Only certified pro");
    });
    it("autorise le propriétaire à enregistrer une vente", async () => {
        await (0, chai_1.expect)(events.connect(owner).addEvent(1, EventKind.Sale, "ipfs://sale")).to.emit(events, "BoatEventLogged");
    });
    it("autorise l'assureur à enregistrer un incident", async () => {
        await (0, chai_1.expect)(events.connect(insurer).addEvent(1, EventKind.Incident, "ipfs://incident")).to.emit(events, "BoatEventLogged");
    });
});
