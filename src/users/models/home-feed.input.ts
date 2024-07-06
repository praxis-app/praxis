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
  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => HomeFeedType, { nullable: true })
  feedType?: HomeFeedType;
}
