import { Module } from '@nestjs/common';
import { ChainModule } from '../chain/chain.module';
import { BoatsController } from './boats.controller';
import { BoatsService } from './boats.service';

@Module({
  imports: [ChainModule],
  controllers: [BoatsController],
  providers: [BoatsService],
})
export class BoatsModule {}
