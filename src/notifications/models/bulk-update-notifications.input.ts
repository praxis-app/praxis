import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class BulkUpdateNotificationsInput {
  @Field(() => [Int])
  ids: number[];

  @Field()
  status: string;
}
