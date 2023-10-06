import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ServerRole } from './server-role.model';

@Entity()
@ObjectType()
export class ServerRolePermission {
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
  removeMembers: boolean;

  @Field(() => ServerRole)
  @OneToOne(() => ServerRole, (serverRole) => serverRole.permission, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  serverRole: ServerRole;

  @Column()
  serverRoleId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
