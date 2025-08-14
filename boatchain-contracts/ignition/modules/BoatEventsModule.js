"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const RoleRegistryModule_1 = __importDefault(require("./RoleRegistryModule"));
const BoatPassportModule_1 = __importDefault(require("./BoatPassportModule"));
/**
 * Deploys BoatEvents after ensuring RoleRegistry and BoatPassport are live.
 * The constructor needs their addresses, so we declare dependencies via
 * `m.useModule` which returns the deployment result of child modules.
 */
exports.default = (0, ignition_core_1.buildModule)("BoatEventsModule", (m) => {
    // Use previously defined modules to obtain deployed addresses
    const { roleRegistry } = m.useModule(RoleRegistryModule_1.default);
    const { boatPassport } = m.useModule(BoatPassportModule_1.default);
    // Constructor parameters: address of BoatPassport, address of RoleRegistry
    const boatEvents = m.contract("BoatEvents", [boatPassport, roleRegistry]);
    return { boatEvents };
});
