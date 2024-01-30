import {
  Args,
  Context,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Comment } from '../../comments/models/comment.model';
import { Dataloaders } from '../../dataloader/dataloader.types';
import { Like } from '../../likes/models/like.model';
import { User } from '../../users/models/user.model';
import { Answer } from '../models/answer.model';
import { QuestionsService } from '../questions.service';

@Resolver(() => Answer)
export class AnswersResolver {
  constructor(private questionsService: QuestionsService) {}

  @Query(() => Answer)
  async answer(@Args('id', { type: () => Int }) id: number) {
    return this.questionsService.getAnswer({ id });
  }

  @ResolveField(() => [Like])
  async likes(@Parent() { id }: Answer) {
    return this.questionsService.getAnswerLikes(id);
  }

  @ResolveField(() => User)
  async user(@Parent() { id }: Answer) {
    return this.questionsService.getAnswerUser(id);
  }

  @ResolveField(() => Int)
  async likeCount(@Parent() { id }: Answer) {
    return this.questionsService.getAnswerLikeCount(id);
  }

  @ResolveField(() => Boolean)
  async isLikedByMe(
    @Context() { loaders }: { loaders: Dataloaders },
    @CurrentUser() user: User,
    @Parent() { id }: Answer,
  ) {
    return loaders.isAnswerLikedByMeLoader.load({
      currentUserId: user.id,
      answerId: id,
    });
  }

  @ResolveField(() => [Comment])
  async comments(@Parent() { id }: Answer) {
    return this.questionsService.getAnswerComments(id);
  }

  @ResolveField(() => Int)
  async commentCount(@Parent() { id }: Answer) {
    return this.questionsService.getAnswerCommentCount(id);
  }
}
