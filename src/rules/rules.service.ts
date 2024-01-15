import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateRuleInput } from './models/create-rule.input';
import { Rule } from './models/rule.model';
import { UpdateRuleInput } from './models/update-rule.input';

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

  async createRule(ruleData: CreateRuleInput) {
    const rule = await this.ruleRepository.save(ruleData);
    return { rule };
  }

  async updateRule({ id, ...ruleData }: UpdateRuleInput) {
    await this.ruleRepository.update(id, ruleData);
    const rule = await this.ruleRepository.findOneOrFail({
      where: { id },
    });
    return { rule };
  }

  async deleteRule(ruleId: number) {
    await this.ruleRepository.delete({ id: ruleId });
    return true;
  }
}
