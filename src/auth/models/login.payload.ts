import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "../../users/models/user.model";

@ObjectType()
export class LoginPayload {
  @Field()
  user: User;
}
