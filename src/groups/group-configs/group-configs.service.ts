import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { GroupConfig } from "./models/group-config.model";

@Injectable()
export class GroupConfigsService {
  constructor(
    @InjectRepository(GroupConfig)
    private repository: Repository<GroupConfig>
  ) {}

  async getGroupConfig(where: FindOptionsWhere<GroupConfig>) {
    return this.repository.findOneOrFail({ where });
  }

  async test() {
    const test = await this.getGroupConfig({ id: 1 });

    return test.privacy === "";
  }
}
