import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Group } from './group.model';

@ObjectType()
export class PublicGroupsConnection {
  @Field(() => [Group])
  nodes: Group;

  @Field(() => Int)
  totalCount: number;
}
