import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Group } from "../../groups/models/group.model";
import { Post } from "../../posts/models/post.model";
import { Proposal } from "../../proposals/models/proposal.model";
import { ProposalAction } from "../../proposals/proposal-actions/models/proposal-action.model";
import { User } from "../../users/models/user.model";

@ObjectType()
@Entity()
export class Image {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  filename: string;

  @Column({ nullable: true })
  @Field()
  imageType: string;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.images, {
    onDelete: "CASCADE",
  })
  post: Post;

  @Column({ nullable: true })
  postId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.images, {
    onDelete: "CASCADE",
  })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @Field(() => Group)
  @ManyToOne(() => Group, (group) => group.images, {
    onDelete: "CASCADE",
  })
  group: Group;

  @Column({ nullable: true })
  groupId: number;

  @Field(() => Proposal)
  @ManyToOne(() => Proposal, (proposal) => proposal.images, {
    onDelete: "CASCADE",
  })
  proposal: Proposal;

  @Column({ nullable: true })
  proposalId: number;

  @Field(() => ProposalAction)
  @OneToOne(
    () => ProposalAction,
    (proposalAction) => proposalAction.groupCoverPhoto,
    {
      onDelete: "CASCADE",
    }
  )
  @JoinColumn()
  proposalAction: ProposalAction;

  @Column({ nullable: true })
  proposalActionId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
