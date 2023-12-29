import { Field, Int, ObjectType } from '@nestjs/graphql';
import { FeedItem } from '../../common/models/feed-item.union';

@ObjectType()
export class FeedItemConnection {
  @Field(() => [FeedItem])
  nodes: Array<typeof FeedItem>;

  @Field(() => Int)
  totalCount: number;
}
