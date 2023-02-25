import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthenticationError } from "apollo-server-express";
import { Context } from "../../../common/common.types";
import { User } from "../../../users/models/user.model";
import { getSub } from "../../auth.utils";

export const RefreshTokenUser = createParamDecorator<
  unknown,
  ExecutionContext,
  Promise<User>
>(async (_, context) => {
  const executionContext = GqlExecutionContext.create(context);
  const {
    claims: { refreshTokenClaims },
    usersService,
  }: Context = executionContext.getContext();

  const sub = getSub(refreshTokenClaims);
  if (!sub) {
    throw new AuthenticationError("Refresh token malformed");
  }

  const user = await usersService.getUser({ id: sub });
  if (!user) {
    throw new AuthenticationError("User not found");
  }

  return user;
});
