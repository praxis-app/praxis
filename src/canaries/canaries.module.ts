import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerConfigsModule } from '../server-configs/server-configs.module';
import { CanariesResolver } from './canaries.resolver';
import { CanariesService } from './canaries.service';
import { Canary } from './models/canary.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Canary]),
    forwardRef(() => ServerConfigsModule),
  ],
  providers: [CanariesService, CanariesResolver],
  exports: [CanariesService],
})
export class CanariesModule {}
