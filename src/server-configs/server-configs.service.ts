import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CanariesService } from '../canaries/canaries.service';
import { sanitizeText } from '../common/common.utils';
import { Group } from '../groups/models/group.model';
import { DecisionMakingModel } from '../proposals/proposals.constants';
import { ServerConfig } from './models/server-config.model';
import { UpdateDefaultGroupsInput } from './models/update-default-groups.input';
import { UpdateServerConfigInput } from './models/update-server-config.input';

@Injectable()
export class ServerConfigsService {
  constructor(
    @InjectRepository(ServerConfig)
    private serverConfigRepository: Repository<ServerConfig>,

    @InjectRepository(Group)
    private groupRepository: Repository<Group>,

    @Inject(forwardRef(() => CanariesService))
    private canariesService: CanariesService,
    private configService: ConfigService,
  ) {}

  async getServerConfig() {
    const serverConfigs = await this.serverConfigRepository.find();
    if (!serverConfigs.length) {
      return this.initializeServerConfig();
    }
    return serverConfigs[0];
  }

  async getWebsiteURL() {
    return this.configService.get('WEBSITE_URL');
  }

  async getContactEmail() {
    return this.configService.get('MAIL_ADDRESS');
  }

  async initializeServerConfig() {
    return this.serverConfigRepository.save({});
  }

  async updateServerConfig({
    canaryStatement,
    ...data
  }: UpdateServerConfigInput) {
    if (data.decisionMakingModel === DecisionMakingModel.Consent) {
      throw new Error('Consent model is not yet supported at server level');
    }
    if (data.decisionMakingModel === DecisionMakingModel.MajorityVote) {
      throw new Error('Majority vote is not yet supported at server level');
    }

    let serverConfig = await this.getServerConfig();
    await this.serverConfigRepository.update(serverConfig.id, data);

    if (canaryStatement) {
      const canary = await this.canariesService.getCanary();
      const sanitizedCanaryStatement = sanitizeText(canaryStatement.trim());

      await this.canariesService.updateCanary({
        id: canary.id,
        statement: sanitizedCanaryStatement,
      });
    }

    const canary = await this.canariesService.getCanary();
    serverConfig = await this.getServerConfig();
    return { canary, serverConfig };
  }

  async updateDefaultGroups({ groups }: UpdateDefaultGroupsInput) {
    for (const { groupId, defaultGroup } of groups) {
      await this.groupRepository.update(groupId, { defaultGroup });
    }
    const updatedGroups = await this.groupRepository.find({
      where: { id: In(groups.map(({ groupId }) => groupId)) },
    });
    return { groups: updatedGroups };
  }
}
