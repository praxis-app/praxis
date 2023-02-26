import { ObjectType } from "@nestjs/graphql";
import { BaseError } from "./base-error.interface";

@ObjectType({
  implements: () => [BaseError],
})
export class ValidationError implements BaseError {
  constructor(message: string) {
    this.message = message;
  }
  message: string;
}
