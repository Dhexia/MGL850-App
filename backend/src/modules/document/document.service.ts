import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinataSDK } from 'pinata';

@Injectable()
export class DocumentService {
  private readonly pinata: PinataSDK;
  private readonly logger = new Logger(DocumentService.name);

  constructor(private readonly cfg: ConfigService) {
    this.pinata = new PinataSDK({
      pinataJwt: this.cfg.get<string>('PINATA_JWT')!, // scoped JWT
      pinataGateway: this.cfg.get<string>('PINATA_GATEWAY'), // optionnel
    });
  }

  /**
   * Upload le buffer sur Pinata et renvoie ipfs://CID
   */
  async upload(buffer: Buffer): Promise<string> {
    try {
      // Le nouveau SDK Pinata attend un objet File (disponible dans Node >= 18)
      const file = new File([buffer], 'upload.bin');
      const { cid } = await this.pinata.upload.public.file(file);
      return `ipfs://${cid}`;
    } catch (error) {
      this.logger.error('Pinata upload failed', error as Error);
      throw new InternalServerErrorException('Upload IPFS échoué');
    }
  }
}
