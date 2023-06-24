import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/models/user.model";
import { ServerPermission } from "../permissions/models/server-permission.model";

@Entity()
@ObjectType()
export class ServerRole {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  color: string;

  @OneToOne(() => ServerPermission, (permission) => permission.role, {
    cascade: true,
  })
  serverPermission: ServerPermission;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable()
  members: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
