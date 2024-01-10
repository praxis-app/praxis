import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../comments/models/comment.model';
import { NotificationType } from '../notifications/notifications.constants';
import { NotificationsService } from '../notifications/notifications.service';
import { Post } from '../posts/models/post.model';
import { User } from '../users/models/user.model';
import { CreateLikeInput } from './models/create-like.input';
import { DeleteLikeInput } from './models/delete-like.input';
import { Like } from './models/like.model';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    private notificationsService: NotificationsService,
  ) {}

  async getLikedPost(postId: number) {
    return this.postRepository.findOneOrFail({
      where: { id: postId },
    });
  }

  async createLike(likeData: CreateLikeInput, user: User) {
    const like = await this.likeRepository.save({
      ...likeData,
      userId: user.id,
    });

    const {
      user: { id: userId },
      ...rest
    } = like.postId
      ? await this.postRepository.findOneOrFail({
          where: { id: like.postId },
          relations: ['user'],
        })
      : await this.commentRepository.findOneOrFail({
          where: { id: like.commentId },
          relations: ['user', 'post'],
        });

    if (userId !== user.id) {
      await this.notificationsService.createNotification({
        notificationType: like.postId
          ? NotificationType.PostLike
          : NotificationType.CommentLike,
        postId: 'post' in rest ? rest.post?.id : like.postId,
        otherUserId: user.id,
        userId,
      });
    }

    return { like };
  }

  async deleteLike(likeData: DeleteLikeInput, user: User) {
    await this.likeRepository.delete({ userId: user.id, ...likeData });
    return true;
  }
}
