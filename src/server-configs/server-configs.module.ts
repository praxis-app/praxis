import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanariesModule } from '../canaries/canaries.module';
import { ServerConfig } from './models/server-configs.model';
import { ServerConfigsResolver } from './server-configs.resolver';
import { ServerConfigsService } from './server-configs.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServerConfig]), CanariesModule],
  providers: [ServerConfigsService, ServerConfigsResolver],
})
export class ServerConfigsModule {}
