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
    return this.boats.addEvent(id, kind, cid, req.user!.address);
  }
}
