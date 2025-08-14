import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { BoatsService } from '../boats/boats.service';
import type { Express } from 'express';
import type { Request } from 'express';

@Controller('documents')
export class DocumentController {
  constructor(
    private readonly docs: DocumentService,
    private readonly boats: BoatsService,
  ) {}

  /**
   * Upload d'un fichier + création d'événement en une seule étape
   */
  @Post('boats/:id/events')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndLog(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('kind') kind: number,
    @Req() req: Request & { user?: { address: string } },
  ) {
    const cid = await this.docs.upload(file.buffer);
    // TODO: Cette route doit être refactorisée pour utiliser EventsService
    // return this.events.createEvent(id, kind, cid, req.user!.address);
    return { message: "Route deprecated - use /events instead", ipfsHash: cid };
  }

  /**
   * Upload JSON metadata to IPFS (for boat NFT creation and updates)
   */
  @Post('upload-json')
  async uploadJson(@Body() body: { boatData: any }) {
    // Extract boat data from wrapper and upload only the boat data
    const boatData = body.boatData;
    if (!boatData) {
      throw new Error('Missing boatData in request body');
    }

    // Force status to 'pending' for all boats (creation AND modification)
    // This ensures any change to boat data requires re-validation
    if (boatData.specification) {
      boatData.specification.status = 'pending';
      // Clear previous validation data when boat is modified
      delete boatData.specification.validationReason;
      delete boatData.specification.validatedAt;
      delete boatData.specification.validatedBy;
    }

    const ipfsHash = await this.docs.uploadJson(boatData);
    return { ipfsHash };
  }
}
