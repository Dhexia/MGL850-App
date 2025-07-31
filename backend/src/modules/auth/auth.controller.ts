// src/auth/auth.controller.ts
import { Controller, Get, Query, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator'; // si déjà en place

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get('nonce')
  getNonce(@Query('address') address: string) {
    this.logger.debug(`GET /auth/nonce address=${address}`);
    return { nonce: this.auth.generateNonce(address) };
  }

  @Public()
  @Post('login')
  login(@Body() body: { nonce: string; signature: string }) {
    this.logger.debug(`POST /auth/login sig.len=${body?.signature?.length}`);
    return this.auth.login(body.nonce, body.signature);
  }
}
