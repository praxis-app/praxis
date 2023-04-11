import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { Role } from "./models/role.model";
import { PermissionsModule } from "./permissions/permissions.module";
import { RolesResolver } from "./roles.resolver";
import { RolesService } from "./roles.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => UsersModule),
    PermissionsModule,
  ],
  providers: [RolesService, RolesResolver],
  exports: [RolesService, TypeOrmModule],
})
export class RolesModule {}
