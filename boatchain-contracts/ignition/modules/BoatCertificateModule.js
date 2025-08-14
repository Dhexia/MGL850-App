"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
const RoleRegistryModule_1 = __importDefault(require("./RoleRegistryModule"));
/**
 * Deploys BoatCertificate after ensuring RoleRegistry is deployed.
 * The constructor needs RoleRegistry address, so we declare dependency via
 * m.useModule which returns the deployment result of RoleRegistryModule.
 */
exports.default = (0, modules_1.buildModule)("BoatCertificateModule", (m) => {
    // Use previously defined module to obtain deployed address
    const { roleRegistry } = m.useModule(RoleRegistryModule_1.default);
    // Constructor parameter: address of RoleRegistry
    const boatCertificate = m.contract("BoatCertificate", [roleRegistry]);
    return { boatCertificate };
});
