import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServerConfig } from './models/server-configs.model';
import { UpdateServerConfigInput } from './models/update-server-config.input';

@Injectable()
export class ServerConfigsService {
  constructor(
    @InjectRepository(ServerConfig)
    private repository: Repository<ServerConfig>,
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

  async updateServerConfig({ id, ...data }: UpdateServerConfigInput) {
    await this.repository.update(id, data);
    const serverConfig = await this.getServerConfig();
    return { serverConfig };
  }
}
