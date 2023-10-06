import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ServerRolePermissionInput {
  @Field({ nullable: true })
  manageRoles?: boolean;

  @Field({ nullable: true })
  managePosts?: boolean;

  @Field({ nullable: true })
  manageComments?: boolean;

  @Field({ nullable: true })
  manageEvents?: boolean;

  @Field({ nullable: true })
  manageInvites?: boolean;

  @Field({ nullable: true })
  createInvites?: boolean;

  @Field({ nullable: true })
  removeMembers?: boolean;
}
