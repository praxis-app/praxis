import { Field, ObjectType } from '@nestjs/graphql';
import { ServerInvite } from './server-invite.model';

@ObjectType()
export class CreateServerInvitePayload {
  @Field()
  serverInvite: ServerInvite;
}
