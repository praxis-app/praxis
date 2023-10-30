import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanariesResolver } from './canaries.resolver';
import { CanariesService } from './canaries.service';
import { Canary } from './models/canary.model';

@Module({
  imports: [TypeOrmModule.forFeature([Canary])],
  providers: [CanariesService, CanariesResolver],
})
export class CanariesModule {}
