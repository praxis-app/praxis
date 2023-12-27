import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../common/models/page-info.type';
import { HomeFeedEdge } from './home-feed.edge';

@ObjectType()
export class HomeFeedConnection {
  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => [HomeFeedEdge])
  edges: HomeFeedEdge[];

  @Field(() => Int)
  totalCount: number;
}
