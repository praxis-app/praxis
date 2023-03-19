import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../models/user.model";
import { Follow } from "./models/follow.model";

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private repository: Repository<Follow>
  ) {}

  async getFollowers(followedUserId: number) {
    return this.repository.find({
      where: { followedUserId },
      order: { createdAt: "DESC" },
    });
  }

  async getFollowing(userId: number) {
    return this.repository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async createFollow(followedUserId: number, user: User) {
    const follow = await this.repository.save({
      followedUserId,
      userId: user.id,
    });
    return { follow };
  }

  async deleteFollow(followedUserId: number, user: User) {
    await this.repository.delete({ followedUserId, userId: user.id });
    return true;
  }
}
