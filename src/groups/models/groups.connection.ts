import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Group } from './group.model';

@ObjectType()
export class GroupsConnection {
  @Field(() => [Group])
  nodes: Group;

  @Field(() => Int)
  totalCount: number;
}
