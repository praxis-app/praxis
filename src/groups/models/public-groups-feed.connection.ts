import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../common/models/page-info.type';
import { PublicGroupsFeedEdge } from './public-groups-feed.edge';

@ObjectType()
export class PublicGroupsFeedConnection {
  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => [PublicGroupsFeedEdge])
  edges: PublicGroupsFeedEdge[];

  @Field(() => Int)
  totalCount: number;
}
