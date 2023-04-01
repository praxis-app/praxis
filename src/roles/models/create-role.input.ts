import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateRoleInput {
  @Field()
  name: string;

  @Field()
  color: string;

  @Field(() => Int, { nullable: true })
  groupId?: number;
}
