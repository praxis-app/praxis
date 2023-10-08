import { Field, ObjectType } from '@nestjs/graphql';
import { Group } from './group.model';

@ObjectType()
export class UpdateGroupPayload {
  @Field()
  group: Group;
}
