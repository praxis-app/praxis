import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Comment } from "./models/comment.model";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private repository: Repository<Comment>
  ) {}

  async getComment(id: number, relations?: string[]) {
    return this.repository.findOneOrFail({ where: { id }, relations });
  }

  async getComments(where?: FindOptionsWhere<Comment>) {
    return this.repository.find({ where, order: { createdAt: "DESC" } });
  }
}
