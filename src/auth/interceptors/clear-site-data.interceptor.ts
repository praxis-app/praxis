import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class ClearSiteDataInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlExecutionContext = GqlExecutionContext.create(context);
    const response: Response = gqlExecutionContext.getContext().res;
    response.setHeader('Clear-Site-Data', '"storage"');
    return next.handle();
  }
}
