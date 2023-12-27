import { Field, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../common/models/page-info.type';
import { PublicGroupsFeedEdge } from './public-groups-feed-edge.type';

@ObjectType()
export class PublicGroupsFeedConnection {
  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => [PublicGroupsFeedEdge])
  edges: PublicGroupsFeedEdge[];
}
