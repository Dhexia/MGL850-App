import { buildModule } from "@nomicfoundation/ignition-core";

/**
 * Deploys the BoatPassport contract and exposes its instance.
 * After deployment, grants MINTER_ROLE to the deployer by default.
 */
export default buildModule("BoatPassportModule", (m) => {
  const boatPassport = m.contract("BoatPassport", []);
  return { boatPassport };
});
