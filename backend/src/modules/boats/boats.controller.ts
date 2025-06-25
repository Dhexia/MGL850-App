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
import type { Request } from 'express';

@Controller('boats')
export class BoatsController {
  constructor(private readonly boats: BoatsService) {}

  /* ----------- lecture ----------- */
  @Get(':id/events')
  async getEvents(@Param('id', ParseIntPipe) id: number) {
    return this.boats.listEvents(id);
  }

  /* ----------- création passeport ----------- */
  @Post()
  async createBoat(@Body() body: { to: string; uri: string }) {
    return this.boats.mintPassport(body.to, body.uri);
  }

  /* ----------- ajout événement ----------- */
  @Post(':id/events')
  async addEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { kind: number; ipfsHash: string },
    @Req() req: Request & { user?: { address: string } },
  ) {
    const caller = req.user?.address;
    return this.boats.addEvent(id, dto.kind, dto.ipfsHash, caller!);
  }
}
