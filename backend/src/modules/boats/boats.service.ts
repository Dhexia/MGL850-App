import { Injectable, ForbiddenException } from '@nestjs/common';
import { ChainService } from '../../modules/chain/chain.service';
import type { BoatEvents } from '../../abi/typechain-types/contracts/BoatEvents';

type EventData = BoatEvents.EventDataStructOutput;

/**
 * Service domaine Bateaux.
 * – lecture de l'historique on‑chain ou via l'indexer (future étape)
 * – création de passeport NFT
 * – ajout d'événements avec contrôle de rôles
 */
@Injectable()
export class BoatsService {
  constructor(private readonly chain: ChainService) {}

  /* -------------------- Lecture -------------------- */
  async listEvents(boatId: number): Promise<EventData[]> {
    return this.chain.getHistory(boatId);
  }

  /* -------------------- Écriture : passeport -------------------- */
  async mintPassport(to: string, uri: string) {
    return this.chain.mintPassport(to, uri); // délègue au ChainService
  }

  /* -------------------- Écriture : événement -------------------- */
  /**
   * Ajoute un événement après avoir vérifié que l'appelant possède le rôle requis.
   * kind:
   *   0 = Sale (uniquement propriétaire)
   *   1 = Repair (professionnel certifié)
   *   2 = Incident (propriétaire OU assureur)
   *   3 = Inspection (professionnel certifié)
   */
  async addEvent(
    boatId: number,
    kind: number,
    ipfsHash: string,
    caller: string,
  ) {
    // vérifie que le bateau existe
    if (!(await this.chain.boatExists(boatId))) {
      throw new ForbiddenException('Bateau inexistant');
    }

    // rôles selon la catégorie
    switch (kind) {
      case 0: // Sale
        if (!(await this.chain.isOwner(boatId, caller))) {
          throw new ForbiddenException(
            'Seul le propriétaire peut enregistrer une vente',
          );
        }
        break;
      case 1: // Repair
      case 3: // Inspection
        if (!(await this.chain.isCertifiedProfessional(caller))) {
          throw new ForbiddenException('Professionnel certifié requis');
        }
        break;
      case 2: // Incident
        if (
          !(await this.chain.isOwner(boatId, caller)) &&
          !(await this.chain.isInsurer(caller))
        ) {
          throw new ForbiddenException('Propriétaire ou assureur requis');
        }
        break;
      default:
        throw new ForbiddenException("Type d'événement inconnu");
    }

    // si tout est bon, envoie la transaction
    return this.chain.addEventTx(boatId, kind, ipfsHash);
  }
}
