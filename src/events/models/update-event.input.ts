import { Field, InputType, Int } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class UpdateEventInput {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => GraphQLUpload, { nullable: true })
  coverPhoto?: Promise<FileUpload>;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  online?: boolean;

  @Field({ nullable: true })
  externalLink?: string;

  @Field(() => Int, { nullable: true })
  hostId?: number;

  @Field()
  startsAt: Date;

  @Field({ nullable: true })
  endsAt?: Date;
}
