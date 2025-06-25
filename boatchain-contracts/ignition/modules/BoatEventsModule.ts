import { buildModule } from "@nomicfoundation/ignition-core";
import RoleRegistryModule from "./RoleRegistryModule";
import BoatPassportModule from "./BoatPassportModule";

/**
 * Deploys BoatEvents after ensuring RoleRegistry and BoatPassport are live.
 * The constructor needs their addresses, so we declare dependencies via
 * `m.useModule` which returns the deployment result of child modules.
 */
export default buildModule("BoatEventsModule", (m) => {
  // Use previously defined modules to obtain deployed addresses
  const { roleRegistry } = m.useModule(RoleRegistryModule);
  const { boatPassport } = m.useModule(BoatPassportModule);

  // Constructor parameters: address of BoatPassport, address of RoleRegistry
  const boatEvents = m.contract("BoatEvents", [boatPassport, roleRegistry]);
  return { boatEvents };
});
