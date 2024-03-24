import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(GqlThrottlerGuard.name);

  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }

  protected async getTracker(req: Record<string, any>) {
    this.logger.log(
      `Getting tracker IP: ${req.ips.length ? req.ips[0] : req.ip}`,
    );
    this.logger.log(
      `X-Forwarded-For header: ${req?.headers['X-Forwarded-For']}`,
    );
    return req.ips.length ? req.ips[0] : req.ip;
  }

  protected async getErrorMessage() {
    return 'Too many requests';
  }
}
