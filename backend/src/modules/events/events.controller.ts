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
import { EventsService } from './events.service';
import { CreateEventDto, EventResponseDto } from './dto';
import { ValidateDto } from '../../shared/dto';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly events: EventsService) {}

  /** Liste événements d'un bateau */
  @Get('boat/:id')
  async getBoatEvents(@Param('id', ParseIntPipe) boatId: number) {
    this.logger.log(`📋 Listing events for boat #${boatId}`);
    return this.events.listEventsByBoat(boatId);
  }

  /** Création d'événement */
  @Post()
  async createEvent(@Body() dto: CreateEventDto, @Req() req: any) {
    const caller = req.user.address;
    this.logger.log(`📝 Creating event kind ${dto.kind} for boat #${dto.boatId} by ${caller}`);
    return this.events.createEvent(dto.boatId, dto.kind, dto.ipfsHash, caller);
  }

  /** Validation événement par certificateur */
  @Put(':boatId/:txHash/validate')
  async validateEvent(
    @Param('boatId', ParseIntPipe) boatId: number,
    @Param('txHash') txHash: string,
    @Body() dto: ValidateDto,
    @Req() req: any,
  ) {
    const validator = req.user.address;
    this.logger.log(`🔍 Validating event ${txHash} → ${dto.status} by ${validator}`);
    return this.events.validateEvent(boatId, txHash, dto.status, validator);
  }

  /** Liste événements en attente (pour certificateurs) */
  @Get('pending')
  async getPendingEvents() {
    this.logger.log('📋 Listing pending events for validation');
    return this.events.listPendingEvents();
  }
}