import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChainService } from '../chain/chain.service';
import { EventKind, Status } from '../../shared/dto';
import type { BoatEvents } from '../../abi/typechain-types/contracts/BoatEvents';

type EventData = BoatEvents.EventDataStructOutput;

@Injectable()
export class EventsService {
  private readonly supa: SupabaseClient;
  private readonly log = new Logger(EventsService.name);

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
  /* Lecture événements pour un bateau                                   */
  /* ------------------------------------------------------------------ */
  async listEventsByBoat(boatId: number): Promise<EventData[]> {
    const cached = await this.listEventsDb(boatId);
    if (cached.length) return cached as unknown as EventData[];
    return this.chain.getHistory(boatId);
  }

  private async listEventsDb(boatId: number) {
    const { data, error } = await this.supa
      .from('events')
      .select('*')
      .eq('boat_id', boatId)
      .order('ts', { ascending: false });
    if (error) this.log.warn(`Supabase events error: ${error.message}`);
    return data ?? [];
  }

  /* ------------------------------------------------------------------ */
  /* Création d'événement avec nouveau workflow                          */
  /* ------------------------------------------------------------------ */
  async createEvent(
    boatId: number,
    kind: EventKind,
    ipfsHash: string,
    caller: string,
  ) {
    if (!(await this.chain.boatExists(boatId))) {
      throw new ForbiddenException('Boat does not exist');
    }

    // Contrôles selon le type d'événement
    if ([EventKind.SALE, EventKind.INCIDENT].includes(kind)) {
      const isOwner = await this.chain.isOwner(boatId, caller);
      if (!isOwner) {
        throw new ForbiddenException('Only owner can log sales and incidents');
      }
    }
    
    // REPAIR et INSPECTION : tous les utilisateurs peuvent créer
    // Ils seront créés avec statut "pending"

    return this.chain.addEventTx(boatId, kind, ipfsHash);
  }

  /* ------------------------------------------------------------------ */
  /* Validation événement par certificateur                              */
  /* ------------------------------------------------------------------ */
  async validateEvent(
    boatId: number,
    eventTxHash: string,
    newStatus: Status,
    validator: string,
  ) {
    if (!(await this.chain.isCertifiedProfessional(validator))) {
      throw new ForbiddenException('Not a certified professional');
    }

    const { data: event, error: fetchError } = await this.supa
      .from('events')
      .select('*')
      .eq('boat_id', boatId)
      .eq('tx_hash', eventTxHash)
      .single();

    if (fetchError || !event) {
      throw new ForbiddenException('Event not found');
    }

    const { error: updateError } = await this.supa
      .from('events')
      .update({ 
        status: newStatus,
        validated_by: validator,
        validated_at: new Date().toISOString(),
      })
      .eq('boat_id', boatId)
      .eq('tx_hash', eventTxHash);

    if (updateError) {
      this.log.error(`Failed to update event status: ${updateError.message}`);
      throw new Error('Failed to validate event');
    }

    this.log.log(`🔍 Event ${eventTxHash} status updated to ${newStatus} by ${validator}`);
    
    return {
      success: true,
      boatId,
      eventTxHash,
      newStatus,
      validatedBy: validator,
      validatedAt: new Date().toISOString(),
    };
  }

  /* ------------------------------------------------------------------ */
  /* Liste tous les événements en attente (pour certificateurs)         */
  /* ------------------------------------------------------------------ */
  async listPendingEvents() {
    const { data, error } = await this.supa
      .from('events')
      .select('*')
      .eq('status', Status.PENDING)
      .order('ts', { ascending: false });
    
    if (error) {
      this.log.warn(`Supabase pending events error: ${error.message}`);
      return [];
    }
    
    return data ?? [];
  }
}