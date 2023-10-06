import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../../../users/models/user.model';
import { UsersService } from '../../../users/users.service';
import { ProposalActionEventHost } from './models/proposal-action-event-host.model';

@Resolver(() => ProposalActionEventHost)
export class ProposalActionEventHostsResolver {
  constructor(private usersService: UsersService) {}

  @ResolveField(() => User)
  async user(@Parent() { userId }: ProposalActionEventHost) {
    return this.usersService.getUser({ id: userId });
  }
}
