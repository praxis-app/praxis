import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class ProposedPermissionInput {
  @Field()
  name: string;

  @Field()
  enabled: boolean;
}
