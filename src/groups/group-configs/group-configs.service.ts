import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { DecisionMakingModel } from '../../proposals/proposals.constants';
import { GroupsService } from '../groups.service';
import { GroupPrivacy } from './group-configs.constants';
import { GroupConfig } from './models/group-config.model';
import { UpdateGroupConfigInput } from './models/update-group-config.input';

@Injectable()
export class GroupConfigsService {
  constructor(
    @InjectRepository(GroupConfig)
    private repository: Repository<GroupConfig>,

    @Inject(forwardRef(() => GroupsService))
    private groupsService: GroupsService,
  ) {}

  async getGroupConfig(where: FindOptionsWhere<GroupConfig>) {
    return this.repository.findOneOrFail({ where });
  }

  async getIsPublic(id: number) {
    const groupConfig = await this.getGroupConfig({ id });
    return groupConfig.privacy === GroupPrivacy.Public;
  }

  async initGroupConfig(groupId: number) {
    return this.repository.save({ groupId });
  }

  async updateGroupConfig({
    groupId,
    ...groupConfigData
  }: UpdateGroupConfigInput) {
    const group = await this.groupsService.getGroup({ id: groupId }, [
      'config',
    ]);
    const newConfig = { ...group.config, ...groupConfigData };
    if (
      newConfig.decisionMakingModel === DecisionMakingModel.Consent &&
      newConfig.votingTimeLimit === 0
    ) {
      throw new Error(
        'Voting time limit is required for consent decision making model',
      );
    }

    await this.repository.update(group.config.id, groupConfigData);
    return { group };
  }
}
