import { Field, InputType, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class SendMessageInput {
  @Field(() => Int)
  conversationId: number;

  @Field({ nullable: true })
  body?: string;

  @Field(() => [GraphQLUpload], { nullable: true })
  images?: Promise<FileUpload>[];
}
