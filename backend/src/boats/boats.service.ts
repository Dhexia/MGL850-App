import { Injectable } from '@nestjs/common';
import { ChainService } from '../chain/chain.service';
import type { BoatEvents } from '../abi/typechain-types/contracts/BoatEvents';

type EventData = BoatEvents.EventDataStructOutput;

@Injectable()
export class BoatsService {
  constructor(private readonly chain: ChainService) {}

  /* Lecture simple – déjà utilisée par GET /boats/:id/events */
  async listEvents(boatId: number): Promise<EventData[]> {
    return this.chain.getHistory(boatId);
  }

  /* Vérifie qu'un NFT existe avant toute opération */
  async ensureBoatExists(boatId: number): Promise<void> {
    if (!(await this.chain.boatExists(boatId))) {
      throw new Error('Boat not found');
    }
  }

  /* Frappe un nouveau passeport on‑chain */
  async mintPassport(to: string, uri: string) {
    const receipt = await this.chain.mintPassport(to, uri);
    return { txHash: receipt.hash };
  }

  /* Ajoute un événement au journal */
  async addEvent(boatId: number, kind: number, ipfsHash: string) {
    await this.ensureBoatExists(boatId);
    const receipt = await this.chain.addEventTx(boatId, kind, ipfsHash);
    return { txHash: receipt.hash };
  }
}
