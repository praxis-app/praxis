import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Notification } from '../../notifications/models/notification.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { QuestionnaireTicket } from '../../vibe-check/models/questionnaire-ticket.model';
import { User } from '../../users/models/user.model';

@Entity()
@ObjectType()
export class Vote {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field()
  voteType: string;

  @ManyToOne(() => Proposal, (proposal) => proposal.votes, {
    onDelete: 'CASCADE',
  })
  proposal?: Proposal;

  @Column({ nullable: true })
  proposalId?: number;

  @ManyToOne(
    () => QuestionnaireTicket,
    (questionnaireTicket) => questionnaireTicket.votes,
    {
      onDelete: 'CASCADE',
    },
  )
  questionnaireTicket?: QuestionnaireTicket;

  @Column({ nullable: true })
  questionnaireTicketId?: number;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Notification, (notification) => notification.vote)
  notifications: Notification[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
