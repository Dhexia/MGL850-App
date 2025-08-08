// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RoleRegistry.sol";

/**
 * @title BoatCertificate
 * @dev Contrat pour gérer les certificats de bateaux avec validation
 */
contract BoatCertificate is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    
    RoleRegistry public immutable roleRegistry;
    
    struct Certificate {
        uint256 boatId;           // ID du bateau
        address issuer;           // Qui a émis le certificat
        address validator;        // Qui a validé le certificat
        string certificateType;   // Type de certificat (safety, technical, etc.)
        string ipfsHash;         // Hash IPFS du certificat
        uint256 issuedAt;        // Timestamp d'émission
        uint256 expiresAt;       // Timestamp d'expiration (0 si pas d'expiration)
        uint256 validatedAt;     // Timestamp de validation
        bool isValid;            // Statut de validité
    }
    
    // Mapping : certificateId => Certificate
    mapping(uint256 => Certificate) public certificates;
    
    // Mapping : boatId => liste des certificateIds
    mapping(uint256 => uint256[]) public boatCertificates;
    
    // Counter pour les IDs de certificats
    uint256 public certificateCounter;
    
    // Events
    event CertificateIssued(
        uint256 indexed certificateId,
        uint256 indexed boatId,
        address indexed issuer,
        string certificateType,
        string ipfsHash
    );
    
    event CertificateValidated(
        uint256 indexed certificateId,
        address indexed validator,
        bool isValid
    );
    
    event CertificateRevoked(
        uint256 indexed certificateId,
        address indexed revoker
    );
    
    constructor(address _roleRegistry) {
        roleRegistry = RoleRegistry(_roleRegistry);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Émet un nouveau certificat
     */
    function issueCertificate(
        uint256 boatId,
        string memory certificateType,
        string memory ipfsHash,
        uint256 expiresAt
    ) external returns (uint256) {
        // Vérifier que l'appelant est un professionnel certifié
        require(
            roleRegistry.hasRole(roleRegistry.PROFESSIONAL_ROLE(), msg.sender),
            "Not a certified professional"
        );
        
        certificateCounter++;
        uint256 certificateId = certificateCounter;
        
        certificates[certificateId] = Certificate({
            boatId: boatId,
            issuer: msg.sender,
            validator: address(0),
            certificateType: certificateType,
            ipfsHash: ipfsHash,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            validatedAt: 0,
            isValid: false  // En attente de validation
        });
        
        boatCertificates[boatId].push(certificateId);
        
        emit CertificateIssued(
            certificateId,
            boatId,
            msg.sender,
            certificateType,
            ipfsHash
        );
        
        return certificateId;
    }
    
    /**
     * @dev Valide ou rejette un certificat
     */
    function validateCertificate(
        uint256 certificateId,
        bool isValid
    ) external {
        require(certificateId <= certificateCounter, "Certificate does not exist");
        require(
            roleRegistry.hasRole(roleRegistry.PROFESSIONAL_ROLE(), msg.sender),
            "Not a certified professional"
        );
        
        Certificate storage cert = certificates[certificateId];
        require(cert.issuer != address(0), "Certificate does not exist");
        require(cert.validator == address(0), "Certificate already validated");
        
        cert.validator = msg.sender;
        cert.isValid = isValid;
        cert.validatedAt = block.timestamp;
        
        emit CertificateValidated(certificateId, msg.sender, isValid);
    }
    
    /**
     * @dev Révoque un certificat
     */
    function revokeCertificate(uint256 certificateId) external {
        require(certificateId <= certificateCounter, "Certificate does not exist");
        
        Certificate storage cert = certificates[certificateId];
        require(cert.issuer != address(0), "Certificate does not exist");
        
        // Seul l'émetteur ou un admin peut révoquer
        require(
            cert.issuer == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized to revoke"
        );
        
        cert.isValid = false;
        
        emit CertificateRevoked(certificateId, msg.sender);
    }
    
    /**
     * @dev Récupère un certificat par ID
     */
    function getCertificate(uint256 certificateId) 
        external 
        view 
        returns (Certificate memory) 
    {
        require(certificateId <= certificateCounter, "Certificate does not exist");
        return certificates[certificateId];
    }
    
    /**
     * @dev Récupère tous les certificats d'un bateau
     */
    function getBoatCertificates(uint256 boatId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return boatCertificates[boatId];
    }
    
    /**
     * @dev Vérifie si un certificat est valide et non expiré
     */
    function isCertificateValid(uint256 certificateId) 
        external 
        view 
        returns (bool) 
    {
        if (certificateId > certificateCounter) return false;
        
        Certificate memory cert = certificates[certificateId];
        
        // Vérifier si validé
        if (!cert.isValid) return false;
        
        // Vérifier si expiré
        if (cert.expiresAt > 0 && cert.expiresAt < block.timestamp) return false;
        
        return true;
    }
    
    /**
     * @dev Compte les certificats valides d'un bateau par type
     */
    function countValidCertificatesByType(
        uint256 boatId,
        string memory certificateType
    ) external view returns (uint256) {
        uint256[] memory certIds = boatCertificates[boatId];
        uint256 count = 0;
        
        for (uint256 i = 0; i < certIds.length; i++) {
            Certificate memory cert = certificates[certIds[i]];
            
            if (
                cert.isValid &&
                (cert.expiresAt == 0 || cert.expiresAt >= block.timestamp) &&
                keccak256(bytes(cert.certificateType)) == keccak256(bytes(certificateType))
            ) {
                count++;
            }
        }
        
        return count;
    }
}