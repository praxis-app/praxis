import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ServerPermissions {
  @Field()
  manageRoles: boolean;

  @Field()
  managePosts: boolean;

  @Field()
  manageComments: boolean;

  @Field()
  manageEvents: boolean;

  @Field()
  manageSettings: boolean;

  @Field()
  manageInvites: boolean;

  @Field()
  createInvites: boolean;

  @Field()
  removeMembers: boolean;

  @Field()
  removeGroups: boolean;
}
