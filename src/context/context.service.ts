import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
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
import { Context, ContextServices, GetContextOptions } from './context.types';
import { GroupConfigsService } from '../groups/group-configs/group-configs.service';

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);

  constructor(
    private authService: AuthService,
    private commentsService: CommentsService,
    private dataloaderService: DataloaderService,
    private eventsService: EventsService,
    private groupConfigsService: GroupConfigsService,
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

  async getContext({
    req,
    res,
    connectionParams,
  }: GetContextOptions): Promise<Context> {
    const sub = await this.authService.getSub(req, connectionParams);
    const user = await this.getUser(sub);
    const permissions = await this.getUserPermisions(sub);
    const loaders = this.dataloaderService.getLoaders();

    const services: ContextServices = {
      commentsService: this.commentsService,
      eventsService: this.eventsService,
      groupConfigsService: this.groupConfigsService,
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
      logger: this.logger,
      loaders,
      permissions,
      services,
      user,
      res,
    };
  }

  private async getUser(userId: number | null) {
    return userId ? this.usersService.getUser({ id: userId }) : null;
  }

  private async getUserPermisions(userId: number | null) {
    return userId ? this.usersService.getUserPermissions(userId) : null;
  }
}
