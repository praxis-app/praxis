import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Group } from "../../groups/models/group.model";
import { Image } from "../../images/models/image.model";
import { User } from "../../users/models/user.model";
import { Vote } from "../../votes/models/vote.model";
import { ProposalStages } from "../proposals.constants";
import { ProposalAction } from "../proposal-actions/models/proposal-action.model";

@Entity()
@ObjectType()
export class Proposal {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  body?: string;

  @OneToOne(() => ProposalAction, (action) => action.proposal, {
    cascade: true,
  })
  @Field(() => ProposalAction)
  action: ProposalAction;

  @Column({ default: ProposalStages.Voting })
  @Field()
  stage: string;

  @Field(() => [Vote])
  @OneToMany(() => Vote, (vote) => vote.proposal, {
    cascade: true,
  })
  votes: Vote[];

  @OneToMany(() => Image, (image) => image.proposal, {
    cascade: true,
  })
  @Field(() => [Image])
  images: Image[];

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.proposals, { onDelete: "CASCADE" })
  user: User;

  @Column()
  userId: number;

  @Field(() => Group, { nullable: true })
  @ManyToOne(() => Group, (group) => group.proposals, { onDelete: "CASCADE" })
  group: Group;

  @Column({ nullable: true })
  groupId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
