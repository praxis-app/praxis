import { Field, ObjectType } from "@nestjs/graphql";
import { Role } from "../../models/role.model";

@ObjectType()
export class DeleteRoleMemberPayload {
  @Field()
  role: Role;
}
