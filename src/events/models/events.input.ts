import { Field, InputType } from '@nestjs/graphql';

export enum EventTimeFrame {
  Past = 'past',
  Future = 'future',
  ThisWeek = 'this-week',
}

@InputType()
export class EventsInput {
  @Field({ nullable: true })
  timeFrame?: string;

  @Field({ nullable: true })
  online?: boolean;
}
