// TODO: Add pipes for group validation

import { Field, InputType, Int } from '@nestjs/graphql';
import { Matches } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { VALID_NAME_CHARACTERS } from '../../shared/shared.constants';

@InputType()
export class UpdateGroupInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  @Matches(VALID_NAME_CHARACTERS, {
    message: 'Group names cannot contain special characters',
  })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  coverPhoto?: Promise<FileUpload>;
}
