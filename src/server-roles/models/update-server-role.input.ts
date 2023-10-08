import { Field, InputType, Int } from '@nestjs/graphql';
import { ServerRolePermissionInput } from './server-role-permission.input';

@InputType()
export class UpdateServerRoleInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => [Int], { nullable: true })
  selectedUserIds?: number[];

  @Field(() => ServerRolePermissionInput, { nullable: true })
  permissions?: ServerRolePermissionInput;
}
