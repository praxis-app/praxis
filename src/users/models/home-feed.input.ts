import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';

export enum HomeFeedType {
  YourFeed = 'your-feed',
  Proposals = 'proposals',
  Following = 'following',
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
