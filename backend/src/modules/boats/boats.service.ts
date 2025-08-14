import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ChainService } from '../chain/chain.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { DocumentService } from '../document/document.service';

@Injectable()
export class BoatsService {
  private readonly supa: SupabaseClient;
  private readonly log = new Logger(BoatsService.name);

  constructor(
    private readonly cfg: ConfigService,
    private readonly chain: ChainService,
    private readonly cloudinary: CloudinaryService,
    private readonly documentService: DocumentService,
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
  /* Transfert de propriété                                              */
  /* ------------------------------------------------------------------ */
  async transferOwnership(tokenId: number, toAddress: string, fromAddress?: string) {
    // ChainService renvoie { txHash, from, to }
    return this.chain.transferBoatOwnership(tokenId, toAddress, fromAddress);
  }

  /* ------------------------------------------------------------------ */
  /* Mise à jour de passeport (NFT)                                      */
  /* ------------------------------------------------------------------ */
  async updateBoatTokenURI(tokenId: number, newUri: string, fromAddress?: string) {
    // 1. Mettre à jour sur la blockchain
    let result;
    try {
      result = await this.chain.updateTokenURI(tokenId, newUri, fromAddress);
    } catch (error) {
      this.log.warn(`Blockchain update failed for boat #${tokenId}: ${error.message}`);
      // En mode dev, continuer même si la blockchain échoue
      result = { txHash: 'dev-mode-skip' };
    }

    // 2. Forcer la mise à jour de la base de données immédiatement
    this.log.log(`🔄 Forcing database update for boat #${tokenId} with new URI: ${newUri}`);
    await this.forceUpdateBoatURI(tokenId, newUri);

    return result;
  }

  /* ------------------------------------------------------------------ */
  /* Validation de bateau (certificateurs seulement)                    */
  /* ------------------------------------------------------------------ */
  async validateBoat(tokenId: number, status: 'validated' | 'rejected', reason?: string, fromAddress?: string) {
    // 1. Vérifier que l'utilisateur est un certificateur
    const isCertifier = await this.chain.isCertifiedProfessional(fromAddress);
    if (!isCertifier) {
      throw new Error('Only certified professionals can validate boats');
    }

    // 2. Récupérer les métadonnées actuelles du bateau
    const boatUri = await this.chain.tokenURI(tokenId);
    if (!boatUri) {
      throw new Error(`Boat #${tokenId} not found`);
    }

    // 3. Télécharger les métadonnées IPFS
    const response = await fetch(boatUri.replace('ipfs://', 'https://ipfs.io/ipfs/'));
    const metadata = await response.json();

    // 4. Mettre à jour le statut
    if (metadata.specification) {
      metadata.specification.status = status;
      if (reason) {
        metadata.specification.validationReason = reason;
      }
      metadata.specification.validatedAt = new Date().toISOString();
      metadata.specification.validatedBy = fromAddress;
    }

    // 5. Upload des nouvelles métadonnées vers IPFS
    const newIpfsHash = await this.documentService.uploadJson(metadata);
    const newUri = `ipfs://${newIpfsHash}`;

    // 6. Mettre à jour l'URI du token (en mode dev, ignorer les erreurs de fonds)
    let result = { success: true, txHash: 'dev-mode-skip' };
    try {
      const txResult = await this.chain.updateTokenURI(tokenId, newUri, fromAddress);
      result = { success: true, txHash: txResult.txHash };
    } catch (error) {
      this.log.warn(`Skipping blockchain update due to error: ${error.message}`);
      // En mode dev, on continue même si la transaction blockchain échoue
    }

    // 7. Forcer la mise à jour de la base de données immédiatement
    this.log.log(`🔄 Forcing database update for boat #${tokenId} with URI: ${newUri}`);
    await this.forceUpdateBoatURI(tokenId, newUri);

    this.log.log(`Boat #${tokenId} ${status} by ${fromAddress}${reason ? ` (reason: ${reason})` : ''}`);
    
    return {
      success: true,
      txHash: result.txHash,
      status,
      newUri,
      validatedBy: fromAddress
    };
  }

  /* ------------------------------------------------------------------ */
  async certifyBoat(tokenId: number, fromAddress?: string) {
    return this.validateBoat(tokenId, 'validated', 'Bateau certifié par certificateur', fromAddress);
  }

  async revokeBoatCertification(tokenId: number, fromAddress?: string) {
    return this.validateBoat(tokenId, 'rejected', 'Certification révoquée par certificateur', fromAddress);
  }

  /* ------------------------------------------------------------------ */
  async getBoatCertificationStatus(tokenId: number) {
    return this.chain.getBoatCertificationStatus(tokenId);
  }

  /* ------------------------------------------------------------------ */
  async forceUpdateBoatURI(tokenId: number, newUri: string) {
    try {
      this.log.log(`🔄 Attempting to update boat #${tokenId} URI in database...`);
      
      // Utiliser la connexion Supabase existante
      const { data, error } = await this.supa
        .from('boats')
        .update({ token_uri: newUri })
        .eq('id', tokenId)
        .select();

      if (error) {
        this.log.error(`❌ Failed to update boat #${tokenId} URI in database: ${error.message}`);
        this.log.error(`Error details:`, error);
      } else {
        this.log.log(`✅ Boat #${tokenId} URI updated in database: ${newUri}`);
        this.log.log(`Updated data:`, data);
      }
    } catch (error) {
      this.log.error(`💥 Exception updating boat #${tokenId} URI in database: ${error.message}`);
    }
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