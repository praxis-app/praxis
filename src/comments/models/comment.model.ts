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
import { Image } from '../../images/models/image.model';
import { Like } from '../../likes/models/like.model';
import { Notification } from '../../notifications/models/notification.model';
import { Post } from '../../posts/models/post.model';
import { Proposal } from '../../proposals/models/proposal.model';
import { Question } from '../../questions/models/question.model';
import { QuestionnaireTicket } from '../../questions/models/questionnaire-ticket.model';
import { User } from '../../users/models/user.model';

@Entity()
@ObjectType()
export class Comment {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  body?: string;

  @Field(() => [Image])
  @OneToMany(() => Image, (image) => image.post)
  images: Image[];

  @OneToMany(() => Like, (like) => like.comment)
  likes: Like[];

  @OneToMany(() => Notification, (notification) => notification.comment)
  notifications: Notification[];

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  post?: Post;

  @Column({ nullable: true })
  postId?: number;

  @ManyToOne(() => Proposal, (proposal) => proposal.comments, {
    onDelete: 'CASCADE',
  })
  proposal?: Proposal;

  @Column({ nullable: true })
  proposalId?: number;

  @ManyToOne(() => Question, (question) => question.comments, {
    onDelete: 'CASCADE',
  })
  question?: Question;

  @Column({ nullable: true })
  questionId?: number;

  @ManyToOne(
    () => QuestionnaireTicket,
    (questionnaireTicket) => questionnaireTicket.comments,
    { onDelete: 'CASCADE' },
  )
  questionnaireTicket?: QuestionnaireTicket;

  @Column({ nullable: true })
  questionnaireTicketId?: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
