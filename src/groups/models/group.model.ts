// TODO: Add one to one relation for cover photo

import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../../events/models/event.model';
import { Image } from '../../images/models/image.model';
import { Notification } from '../../notifications/models/notification.model';
import { Post } from '../../posts/models/post.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { Rule } from '../../rules/models/rule.model';
import { User } from '../../users/models/user.model';
import { GroupRole } from '../group-roles/models/group-role.model';
import { GroupConfig } from './group-config.model';
import { GroupMemberRequest } from './group-member-request.model';
import { Conversation } from '../../chat/models/conversation.model';

@Entity()
@ObjectType()
export class Group {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  @Column({ default: false })
  @Field()
  isDefault: boolean;

  @OneToMany(() => Post, (post) => post.group, {
    cascade: true,
  })
  posts: Post[];

  @OneToMany(() => Proposal, (proposal) => proposal.group, {
    cascade: true,
  })
  proposals: Proposal[];

  @OneToMany(() => Event, (event) => event.group, {
    cascade: true,
  })
  events: Event[];

  @OneToMany(() => Image, (image) => image.group, {
    cascade: true,
  })
  images: Image[];

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.groups)
  @JoinTable()
  members: User[];

  // TODO: Determine why group member requests are set as nullable
  @Field(() => [GroupMemberRequest], { nullable: true })
  @OneToMany(() => GroupMemberRequest, (memberRequest) => memberRequest.group, {
    cascade: true,
  })
  memberRequests: GroupMemberRequest[];

  @OneToMany(() => Conversation, (conversation) => conversation.group, {
    cascade: true,
  })
  conversations: Conversation[];

  @Field(() => [GroupRole])
  @OneToMany(() => GroupRole, (role) => role.group, {
    cascade: true,
  })
  roles: GroupRole[];

  @OneToMany(() => Notification, (notification) => notification.group)
  notifications: Notification[];

  @OneToMany(() => Rule, (rule) => rule.group, {
    cascade: true,
  })
  rules: Rule[];

  @OneToOne(() => GroupConfig, (groupConfig) => groupConfig.group, {
    cascade: true,
  })
  config: GroupConfig;

  @Field(() => Image, { nullable: true })
  coverPhoto: Image;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
