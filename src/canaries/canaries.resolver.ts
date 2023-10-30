import { Query, Resolver } from '@nestjs/graphql';
import { CanariesService } from './canaries.service';
import { Canary } from './models/canary.model';

@Resolver(() => Canary)
export class CanariesResolver {
  constructor(private canaryService: CanariesService) {}

  @Query(() => Canary)
  async canaryStatement() {
    return this.canaryService.getCanary();
  }
}
