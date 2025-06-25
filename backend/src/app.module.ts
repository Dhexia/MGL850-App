import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChainModule } from './modules/chain/chain.module';
import { BoatsModule } from './modules/boats/boats.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentModule } from './modules/document/document.module';
import { IndexerModule } from './modules/indexer/indexer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // charge .env partout
    ChainModule,
    BoatsModule,
    AuthModule,
    DocumentModule,
    IndexerModule,
  ],
  controllers: [],
})
export class AppModule {}
