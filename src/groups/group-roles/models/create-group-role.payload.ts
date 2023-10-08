import { Field, ObjectType } from '@nestjs/graphql';
import { GroupRole } from './group-role.model';

@ObjectType()
export class CreateGroupRolePayload {
  @Field()
  groupRole: GroupRole;
}
