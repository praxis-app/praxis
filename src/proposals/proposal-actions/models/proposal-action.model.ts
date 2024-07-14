import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
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
import { ProposalActionType } from '../../proposals.constants';
import { ProposalActionEvent } from './proposal-action-event.model';
import { ProposalActionGroupConfig } from './proposal-action-group-config.model';
import { ProposalActionRole } from './proposal-action-role.model';

registerEnumType(ProposalActionType, {
  name: 'ProposalActionType',
});

@Entity()
@ObjectType()
export class ProposalAction {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ type: 'varchar' })
  @Field(() => ProposalActionType)
  actionType: ProposalActionType;

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

  @OneToOne(
    () => ProposalActionGroupConfig,
    (proposalActionGroupConfig) => proposalActionGroupConfig.proposalAction,
    {
      cascade: true,
      nullable: true,
    },
  )
  groupConfig?: ProposalActionGroupConfig;

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
