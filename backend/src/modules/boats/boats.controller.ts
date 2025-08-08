import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Logger,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { BoatsService } from './boats.service';
import { CreateBoatDto, BoatListItemDto, BoatResponseDto } from './dto';

@Controller('boats')
export class BoatsController {
  private readonly logger = new Logger(BoatsController.name);

  constructor(private readonly boats: BoatsService) {}

  /** Liste de tous les bateaux indexés (via Supabase 'boats') */
  @Get()
  async list(): Promise<BoatListItemDto[]> {
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
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<BoatResponseDto> {
    const boat = await this.boats.getBoat(id);
    this.logger.log(`🛥️  Fetching boat #${id} details`);
    if (boat.tokenURI) {
      this.logger.verbose(`🔗 Boat #${id} IPFS URI: ${boat.tokenURI}`);
    }
    return boat;
  }

  /** Frappe d'un nouveau passeport (renvoie aussi tokenId) */
  @Post()
  async mint(@Body() dto: CreateBoatDto) {
    this.logger.log(`⚡ Minting new boat passport for ${dto.to}`);
    return this.boats.mintPassport(dto.to, dto.uri);
  }

  /** Upload d'images pour un bateau */
  @Post('upload/images')
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    this.logger.log(`📸 Uploading ${files?.length || 0} images`);
    return this.boats.uploadImages(files);
  }
}