"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ignition_core_1 = require("@nomicfoundation/ignition-core");
/**
 * Deploys the RoleRegistry contract and exposes its instance.
 * After deployment, grants the DEFAULT_ADMIN_ROLE to the deployer by default.
 */
exports.default = (0, ignition_core_1.buildModule)("RoleRegistryModule", (m) => {
    const roleRegistry = m.contract("RoleRegistry", []);
    return { roleRegistry };
});
