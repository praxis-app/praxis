import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Dataloaders } from '../../../dataloader/dataloader.types';
import { User } from '../../../users/models/user.model';
import { ProposalActionRoleMember } from './models/proposal-action-role-member.model';

@Resolver(() => ProposalActionRoleMember)
export class ProposalActionRoleMembersResolver {
  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: ProposalActionRoleMember,
  ) {
    return loaders.usersLoader.load(userId);
  }
}
