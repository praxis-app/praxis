import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { GroupsService } from "../groups.service";
import { GroupConfig } from "./models/group-config.model";
import { UpdateGroupConfigInput } from "./models/update-group-config.input";

@Injectable()
export class GroupConfigsService {
  constructor(
    @InjectRepository(GroupConfig)
    private repository: Repository<GroupConfig>,

    @Inject(forwardRef(() => GroupsService))
    private groupsService: GroupsService
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

  async updateGroupConfig({
    groupId,
    ...groupConfigData
  }: UpdateGroupConfigInput) {
    const group = await this.groupsService.getGroup({ id: groupId }, [
      "config",
    ]);
    await this.repository.update(group.config.id, groupConfigData);
    return { group };
  }
}
