/* eslint-disable @typescript-eslint/no-unused-vars */
// src/auth/auth.service.ts — nonce-based login
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { ethers } from 'ethers';

@Injectable()
export class AuthService {
  // Nonces actives (pas liées à une adresse) → consommées à l'usage
  private readonly activeNonces = new Set<string>();
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly jwt: JwtService) {}

  // On garde la signature du contrôleur (il passe encore l'adresse) mais on ne l'utilise plus pour lier le nonce
  generateNonce(_address: string): string {
    const nonce = '0x' + randomBytes(16).toString('hex');
    this.activeNonces.add(nonce);
    this.logger.debug(`nonce generated: ${nonce}`);
    return nonce;
  }

  async login(nonce: string, signature: string) {
    if (!nonce || !this.activeNonces.has(nonce)) {
      this.logger.warn(`nonce missing/invalid: ${nonce}`);
      throw new UnauthorizedException('Nonce inexistante');
    }

    let recovered: string;
    try {
      // ethers v6: verifyMessage accepte directement le hex "0x.." (BytesLike)
      recovered = ethers.verifyMessage(nonce, signature);
      this.logger.debug(
        `verifyMessage OK: recovered=${recovered.toLowerCase()}`,
      );
    } catch (e: any) {
      this.logger.error(`verifyMessage threw: ${e?.message ?? e}`);
      throw new UnauthorizedException('Signature invalide');
    }

    // Consommer le nonce (anti-replay)
    this.activeNonces.delete(nonce);

    // Emettre un JWT pour l'adresse réellement signataire
    const token = await this.jwt.signAsync({ sub: recovered });
    this.logger.debug(`login success for ${recovered.toLowerCase()}`);
    return { token };
  }
}
