import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CanariesModule } from '../canaries/canaries.module';
import { Group } from '../groups/models/group.model';
import { ServerConfig } from './models/server-config.model';
import { ServerConfigsResolver } from './server-configs.resolver';
import { ServerConfigsService } from './server-configs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerConfig, Group]),
    forwardRef(() => CanariesModule),
  ],
  providers: [ServerConfigsService, ServerConfigsResolver],
  exports: [ServerConfigsService],
})
export class ServerConfigsModule {}
