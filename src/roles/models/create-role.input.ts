import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateRoleInput {
  @Field()
  name: string;

  @Field()
  color: string;
}
