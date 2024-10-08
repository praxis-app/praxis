import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ProposalActionPermissionInput {
  @Field({ nullable: true })
  manageRoles?: boolean;

  @Field({ nullable: true })
  manageSettings?: boolean;

  @Field({ nullable: true })
  managePosts?: boolean;

  @Field({ nullable: true })
  manageComments?: boolean;

  @Field({ nullable: true })
  manageEvents?: boolean;

  @Field({ nullable: true })
  updateGroup?: boolean;

  @Field({ nullable: true })
  deleteGroup?: boolean;

  @Field({ nullable: true })
  createEvents?: boolean;

  @Field({ nullable: true })
  approveMemberRequests?: boolean;

  @Field({ nullable: true })
  removeMembers?: boolean;

  @Field({ nullable: true })
  manageInvites?: boolean;

  @Field({ nullable: true })
  createInvites?: boolean;

  @Field({ nullable: true })
  removeGroups?: boolean;

  @Field({ nullable: true })
  removeProposals?: boolean;

  @Field({ nullable: true })
  manageRules?: boolean;

  @Field({ nullable: true })
  manageQuestions?: boolean;

  @Field({ nullable: true })
  manageQuestionnaireTickets?: boolean;
}
