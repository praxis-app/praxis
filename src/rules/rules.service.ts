import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Rule } from './models/rule.model';

@Injectable()
export class RulesService {
  constructor(
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
  ) {}

  async getServerRules() {
    return this.ruleRepository.find({
      where: { groupId: IsNull() },
      order: { updatedAt: 'DESC' },
    });
  }
}
