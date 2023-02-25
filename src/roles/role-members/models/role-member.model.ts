import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../../users/models/user.model";
import { Role } from "../../models/role.model";

@Entity()
@ObjectType()
export class RoleMember {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Role, (role) => role.members, { onDelete: "CASCADE" })
  @Field(() => Role)
  role: Role;

  @Column()
  roleId: number;

  @ManyToOne(() => User, (user) => user.roleMembers, {
    onDelete: "CASCADE",
  })
  @Field(() => User)
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
