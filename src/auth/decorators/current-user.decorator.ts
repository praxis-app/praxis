import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

export const CurrentUser = createParamDecorator<
  unknown,
  ExecutionContext,
  User
>((_, context) => {
  const executionContext = GqlExecutionContext.create(context);
  const ctx = executionContext.getContext();
  return ctx.user;
});
