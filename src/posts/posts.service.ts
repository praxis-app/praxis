import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileUpload } from 'graphql-upload-ts';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { IsLikedByMeKey } from '../dataloader/dataloader.types';
import { deleteImageFile, saveImage } from '../images/image.utils';
import { ImagesService } from '../images/images.service';
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
    private repository: Repository<Post>,
    private imagesService: ImagesService,
    private likesService: LikesService,
  ) {}

  async getPost(id: number, relations?: string[]) {
    return this.repository.findOneOrFail({ where: { id }, relations });
  }

  async getPosts(where?: FindOptionsWhere<Post>) {
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async getPostImagesBatch(postIds: number[]) {
    const images = await this.imagesService.getImages({
      postId: In(postIds),
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
    const posts = (await this.repository
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
    const posts = (await this.repository
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

  async createPost({ images, ...postData }: CreatePostInput, user: User) {
    const post = await this.repository.save({ ...postData, userId: user.id });

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

  async updatePost({ id, images, ...data }: UpdatePostInput) {
    await this.repository.update(id, data);
    const post = await this.getPost(id);
    if (images) {
      await this.savePostImages(post.id, images);
    }
    return { post };
  }

  async savePostImages(postId: number, images: Promise<FileUpload>[]) {
    for (const image of images) {
      const filename = await saveImage(image);
      await this.imagesService.createImage({ filename, postId });
    }
  }

  async deletePost(postId: number) {
    const images = await this.imagesService.getImages({ postId });
    for (const { filename } of images) {
      await deleteImageFile(filename);
    }
    await this.repository.delete(postId);
    return true;
  }
}
