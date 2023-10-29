import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateServerConfigInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  canaryStatement: string;

  @Field({ nullable: true })
  showCanaryStatement: boolean;

  @Field({ nullable: true })
  canaryMessageExpiresAt: Date;
}
