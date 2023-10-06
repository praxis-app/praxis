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
import { Image } from '../../../images/models/image.model';
import { Proposal } from '../../models/proposal.model';
import { ProposalActionEvent } from '../proposal-action-events/models/proposal-action-event.model';
import { ProposalActionRole } from '../proposal-action-roles/models/proposal-action-role.model';

@Entity()
@ObjectType()
export class ProposalAction {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field()
  actionType: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  groupName?: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  groupDescription?: string;

  @OneToMany(() => Image, (image) => image.proposalAction)
  images: Image[];

  @Field(() => ProposalActionRole, { nullable: true })
  @OneToOne(
    () => ProposalActionRole,
    (proposedRole) => proposedRole.proposalAction,
    {
      cascade: true,
      nullable: true,
    },
  )
  role?: ProposalActionRole;

  @Field(() => ProposalActionEvent, { nullable: true })
  @OneToOne(
    () => ProposalActionEvent,
    (proposalActionEvent) => proposalActionEvent.proposalAction,
    {
      cascade: true,
      nullable: true,
    },
  )
  event?: ProposalActionEvent;

  @Field(() => Proposal)
  @OneToOne(() => Proposal, (proposal) => proposal.action, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  proposal: Proposal;

  @Column()
  proposalId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
