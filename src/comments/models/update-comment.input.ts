import { Field, InputType, Int } from "@nestjs/graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload";

@InputType()
export class UpdateCommentInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  body?: number;

  @Field(() => [GraphQLUpload], { nullable: true })
  images?: Promise<FileUpload>[];
}
