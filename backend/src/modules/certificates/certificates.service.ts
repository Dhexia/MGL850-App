import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChainService } from '../chain/chain.service';
import { CertificateType, Status } from '../../shared/dto';

@Injectable()
export class CertificatesService {
  private readonly supa: SupabaseClient;
  private readonly log = new Logger(CertificatesService.name);

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
  /* Création de certificat                                              */
  /* ------------------------------------------------------------------ */
  async createCertificate(
    boatId: number,
    person: string,
    date: string,
    title: string,
    certificateType: CertificateType,
    description: string,
    ipfsHash: string,
    expires?: string,
  ) {
    if (!(await this.chain.boatExists(boatId))) {
      throw new ForbiddenException('Boat does not exist');
    }

    const { data, error } = await this.supa
      .from('certificates')
      .insert([{
        boat_id: boatId,
        person,
        date: new Date(date).toISOString(),
        title,
        expires: expires ? new Date(expires).toISOString() : null,
        certificate_type: certificateType,
        status: Status.PENDING,
        description,
        ipfs_hash: ipfsHash,
      }])
      .select()
      .single();

    if (error) {
      this.log.error(`Failed to create certificate: ${error.message}`);
      throw new Error('Failed to create certificate');
    }

    this.log.log(`📜 Certificate created for boat #${boatId}: ${title}`);
    return data;
  }

  /* ------------------------------------------------------------------ */
  /* Liste certificats d'un bateau                                       */
  /* ------------------------------------------------------------------ */
  async listCertificatesByBoat(boatId: number) {
    const { data, error } = await this.supa
      .from('certificates')
      .select('*')
      .eq('boat_id', boatId)
      .order('created_at', { ascending: false });

    if (error) {
      this.log.warn(`Supabase certificates error: ${error.message}`);
      return [];
    }

    return data ?? [];
  }

  /* ------------------------------------------------------------------ */
  /* Validation certificat par certificateur                             */
  /* ------------------------------------------------------------------ */
  async validateCertificate(
    certificateId: number,
    newStatus: Status,
    validator: string,
  ) {
    if (!(await this.chain.isCertifiedProfessional(validator))) {
      throw new ForbiddenException('Not a certified professional');
    }

    const { data: certificate, error: fetchError } = await this.supa
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single();

    if (fetchError || !certificate) {
      throw new ForbiddenException('Certificate not found');
    }

    const { error: updateError } = await this.supa
      .from('certificates')
      .update({ 
        status: newStatus,
        validated_by: validator,
        validated_at: new Date().toISOString(),
      })
      .eq('id', certificateId);

    if (updateError) {
      this.log.error(`Failed to update certificate status: ${updateError.message}`);
      throw new Error('Failed to validate certificate');
    }

    this.log.log(`🔍 Certificate ${certificateId} status updated to ${newStatus} by ${validator}`);
    
    return {
      success: true,
      certificateId,
      newStatus,
      validatedBy: validator,
      validatedAt: new Date().toISOString(),
    };
  }

  /* ------------------------------------------------------------------ */
  /* Liste certificats en attente                                        */
  /* ------------------------------------------------------------------ */
  async listPendingCertificates() {
    const { data, error } = await this.supa
      .from('certificates')
      .select('*')
      .eq('status', Status.PENDING)
      .order('created_at', { ascending: false });
    
    if (error) {
      this.log.warn(`Supabase pending certificates error: ${error.message}`);
      return [];
    }
    
    return data ?? [];
  }
}