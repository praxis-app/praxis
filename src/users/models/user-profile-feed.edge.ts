import { Field, ObjectType } from '@nestjs/graphql';
import { FeedItem } from '../../common/models/feed-item.union';

@ObjectType()
export class UserProfileFeedEdge {
  @Field()
  cursor: Date;

  @Field(() => FeedItem)
  node: typeof FeedItem;
}
