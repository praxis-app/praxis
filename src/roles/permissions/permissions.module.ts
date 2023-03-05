import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./models/permission.model";
import { PermissionsService } from "./permissions.service";

@Module({
  imports: [TypeOrmModule.forFeature([Permission])],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
