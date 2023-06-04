import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "../images/images.module";
import { PostsModule } from "../posts/posts.module";
import { RolesModule } from "../roles/roles.module";
import { UsersModule } from "../users/users.module";
import { GroupsResolver } from "./groups.resolver";
import { GroupsService } from "./groups.service";
import { MemberRequestsModule } from "./member-requests/member-requests.module";
import { Group } from "./models/group.model";
import { GroupConfigsModule } from "./group-configs/group-configs.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Group]),
    forwardRef(() => GroupConfigsModule),
    forwardRef(() => MemberRequestsModule),
    ImagesModule,
    PostsModule,
    RolesModule,
    UsersModule,
  ],
  providers: [GroupsService, GroupsResolver],
  exports: [GroupsService, TypeOrmModule],
})
export class GroupsModule {}
