import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChainModule } from './chain/chain.module';
import { BoatsModule } from './boats/boats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // charge .env partout
    ChainModule,
    BoatsModule,
  ],
  controllers: [],
})
export class AppModule {}
