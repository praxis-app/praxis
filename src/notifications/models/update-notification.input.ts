import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateNotificationInput {
  @Field(() => Int)
  id: number;

  @Field()
  status: string;
}
