import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroupConfigsResolver } from "./group-configs.resolver";
import { GroupConfigsService } from "./group-configs.service";
import { GroupConfig } from "./models/group-config.model";

@Module({
  imports: [TypeOrmModule.forFeature([GroupConfig])],
  providers: [GroupConfigsService, GroupConfigsResolver],
  exports: [GroupConfigsService],
})
export class GroupConfigsModule {}
