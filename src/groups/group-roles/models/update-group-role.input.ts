import { Field, InputType, Int } from '@nestjs/graphql';
import { GroupRolePermissionInput } from './group-role-permission.input';

@InputType()
export class UpdateGroupRoleInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => [Int], { nullable: true })
  selectedUserIds?: number[];

  @Field(() => GroupRolePermissionInput, { nullable: true })
  permissions?: GroupRolePermissionInput;
}
