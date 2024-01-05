import { Field, Int, ObjectType } from '@nestjs/graphql';
import { FeedItem } from './feed-item.union';

@ObjectType()
export class PublicFeedItemsConnection {
  @Field(() => [FeedItem])
  nodes: Array<typeof FeedItem>;

  @Field(() => Int)
  totalCount: number;
}
