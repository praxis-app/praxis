import { Field, ObjectType } from '@nestjs/graphql';
import { Group } from '../../groups/models/group.model';

@ObjectType()
export class UpdateDefaultGroupsPayload {
  @Field(() => [Group])
  groups: Group[];
}
