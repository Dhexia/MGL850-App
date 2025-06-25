import { ethers } from "hardhat";
import { expect } from "chai";

describe("BoatPassport", () => {
  let passport: any;
  let deployer: any;
  let minter: any;
  let alice: any;

  beforeEach(async () => {
    [deployer, minter, alice] = await ethers.getSigners();
    const Passport = await ethers.getContractFactory("BoatPassport");
    passport = await Passport.deploy();
    await passport.waitForDeployment();
    // Autorise le minter
    await passport.connect(deployer).grantRole(await passport.MINTER_ROLE(), minter.address);
  });

  it("autorise le minter à créer un passeport et fixe l'URI", async () => {
    await expect(passport.connect(minter).mint(alice.address, "ipfs://hash"))
      .to.emit(passport, "Transfer")
      .withArgs(ethers.ZeroAddress, alice.address, 1);

    expect(await passport.ownerOf(1)).to.equal(alice.address);
    expect(await passport.tokenURI(1)).to.equal("ipfs://hash");
  });

  it("refuse la création si l'appelant n'est pas minter", async () => {
    await expect(
      passport.connect(alice).mint(alice.address, "ipfs://hash")
    ).to.be.revertedWithCustomError(passport, "AccessControlUnauthorizedAccount");
  });

  it("annonce les interfaces ERC721 et AccessControl", async () => {
    const IERC721 = "0x80ac58cd"; // ERC‑721
    const IAccessControl = "0x7965db0b"; // AccessControl
    expect(await passport.supportsInterface(IERC721)).to.be.true;
    expect(await passport.supportsInterface(IAccessControl)).to.be.true;
  });
});