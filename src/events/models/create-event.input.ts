import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreateEventInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  online?: boolean;

  @Field({ nullable: true })
  externalLink?: string;

  @Field()
  startsAt: Date;

  @Field({ nullable: true })
  endsAt?: Date;

  @Field({ nullable: true })
  groupId?: number;
}
