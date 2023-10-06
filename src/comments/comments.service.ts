import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { DEFAULT_PAGE_SIZE } from '../shared/shared.constants';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { ImagesService } from '../images/images.service';
import { Image } from '../images/models/image.model';
import { User } from '../users/models/user.model';
import { Comment } from './models/comment.model';
import { CreateCommentInput } from './models/create-comment.input';
import { UpdateCommentInput } from './models/update-comment.input';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private repository: Repository<Comment>,
    private imagesService: ImagesService,
  ) {}

  async getComment(id: number, relations?: string[]) {
    return this.repository.findOneOrFail({ where: { id }, relations });
  }

  async getComments(where: FindOptionsWhere<Comment>) {
    const comments = await this.repository.find({
      order: { createdAt: 'ASC' },
      where,
    });
    // TODO: Update once pagination has been implemented
    return comments.slice(
      comments.length - Math.min(comments.length, DEFAULT_PAGE_SIZE),
      comments.length,
    );
  }

  async getCommentImagesBatch(commentIds: number[]) {
    const images = await this.imagesService.getImages({
      commentId: In(commentIds),
    });
    return commentIds.map(
      (id) =>
        images.filter((image: Image) => image.commentId === id) ||
        new Error(`Could not load images for comment: ${id}`),
    );
  }

  async createComment(
    { images, ...commentData }: CreateCommentInput,
    user: User,
  ) {
    if (!commentData.body && !images?.length) {
      throw new Error('Comments must include text or images');
    }
    const comment = await this.repository.save({
      ...commentData,
      userId: user.id,
    });

    if (images) {
      try {
        await this.saveCommentImages(comment.id, images);
      } catch (err) {
        await this.deleteComment(comment.id);
        throw new Error(err.message);
      }
    }
    return { comment };
  }

  async updateComment({ id, images, ...commentData }: UpdateCommentInput) {
    await this.repository.update(id, commentData);
    const comment = await this.getComment(id);
    if (images) {
      await this.saveCommentImages(comment.id, images);
    }
    return { comment };
  }

  async saveCommentImages(commentId: number, images: Promise<FileUpload>[]) {
    for (const image of images) {
      const filename = await saveImage(image);
      await this.imagesService.createImage({ filename, commentId });
    }
  }

  async deleteComment(commentId: number) {
    const images = await this.imagesService.getImages({ commentId });
    for (const { filename } of images) {
      await deleteImageFile(filename);
    }
    await this.repository.delete(commentId);
    return true;
  }
}
