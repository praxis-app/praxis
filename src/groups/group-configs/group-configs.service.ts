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

  async createGroupConfig(groupConfigData: Partial<GroupConfig>) {
    return this.repository.save(groupConfigData);
  }

  // TODO: Determine whether this method is needed
  async initGroupConfig(groupId: number) {
    return this.createGroupConfig({ groupId });
  }
}
