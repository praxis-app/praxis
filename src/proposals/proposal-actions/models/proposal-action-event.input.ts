import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class ProposalActionEventInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsNotEmpty()
  description: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  online?: boolean;

  @Field({ nullable: true })
  externalLink?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  coverPhoto?: Promise<FileUpload>;

  @Field(() => Int)
  hostId: number;

  @Field()
  startsAt: Date;

  @Field({ nullable: true })
  endsAt?: Date;
}
