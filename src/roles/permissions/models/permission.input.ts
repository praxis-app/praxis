import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class PermissionInput {
  @Field()
  name: string;

  @Field()
  enabled: boolean;
}
