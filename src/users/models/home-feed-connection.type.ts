import { Field, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../common/models/page-info.type';
import { HomeFeedEdge } from './home-feed-edge.type';

@ObjectType()
export class HomeFeedConnection {
  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => [HomeFeedEdge])
  edges: HomeFeedEdge[];
}
