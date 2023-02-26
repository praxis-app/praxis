import { Field, InterfaceType } from "@nestjs/graphql";

@InterfaceType()
export abstract class BaseError {
  @Field()
  message: string;
}
