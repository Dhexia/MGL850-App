import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, ZeroAddress } from 'ethers';

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
  private readonly log = new Logger(ChainService.name);

  private readonly provider: ethers.JsonRpcProvider;
  private readonly signer: ethers.Wallet;

  private readonly boatEvents: BoatEvents;
  private readonly boatPassport: BoatPassport;
  private readonly roleRegistry: RoleRegistry;

  constructor(private readonly cfg: ConfigService) {
    // lecture / écriture
    this.provider = new ethers.JsonRpcProvider(
      this.cfg.getOrThrow<string>('SEPOLIA_RPC_URL'),
    );
    this.signer = new ethers.Wallet(
      this.cfg.getOrThrow<string>('PRIVATE_KEY'),
      this.provider,
    );

    // contrats (lecture via provider; écriture via connect(signer))
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

  /* ================= LECTURE ================= */

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

  async getOwner(boatId: number) {
    return this.boatPassport.ownerOf(boatId);
  }

  async isOwner(boatId: number, caller: string) {
    return (await this.getOwner(boatId)).toLowerCase() === caller.toLowerCase();
  }

  async isInsurer(caller: string) {
    const role = await this.roleRegistry.INSURER_ROLE();
    return this.roleRegistry.hasRole(role, caller);
  }

  async tokenURI(boatId: number) {
    try {
      return await this.boatPassport.tokenURI(boatId);
    } catch {
      return undefined;
    }
  }

  /* ================= ÉCRITURE ================= */

  /** Mint un passeport et retourne { txHash, tokenId } */
  async mintPassport(to: string, uri: string) {
    const tx = await this.boatPassport.connect(this.signer).mint(to, uri);
    this.log.log(`mint tx sent: ${tx.hash} → to=${to}`);
    const receipt = await tx.wait();
    // parse log Transfer(from=0x0, to, tokenId)
    const topic = this.boatPassport.interface.getEvent('Transfer').topicHash;
    const tf = receipt.logs.find((l) => l.topics?.[0] === topic);
    if (!tf) {
      this.log.warn(`mint receipt has no Transfer log: tx=${tx.hash}`);
      return { txHash: tx.hash };
    }
    const parsed = this.boatPassport.interface.parseLog(tf);
    const from = (parsed.args[0] as string).toLowerCase();
    const toAddr = (parsed.args[1] as string).toLowerCase();
    const tokenId = parsed.args[2].toString();
    if (from !== ZeroAddress) {
      this.log.warn(
        `Transfer not mint (from!=0x0): tx=${tx.hash}, from=${from}`,
      );
    }
    this.log.log(`mint success: tokenId=${tokenId}, to=${toAddr}`);
    return { txHash: tx.hash, tokenId };
  }

  /** Ajoute un événement on-chain et retourne { txHash } */
  async addEventTx(boatId: number, kind: number, ipfsHash: string) {
    const tx = await this.boatEvents
      .connect(this.signer)
      .addEvent(boatId, kind, ipfsHash);
    this.log.log(`addEvent tx sent: ${tx.hash} → boat=${boatId}, kind=${kind}`);
    return { txHash: tx.hash };
  }
}
