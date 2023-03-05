import { Field, InputType, Int } from "@nestjs/graphql";
import { FileUpload, GraphQLUpload } from "graphql-upload";

@InputType()
export class CreatePostInput {
  @Field(() => Int, { nullable: true })
  groupId: number;

  @Field({ nullable: true })
  body: string;

  @Field(() => [GraphQLUpload], { nullable: true })
  images?: Promise<FileUpload>[];
}
