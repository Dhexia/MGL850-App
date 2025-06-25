import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IndexerService } from './indexer.service';

@Module({
  imports: [ConfigModule],
  providers: [IndexerService],
})
export class IndexerModule implements OnModuleInit {
  constructor(private readonly idx: IndexerService) {}
  onModuleInit() {
    this.idx.start();
  } // lance le worker dès boot Nest
}
