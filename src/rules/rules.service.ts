import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { sanitizeText } from '../common/common.utils';
import { GroupPrivacy } from '../groups/groups.constants';
import { CreateRuleInput } from './models/create-rule.input';
import { Rule } from './models/rule.model';
import { UpdateRuleInput } from './models/update-rule.input';
import { UpdateRulesPriorityInput } from './models/update-rules-priority.input';

@Injectable()
export class RulesService {
  constructor(
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
  ) {}

  async getServerRules() {
    return this.ruleRepository.find({
      where: { groupId: IsNull() },
      order: { priority: 'ASC' },
    });
  }

  async isPublicRule(ruleId: number) {
    const rule = await this.ruleRepository.findOneOrFail({
      where: { id: ruleId },
      relations: ['group.config'],
    });
    if (!rule.group) {
      return true;
    }
    return rule.group.config.privacy === GroupPrivacy.Public;
  }

  async createRule(ruleData: CreateRuleInput) {
    this.validateRule(ruleData.title, ruleData.description);
    const [lowestPriorityRule] = await this.ruleRepository.find({
      where: { groupId: ruleData.groupId || IsNull() },
      order: { priority: 'DESC' },
      take: 1,
    });
    const priority = lowestPriorityRule ? lowestPriorityRule.priority + 1 : 0;
    const rule = await this.ruleRepository.save({
      ...ruleData,
      priority,
    });
    return { rule };
  }

  async updateRule({ id, description, ...ruleData }: UpdateRuleInput) {
    this.validateRule(ruleData?.title, description);
    const sanitizedDescription = sanitizeText(description?.trim());
    await this.ruleRepository.update(id, {
      description: sanitizedDescription,
      ...ruleData,
    });
    const rule = await this.ruleRepository.findOneOrFail({
      where: { id },
    });
    return { rule };
  }

  validateRule(title?: string, description?: string) {
    if (!title?.trim()) {
      throw new Error('Title is required');
    }
    if (!description?.trim()) {
      throw new Error('Description is required');
    }
  }

  async updateRulesPriority({ rules }: UpdateRulesPriorityInput) {
    await this.ruleRepository.save(
      rules.map(({ id, priority }) => ({ id, priority })),
    );
    return true;
  }

  // TODO: Add support for group rules
  async deleteRule(ruleId: number) {
    const rule = await this.ruleRepository.findOneOrFail({
      where: { id: ruleId },
      select: ['priority'],
    });

    await this.ruleRepository.delete({
      id: ruleId,
    });
    await this.ruleRepository
      .createQueryBuilder()
      .update(Rule)
      .set({ priority: () => 'priority - 1' })
      .where('priority > :priority', { priority: rule.priority })
      .execute();

    return true;
  }
}
