import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { Repository } from 'typeorm';
import { PageSize } from '../common/common.constants';
import { sanitizeText } from '../common/common.utils';
import { GroupPrivacy } from '../groups/groups.constants';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { Image } from '../images/models/image.model';
import { NotificationType } from '../notifications/notifications.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { Proposal } from '../proposals/models/proposal.model';
import { User } from '../users/models/user.model';
import { CreatePostInput } from './models/create-post.input';
import { Post } from './models/post.model';
import { UpdatePostInput } from './models/update-post.input';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    @InjectRepository(Proposal)
    private proposalRepository: Repository<Proposal>,

    private notificationsService: NotificationsService,
  ) {}

  async getPost(id: number, relations?: string[]) {
    return this.postRepository.findOneOrFail({ where: { id }, relations });
  }

  async getPostComments(postId: number) {
    const { comments } = await this.getPost(postId, ['comments']);

    // TODO: Replace with pagination
    return comments.slice(
      comments.length - Math.min(comments.length, PageSize.Large),
      comments.length,
    );
  }

  async getPostShares(postId: number) {
    const { shares } = await this.getPost(postId, ['shares']);

    // TODO: Replace with pagination
    return shares.slice(
      shares.length - Math.min(shares.length, PageSize.Large),
      shares.length,
    );
  }

  async isPublicPostImage(imageId: number) {
    const image = await this.imageRepository.findOneOrFail({
      where: { id: imageId },
      relations: ['post.group.config', 'post.event.group.config'],
    });
    return (
      image.post?.group?.config.privacy === GroupPrivacy.Public ||
      image.post?.event?.group?.config.privacy === GroupPrivacy.Public
    );
  }

  async hasMissingSharedPost(sharedPostId: number | null) {
    if (!sharedPostId) {
      return false;
    }
    const sharedPostExists = await this.postRepository.exist({
      where: { id: sharedPostId },
    });
    return !sharedPostExists;
  }

  async hasMissingSharedProposal(sharedProposalId: number | null) {
    if (!sharedProposalId) {
      return false;
    }
    const sharedProposalExists = await this.proposalRepository.exist({
      where: { id: sharedProposalId },
    });
    return !sharedProposalExists;
  }

  async createPost(
    { images, body, sharedFromUserId, ...postData }: CreatePostInput,
    user: User,
  ) {
    if (
      !body?.trim() &&
      !images?.length &&
      !postData.sharedPostId &&
      !postData.sharedProposalId
    ) {
      throw new Error('Posts must include some content');
    }
    if (postData.sharedPostId && images?.length) {
      throw new Error('Shared posts cannot include images');
    }
    if (postData.sharedProposalId && images?.length) {
      throw new Error('Shared proposals cannot include images');
    }
    if (
      sharedFromUserId &&
      !postData.sharedPostId &&
      !postData.sharedProposalId
    ) {
      throw new Error('Shared posts must include the original post ID');
    }
    if (
      !sharedFromUserId &&
      (postData.sharedPostId || postData.sharedProposalId)
    ) {
      throw new Error('Shared posts must include the sharer ID');
    }
    const post = await this.postRepository.save({
      body: sanitizeText(body),
      userId: user.id,
      ...postData,
    });

    if (images) {
      try {
        await this.savePostImages(post.id, images);
      } catch (err) {
        await this.deletePost(post.id);
        throw new Error(err.message);
      }
    }

    if (postData.sharedPostId || postData.sharedProposalId) {
      const { userId: authorId } = postData.sharedPostId
        ? await this.postRepository.findOneOrFail({
            where: { id: postData.sharedPostId },
            select: ['userId'],
          })
        : await this.proposalRepository.findOneOrFail({
            where: { id: postData.sharedProposalId },
            select: ['userId'],
          });

      // Skip notifications if the user is sharing their own content
      if (authorId === user.id) {
        return { post };
      }

      // Notify the original author of the shared content
      await this.notificationsService.createNotification({
        notificationType: postData.sharedPostId
          ? NotificationType.PostShare
          : NotificationType.ProposalShare,
        otherUserId: user.id,
        postId: post.id,
        userId: authorId,
      });

      // Notify the sharer if they are not the original author
      if (sharedFromUserId !== authorId) {
        await this.notificationsService.createNotification({
          notificationType: postData.sharedPostId
            ? NotificationType.PostShare
            : NotificationType.ProposalShare,
          userId: sharedFromUserId,
          otherUserId: user.id,
          postId: post.id,
        });
      }
    }

    return { post };
  }

  async updatePost({ id, images, body, ...postData }: UpdatePostInput) {
    await this.postRepository.update(id, {
      body: sanitizeText(body.trim()),
      ...postData,
    });
    if (images) {
      await this.savePostImages(id, images);
    }

    const post = await this.getPost(id);
    return { post };
  }

  async savePostImages(postId: number, images: Promise<FileUpload>[]) {
    for (const image of images) {
      const filename = await saveImage(image);
      await this.imageRepository.save({ filename, postId });
    }
  }

  async deletePost(postId: number) {
    const images = await this.imageRepository.find({ where: { postId } });
    for (const { filename } of images) {
      await deleteImageFile(filename);
    }
    await this.postRepository.delete(postId);
    return true;
  }
}
