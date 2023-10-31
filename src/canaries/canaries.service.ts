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
      return this.createCanary({ statement: '' });
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

  async createCanary(data: Partial<Canary>): Promise<Canary> {
    return this.repository.save(data);
  }

  async updateCanary({ id, ...data }: Partial<Canary>) {
    if (!id) {
      throw new Error('Canary ID was not provided');
    }
    await this.repository.update(id, data);
    return this.getCanary();
  }
}
