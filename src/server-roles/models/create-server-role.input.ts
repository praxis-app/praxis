import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateServerRoleInput {
  @Field()
  name: string;

  @Field()
  color: string;
}
