import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class UpdateEventInput {
  @Field(() => Int)
  id: number;

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
}
