import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class ServerRolePermissionInput {
  @Field()
  manageRoles: boolean;

  @Field()
  managePosts: boolean;

  @Field()
  manageComments: boolean;

  @Field()
  manageEvents: boolean;

  @Field()
  manageInvites: boolean;

  @Field()
  createInvites: boolean;

  @Field()
  banMembers: boolean;
}
