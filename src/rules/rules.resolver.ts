import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRuleInput } from './models/create-rule.input';
import { CreateRulePayload } from './models/create-rule.payload';
import { Rule } from './models/rule.model';
import { UpdateRuleInput } from './models/update-rule.input';
import { UpdateRulePayload } from './models/update-rule.payload';
import { UpdateRulesPriorityInput } from './models/update-rules-priority.input';
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

  @Mutation(() => Boolean)
  async updateRulesPriority(
    @Args('rulesData') rulesData: UpdateRulesPriorityInput,
  ) {
    return this.rulesService.updateRulesPriority(rulesData);
  }

  @Mutation(() => Boolean)
  async deleteRule(@Args('id', { type: () => Int }) id: number) {
    return this.rulesService.deleteRule(id);
  }
}
