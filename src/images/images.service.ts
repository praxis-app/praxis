import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CommentsService } from '../comments/comments.service';
import { EventsService } from '../events/events.service';
import { GroupsService } from '../groups/groups.service';
import { PostsService } from '../posts/posts.service';
import { ProposalsService } from '../proposals/proposals.service';
import { UsersService } from '../users/users.service';
import { deleteImageFile } from './image.utils';
import { Image } from './models/image.model';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private repository: Repository<Image>,

    private postsService: PostsService,
    private proposalsService: ProposalsService,
    private groupsService: GroupsService,
    private commentsService: CommentsService,
    private eventsService: EventsService,
    private usersService: UsersService,
  ) {}

  async getImage(where: FindOptionsWhere<Image>, relations?: string[]) {
    return this.repository.findOne({ where, relations });
  }

  // TOOD: Use models directly instead of services
  async isPublicImage(id: number) {
    const image = await this.getImage({ id });
    if (!image) {
      throw new Error(`Image not found: ${id}`);
    }
    if (image.userId) {
      return this.usersService.isPublicUserAvatar(image.id);
    }
    if (image.groupId) {
      return this.groupsService.isPublicGroupImage(image.id);
    }
    if (image.proposalId || image.proposalActionId) {
      return this.proposalsService.isPublicProposalImage(image);
    }
    if (image.eventId || image.proposalActionEventId) {
      return this.eventsService.isPublicEventImage(image.id);
    }
    if (image.postId) {
      return this.postsService.isPublicPostImage(id);
    }
    if (image.commentId) {
      return this.commentsService.isPublicCommentImage(id);
    }
    return false;
  }

  async deleteImage(where: FindOptionsWhere<Image>) {
    const image = await this.getImage(where);
    if (!image) {
      return;
    }
    await deleteImageFile(image.filename);
    this.repository.delete(where);
    return true;
  }
}
