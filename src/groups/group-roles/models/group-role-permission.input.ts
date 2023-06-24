import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class GroupRolePermissionInput {
  @Field()
  manageRoles: boolean;

  @Field()
  manageSettings: boolean;

  @Field()
  managePosts: boolean;

  @Field()
  manageComments: boolean;

  @Field()
  manageEvents: boolean;

  @Field()
  updateGroup: boolean;

  @Field()
  deleteGroup: boolean;

  @Field()
  createEvents: boolean;

  @Field()
  approveMemberRequests: boolean;

  @Field()
  removeMembers: boolean;
}
