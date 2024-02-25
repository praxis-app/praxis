import { Field, InputType } from '@nestjs/graphql';
import { Matches } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { VALID_NAME_CHARACTERS } from '../../common/common.constants';

@InputType()
export class UpdateUserInput {
  @Field()
  @Matches(VALID_NAME_CHARACTERS, {
    message: 'Usernames cannot contain special characters',
  })
  name: string;

  @Field()
  bio: string;

  @Field(() => GraphQLUpload, { nullable: true })
  profilePicture?: Promise<FileUpload>;

  @Field(() => GraphQLUpload, { nullable: true })
  coverPhoto?: Promise<FileUpload>;
}
