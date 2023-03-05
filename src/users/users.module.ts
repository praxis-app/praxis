import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImagesModule } from "../images/images.module";
import { PostsModule } from "../posts/posts.module";
import { RoleMembersModule } from "../roles/role-members/role-members.module";
import { RolesModule } from "../roles/roles.module";
import { User } from "./models/user.model";
import { UsersResolver } from "./users.resolver";
import { UsersService } from "./users.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => RolesModule),
    ImagesModule,
    PostsModule,
    RoleMembersModule,
  ],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
