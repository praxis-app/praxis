import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Comment } from '../../comments/models/comment.model';
import { Like } from '../../likes/models/like.model';
import { Answer } from '../models/answer.model';
import { Question } from '../models/question.model';
import { QuestionsService } from '../questions.service';

@Resolver(() => Answer)
export class AnswersResolver {
  constructor(private questionsService: QuestionsService) {}

  @Query(() => Answer)
  async answer(@Args('id', { type: () => Int }) id: number) {
    return this.questionsService.getAnswer({ id });
  }

  @ResolveField(() => [Like])
  async likes(@Parent() { id }: Question) {
    return this.questionsService.getAnswerLikes(id);
  }

  @ResolveField(() => Int)
  async likeCount(@Parent() { id }: Question) {
    return this.questionsService.getAnswerLikeCount(id);
  }

  @ResolveField(() => [Comment])
  async comments(@Parent() { id }: Question) {
    return this.questionsService.getAnswerComments(id);
  }

  @ResolveField(() => Int)
  async commentCount(@Parent() { id }: Question) {
    return this.questionsService.getAnswerCommentCount(id);
  }
}
