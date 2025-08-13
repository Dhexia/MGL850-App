import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChainService } from '../chain/chain.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BoatsService {
  private readonly supa: SupabaseClient;
  private readonly log = new Logger(BoatsService.name);

  constructor(
    private readonly cfg: ConfigService,
    private readonly chain: ChainService,
    private readonly cloudinary: CloudinaryService,
  ) {
    this.supa = createClient(
      this.cfg.get<string>('SUPABASE_URL')!,
      this.cfg.get<string>('SUPABASE_SERVICE_KEY')!,
    );
  }

  /* ------------------------------------------------------------------ */
  /* Lecture : liste des bateaux (source = table Supabase 'boats')       */
  /* ------------------------------------------------------------------ */
  async listBoats() {
    const { data, error } = await this.supa
      .from('boats')
      .select('*')
      .order('id', { ascending: false });
    if (error) this.log.warn(`Supabase boats error: ${error.message}`);
    // format brut : [{ id, owner, token_uri, minted_at, block_number, tx_hash }]
    return (data ?? []).map((b) => ({
      id: Number(b.id),
      owner: (b.owner as string)?.toLowerCase?.() ?? b.owner,
      tokenURI: b.token_uri ?? undefined,
      mintedAt: b.minted_at,
      blockNumber: b.block_number,
      txHash: b.tx_hash,
    }));
  }

  /* ------------------------------------------------------------------ */
  /* Lecture : fiche d'un bateau (DB → fallback on-chain)                */
  /* ------------------------------------------------------------------ */
  async getBoat(id: number) {
    // 1) tente DB
    const { data, error } = await this.supa
      .from('boats')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) this.log.warn(`Supabase boat#${id} error: ${error.message}`);

    if (data) {
      return {
        exists: true,
        id,
        owner: (data.owner as string)?.toLowerCase?.() ?? data.owner,
        tokenURI: data.token_uri ?? undefined,
        mintedAt: data.minted_at,
        blockNumber: data.block_number,
        txHash: data.tx_hash,
      };
    }

    // 2) fallback on-chain (ownerOf + tokenURI)
    try {
      const owner = await this.chain.getOwner(id);
      const tokenURI = await this.chain.tokenURI(id); // peut être undefined si non implémenté
      return {
        exists: true,
        id,
        owner: owner.toLowerCase?.() ?? owner,
        tokenURI,
      };
    } catch {
      return { exists: false, id };
    }
  }

  /* ------------------------------------------------------------------ */
  /* Création de passeport (NFT)                                         */
  /* ------------------------------------------------------------------ */
  async mintPassport(to: string, uri: string, fromAddress?: string) {
    // ChainService renvoie { txHash, tokenId }
    return this.chain.mintPassport(to, uri, fromAddress);
  }

  /* ------------------------------------------------------------------ */
  /* Suppression de passeport (NFT)                                      */
  /* ------------------------------------------------------------------ */
  async burnPassport(tokenId: number, fromAddress?: string) {
    // ChainService renvoie { txHash }
    return this.chain.burnPassport(tokenId, fromAddress);
  }

  /* ------------------------------------------------------------------ */
  /* Upload d'images via Cloudinary                                      */
  /* ------------------------------------------------------------------ */
  async uploadImages(files: Express.Multer.File[]): Promise<{ images: Array<{ url: string; public_id: string }> }> {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadPromises = files.map(file => 
      this.cloudinary.uploadImage(file, 'boatchain/boats')
    );

    const images = await Promise.all(uploadPromises);
    
    this.log.log(`📸 Uploaded ${images.length} images to Cloudinary`);
    
    return { images };
  }
}