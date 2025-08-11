import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChainModule } from './modules/chain/chain.module';
import { BoatsModule } from './modules/boats/boats.module';
import { EventsModule } from './modules/events/events.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentModule } from './modules/document/document.module';
import { IndexerModule } from './modules/indexer/indexer.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // charge .env partout
    ChainModule,
    BoatsModule,
    EventsModule,
    CertificatesModule,
    AuthModule,
    DocumentModule,
    IndexerModule,
    HealthModule,
  ],
  controllers: [],
})
export class AppModule {}
