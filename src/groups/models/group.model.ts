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
import { FeedItem } from '../../common/models/feed-item.union';
import { Event } from '../../events/models/event.model';
import { Image } from '../../images/models/image.model';
import { Post } from '../../posts/models/post.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { User } from '../../users/models/user.model';
import { GroupConfig } from '../group-configs/models/group-config.model';
import { GroupMemberRequest } from '../group-member-requests/models/group-member-request.model';
import { GroupRole } from '../group-roles/models/group-role.model';

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

  @Field(() => [FeedItem])
  feed: Array<typeof FeedItem>;

  @Field(() => [Post])
  @OneToMany(() => Post, (post) => post.group, {
    cascade: true,
  })
  posts: Post[];

  @Field(() => [Proposal])
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

  @Field(() => [GroupRole])
  @OneToMany(() => GroupRole, (role) => role.group, {
    cascade: true,
  })
  roles: GroupRole[];

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
