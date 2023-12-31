import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { DecisionMakingModel } from '../../proposals/proposals.constants';
import { Group } from '../models/group.model';
import { GroupPrivacy } from './group-configs.constants';
import { GroupConfig } from './models/group-config.model';
import { UpdateGroupConfigInput } from './models/update-group-config.input';

@Injectable()
export class GroupConfigsService {
  constructor(
    @InjectRepository(GroupConfig)
    private groupConfigRepository: Repository<GroupConfig>,

    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
  ) {}

  async getGroupConfig(where: FindOptionsWhere<GroupConfig>) {
    return this.groupConfigRepository.findOneOrFail({ where });
  }

  async getIsPublic(id: number) {
    const groupConfig = await this.getGroupConfig({ id });
    return groupConfig.privacy === GroupPrivacy.Public;
  }

  async initGroupConfig(groupId: number) {
    return this.groupConfigRepository.save({ groupId });
  }

  async updateGroupConfig({
    groupId,
    ...groupConfigData
  }: UpdateGroupConfigInput) {
    const group = await this.groupRepository.findOneOrFail({
      where: { id: groupId },
      relations: ['config'],
    });
    const newConfig = { ...group.config, ...groupConfigData };
    if (
      newConfig.decisionMakingModel === DecisionMakingModel.Consent &&
      newConfig.votingTimeLimit === 0
    ) {
      throw new Error(
        'Voting time limit is required for consent decision making model',
      );
    }

    await this.groupConfigRepository.update(group.config.id, groupConfigData);
    return { group };
  }
}
