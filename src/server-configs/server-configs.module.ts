import { Module } from '@nestjs/common';
import { ServerConfigsResolver } from './server-configs.resolver';
import { ServerConfigsService } from './server-configs.service';

@Module({
  providers: [ServerConfigsService, ServerConfigsResolver],
})
export class ServerConfigsModule {}
