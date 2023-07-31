import { Injectable } from "@nestjs/common";
import { getClaims, getSub } from "../auth/auth.utils";
import { RefreshTokensService } from "../auth/refresh-tokens/refresh-tokens.service";
import { ShieldService } from "../auth/shield/shield.service";
import { Context, ContextServices } from "./context.types";
import { DataloaderService } from "../dataloader/dataloader.service";
import { EventsService } from "../events/events.service";
import { GroupMemberRequestsService } from "../groups/group-member-requests/group-member-requests.service";
import { GroupRolesService } from "../groups/group-roles/group-roles.service";
import { GroupsService } from "../groups/groups.service";
import { PostsService } from "../posts/posts.service";
import { ProposalsService } from "../proposals/proposals.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class ContextService {
  constructor(
    private dataloaderService: DataloaderService,
    private eventsService: EventsService,
    private groupMemberRequestsService: GroupMemberRequestsService,
    private groupRolesService: GroupRolesService,
    private groupsService: GroupsService,
    private postsService: PostsService,
    private proposalsService: ProposalsService,
    private refreshTokensService: RefreshTokensService,
    private shieldService: ShieldService,
    private usersService: UsersService
  ) {}

  async getContext({ req }: { req: Request }): Promise<Context> {
    const claims = getClaims(req);
    const sub = getSub(claims.accessTokenClaims);
    const permissions = sub
      ? await this.usersService.getUserPermissions(sub)
      : null;
    const user = sub ? await this.usersService.getUser({ id: sub }) : null;

    const services: ContextServices = {
      eventsService: this.eventsService,
      groupMemberRequestsService: this.groupMemberRequestsService,
      groupRolesService: this.groupRolesService,
      groupsService: this.groupsService,
      postsService: this.postsService,
      proposalsService: this.proposalsService,
      refreshTokensService: this.refreshTokensService,
      shieldService: this.shieldService,
      usersService: this.usersService,
    };
    const loaders = this.dataloaderService.getLoaders();

    return {
      claims,
      loaders,
      permissions,
      services,
      user,
    };
  }
}
