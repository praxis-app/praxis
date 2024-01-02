import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { GroupPrivacy } from '../groups/groups.constants';
import { deleteImageFile } from './image.utils';
import { Image } from './models/image.model';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private repository: Repository<Image>,
  ) {}

  async getImage(where: FindOptionsWhere<Image>, relations?: string[]) {
    return this.repository.findOne({ where, relations });
  }

  async isPublicImage(id: number) {
    const image = await this.getImage({ id });
    if (!image) {
      throw new Error(`Image not found: ${id}`);
    }
    if (image.userId) {
      const image = await this.repository.findOneOrFail({
        where: { id },
        relations: ['user.groups.config'],
      });
      if (!image.user) {
        return false;
      }
      return image.user.groups.some(
        (group) => group.config.privacy === GroupPrivacy.Public,
      );
    }
    if (image.groupId) {
      const image = await this.repository.findOneOrFail({
        where: { id },
        relations: ['group.config'],
      });
      return image.group?.config.privacy === GroupPrivacy.Public;
    }
    if (image.proposalId) {
      const image = await this.repository.findOneOrFail({
        where: { id },
        relations: ['proposal.group.config'],
      });
      return image.proposal?.group?.config.privacy === GroupPrivacy.Public;
    }
    if (image.proposalActionId) {
      const image = await this.repository.findOneOrFail({
        where: { id },
        relations: ['proposalAction.proposal.group.config'],
      });
      return (
        image.proposalAction?.proposal?.group?.config.privacy ===
        GroupPrivacy.Public
      );
    }
    if (image.eventId) {
      const image = await this.repository.findOneOrFail({
        where: { id },
        relations: ['event.group.config'],
      });
      return image.event?.group?.config.privacy === GroupPrivacy.Public;
    }
    if (image.proposalActionEventId) {
      const image = await this.repository.findOneOrFail({
        where: { id },
        relations: ['proposalActionEvent.proposalAction.proposal.group.config'],
      });
      return (
        image.proposalActionEvent?.proposalAction?.proposal?.group?.config
          .privacy === GroupPrivacy.Public
      );
    }
    if (image.postId) {
      const image = await this.repository.findOneOrFail({
        where: { id },
        relations: ['post.group.config', 'post.event.group.config'],
      });
      return (
        image.post?.group?.config.privacy === GroupPrivacy.Public ||
        image.post?.event?.group?.config.privacy === GroupPrivacy.Public
      );
    }
    if (image.commentId) {
      const image = await this.repository.findOneOrFail({
        where: { id },
        relations: [
          'comment.post.event.group.config',
          'comment.post.group.config',
          'comment.proposal.group.config',
        ],
      });
      return (
        image.comment?.post?.event?.group?.config.privacy ===
          GroupPrivacy.Public ||
        image.comment?.post?.group?.config.privacy === GroupPrivacy.Public ||
        image.comment?.proposal?.group?.config.privacy === GroupPrivacy.Public
      );
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
