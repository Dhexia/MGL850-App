import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  ParseIntPipe,
  Logger,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { BoatsService } from './boats.service';

@Controller('boats')
export class BoatsController {
  private readonly logger = new Logger(BoatsController.name);

  constructor(private readonly boats: BoatsService) {}

  /** Liste de tous les bateaux indexés (via Supabase 'boats') */
  @Get()
  async list() {
    const boats = await this.boats.listBoats();
    this.logger.log(`📋 Listing ${boats.length} boats from database`);

    // Log IPFS URIs for debugging
    boats.forEach((boat) => {
      if (boat.tokenURI) {
        this.logger.verbose(`🔗 Boat #${boat.id}: IPFS URI = ${boat.tokenURI}`);
      }
    });

    return boats;
  }

  /** Fiche d'un bateau : owner + tokenURI (+ champs DB si présents) */
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    const boat = await this.boats.getBoat(id);
    this.logger.log(`🛥️  Fetching boat #${id} details`);
    if (boat.tokenURI) {
      this.logger.verbose(`🔗 Boat #${id} IPFS URI: ${boat.tokenURI}`);
    }
    return boat;
  }

  /** Timeline complète d'un bateau */
  @Get(':id/events')
  async getEvents(@Param('id', ParseIntPipe) id: number) {
    return this.boats.listEvents(id);
  }

  /** Frappe d'un nouveau passeport (renvoie aussi tokenId) */
  @Post()
  async mint(@Body() dto: { to: string; uri: string }) {
    return this.boats.mintPassport(dto.to, dto.uri);
  }

  /** Upload d'images pour un bateau */
  @Post('upload/images')
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    return this.boats.uploadImages(files);
  }

  /** Ajout d'un événement (authentifié) */
  @Post(':id/events')
  async addEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { kind: number; ipfsHash: string },
    @Req() req: any,
  ) {
    const caller = req.user.address;
    return this.boats.addEvent(id, dto.kind, dto.ipfsHash, caller);
  }
}
