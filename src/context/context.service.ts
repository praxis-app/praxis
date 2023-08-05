import { Injectable } from "@nestjs/common";
import { Context as ApolloContext } from "apollo-server-core";
import { JwtPayload } from "jsonwebtoken";
import { Claims, getClaims, getSub } from "../auth/auth.utils";
import { RefreshTokensService } from "../auth/refresh-tokens/refresh-tokens.service";
import { ShieldService } from "../auth/shield/shield.service";
import { DataloaderService } from "../dataloader/dataloader.service";
import { Dataloaders } from "../dataloader/dataloader.types";
import { EventsService } from "../events/events.service";
import { GroupMemberRequestsService } from "../groups/group-member-requests/group-member-requests.service";
import { GroupRolesService } from "../groups/group-roles/group-roles.service";
import { GroupsService } from "../groups/groups.service";
import { ImagesService } from "../images/images.service";
import { PostsService } from "../posts/posts.service";
import { ProposalActionsService } from "../proposals/proposal-actions/proposal-actions.service";
import { ProposalsService } from "../proposals/proposals.service";
import { User } from "../users/models/user.model";
import { UserPermissions } from "../users/user.types";
import { UsersService } from "../users/users.service";

export interface ContextServices {
  eventsService: EventsService;
  groupMemberRequestsService: GroupMemberRequestsService;
  groupRolesService: GroupRolesService;
  groupsService: GroupsService;
  imagesService: ImagesService;
  postsService: PostsService;
  proposalActionsService: ProposalActionsService;
  proposalsService: ProposalsService;
  refreshTokensService: RefreshTokensService;
  shieldService: ShieldService;
  usersService: UsersService;
}

export interface Context extends ApolloContext {
  claims: {
    accessTokenClaims: JwtPayload | null;
    refreshTokenClaims: JwtPayload | null;
  };
  loaders: Dataloaders;
  permissions: UserPermissions | null;
  services: ContextServices;
  user: User | null;
}

@Injectable()
export class ContextService {
  constructor(
    private dataloaderService: DataloaderService,
    private eventsService: EventsService,
    private groupMemberRequestsService: GroupMemberRequestsService,
    private groupRolesService: GroupRolesService,
    private groupsService: GroupsService,
    private imagesService: ImagesService,
    private postsService: PostsService,
    private proposalActionsService: ProposalActionsService,
    private proposalsService: ProposalsService,
    private refreshTokensService: RefreshTokensService,
    private shieldService: ShieldService,
    private usersService: UsersService
  ) {}

  async getContext({ req }: { req: Request }): Promise<Context> {
    const claims = getClaims(req);
    const loaders = this.dataloaderService.getLoaders();
    const permissions = await this.getUserPermisionsFromClaims(claims);
    const user = await this.getUserFromClaims(claims);

    const services: ContextServices = {
      eventsService: this.eventsService,
      groupMemberRequestsService: this.groupMemberRequestsService,
      groupRolesService: this.groupRolesService,
      groupsService: this.groupsService,
      imagesService: this.imagesService,
      postsService: this.postsService,
      proposalActionsService: this.proposalActionsService,
      proposalsService: this.proposalsService,
      refreshTokensService: this.refreshTokensService,
      shieldService: this.shieldService,
      usersService: this.usersService,
    };

    return {
      claims,
      loaders,
      permissions,
      services,
      user,
    };
  }

  private getUserFromClaims(claims: Claims) {
    const sub = getSub(claims.accessTokenClaims);
    return sub ? this.usersService.getUser({ id: sub }) : null;
  }

  private getUserPermisionsFromClaims(claims: Claims) {
    const sub = getSub(claims.accessTokenClaims);
    return sub ? this.usersService.getUserPermissions(sub) : null;
  }
}
