import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class SignUpInput {
  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  password: string;

  @Field()
  inviteToken: string;
}
