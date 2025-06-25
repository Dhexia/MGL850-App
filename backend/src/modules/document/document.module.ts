import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({ limits: { fileSize: 10_000_000 } }),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
