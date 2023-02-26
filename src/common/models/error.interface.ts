import { Field, InterfaceType } from "@nestjs/graphql";

@InterfaceType()
export abstract class Error {
  @Field()
  message: string;
}
