import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/models/user.model';
import { GroupRolesResolver } from './group-roles.resolver';
import { GroupRolesService } from './group-roles.service';
import { GroupRolePermission } from './models/group-role-permission.model';
import { GroupRole } from './models/group-role.model';

@Module({
  imports: [TypeOrmModule.forFeature([GroupRole, GroupRolePermission, User])],
  providers: [GroupRolesService, GroupRolesResolver],
  exports: [GroupRolesService],
})
export class GroupRolesModule {}
