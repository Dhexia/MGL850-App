import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Req,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CreateCertificateDto, CertificateResponseDto } from './dto';
import { ValidateDto } from '../../shared/dto';

@Controller('certificates')
export class CertificatesController {
  private readonly logger = new Logger(CertificatesController.name);

  constructor(private readonly certificates: CertificatesService) {}

  /** Liste certificats d'un bateau */
  @Get('boat/:id')
  async getBoatCertificates(@Param('id', ParseIntPipe) boatId: number): Promise<CertificateResponseDto[]> {
    this.logger.log(`📜 Listing certificates for boat #${boatId}`);
    return this.certificates.listCertificatesByBoat(boatId) as Promise<CertificateResponseDto[]>;
  }

  /** Création de certificat */
  @Post()
  async createCertificate(@Body() dto: CreateCertificateDto) {
    this.logger.log(`📝 Creating certificate "${dto.title}" for boat #${dto.boatId}`);
    return this.certificates.createCertificate(
      dto.boatId,
      dto.person,
      dto.date,
      dto.title,
      dto.certificateType,
      dto.description,
      dto.ipfsHash,
      dto.expires,
    );
  }

  /** Validation certificat par certificateur */
  @Put(':id/validate')
  async validateCertificate(
    @Param('id', ParseIntPipe) certificateId: number,
    @Body() dto: ValidateDto,
    @Req() req: any,
  ) {
    const validator = req.user.address;
    this.logger.log(`🔍 Validating certificate ${certificateId} → ${dto.status} by ${validator}`);
    return this.certificates.validateCertificate(certificateId, dto.status, validator);
  }

  /** Liste certificats en attente (pour certificateurs) */
  @Get('pending')
  async getPendingCertificates() {
    this.logger.log('📋 Listing pending certificates for validation');
    return this.certificates.listPendingCertificates();
  }
}