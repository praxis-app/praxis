import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CanariesService } from '../canaries/canaries.service';
import { ServerConfig } from './models/server-configs.model';
import { UpdateServerConfigInput } from './models/update-server-config.input';

@Injectable()
export class ServerConfigsService {
  constructor(
    @InjectRepository(ServerConfig)
    private repository: Repository<ServerConfig>,

    @Inject(forwardRef(() => CanariesService))
    private canariesService: CanariesService,
  ) {}

  async getServerConfig() {
    const serverConfigs = await this.repository.find();
    if (!serverConfigs.length) {
      return this.initializeServerConfig();
    }
    return serverConfigs[0];
  }

  async initializeServerConfig() {
    return this.repository.save({});
  }

  async updateServerConfig({
    id,
    canaryStatement,
    ...data
  }: UpdateServerConfigInput) {
    await this.repository.update(id, data);

    if (canaryStatement) {
      const canary = await this.canariesService.getCanary();
      await this.canariesService.updateCanary({
        id: canary.id,
        statement: canaryStatement.trim(),
      });
    }

    const serverConfig = await this.getServerConfig();
    const canary = await this.canariesService.getCanary();
    return { serverConfig, canary };
  }
}
