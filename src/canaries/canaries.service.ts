import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Canary } from './models/canary.model';

@Injectable()
export class CanariesService {
  constructor(
    @InjectRepository(Canary)
    private repository: Repository<Canary>,
  ) {}

  async getCanary() {
    const canaries = await this.repository.find();
    if (!canaries.length) {
      return this.initializeCanary();
    }
    return canaries[0];
  }

  async initializeCanary() {
    return this.repository.save({});
  }

  async updateCanary({ id, ...data }: any) {
    await this.repository.update(id, data);
    const canary = await this.getCanary();
    return { canary };
  }
}
