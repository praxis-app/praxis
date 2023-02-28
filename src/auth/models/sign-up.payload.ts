import { Field, Int, ObjectType } from "@nestjs/graphql";
import { User } from "../../users/models/user.model";

@ObjectType()
export class SignUpPayload {
  @Field()
  user: User;

  @Field(() => Int)
  userCount: number;
}
