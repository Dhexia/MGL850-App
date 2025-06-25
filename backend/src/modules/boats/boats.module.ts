import { Module } from '@nestjs/common';
import { ChainModule } from '../chain/chain.module';
import { AuthModule } from '../auth/auth.module';
import { BoatsController } from './boats.controller';
import { BoatsService } from './boats.service';

@Module({
  imports: [ChainModule, AuthModule],
  controllers: [BoatsController],
  providers: [BoatsService],
  exports: [BoatsService],
})
export class BoatsModule {}
