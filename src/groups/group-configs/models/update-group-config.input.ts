import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateGroupConfigInput {
  @Field(() => Int)
  groupId: number;

  @Field({ nullable: true })
  privacy?: string;
}
