import { Field, ObjectType } from "@nestjs/graphql";
import { User } from "../../users/models/user.model";
import { Role } from "./role.model";

@ObjectType()
export class UpdateRolePayload {
  @Field()
  role: Role;

  @Field()
  me: User;
}
