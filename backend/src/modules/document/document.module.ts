import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { BoatsModule } from '../boats/boats.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => BoatsModule),
    MulterModule.register({ limits: { fileSize: 10_000_000 } }),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
