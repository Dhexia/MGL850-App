import { Module, forwardRef } from '@nestjs/common';
import { ChainModule } from '../chain/chain.module';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { DocumentModule } from '../document/document.module';
import { BoatsController } from './boats.controller';
import { BoatsService } from './boats.service';

@Module({
  imports: [ChainModule, AuthModule, CloudinaryModule, forwardRef(() => DocumentModule)],
  controllers: [BoatsController],
  providers: [BoatsService],
  exports: [BoatsService],
})
export class BoatsModule {}
