import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class ServerConfig {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ nullable: true })
  @Field({ nullable: true })
  securityTxt?: string;

  @Column({ default: false })
  @Field()
  showCanaryStatement: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  serverQuestionsPrompt?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
