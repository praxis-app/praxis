import { Query, Resolver } from '@nestjs/graphql';
import { Rule } from './models/rule.model';
import { RulesService } from './rules.service';

@Resolver()
export class RulesResolver {
  constructor(private rulesService: RulesService) {}

  @Query(() => [Rule])
  async serverRules() {
    return this.rulesService.getServerRules();
  }
}
