import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class ProposalActionPermissionInput {
  @Field()
  name: string;

  @Field()
  enabled: boolean;
}
