import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * Génère un nonce pour l'adresse donnée.
   * @param address L'adresse Ethereum pour laquelle générer le nonce.
   * @returns Un objet contenant le nonce.
   */
  @Get('nonce')
  getNonce(@Query('address') address: string) {
    return { nonce: this.auth.generateNonce(address) };
  }

  /**
   * Authentifie l'utilisateur en vérifiant la signature.
   * @param body Contient l'adresse Ethereum et la signature.
   * @returns Un objet contenant le token JWT si l'authentification réussit.
   */
  @Post('login')
  login(@Body() body: { address: string; signature: string }) {
    return this.auth.login(body.address, body.signature);
  }
}
