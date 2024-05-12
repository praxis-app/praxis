import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CanariesService } from '../canaries/canaries.service';
import { sanitizeText } from '../common/common.utils';
import { DecisionMakingModel } from '../proposals/proposals.constants';
import { ServerConfig } from './models/server-config.model';
import { UpdateServerConfigInput } from './models/update-server-config.input';

@Injectable()
export class ServerConfigsService {
  constructor(
    @InjectRepository(ServerConfig)
    private repository: Repository<ServerConfig>,

    @Inject(forwardRef(() => CanariesService))
    private canariesService: CanariesService,
    private configService: ConfigService,
  ) {}

  async getServerConfig() {
    const serverConfigs = await this.repository.find();
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
    return this.repository.save({});
  }

  async updateServerConfig({
    id,
    canaryStatement,
    ...data
  }: UpdateServerConfigInput) {
    if (data.decisionMakingModel === DecisionMakingModel.Consent) {
      throw new Error('Consent model is not yet supported at server level');
    }
    if (data.decisionMakingModel === DecisionMakingModel.MajorityVote) {
      throw new Error('Majority vote is not yet supported at server level');
    }

    await this.repository.update(id, data);

    if (canaryStatement) {
      const canary = await this.canariesService.getCanary();
      const sanitizedCanaryStatement = sanitizeText(canaryStatement.trim());

      await this.canariesService.updateCanary({
        id: canary.id,
        statement: sanitizedCanaryStatement,
      });
    }

    const serverConfig = await this.getServerConfig();
    const canary = await this.canariesService.getCanary();
    return { serverConfig, canary };
  }
}
