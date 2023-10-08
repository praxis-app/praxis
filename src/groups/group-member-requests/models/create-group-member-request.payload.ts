import { Field, ObjectType } from '@nestjs/graphql';
import { GroupMemberRequest } from './group-member-request.model';

@ObjectType()
export class CreateGroupMemberRequestPayload {
  @Field()
  groupMemberRequest: GroupMemberRequest;
}
