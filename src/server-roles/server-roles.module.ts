import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ServerRolePermission } from './models/server-role-permission.model';
import { ServerRole } from './models/server-role.model';
import { ServerRolesResolver } from './server-roles.resolver';
import { ServerRolesService } from './server-roles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServerRole, ServerRolePermission]),
    forwardRef(() => UsersModule),
  ],
  providers: [ServerRolesService, ServerRolesResolver],
  exports: [ServerRolesService, TypeOrmModule],
})
export class ServerRolesModule {}
