import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { BoatsService } from './boats.service';

@Controller('boats')
export class BoatsController {
  constructor(private readonly boats: BoatsService) {}

  /* Lecture – déjà fonctionnel */
  @Get(':id/events')
  async getEvents(@Param('id', ParseIntPipe) id: number) {
    return this.boats.listEvents(id);
  }

  /* Frappe un nouveau passeport */
  @Post()
  async createBoat(@Body() dto: { to: string; uri: string }) {
    return this.boats.mintPassport(dto.to, dto.uri);
  }

  /* Ajoute un événement */
  @Post(':id/events')
  async addEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { kind: number; ipfsHash: string },
  ) {
    return this.boats.addEvent(id, dto.kind, dto.ipfsHash);
  }
}
