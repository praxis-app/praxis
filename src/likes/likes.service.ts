// TODO: Test thoroughly and add remaining functionality - below is a WIP

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { User } from "../users/models/user.model";
import { CreateLikeInput } from "./models/create-like.input";
import { Like } from "./models/like.model";

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private repository: Repository<Like>
  ) {}

  async getLikes(where?: FindOptionsWhere<Like>) {
    return this.repository.find({ where, order: { createdAt: "DESC" } });
  }

  async createLike(likeData: CreateLikeInput, user: User) {
    const like = await this.repository.save({ ...likeData, userId: user.id });
    return { like };
  }

  async deleteLike(id: number) {
    await this.repository.delete(id);
    return true;
  }
}
