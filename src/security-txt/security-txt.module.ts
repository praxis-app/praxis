import { Module } from '@nestjs/common';
import { ServerConfigsModule } from '../server-configs/server-configs.module';
import { SecurityTxtController } from './security-txt.controller';
import { SecurityTxtService } from './security-txt.service';

@Module({
  imports: [ServerConfigsModule],
  controllers: [SecurityTxtController],
  providers: [SecurityTxtService],
})
export class SecurityTxtModule {}
