import { Controller, Get, Query, Post, Body, Logger, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ChainService } from '../chain/chain.service';
import { isDevMode } from '../../lib/dev-accounts';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private readonly auth: AuthService,
    private readonly chain: ChainService,
  ) {}

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

  @Public()
  @Post('dev-login')
  async devLogin(@Body() body: { address: string }) {
    if (!isDevMode()) {
      throw new Error('Dev login only available in development mode');
    }
    this.logger.debug(`POST /auth/dev-login address=${body.address}`);
    return this.auth.devLogin(body.address);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    const address = req.user?.address;
    if (!address) {
      throw new Error('Address not found in JWT payload');
    }
    
    const role = await this.chain.getUserRole(address);
    const isVerified = role === 'certifier';
    
    return {
      address,
      role,
      isVerified,
    };
  }
}
