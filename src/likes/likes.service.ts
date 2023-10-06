import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../users/models/user.model';
import { CreateLikeInput } from './models/create-like.input';
import { DeleteLikeInput } from './models/delete-like.input';
import { Like } from './models/like.model';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private repository: Repository<Like>,
  ) {}

  async getLikes(where?: FindOptionsWhere<Like>) {
    return this.repository.find({ where, order: { createdAt: 'DESC' } });
  }

  async createLike(likeData: CreateLikeInput, user: User) {
    const like = await this.repository.save({ ...likeData, userId: user.id });
    return { like };
  }

  async deleteLike(likeData: DeleteLikeInput, user: User) {
    await this.repository.delete({ userId: user.id, ...likeData });
    return true;
  }
}
