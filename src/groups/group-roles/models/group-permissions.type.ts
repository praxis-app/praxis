import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GroupPermissions {
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
