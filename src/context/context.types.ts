import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { CommentsService } from '../comments/comments.service';
import { Dataloaders } from '../dataloader/dataloader.types';
import { EventsService } from '../events/events.service';
import { GroupRolesService } from '../groups/group-roles/group-roles.service';
import { GroupsService } from '../groups/groups.service';
import { ImagesService } from '../images/images.service';
import { LikesService } from '../likes/likes.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PostsService } from '../posts/posts.service';
import { ProposalActionsService } from '../proposals/proposal-actions/proposal-actions.service';
import { ProposalsService } from '../proposals/proposals.service';
import { VibeCheckService } from '../vibe-check/vibe-check.service';
import { RulesService } from '../rules/rules.service';
import { ShieldService } from '../shield/shield.service';
import { User } from '../users/models/user.model';
import { UserPermissions } from '../users/user.types';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';

export interface ContextServices {
  chatService: ChatService;
  commentsService: CommentsService;
  eventsService: EventsService;
  groupRolesService: GroupRolesService;
  groupsService: GroupsService;
  imagesService: ImagesService;
  likesService: LikesService;
  notificationsService: NotificationsService;
  postsService: PostsService;
  proposalActionsService: ProposalActionsService;
  proposalsService: ProposalsService;
  rulesService: RulesService;
  shieldService: ShieldService;
  usersService: UsersService;
  vibeCheckService: VibeCheckService;
}

export interface Context {
  loaders: Dataloaders;
  permissions: UserPermissions | null;
  services: ContextServices;
  user: User | null;
  logger: Logger;
  res?: Response;
}

export interface GetContextOptions {
  connectionParams?: { authorization: string };
  req?: Request;
  res?: Response;
}
