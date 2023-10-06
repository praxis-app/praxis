import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/models/user.model';
import { ServerRolePermission } from './server-role-permission.model';

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

  @OneToOne(() => ServerRolePermission, (permission) => permission.serverRole, {
    cascade: true,
  })
  permission: ServerRolePermission;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.serverRoles)
  @JoinTable()
  members: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
