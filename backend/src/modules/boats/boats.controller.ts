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
import { UpdateBoatDto } from './dto/update-boat.dto';
import { multerConfig } from '../../common/multer.config';

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
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    this.logger.log(`📸 Uploading ${files?.length || 0} images`);
    return this.boats.uploadImages(files);
  }

  /** Met à jour le tokenURI d'un bateau */
  @Post(':id/update-uri')
  async updateBoatURI(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBoatDto, @Request() req: any) {
    const caller = req.user?.address;
    this.logger.log(`🔄 Updating boat #${id} tokenURI (caller: ${caller})`);
    return this.boats.updateBoatTokenURI(id, dto.newUri, caller);
  }

  /** Valide un bateau (certificateurs seulement) */
  @Post(':id/validate')
  async validateBoat(@Param('id', ParseIntPipe) id: number, @Body() dto: { status: 'validated' | 'rejected'; reason?: string }, @Request() req: any) {
    const caller = req.user?.address;
    this.logger.log(`✅ Validating boat #${id} → ${dto.status} (caller: ${caller})`);
    return this.boats.validateBoat(id, dto.status, dto.reason, caller);
  }

  /** Certifie un bateau (certificateurs seulement) */
  @Post(':id/certify')
  async certifyBoat(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const caller = req.user?.address;
    this.logger.log(`✅ Certifying boat #${id} (caller: ${caller})`);
    return this.boats.certifyBoat(id, caller);
  }

  /** Révoque la certification d'un bateau (certificateurs seulement) */
  @Post(':id/revoke')
  async revokeBoat(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const caller = req.user?.address;
    this.logger.log(`❌ Revoking boat #${id} certification (caller: ${caller})`);
    return this.boats.revokeBoatCertification(id, caller);
  }

  /** Obtient le statut de certification d'un bateau */
  @Get(':id/status')
  async getBoatStatus(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`📊 Getting certification status for boat #${id}`);
    const status = await this.boats.getBoatCertificationStatus(id);
    return { status };
  }

  /** Force le refresh des données d'un bateau depuis la blockchain */
  @Post(':id/refresh')
  async refreshBoat(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`🔄 Refreshing boat #${id} data from blockchain`);
    try {
      // Forcer la lecture depuis la blockchain et mise à jour de la DB
      const boat = await this.boats.getBoat(id);
      return { success: true, boat };
    } catch (error) {
      this.logger.error(`Failed to refresh boat #${id}:`, error);
      return { success: false, error: error.message };
    }
  }

  /** Brûle un passeport de bateau */
  @Delete(':id')
  async burnBoat(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const caller = req.user?.address;
    this.logger.log(`🔥 Burning boat passport #${id} (caller: ${caller})`);
    return this.boats.burnPassport(id, caller);
  }
}