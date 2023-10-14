import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SetAuthCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((accessToken: string) => {
        const ctx = GqlExecutionContext.create(context).getContext();
        const body = { access_token: accessToken };

        ctx.req.res.cookie('auth', body, {
          httpOnly: true,
          sameSite: true,
          secure: true,
        });
        return true;
      }),
    );
  }
}
