import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class PermissionInput {
  @Field(() => Int)
  id: number;

  @Field(() => Boolean)
  enabled: boolean;
}
