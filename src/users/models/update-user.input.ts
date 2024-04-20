import { Field, InputType } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class UpdateUserInput {
  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field()
  bio: string;

  @Field(() => GraphQLUpload, { nullable: true })
  profilePicture?: Promise<FileUpload>;

  @Field(() => GraphQLUpload, { nullable: true })
  coverPhoto?: Promise<FileUpload>;
}
