import { Field, InputType, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class CreatePostInput {
  @Field(() => Int, { nullable: true })
  groupId: number;

  @Field(() => Int, { nullable: true })
  eventId: number;

  @Field({ nullable: true })
  body: string;

  @Field(() => [GraphQLUpload], { nullable: true })
  images?: Promise<FileUpload>[];
}
