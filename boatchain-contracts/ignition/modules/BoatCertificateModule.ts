import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import RoleRegistryModule from "./RoleRegistryModule";

/**
 * Deploys BoatCertificate after ensuring RoleRegistry is deployed.
 * The constructor needs RoleRegistry address, so we declare dependency via
 * m.useModule which returns the deployment result of RoleRegistryModule.
 */
export default buildModule("BoatCertificateModule", (m) => {
  // Use previously defined module to obtain deployed address
  const { roleRegistry } = m.useModule(RoleRegistryModule);

  // Constructor parameter: address of RoleRegistry
  const boatCertificate = m.contract("BoatCertificate", [roleRegistry]);
  
  return { boatCertificate };
});