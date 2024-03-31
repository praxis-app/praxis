import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ResetPasswordInput {
  @Field()
  password: string;

  @Field()
  confirmPassword: string;

  @Field({ nullable: true })
  resetPasswordToken?: string;
}
