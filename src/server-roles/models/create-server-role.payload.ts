import { Field, ObjectType } from '@nestjs/graphql';
import { ServerRole } from './server-role.model';

@ObjectType()
export class CreateServerRolePayload {
  @Field()
  serverRole: ServerRole;
}
