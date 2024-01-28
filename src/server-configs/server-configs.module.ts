import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanariesModule } from '../canaries/canaries.module';
import { ServerConfig } from './models/server-config.model';
import { ServerConfigsResolver } from './server-configs.resolver';
import { ServerConfigsService } from './server-configs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerConfig]),
    forwardRef(() => CanariesModule),
  ],
  providers: [ServerConfigsService, ServerConfigsResolver],
  exports: [ServerConfigsService],
})
export class ServerConfigsModule {}
