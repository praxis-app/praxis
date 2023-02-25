import { Field, InputType } from "@nestjs/graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload";

@InputType()
export class ProposalActionInput {
  @Field()
  actionType: string;

  @Field({ nullable: true })
  groupName?: string;

  @Field({ nullable: true })
  groupDescription?: string;

  @Field(() => GraphQLUpload, { nullable: true })
  groupCoverPhoto?: Promise<FileUpload>;
}
