// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RoleRegistry
 * @notice Attribue et vérifie les rôles externes (professionnel, assureur…).
 */
contract RoleRegistry is AccessControl {
    /// Hash IPFS prouvant la licence ou le diplôme d’un professionnel
    struct Certificate {
        string proof;      // ex : ipfs://Qm...
        bool   valid;
    }

    bytes32 public constant PROFESSIONAL_ROLE = keccak256("PROFESSIONAL_ROLE");
    bytes32 public constant INSURER_ROLE      = keccak256("INSURER_ROLE");

    mapping(address => Certificate) private _certs;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Certifie un professionnel et lui assigne le rôle.
     * @dev    La preuve peut être mise à jour, jamais supprimée.
     */
    function certifyProfessional(address account, string calldata proof)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _certs[account] = Certificate({proof: proof, valid: true});
        _grantRole(PROFESSIONAL_ROLE, account);
    }

    /**
     * @notice Révoque (ou suspend) un professionnel certifié.
     */
    function revokeProfessional(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _certs[account].valid = false;
        _revokeRole(PROFESSIONAL_ROLE, account);
    }

    /**
     * @return true si l’adresse possède le rôle et une certification valide.
     */
    function isProfessional(address account) external view returns (bool) {
        return
            hasRole(PROFESSIONAL_ROLE, account) &&
            _certs[account].valid;
    }

    /// Vue similaire pour les assureurs, si besoin
}
