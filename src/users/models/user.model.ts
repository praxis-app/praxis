// TODO: Add one to one relations for profile picture and cover photo

import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { RefreshToken } from "../../auth/refresh-tokens/models/refresh-token.model";
import { FeedItem } from "../../common/models/feed-item.union";
import { GroupMember } from "../../groups/group-members/models/group-member.model";
import { Image } from "../../images/models/image.model";
import { Like } from "../../likes/models/like.model";
import { Post } from "../../posts/models/post.model";
import { Proposal } from "../../proposals/models/proposal.model";
import { RoleMember } from "../../roles/role-members/models/role-member.model";
import { ServerInvite } from "../../server-invites/models/server-invite.model";

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ unique: true })
  @Field()
  name: string;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bio: string;

  @OneToMany(() => Post, (post) => post.user, {
    cascade: true,
  })
  @Field(() => [Post])
  posts: Post[];

  @OneToMany(() => Proposal, (proposal) => proposal.user, {
    cascade: true,
  })
  @Field(() => [Proposal])
  proposals: Proposal[];

  @OneToMany(() => Like, (like) => like.user, {
    cascade: true,
  })
  @Field(() => [Like])
  likes: Like[];

  @Field(() => [FeedItem])
  homeFeed: Array<typeof FeedItem>;

  @Field(() => [FeedItem])
  profileFeed: Array<typeof FeedItem>;

  @OneToMany(() => Image, (image) => image.user, {
    cascade: true,
  })
  images: Image[];

  @Field(() => Image)
  profilePicture: Image;

  @Field(() => Image, { nullable: true })
  coverPhoto: Image;

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.following)
  @JoinTable()
  followers: User[];

  @Field(() => [User])
  @ManyToMany(() => User, (user) => user.followers)
  following: User[];

  @OneToMany(() => GroupMember, (groupMember) => groupMember.user, {
    cascade: true,
  })
  groupMembers: GroupMember[];

  @OneToMany(() => RoleMember, (roleMember) => roleMember.user, {
    cascade: true,
  })
  roleMembers: RoleMember[];

  @OneToMany(() => ServerInvite, (serverInvite) => serverInvite.user, {
    cascade: true,
  })
  serverInvites: ServerInvite[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
  })
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
