import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Context } from '../../../context/context.types';
import { User } from '../../../users/models/user.model';
import { getSub } from '../../auth.utils';
import { AuthenticationError } from '@nestjs/apollo';

export const RefreshTokenUser = createParamDecorator<
  unknown,
  ExecutionContext,
  Promise<User>
>(async (_, context) => {
  const executionContext = GqlExecutionContext.create(context);
  const {
    claims: { refreshTokenClaims },
    services: { usersService },
  }: Context = executionContext.getContext();

  const sub = getSub(refreshTokenClaims);
  if (!sub) {
    throw new AuthenticationError('Refresh token malformed');
  }

  const user = await usersService.getUser({ id: sub });
  if (!user) {
    throw new AuthenticationError('User not found');
  }

  return user;
});
