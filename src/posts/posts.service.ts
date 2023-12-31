import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { sanitizeText } from '../common/common.utils';
import { IsLikedByMeKey } from '../dataloader/dataloader.types';
import { GroupPrivacy } from '../groups/group-configs/group-configs.constants';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { Image } from '../images/models/image.model';
import { LikesService } from '../likes/likes.service';
import { Like } from '../likes/models/like.model';
import { User } from '../users/models/user.model';
import { CreatePostInput } from './models/create-post.input';
import { Post } from './models/post.model';
import { UpdatePostInput } from './models/update-post.input';

type PostWithLikeCount = Post & { likeCount: number };
type PostWithCommentCount = Post & { commentCount: number };

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,

    private likesService: LikesService,
  ) {}

  async getPost(id: number, relations?: string[]) {
    return this.postRepository.findOneOrFail({ where: { id }, relations });
  }

  async getPosts(where?: FindOptionsWhere<Post>) {
    return this.postRepository.find({ where, order: { createdAt: 'DESC' } });
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

  async getPostImagesBatch(postIds: number[]) {
    const images = await this.imageRepository.find({
      where: { postId: In(postIds) },
    });
    return postIds.map(
      (id) =>
        images.filter((image: Image) => image.postId === id) ||
        new Error(`Could not load images for post: ${id}`),
    );
  }

  async getPostLikesBatch(postIds: number[]) {
    const likes = await this.likesService.getLikes({
      postId: In(postIds),
    });
    return postIds.map(
      (id) =>
        likes.filter((like: Like) => like.postId === id) ||
        new Error(`Could not load likes for post: ${id}`),
    );
  }

  async getIsLikedByMeBatch(keys: IsLikedByMeKey[]) {
    const postIds = keys.map(({ postId }) => postId);
    const likes = await this.likesService.getLikes({
      postId: In(postIds),
      userId: keys[0].currentUserId,
    });
    return postIds.map((postId) =>
      likes.some((like: Like) => like.postId === postId),
    );
  }

  async getLikesCountBatch(postIds: number[]) {
    const posts = (await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.likes', 'like')
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .select(['post.id'])
      .whereInIds(postIds)
      .getMany()) as PostWithLikeCount[];

    return postIds.map((id) => {
      const post = posts.find((post: Post) => post.id === id);
      if (!post) {
        return new Error(`Could not load like count for post: ${id}`);
      }
      return post.likeCount;
    });
  }

  async getPostCommentCountBatch(postIds: number[]) {
    const posts = (await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.comments', 'comment')
      .loadRelationCountAndMap('post.commentCount', 'post.comments')
      .select(['post.id'])
      .whereInIds(postIds)
      .getMany()) as PostWithCommentCount[];

    return postIds.map((id) => {
      const post = posts.find((post: Post) => post.id === id);
      if (!post) {
        return new Error(`Could not load comment count for post: ${id}`);
      }
      return post.commentCount;
    });
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
