// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title RoleRegistry
 * @notice Gère les rôles d'utilisateurs : Standard Users et Certificateurs.
 */
contract RoleRegistry is AccessControl {
    /// Hash IPFS prouvant la licence ou le diplôme d'un certificateur
    struct Certificate {
        string proof;      // ex : ipfs://Qm...
        bool   valid;
    }

    /// Rôle pour les certificateurs (organismes de certification)
    bytes32 public constant PROFESSIONAL_ROLE = keccak256("PROFESSIONAL_ROLE");

    mapping(address => Certificate) private _certs;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Certifie un certificateur et lui assigne le rôle PROFESSIONAL_ROLE.
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
     * @notice Révoque (ou suspend) un certificateur.
     */
    function revokeProfessional(address account)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _certs[account].valid = false;
        _revokeRole(PROFESSIONAL_ROLE, account);
    }

    /**
     * @notice Vérifie si l'adresse est un certificateur valide.
     * @return true si l'adresse possède le rôle PROFESSIONAL_ROLE et une certification valide.
     */
    function isProfessional(address account) external view returns (bool) {
        return
            hasRole(PROFESSIONAL_ROLE, account) &&
            _certs[account].valid;
    }

    /**
     * @notice Vérifie si l'adresse est un utilisateur standard (pas de rôle spécial).
     * @return true si l'adresse n'a pas le rôle PROFESSIONAL_ROLE.
     */
    function isStandardUser(address account) external view returns (bool) {
        return !hasRole(PROFESSIONAL_ROLE, account);
    }
}
