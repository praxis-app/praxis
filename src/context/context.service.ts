import { Injectable } from '@nestjs/common';
import { RequestWithCookies } from '../auth/auth.types';
import { getSub } from '../auth/auth.utils';
import { CommentsService } from '../comments/comments.service';
import { DataloaderService } from '../dataloader/dataloader.service';
import { EventsService } from '../events/events.service';
import { GroupMemberRequestsService } from '../groups/group-member-requests/group-member-requests.service';
import { GroupRolesService } from '../groups/group-roles/group-roles.service';
import { GroupsService } from '../groups/groups.service';
import { ImagesService } from '../images/images.service';
import { PostsService } from '../posts/posts.service';
import { ProposalActionEventsService } from '../proposals/proposal-actions/proposal-action-events/proposal-action-events.service';
import { ProposalActionRolesService } from '../proposals/proposal-actions/proposal-action-roles/proposal-action-roles.service';
import { ProposalActionsService } from '../proposals/proposal-actions/proposal-actions.service';
import { ProposalsService } from '../proposals/proposals.service';
import { ShieldService } from '../shield/shield.service';
import { UsersService } from '../users/users.service';
import { Context, ContextServices } from './context.types';

@Injectable()
export class ContextService {
  constructor(
    private commentsService: CommentsService,
    private dataloaderService: DataloaderService,
    private eventsService: EventsService,
    private groupMemberRequestsService: GroupMemberRequestsService,
    private groupRolesService: GroupRolesService,
    private groupsService: GroupsService,
    private imagesService: ImagesService,
    private postsService: PostsService,
    private proposalActionEventsService: ProposalActionEventsService,
    private proposalActionRolesService: ProposalActionRolesService,
    private proposalActionsService: ProposalActionsService,
    private proposalsService: ProposalsService,
    private shieldService: ShieldService,
    private usersService: UsersService,
  ) {}

  async getContext({ req }: { req: RequestWithCookies }): Promise<Context> {
    const user = await this.getUserFromReq(req);
    const permissions = await this.getUserPermisionsFromReq(req);
    const loaders = this.dataloaderService.getLoaders();

    const services: ContextServices = {
      commentsService: this.commentsService,
      eventsService: this.eventsService,
      groupMemberRequestsService: this.groupMemberRequestsService,
      groupRolesService: this.groupRolesService,
      groupsService: this.groupsService,
      imagesService: this.imagesService,
      postsService: this.postsService,
      proposalActionEventsService: this.proposalActionEventsService,
      proposalActionRolesService: this.proposalActionRolesService,
      proposalActionsService: this.proposalActionsService,
      proposalsService: this.proposalsService,
      shieldService: this.shieldService,
      usersService: this.usersService,
    };

    return {
      loaders,
      permissions,
      services,
      user,
    };
  }

  private async getUserFromReq(req: RequestWithCookies) {
    const sub = getSub(req);
    if (!sub) {
      return null;
    }
    return this.usersService.getUser({ id: sub });
  }

  private async getUserPermisionsFromReq(req: RequestWithCookies) {
    const sub = getSub(req);
    if (!sub) {
      return null;
    }
    return this.usersService.getUserPermissions(sub);
  }
}
