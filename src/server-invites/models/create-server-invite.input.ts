import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateServerInviteInput {
  @Field(() => Int, { nullable: true })
  maxUses: number;

  @Field({ nullable: true })
  expiresAt: Date;
}
