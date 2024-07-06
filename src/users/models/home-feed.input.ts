import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';

export enum HomeFeedType {
  YOUR_FEED,
  PROPOSALS,
  FOLLOWING,
}

registerEnumType(HomeFeedType, {
  name: 'HomeFeedType',
});

@InputType()
export class HomeFeedInput {
  @Field(() => Int)
  offset: number;

  @Field(() => Int)
  limit: number;

  @Field(() => HomeFeedType)
  feedType: HomeFeedType;
}
