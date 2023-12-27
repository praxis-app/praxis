import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../common/models/page-info.type';
import { GroupFeedEdge } from './group-feed.edge';

@ObjectType()
export class GroupFeedConnection {
  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => [GroupFeedEdge])
  edges: GroupFeedEdge[];

  @Field(() => Int)
  totalCount: number;
}
