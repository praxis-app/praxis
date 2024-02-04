import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServerConfigsService } from '../server-configs/server-configs.service';
import { Canary } from './models/canary.model';

@Injectable()
export class CanariesService {
  constructor(
    @InjectRepository(Canary)
    private repository: Repository<Canary>,

    @Inject(forwardRef(() => ServerConfigsService))
    private serverConfigsService: ServerConfigsService,
  ) {}

  async getCanary() {
    const canaries = await this.repository.find();
    if (!canaries.length) {
      return this.initializeCanary();
    }
    return canaries[0];
  }

  async getPublicCanary() {
    const serverConfig = await this.serverConfigsService.getServerConfig();
    if (!serverConfig.showCanaryStatement) {
      return null;
    }
    return this.getCanary();
  }

  // TODO: Rename as `createCanary`
  async initializeCanary(): Promise<Canary> {
    return this.repository.save({ statement: '' });
  }

  async updateCanary({ id, statement, ...canaryData }: Partial<Canary>) {
    if (!id) {
      throw new Error('Canary ID was not provided');
    }
    await this.repository.update(id, {
      statement: statement?.trim(),
      ...canaryData,
    });
    return this.getCanary();
  }
}
