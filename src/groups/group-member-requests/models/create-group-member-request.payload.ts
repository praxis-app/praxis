import { Field, ObjectType } from "@nestjs/graphql";
import { MemberRequest } from "./group-member-request.model";

@ObjectType()
export class CreateMemberRequestPayload {
  @Field()
  memberRequest: MemberRequest;
}
