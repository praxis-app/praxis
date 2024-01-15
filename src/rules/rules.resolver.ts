import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRuleInput } from './models/create-rule.input';
import { CreateRulePayload } from './models/create-rule.payload';
import { Rule } from './models/rule.model';
import { UpdateRuleInput } from './models/update-rule.input';
import { UpdateRulePayload } from './models/update-rule.payload';
import { RulesService } from './rules.service';

@Resolver()
export class RulesResolver {
  constructor(private rulesService: RulesService) {}

  @Query(() => [Rule])
  async serverRules() {
    return this.rulesService.getServerRules();
  }

  @Mutation(() => CreateRulePayload)
  async createRule(@Args('ruleData') ruleData: CreateRuleInput) {
    return this.rulesService.createRule(ruleData);
  }

  @Mutation(() => UpdateRulePayload)
  async updateRule(@Args('ruleData') ruleData: UpdateRuleInput) {
    return this.rulesService.updateRule(ruleData);
  }
}
