import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, Repository } from 'typeorm';
import { DEFAULT_PAGE_SIZE } from '../common/common.constants';
import { sanitizeText } from '../common/common.utils';
import { GroupPrivacy } from '../groups/groups.constants';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { Image } from '../images/models/image.model';
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
  ) {}

  async getPost(id: number, relations?: string[]) {
    return this.postRepository.findOneOrFail({ where: { id }, relations });
  }

  async getPosts(where?: FindOptionsWhere<Post>) {
    return this.postRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async getPostComments(postId: number) {
    const { comments } = await this.getPost(postId, ['comments']);

    // TODO: Update once pagination has been implemented
    return comments.slice(
      comments.length - Math.min(comments.length, DEFAULT_PAGE_SIZE),
      comments.length,
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

  async createPost({ images, body, ...postData }: CreatePostInput, user: User) {
    const post = await this.postRepository.save({
      body: sanitizeText(body.trim()),
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
