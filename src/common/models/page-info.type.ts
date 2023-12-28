import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PageInfo {
  @Field({ nullable: true })
  startCursor?: Date;

  @Field({ nullable: true })
  endCursor?: Date;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}
