import { Field, InputType } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class SignUpInput {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  password: string;

  @Field()
  confirmPassword: string;

  @Field(() => GraphQLUpload, { nullable: true })
  profilePicture?: Promise<FileUpload>;

  @Field({ nullable: true })
  inviteToken?: string;
}
