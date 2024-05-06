import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from '../chat/chat.module';
import { User } from '../users/models/user.model';
import { ServerRolePermission } from './models/server-role-permission.model';
import { ServerRole } from './models/server-role.model';
import { ServerRolesResolver } from './server-roles.resolver';
import { ServerRolesService } from './server-roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerRole, ServerRolePermission, User]),
    ChatModule,
  ],
  providers: [ServerRolesService, ServerRolesResolver],
  exports: [ServerRolesService, TypeOrmModule],
})
export class ServerRolesModule {}
