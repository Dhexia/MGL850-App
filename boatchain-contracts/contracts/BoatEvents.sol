// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./RoleRegistry.sol";
import "./BoatPassport.sol";

/**
 * @title BoatEvents
 * @notice Historise les réparations, inspections, ventes, sinistres d’un bateau.
 * @dev    Ne stocke que les métadonnées minimales pour limiter le coût en gas.
 */
contract BoatEvents {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    /// Types d’événements possibles
    /// - Sale : vente du bateau
    /// - Repair : réparation effectuée
    /// - Incident : sinistre déclaré (accident, vol, etc.)
    /// - Inspection : contrôle technique ou vérification de conformité
    /// Les catégories sont restreintes par des rôles spécifiques.
    /// Les événements sont indexés par boatId pour un accès rapide.
    /// Les données sont stockées dans un tableau pour chaque bateau.
    enum EventKind {
        Sale,
        Repair,
        Incident,
        Inspection
    }

    // Structure pour stocker les données d’un événement
    /// @dev Utilise uint256 pour le timestamp pour la compatibilité avec les timestamps Unix
    /// @dev L'IPFS hash est stocké en string pour la flexibilité,
    struct EventData {
        EventKind kind;
        uint256   timestamp;
        address   author;     // wallet initiateur
        string    ipfsHash;   // lien vers la preuve détaillée
    }

    /// boatId => liste d’événements
    mapping(uint256 => EventData[]) private _history;

    BoatPassport  public immutable passport;
    RoleRegistry  public immutable roles;

    /// Événement émis à chaque ajout pour l’indexation off-chain
    event BoatEventLogged(
        uint256 indexed boatId,
        EventKind       kind,
        address indexed author,
        string          ipfsHash
    );

    /**
     * @notice Constructeur du contrat.
     * @param _passport Référence au contrat BoatPassport pour vérifier les propriétaires.
     * @param _roles    Référence au contrat RoleRegistry pour vérifier les rôles.
     */
    constructor(BoatPassport _passport, RoleRegistry _roles) {
        passport = _passport;
        roles    = _roles;
    }

    /**
     * @notice Ajoute un événement. Certaines catégories sont restreintes.
     *         – Repair et Inspection : réservés aux professionnels certifiés
     *         – Incident : réservé au propriétaire ou à l’assureur
     *         – Sale      : réservé au vendeur (propriétaire actuel)
     */
    function addEvent(
        uint256   boatId,
        EventKind kind,
        string    calldata ipfsHash
    ) external {
        // Vérifie d'abord que le bateau existe en tentant de récupérer son propriétaire
        // Si le bateau n'existe pas, ownerOf() lèvera une exception
        require(passport.ownerOf(boatId) != address(0), "Unknown boat");

        // Contrôle d'accès basé sur le type d'événement pour garantir l'intégrité des données
        if (kind == EventKind.Repair || kind == EventKind.Inspection) {
            // Seuls les professionnels certifiés peuvent enregistrer des réparations/inspections
            // Cela garantit la qualité et la fiabilité des informations techniques
            require(
                roles.isProfessional(msg.sender),
                "Only certified pro"
            );
        } else if (kind == EventKind.Incident) {
            // Vérification que l'appelant est bien le propriétaire du bateau
            bool isOwner = passport.ownerOf(boatId) == msg.sender;
            // Seuls les propriétaires peuvent déclarer des incidents pour éviter les fausses déclarations
            require(isOwner, "Only owner can log incidents");
        } else if (kind == EventKind.Sale) {
            // Pour les ventes, seul le propriétaire actuel peut enregistrer la transaction
            // Cela empêche les ventes frauduleuses ou non autorisées
            require(
                passport.ownerOf(boatId) == msg.sender,
                "Only owner may log sale"
            );
        }

        // Ajout de l'événement à l'historique avec timestamp automatique
        // L'utilisation de block.timestamp assure une horodatage immuable
        _history[boatId].push(
            EventData({
                kind: kind,
                timestamp: block.timestamp, // Timestamp Unix du bloc actuel
                author: msg.sender,         // Adresse de l'auteur de l'événement
                ipfsHash: ipfsHash          // Hash IPFS contenant les détails/preuves
            })
        );

        // Émission d'un événement pour l'indexation off-chain et les notifications
        // Permet aux services externes de réagir aux nouveaux événements en temps réel
        emit BoatEventLogged(boatId, kind, msg.sender, ipfsHash);
    }

    /**
     * @notice Retourne le nombre total d’événements d’un bateau.
     */
    function eventCount(uint256 boatId) external view returns (uint256) {
        return _history[boatId].length;
    }

    /**
     * @notice Accès indexé à un événement donné.
     * @dev    Utile pour l’Indexer off-chain ; éviter en front direct.
     */
    function eventByIndex(uint256 boatId, uint256 index)
        external
        view
        returns (EventData memory)
    {
        require(index < _history[boatId].length, "Index out of range");
        return _history[boatId][index];
    }
}
