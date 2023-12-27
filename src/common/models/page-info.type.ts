import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageInfo {
  @Field()
  startCursor: Date;

  @Field()
  endCursor: Date;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}
