import { Field, ObjectType } from "@nestjs/graphql";
import { Follow } from "./follow.model";

@ObjectType()
export class CreateFollowPayload {
  @Field()
  follow: Follow;
}
