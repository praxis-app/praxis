import { Field, InputType, Int } from "@nestjs/graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload";

@InputType()
export class ProposalActionEventInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  online: boolean;

  @Field({ nullable: true })
  externalLink?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  coverPhoto?: Promise<FileUpload>;

  @Field(() => Int)
  hostUserId: number;

  @Field()
  startsAt: Date;

  @Field({ nullable: true })
  endsAt?: Date;
}
