import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class CreateEventInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsNotEmpty()
  description: string;

  @Field(() => GraphQLUpload, { nullable: true })
  coverPhoto?: Promise<FileUpload>;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  online?: boolean;

  @Field({ nullable: true })
  externalLink?: string;

  @Field()
  startsAt: Date;

  @Field({ nullable: true })
  endsAt?: Date;

  @Field(() => Int, { nullable: true })
  groupId?: number;

  @Field(() => Int)
  hostId: number;
}
