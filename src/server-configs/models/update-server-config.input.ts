import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateServerConfigInput {
  @Field(() => Int)
  id: number;

  @Field()
  canaryMessage: string;

  @Field()
  showCanaryMessage: boolean;

  @Field()
  canaryMessageExpiresAt: Date;
}
