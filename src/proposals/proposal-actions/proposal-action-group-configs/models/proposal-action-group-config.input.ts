import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ProposalActionGroupConfigInput {
  @Field({ nullable: true })
  privacy?: string;
}
