import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChainService } from '../chain/chain.service';
import type { BoatEvents } from '../../abi/typechain-types/contracts/BoatEvents';

type EventData = BoatEvents.EventDataStructOutput;

@Injectable()
export class BoatsService {
  private readonly supa: SupabaseClient;

  constructor(
    private readonly cfg: ConfigService,
    private readonly chain: ChainService,
  ) {
    this.supa = createClient(
      this.cfg.get<string>('SUPABASE_URL')!,
      this.cfg.get<string>('SUPABASE_SERVICE_KEY')!,
    );
  }

  /* ------------------------------------------------------------------ */
  /* Lecture : priorité à Supabase, fallback on‑chain                    */
  /* ------------------------------------------------------------------ */
  async listEvents(boatId: number): Promise<EventData[]> {
    const cached = await this.listEventsDb(boatId);
    if (cached.length) return cached as unknown as EventData[];
    return this.chain.getHistory(boatId);
  }

  private async listEventsDb(boatId: number) {
    const { data } = await this.supa
      .from('events')
      .select('*')
      .eq('boat_id', boatId)
      .order('ts', { ascending: false });
    return data ?? [];
  }

  /* ------------------------------------------------------------------ */
  /* Création de passeport (NFT)                                         */
  /* ------------------------------------------------------------------ */
  async mintPassport(to: string, uri: string) {
    return this.chain.mintPassport(to, uri);
  }

  /* ------------------------------------------------------------------ */
  /* Ajout d'événement : contrôle des rôles                              */
  /* kind : 0 = Sale, 1 = Repair, 2 = Incident, 3 = Inspection          */
  /* ------------------------------------------------------------------ */
  async addEvent(
    boatId: number,
    kind: number,
    ipfsHash: string,
    caller: string,
  ) {
    if (!(await this.chain.boatExists(boatId))) {
      throw new ForbiddenException('Boat does not exist');
    }

    if ([1, 3].includes(kind)) {
      if (!(await this.chain.isCertifiedProfessional(caller))) {
        throw new ForbiddenException('Not a certified professional');
      }
    } else if (kind === 2) {
      const isOwner = await this.chain.isOwner(boatId, caller);
      const isInsurer = await this.chain.isInsurer(caller);
      if (!isOwner && !isInsurer) {
        throw new ForbiddenException('Not owner nor insurer');
      }
    } else if (kind === 0) {
      if (!(await this.chain.isOwner(boatId, caller))) {
        throw new ForbiddenException('Not owner');
      }
    }

    return this.chain.addEventTx(boatId, kind, ipfsHash);
  }
}
