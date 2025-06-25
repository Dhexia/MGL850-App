import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { BoatsService } from './boats.service';

@Controller('boats')
export class BoatsController {
  constructor(private readonly boats: BoatsService) {}

  /** Timeline complète d'un bateau */
  @Get(':id/events')
  async getEvents(@Param('id', ParseIntPipe) id: number) {
    return this.boats.listEvents(id);
  }

  /** Frappe d'un nouveau passeport */
  @Post()
  async mint(@Body() dto: { to: string; uri: string }) {
    return this.boats.mintPassport(dto.to, dto.uri);
  }

  /** Ajout d'un événement (authentifié) */
  @Post(':id/events')
  async addEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { kind: number; ipfsHash: string },
    @Req() req,
  ) {
    const caller = req.user.address;
    return this.boats.addEvent(id, dto.kind, dto.ipfsHash, caller);
  }
}
