const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const BoatCertificateModule = buildModule("BoatCertificateModule", (m) => {
  // Adresse du RoleRegistry déjà déployé sur Sepolia
  const roleRegistryAddress = m.getParameter(
    "roleRegistryAddress", 
    "0xf0B2598Ea8e0EF26b32D0eF344160217bBbA44D8"
  );
  
  const boatCertificate = m.contract("BoatCertificate", [roleRegistryAddress]);

  return { boatCertificate };
});

module.exports = BoatCertificateModule;