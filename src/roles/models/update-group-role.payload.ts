import { Field, ObjectType } from "@nestjs/graphql";
import { Role } from "./role.model";

@ObjectType()
export class UpdateGroupRolePayload {
  @Field()
  role: Role;
}
