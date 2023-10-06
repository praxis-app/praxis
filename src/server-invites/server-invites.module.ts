import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServerInvite } from './models/server-invite.model';
import { ServerInvitesResolver } from './server-invites.resolver';
import { ServerInvitesService } from './server-invites.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServerInvite])],
  providers: [ServerInvitesResolver, ServerInvitesService],
  exports: [ServerInvitesService],
})
export class ServerInvitesModule {}
