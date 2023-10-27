import { Module } from '@nestjs/common';
import { ServerSettingsService } from './server-settings.service';
import { ServerSettingsResolver } from './server-settings.resolver';

@Module({
  providers: [ServerSettingsService, ServerSettingsResolver],
})
export class ServerSettingsModule {}
