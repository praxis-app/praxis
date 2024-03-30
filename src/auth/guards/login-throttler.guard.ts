import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { Request } from 'express';
import { LoginInput } from '../../auth/models/login.input';
import { normalizeText } from '../../common/common.utils';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';

interface LoginRequest extends Request {
  body: {
    variables: { input: LoginInput };
  };
}

interface LoginContext extends ExecutionContext {
  req: LoginRequest;
  res: Response;
}

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    private usersService: UsersService,
    private authService: AuthService,
    reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  getRequestResponse(context: ExecutionContext) {
    const ctx = this.getContext(context);
    return { req: ctx.req, res: ctx.res };
  }

  async getTracker({ body }: LoginRequest) {
    const { email } = body.variables.input;
    return normalizeText(email);
  }

  async getErrorMessage(context: ExecutionContext) {
    const ctx = this.getContext(context);
    const { email } = ctx.req.body.variables.input;
    const user = await this.usersService.getUser({ email });

    if (user && !user.locked) {
      await this.usersService.lockUserAccount(user.id);
      await this.authService.sendPasswordResetEmail(user);
    }

    return 'Incorrect username or password';
  }

  private getContext(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    return gqlCtx.getContext<LoginContext>();
  }
}
