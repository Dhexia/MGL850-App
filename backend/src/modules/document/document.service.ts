import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinataSDK } from 'pinata';

// Polyfill minimal pour Node 18 (TS/typing-friendly)
class NodeFile extends Blob {
  name: string;
  lastModified: number;
  // Ajout requis par l'interface DOM File (présente dans lib.dom.d.ts)
  webkitRelativePath: string;
  constructor(parts: BlobPart[], name: string, options?: FilePropertyBag) {
    super(parts, options);
    this.name = name;
    this.lastModified = options?.lastModified ?? Date.now();
    this.webkitRelativePath = '';
  }
}

@Injectable()
export class DocumentService {
  private readonly pinata: PinataSDK;
  private readonly logger = new Logger(DocumentService.name);

  constructor(private readonly cfg: ConfigService) {
    this.pinata = new PinataSDK({
      pinataJwt: this.cfg.get<string>('PINATA_JWT')!,
      pinataGateway: this.cfg.get<string>('PINATA_GATEWAY'),
    });
  }

  async upload(buffer: Buffer): Promise<string> {
    try {
      // Utilise le polyfill File compatible Node 18
      const file = new NodeFile([buffer], 'upload.bin', {
        type: 'application/octet-stream',
      });

      // Le SDK Pinata tape souvent sur File; ici on reste strict (pas de cast any nécessaire)
      const { cid } = await this.pinata.upload.public.file(file);
      return `ipfs://${cid}`;
    } catch (error) {
      this.logger.error('Pinata upload failed', error as Error);
      throw new InternalServerErrorException('Upload IPFS échoué');
    }
  }
}
