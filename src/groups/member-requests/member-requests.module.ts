import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GroupMembersModule } from "../group-members/group-members.module";
import { GroupsModule } from "../groups.module";
import { MemberRequestsResolver } from "./member-requests.resolver";
import { MemberRequestsService } from "./member-requests.service";
import { MemberRequest } from "./models/member-request.model";

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberRequest]),
    forwardRef(() => GroupMembersModule),
    forwardRef(() => GroupsModule),
  ],
  providers: [MemberRequestsResolver, MemberRequestsService],
  exports: [MemberRequestsService],
})
export class MemberRequestsModule {}
