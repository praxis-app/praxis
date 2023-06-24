import { Field, ObjectType } from "@nestjs/graphql";
import { Role } from "../../../roles/models/role.model";

@ObjectType()
export class UpdateGroupRolePayload {
  @Field()
  role: Role;
}
