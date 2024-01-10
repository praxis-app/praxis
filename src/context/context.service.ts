import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CommentsService } from '../comments/comments.service';
import { DataloaderService } from '../dataloader/dataloader.service';
import { EventsService } from '../events/events.service';
import { GroupRolesService } from '../groups/group-roles/group-roles.service';
import { GroupsService } from '../groups/groups.service';
import { ImagesService } from '../images/images.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PostsService } from '../posts/posts.service';
import { ProposalActionsService } from '../proposals/proposal-actions/proposal-actions.service';
import { ProposalsService } from '../proposals/proposals.service';
import { ShieldService } from '../shield/shield.service';
import { UsersService } from '../users/users.service';
import { Context, ContextServices, GetContextOptions } from './context.types';

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);

  constructor(
    private authService: AuthService,
    private commentsService: CommentsService,
    private dataloaderService: DataloaderService,
    private eventsService: EventsService,
    private groupRolesService: GroupRolesService,
    private groupsService: GroupsService,
    private imagesService: ImagesService,
    private notificationsService: NotificationsService,
    private postsService: PostsService,
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
      groupRolesService: this.groupRolesService,
      groupsService: this.groupsService,
      imagesService: this.imagesService,
      notificationsService: this.notificationsService,
      postsService: this.postsService,
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
