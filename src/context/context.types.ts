import { JwtPayload } from 'jsonwebtoken';
import { RefreshTokensService } from '../auth/refresh-tokens/refresh-tokens.service';
import { CommentsService } from '../comments/comments.service';
import { Dataloaders } from '../dataloader/dataloader.types';
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
import { User } from '../users/models/user.model';
import { UserPermissions } from '../users/user.types';
import { UsersService } from '../users/users.service';

export interface ContextServices {
  commentsService: CommentsService;
  eventsService: EventsService;
  groupMemberRequestsService: GroupMemberRequestsService;
  groupRolesService: GroupRolesService;
  groupsService: GroupsService;
  imagesService: ImagesService;
  postsService: PostsService;
  proposalActionRolesService: ProposalActionRolesService;
  proposalActionEventsService: ProposalActionEventsService;
  proposalActionsService: ProposalActionsService;
  proposalsService: ProposalsService;
  refreshTokensService: RefreshTokensService;
  shieldService: ShieldService;
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
