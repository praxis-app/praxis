import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../common/models/page-info.type';
import { UserProfileFeedEdge } from './user-profile-feed.edge';

@ObjectType()
export class UserProfileFeedConnection {
  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => [UserProfileFeedEdge])
  edges: UserProfileFeedEdge[];

  @Field(() => Int)
  totalCount: number;
}
