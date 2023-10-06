import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GroupRolePermissionInput {
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
}
