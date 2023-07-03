import { JwtPayload } from "jsonwebtoken";
import { RefreshTokensService } from "../auth/refresh-tokens/refresh-tokens.service";
import { Dataloaders } from "../dataloader/dataloader.types";
import { GroupRolesService } from "../groups/group-roles/group-roles.service";
import { GroupsService } from "../groups/groups.service";
import { GroupMemberRequestsService } from "../groups/group-member-requests/group-member-requests.service";
import { PostsService } from "../posts/posts.service";
import { ProposalsService } from "../proposals/proposals.service";
import { User } from "../users/models/user.model";
import { UserPermissions } from "../users/user.types";
import { UsersService } from "../users/users.service";

export interface ContextServices {
  groupRolesService: GroupRolesService;
  groupsService: GroupsService;
  memberRequestsService: GroupMemberRequestsService;
  postsService: PostsService;
  proposalsService: ProposalsService;
  refreshTokensService: RefreshTokensService;
  usersService: UsersService;
}

export interface Context {
  claims: {
    accessTokenClaims: JwtPayload | null;
    refreshTokenClaims: JwtPayload | null;
  };
  loaders: Dataloaders;
  permissions: UserPermissions | null;
  services: ContextServices;
  user: User | null;
}
