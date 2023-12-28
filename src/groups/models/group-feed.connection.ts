import { Field, Int, ObjectType } from '@nestjs/graphql';
import { FeedItem } from '../../common/models/feed-item.union';

@ObjectType()
export class GroupFeedConnection {
  @Field(() => [FeedItem])
  feedItems: Array<typeof FeedItem>;

  @Field(() => Int)
  totalCount: number;
}
