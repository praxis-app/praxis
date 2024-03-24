import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { LoginInput } from '../../auth/models/login.input';

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
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const ctx = this.getContext(context);
    return { req: ctx.req, res: ctx.res };
  }

  async getTracker(req: LoginRequest) {
    return req.ips.length ? req.ips[0] : req.ip;
  }

  async getErrorMessage(context: ExecutionContext) {
    const ctx = this.getContext(context);
    console.log(ctx.req.body.variables.input.email);
    return 'Too many requests';
  }

  private getContext(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    return gqlCtx.getContext<LoginContext>();
  }
}
