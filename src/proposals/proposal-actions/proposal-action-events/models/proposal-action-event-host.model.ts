import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventAttendeeStatus } from "../../../../events/event-attendees/models/event-attendee.model";
import { User } from "../../../../users/models/user.model";
import { ProposalActionEvent } from "./proposal-action-event.model";

@ObjectType()
@Entity()
export class ProposalActionEventHost {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: EventAttendeeStatus.Host })
  @Field()
  status: string;

  @ManyToOne(() => User, (user) => user.eventAttendees, { onDelete: "CASCADE" })
  @Field(() => User)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => ProposalActionEvent, (event) => event.hosts, {
    onDelete: "CASCADE",
  })
  @Field(() => ProposalActionEvent)
  event: ProposalActionEvent;

  @Column()
  proposalActionEventId: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
