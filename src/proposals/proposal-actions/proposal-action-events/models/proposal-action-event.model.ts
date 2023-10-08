import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Image } from '../../../../images/models/image.model';
import { ProposalAction } from '../../models/proposal-action.model';
import { ProposalActionEventHost } from './proposal-action-event-host.model';

@Entity()
@ObjectType()
export class ProposalActionEvent {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  location?: string;

  @Column({ default: false })
  @Field()
  online: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  externalLink?: string;

  @Field(() => [ProposalActionEventHost])
  @OneToMany(
    () => ProposalActionEventHost,
    (proposalActionEventHost) => proposalActionEventHost.proposalActionEvent,
  )
  hosts: ProposalActionEventHost[];

  @OneToMany(() => Image, (image) => image.proposalActionEvent)
  images: Image[];

  @Field(() => ProposalAction)
  @OneToOne(() => ProposalAction, (proposalAction) => proposalAction.event, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  proposalAction: ProposalAction;

  @Column()
  proposalActionId: number;

  @Column()
  @Field()
  startsAt: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  endsAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
