import { Inject, UseInterceptors, UsePipes } from '@nestjs/common';
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Comment } from '../comments/models/comment.model';
import { Dataloaders } from '../dataloader/dataloader.types';
import { Group } from '../groups/models/group.model';
import { Image } from '../images/models/image.model';
import { User } from '../users/models/user.model';
import { Vote } from '../votes/models/vote.model';
import { SynchronizeProposalsInterceptor } from './interceptors/synchronize-proposals.interceptor';
import { CreateProposalInput } from './models/create-proposal.input';
import { CreateProposalPayload } from './models/create-proposal.payload';
import { ProposalConfig } from './models/proposal-config.model';
import { Proposal } from './models/proposal.model';
import { SynchronizeProposalPayload } from './models/synchronize-proposal.payload';
import { UpdateProposalInput } from './models/update-proposal.input';
import { UpdateProposalPayload } from './models/update-proposal.payload';
import { CreateProposalValidationPipe } from './pipes/create-proposal-validation.pipe';
import { UpdateProposalValidationPipe } from './pipes/update-proposal-validation.pipe';
import { ProposalAction } from './proposal-actions/models/proposal-action.model';
import { ProposalsService } from './proposals.service';

@Resolver(() => Proposal)
export class ProposalsResolver {
  constructor(
    @Inject('PUB_SUB') private pubSub: PubSub,
    private proposalsService: ProposalsService,
  ) {}

  @Query(() => Proposal)
  @UseInterceptors(SynchronizeProposalsInterceptor)
  async proposal(@Args('id', { type: () => Int }) id: number) {
    return this.proposalsService.getProposal(id);
  }

  @ResolveField(() => [Vote])
  async votes(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Proposal,
  ) {
    return loaders.proposalVotesLoader.load(id);
  }

  @ResolveField(() => Int)
  async voteCount(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Proposal,
  ) {
    return loaders.proposalVoteCountLoader.load(id);
  }

  @ResolveField(() => Vote, { nullable: true })
  async myVote(@Parent() { id }: Proposal, @CurrentUser() user: User) {
    return this.proposalsService.getProposalVote(id, user.id);
  }

  @ResolveField(() => [Comment])
  async comments(@Parent() { id }: Proposal) {
    return this.proposalsService.getProposalComments(id);
  }

  @ResolveField(() => Int)
  async commentCount(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Proposal,
  ) {
    return loaders.proposalCommentCountLoader.load(id);
  }

  @ResolveField(() => [Image])
  async images(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Proposal,
  ) {
    return loaders.proposalImagesLoader.load(id);
  }

  @ResolveField(() => ProposalAction)
  async action(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Proposal,
  ) {
    return loaders.proposalActionsLoader.load(id);
  }

  @ResolveField(() => ProposalConfig)
  async settings(@Parent() { id }: Proposal) {
    return this.proposalsService.getProposalConfig(id);
  }

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: Proposal,
  ) {
    return loaders.usersLoader.load(userId);
  }

  @ResolveField(() => Group, { nullable: true })
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: Proposal,
  ) {
    return groupId ? loaders.groupsLoader.load(groupId) : null;
  }

  @Mutation(() => CreateProposalPayload)
  @UsePipes(CreateProposalValidationPipe)
  async createProposal(
    @Args('proposalData') proposalData: CreateProposalInput,
    @CurrentUser() user: User,
  ) {
    return this.proposalsService.createProposal(proposalData, user);
  }

  @Mutation(() => UpdateProposalPayload)
  @UsePipes(UpdateProposalValidationPipe)
  async updateProposal(
    @Args('proposalData') proposalData: UpdateProposalInput,
  ) {
    return this.proposalsService.updateProposal(proposalData);
  }

  @Mutation(() => SynchronizeProposalPayload)
  async synchronizeProposal(@Args('id', { type: () => Int }) id: number) {
    return this.proposalsService.synchronizeProposalById(id);
  }

  @Mutation(() => Boolean)
  async deleteProposal(@Args('id', { type: () => Int }) id: number) {
    return this.proposalsService.deleteProposal(id);
  }

  @Subscription(() => Boolean)
  isProposalRatified(@Args('id', { type: () => Int }) id: number) {
    return this.pubSub.asyncIterator(`isProposalRatified-${id}`);
  }
}
