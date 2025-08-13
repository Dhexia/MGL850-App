import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Logger,
  UploadedFiles,
  UseInterceptors,
  Request,
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
  async mint(@Body() dto: CreateBoatDto, @Request() req: any) {
    const caller = req.user?.address;
    this.logger.log(`⚡ Minting new boat passport for ${dto.to} (caller: ${caller})`);
    return this.boats.mintPassport(dto.to, dto.uri, caller);
  }

  /** Upload d'images pour un bateau */
  @Post('upload/images')
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    this.logger.log(`📸 Uploading ${files?.length || 0} images`);
    return this.boats.uploadImages(files);
  }

  /** Brûle un passeport de bateau */
  @Delete(':id')
  async burnBoat(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const caller = req.user?.address;
    this.logger.log(`🔥 Burning boat passport #${id} (caller: ${caller})`);
    return this.boats.burnPassport(id, caller);
  }
}