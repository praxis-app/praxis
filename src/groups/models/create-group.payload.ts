import { Field, ObjectType } from '@nestjs/graphql';
import { Group } from './group.model';

@ObjectType()
export class CreateGroupPayload {
  @Field()
  group: Group;
}
