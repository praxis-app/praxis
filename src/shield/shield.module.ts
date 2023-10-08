import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { ShieldService } from './shield.service';

@Module({
  imports: [EventsModule],
  providers: [ShieldService],
  exports: [ShieldService],
})
export class ShieldModule {}
