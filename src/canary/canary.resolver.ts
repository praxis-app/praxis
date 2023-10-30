import { Query, Resolver } from '@nestjs/graphql';
import { CanaryService } from './canary.service';
import { Canary } from './models/canary.model';

@Resolver(() => Canary)
export class CanaryResolver {
  constructor(private canaryService: CanaryService) {}

  @Query(() => Canary)
  async canaryStatement() {
    return this.canaryService.getCanary();
  }
}
