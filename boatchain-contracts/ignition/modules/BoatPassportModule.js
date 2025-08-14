"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ignition_core_1 = require("@nomicfoundation/ignition-core");
/**
 * Deploys the BoatPassport contract and exposes its instance.
 * After deployment, grants MINTER_ROLE to the deployer by default.
 */
exports.default = (0, ignition_core_1.buildModule)("BoatPassportModule", (m) => {
    const boatPassport = m.contract("BoatPassport", []);
    return { boatPassport };
});
