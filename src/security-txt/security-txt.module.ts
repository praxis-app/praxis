import { Module } from '@nestjs/common';
import { ServerConfigsModule } from '../server-configs/server-configs.module';
import { SecurityTxtController } from './security-txt.controller';

@Module({
  imports: [ServerConfigsModule],
  controllers: [SecurityTxtController],
})
export class SecurityTxtModule {}
