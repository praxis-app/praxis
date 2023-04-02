import { JwtPayload } from "jsonwebtoken";
import { RefreshTokensService } from "../auth/refresh-tokens/refresh-tokens.service";
import { Dataloaders } from "../dataloader/dataloader.types";
import { GroupsService } from "../groups/groups.service";
import { MemberRequestsService } from "../groups/member-requests/member-requests.service";
import { ProposalsService } from "../proposals/proposals.service";
import { User } from "../users/models/user.model";
import { UserPermissions } from "../users/user.types";
import { UsersService } from "../users/users.service";

export interface ContextServices {
  groupsService: GroupsService;
  memberRequestsService: MemberRequestsService;
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
