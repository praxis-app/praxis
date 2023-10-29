import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanaryResolver } from './canary.resolver';
import { CanaryService } from './canary.service';
import { Canary } from './models/canary.model';

@Module({
  imports: [TypeOrmModule.forFeature([Canary])],
  providers: [CanaryService, CanaryResolver],
})
export class CanaryModule {}
