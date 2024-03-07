import { Field, InputType, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class UpdateGroupInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  coverPhoto?: Promise<FileUpload>;
}
