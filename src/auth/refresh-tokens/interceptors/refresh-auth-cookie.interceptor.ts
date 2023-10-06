import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthTokens } from '../../auth.types';

@Injectable()
export class RefreshAuthCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((authTokens: AuthTokens) => {
        const ctx = GqlExecutionContext.create(context).getContext();
        ctx.req.res.cookie('auth', authTokens, {
          httpOnly: true,
          sameSite: true,
          secure: true,
        });
        return true;
      }),
    );
  }
}
