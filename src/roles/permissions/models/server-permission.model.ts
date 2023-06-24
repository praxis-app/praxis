import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "../../models/role.model";
import { ServerRole } from "../../models/server-role.model";

@Entity()
@ObjectType()
export class ServerPermission {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  @Field()
  manageRoles: boolean;

  @Column({ default: false })
  @Field()
  managePosts: boolean;

  @Column({ default: false })
  @Field()
  manageComments: boolean;

  @Column({ default: false })
  @Field()
  manageEvents: boolean;

  @Column({ default: false })
  @Field()
  manageInvites: boolean;

  @Column({ default: false })
  @Field()
  createInvites: boolean;

  @Column({ default: false })
  @Field()
  banMembers: boolean;

  @Field(() => ServerRole)
  @OneToOne(() => ServerRole, (serverRole) => serverRole.serverPermission, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  role: Role;

  @Column()
  roleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
