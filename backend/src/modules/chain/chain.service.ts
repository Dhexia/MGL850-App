// src/chain/chain.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

import {
  BoatEvents__factory,
  BoatPassport__factory,
  RoleRegistry__factory,
  BoatEvents,
  BoatPassport,
  RoleRegistry,
} from '../../abi/typechain-types';

@Injectable()
export class ChainService {
  private readonly provider: ethers.JsonRpcProvider;
  private readonly signer: ethers.Wallet;

  private readonly boatEvents: BoatEvents;
  private readonly boatPassport: BoatPassport;
  private readonly roleRegistry: RoleRegistry;

  constructor(private readonly cfg: ConfigService) {
    /* --- connexion RPC lecture / écriture --- */
    this.provider = new ethers.JsonRpcProvider(
      this.cfg.getOrThrow<string>('SEPOLIA_RPC_URL'),
    );

    /* --- signer dérivé de la clé privée (env: PRIVATE_KEY) --- */
    this.signer = new ethers.Wallet(
      this.cfg.getOrThrow<string>('PRIVATE_KEY'),
      this.provider,
    );

    /* --- instances typées des contrats --- */
    this.boatEvents = BoatEvents__factory.connect(
      this.cfg.getOrThrow<string>('BOAT_EVENTS_ADDRESS'),
      this.provider,
    );

    this.boatPassport = BoatPassport__factory.connect(
      this.cfg.getOrThrow<string>('BOAT_PASSPORT_ADDRESS'),
      this.provider,
    );

    this.roleRegistry = RoleRegistry__factory.connect(
      this.cfg.getOrThrow<string>('ROLE_REGISTRY_ADDRESS'),
      this.provider,
    );
  }

  /* === LECTURE =========================================================== */

  async getHistory(boatId: number) {
    const total = await this.boatEvents.eventCount(boatId);
    const events = [];
    for (let i = 0; i < total; i++) {
      events.push(await this.boatEvents.eventByIndex(boatId, i));
    }
    return events;
  }

  async isCertifiedProfessional(address: string) {
    return this.roleRegistry.isProfessional(address);
  }

  async boatExists(boatId: number) {
    try {
      await this.boatPassport.ownerOf(boatId);
      return true;
    } catch {
      return false;
    }
  }

  /** Adresse propriétaire actuelle d’un bateau */
  async getOwner(boatId: number) {
    return this.boatPassport.ownerOf(boatId);
  }

  /** Vrai si caller est propriétaire du bateau */
  async isOwner(boatId: number, caller: string) {
    return (await this.getOwner(boatId)).toLowerCase() === caller.toLowerCase();
  }

  /** Vrai si caller possède le rôle assureur */
  async isInsurer(caller: string) {
    const role = await this.roleRegistry.INSURER_ROLE();
    return this.roleRegistry.hasRole(role, caller);
  }

  /* === ÉCRITURE ========================================================== */

  /** Frappe un passeport et renvoie le reçu miné */
  async mintPassport(to: string, uri: string) {
    const tx = await this.boatPassport.connect(this.signer).mint(to, uri);
    return { txHash: tx.hash };
  }

  /** Ajoute un événement on-chain et retourne le reçu miné */
  async addEventTx(boatId: number, kind: number, ipfsHash: string) {
    const tx = await this.boatEvents
      .connect(this.signer)
      .addEvent(boatId, kind, ipfsHash);
    return tx.wait();
  }
}
