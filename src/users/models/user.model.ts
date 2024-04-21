// TODO: Add one to one relations for profile picture and cover photo

import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../../chat/models/message.model';
import { Comment } from '../../comments/models/comment.model';
import { EventAttendee } from '../../events/models/event-attendee.model';
import { GroupRole } from '../../groups/group-roles/models/group-role.model';
import { GroupMemberRequest } from '../../groups/models/group-member-request.model';
import { Group } from '../../groups/models/group.model';
import { Image } from '../../images/models/image.model';
import { Like } from '../../likes/models/like.model';
import { Notification } from '../../notifications/models/notification.model';
import { Post } from '../../posts/models/post.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { ProposalActionRoleMember } from '../../proposals/proposal-actions/models/proposal-action-role-member.model';
import { ServerInvite } from '../../server-invites/models/server-invite.model';
import { ServerRole } from '../../server-roles/models/server-role.model';
import { QuestionnaireTicket } from '../../vibe-check/models/questionnaire-ticket.model';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ unique: true })
  @Field()
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Column({ unique: true })
  @Field()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  bio: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: false })
  locked: boolean;

  @Column({ nullable: true, type: 'varchar' })
  resetPasswordToken: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordSentAt: Date | null;

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

  @OneToMany(() => Comment, (comment) => comment.user, {
    cascade: true,
  })
  @Field(() => [Comment])
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.user, {
    cascade: true,
  })
  @Field(() => [Like])
  likes: Like[];

  @OneToMany(() => Message, (message) => message.user, {
    cascade: true,
  })
  @Field(() => [Message])
  messages: Message[];

  @OneToMany(() => Image, (image) => image.user, {
    cascade: true,
  })
  images: Image[];

  @Field(() => Image)
  profilePicture: Image;

  @Field(() => Image, { nullable: true })
  coverPhoto: Image;

  @ManyToMany(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  @JoinTable()
  followers: User[];

  @ManyToMany(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  following: User[];

  @ManyToMany(() => Group, (group) => group.members, { onDelete: 'CASCADE' })
  groups: Group[];

  @OneToMany(
    () => GroupMemberRequest,
    (groupMemberRequest) => groupMemberRequest.user,
    {
      cascade: true,
    },
  )
  groupMemberRequests: GroupMemberRequest[];

  @ManyToMany(() => ServerRole, (serverRole) => serverRole.members, {
    onDelete: 'CASCADE',
  })
  serverRoles: ServerRole[];

  @ManyToMany(() => GroupRole, (groupRole) => groupRole.members, {
    onDelete: 'CASCADE',
  })
  groupRoles: GroupRole[];

  @OneToMany(() => EventAttendee, (eventAttendee) => eventAttendee.user, {
    cascade: true,
  })
  eventAttendees: EventAttendee[];

  @OneToMany(() => ProposalActionRoleMember, (roleMember) => roleMember.user, {
    cascade: true,
  })
  proposalActionRoleMembers: ProposalActionRoleMember[];

  @OneToMany(() => ServerInvite, (serverInvite) => serverInvite.user, {
    cascade: true,
  })
  serverInvites: ServerInvite[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: true,
  })
  notifications: Notification[];

  @OneToMany(
    () => QuestionnaireTicket,
    (questionnaireTicket) => questionnaireTicket.user,
    { cascade: true },
  )
  questionnaireTickets: QuestionnaireTicket[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
