import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PageInfo } from '../../common/models/page-info.type';
import { PostsEdge } from './posts.edge';

@ObjectType()
export class PostsConnection {
  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field(() => [PostsEdge])
  edges: PostsEdge[];

  @Field(() => Int)
  totalCount: number;
}
