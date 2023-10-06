import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { ServerRole } from './server-role.model';

@ObjectType()
export class DeleteServerRoleMemberPayload {
  @Field()
  serverRole: ServerRole;

  @Field()
  me: User;
}
