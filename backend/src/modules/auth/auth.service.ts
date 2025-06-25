import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { ethers } from 'ethers';

@Injectable()
export class AuthService {
  private readonly nonces = new Map<string, string>();

  constructor(private readonly jwt: JwtService) {}

  generateNonce(address: string): string {
    const nonce = '0x' + randomBytes(16).toString('hex');
    this.nonces.set(address.toLowerCase(), nonce);
    return nonce;
  }

  async login(address: string, signature: string) {
    const expected = this.nonces.get(address.toLowerCase());
    if (!expected) throw new UnauthorizedException('Nonce inexistante');

    const recovered = ethers.verifyMessage(expected, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      throw new UnauthorizedException('Signature invalide');
    }

    this.nonces.delete(address.toLowerCase());
    return { token: await this.jwt.signAsync({ sub: address }) };
  }
}
