import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChainService } from './chain.service';

@Module({
  imports: [ConfigModule], // permet d’injecter ConfigService
  providers: [ChainService], // instancie ChainService
  exports: [ChainService],
})
export class ChainModule {}
