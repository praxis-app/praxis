import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateServerConfigInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  canaryMessage: string;

  @Field({ nullable: true })
  showCanaryMessage: boolean;

  @Field({ nullable: true })
  canaryMessageExpiresAt: Date;
}
