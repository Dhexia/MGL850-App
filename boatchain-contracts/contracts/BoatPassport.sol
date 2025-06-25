// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BoatPassport
 * @notice Gère les passeports numériques des bateaux.
 * @dev    Hérite d'ERC721URIStorage pour stocker les métadonnées.
 */
contract BoatPassport is ERC721URIStorage, AccessControl {
    /// Rôle pour les comptes autorisés à mint des passeports
    /// (ex : professionnels, assureurs, etc.)
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextId;

    /**
     * @notice Constructeur qui initialise le contrat.
     * @dev    Le propriétaire (msg.sender) reçoit les rôles d'admin et de minter.
     */
    constructor() ERC721("BoatPassport", "BOAT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @notice Mint un nouveau passeport pour un bateau.
     * @param to L'adresse du propriétaire du bateau.
     * @param uri L'URI des métadonnées du passeport.
     * @return tokenId L'identifiant unique du passeport minté.
     * @dev    Seuls les comptes avec le rôle MINTER_ROLE peuvent appeler cette fonction.
     */
    function mint(address to, string calldata uri)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256 tokenId)
    {
        tokenId = ++_nextId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @notice Indique si l'interface spécifiée est supportée.
     * @param interfaceId L'identifiant de l'interface à vérifier.
     * @return true si l'interface est supportée, false sinon.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
