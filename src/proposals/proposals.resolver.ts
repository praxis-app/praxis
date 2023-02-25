import { UsePipes } from "@nestjs/common";
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Dataloaders } from "../dataloader/dataloader.service";
import { Group } from "../groups/models/group.model";
import { Image } from "../images/models/image.model";
import { User } from "../users/models/user.model";
import { Vote } from "../votes/models/vote.model";
import { CreateProposalInput } from "./models/create-proposal.input";
import { CreateProposalPayload } from "./models/create-proposal.payload";
import { Proposal } from "./models/proposal.model";
import { UpdateProposalInput } from "./models/update-proposal.input";
import { UpdateProposalPayload } from "./models/update-proposal.payload";
import { CreateProposalValidationPipe } from "./pipes/create-proposal-validation.pipe";
import { DeleteProposalValidationPipe } from "./pipes/delete-proposal-validation.pipe";
import { UpdateProposalValidationPipe } from "./pipes/update-proposal-validation.pipe";
import { ProposalAction } from "./proposal-actions/models/proposal-action.model";
import { ProposalsService } from "./proposals.service";

@Resolver(() => Proposal)
export class ProposalsResolver {
  constructor(private proposalsService: ProposalsService) {}

  @Query(() => Proposal)
  async proposal(@Args("id", { type: () => Int }) id: number) {
    return this.proposalsService.getProposal(id);
  }

  @Query(() => [Proposal])
  async proposals() {
    return this.proposalsService.getProposals();
  }

  @ResolveField(() => [Vote])
  async votes(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Proposal
  ) {
    return loaders.proposalVotesLoader.load(id);
  }

  @ResolveField(() => Int)
  async voteCount(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Proposal
  ) {
    return loaders.proposalVoteCountLoader.load(id);
  }

  @ResolveField(() => [Image])
  async images(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Proposal
  ) {
    return loaders.proposalImagesLoader.load(id);
  }

  @ResolveField(() => ProposalAction)
  async action(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { id }: Proposal
  ) {
    return loaders.proposalActionsLoader.load(id);
  }

  @ResolveField(() => User)
  async user(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { userId }: Proposal
  ) {
    return loaders.usersLoader.load(userId);
  }

  @ResolveField(() => Group)
  async group(
    @Context() { loaders }: { loaders: Dataloaders },
    @Parent() { groupId }: Proposal
  ) {
    return loaders.groupsLoader.load(groupId);
  }

  @Mutation(() => CreateProposalPayload)
  @UsePipes(CreateProposalValidationPipe)
  async createProposal(
    @Args("proposalData") proposalData: CreateProposalInput,
    @CurrentUser() user: User
  ) {
    return this.proposalsService.createProposal(proposalData, user);
  }

  @Mutation(() => UpdateProposalPayload)
  @UsePipes(UpdateProposalValidationPipe)
  async updateProposal(
    @Args("proposalData") proposalData: UpdateProposalInput
  ) {
    return this.proposalsService.updateProposal(proposalData);
  }

  @Mutation(() => Boolean)
  @UsePipes(DeleteProposalValidationPipe)
  async deleteProposal(@Args("id", { type: () => Int }) id: number) {
    return this.proposalsService.deleteProposal(id);
  }
}
