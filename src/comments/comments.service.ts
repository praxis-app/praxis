import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, Repository } from 'typeorm';
import { DEFAULT_PAGE_SIZE } from '../common/common.constants';
import { sanitizeText } from '../common/common.utils';
import { GroupPrivacy } from '../groups/groups.constants';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { Image } from '../images/models/image.model';
import { NotificationType } from '../notifications/notifications.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { Post } from '../posts/models/post.model';
import { Proposal } from '../proposals/models/proposal.model';
import { User } from '../users/models/user.model';
import { Comment } from './models/comment.model';
import { CreateCommentInput } from './models/create-comment.input';
import { UpdateCommentInput } from './models/update-comment.input';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,

    private notificationsService: NotificationsService,
  ) {}

  async getComment(id: number, relations?: string[]) {
    return this.commentRepository.findOneOrFail({ where: { id }, relations });
  }

  async getComments(where: FindOptionsWhere<Comment>) {
    const comments = await this.commentRepository.find({
      order: { createdAt: 'ASC' },
      where,
    });
    // TODO: Update once pagination has been implemented
    return comments.slice(
      comments.length - Math.min(comments.length, DEFAULT_PAGE_SIZE),
      comments.length,
    );
  }

  async isPublicCommentImage(imageId: number) {
    const image = await this.imageRepository.findOneOrFail({
      where: { id: imageId },
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

  async createComment(
    { body, images, ...commentData }: CreateCommentInput,
    user: User,
  ) {
    if (!body && !images?.length) {
      throw new Error('Comments must include text or images');
    }
    const sanitizedBody = body ? sanitizeText(body.trim()) : undefined;
    const comment = await this.commentRepository.save({
      ...commentData,
      userId: user.id,
      body: sanitizedBody,
    });

    if (images) {
      try {
        await this.saveCommentImages(comment.id, images);
      } catch (err) {
        await this.deleteComment(comment.id);
        throw new Error(err.message);
      }
    }

    const {
      user: { id: userId },
    } = comment.postId
      ? await this.postRepository.findOneOrFail({
          where: { id: comment.postId },
          relations: ['user'],
        })
      : await this.proposalRepository.findOneOrFail({
          where: { id: comment.proposalId },
          relations: ['user'],
        });

    if (userId !== user.id) {
      await this.notificationsService.createNotification({
        notificationType: comment.postId
          ? NotificationType.PostComment
          : NotificationType.ProposalComment,
        proposalId: comment.proposalId,
        postId: comment.postId,
        otherUserId: user.id,
        userId,
      });
    }

    return { comment };
  }

  async updateComment({
    id,
    body,
    images,
    ...commentData
  }: UpdateCommentInput) {
    const sanitizedBody = body ? sanitizeText(body.trim()) : undefined;
    await this.commentRepository.update(id, {
      body: sanitizedBody,
      ...commentData,
    });
    if (images) {
      await this.saveCommentImages(id, images);
    }

    const comment = await this.getComment(id);
    return { comment };
  }

  async saveCommentImages(commentId: number, images: Promise<FileUpload>[]) {
    for (const image of images) {
      const filename = await saveImage(image);
      await this.imageRepository.save({ commentId, filename });
    }
  }

  async deleteComment(commentId: number) {
    const images = await this.imageRepository.find({ where: { commentId } });
    for (const { filename } of images) {
      await deleteImageFile(filename);
    }
    await this.commentRepository.delete(commentId);
    return true;
  }
}
