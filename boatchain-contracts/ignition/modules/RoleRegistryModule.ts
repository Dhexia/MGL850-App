import { buildModule } from "@nomicfoundation/ignition-core";


/**
 * Deploys the RoleRegistry contract and exposes its instance.
 * After deployment, grants the DEFAULT_ADMIN_ROLE to the deployer by default.
 */
export default buildModule("RoleRegistryModule", (m) => {
  const roleRegistry = m.contract("RoleRegistry", []);
  return { roleRegistry };
});