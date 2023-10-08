import { forwardRef, Module } from '@nestjs/common';
import { GroupRolesService } from './group-roles.service';
import { GroupRolesResolver } from './group-roles.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupRole } from './models/group-role.model';
import { GroupRolePermission } from './models/group-role-permission.model';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupRole, GroupRolePermission]),
    forwardRef(() => UsersModule),
  ],
  providers: [GroupRolesService, GroupRolesResolver],
  exports: [GroupRolesService],
})
export class GroupRolesModule {}
