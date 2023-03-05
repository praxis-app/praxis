import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesModule } from "../roles.module";
import { RoleMember } from "./models/role-member.model";
import { RoleMembersResolver } from "./role-members.resolver";
import { RoleMembersService } from "./role-members.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleMember]),
    forwardRef(() => RolesModule),
  ],
  providers: [RoleMembersService, RoleMembersResolver],
  exports: [RoleMembersService, TypeOrmModule],
})
export class RoleMembersModule {}
