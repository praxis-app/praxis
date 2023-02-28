import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { User } from "../../users/models/user.model";
import { AuthTokens } from "../auth.service";

export interface SetAuthCookieInput {
  authTokens: AuthTokens;
  user: Omit<User, "password">;
  userCount?: number;
}

@Injectable()
export class SetAuthCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(({ authTokens, ...userData }: SetAuthCookieInput) => {
        const ctx = GqlExecutionContext.create(context).getContext();
        ctx.req.res.cookie("auth", authTokens, {
          httpOnly: true,
          sameSite: true,
          secure: true,
        });
        return userData;
      })
    );
  }
}
