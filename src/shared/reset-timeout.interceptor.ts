import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Observable } from 'rxjs';

@Injectable()
export class ResetTimeoutInterceptor implements NestInterceptor {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeout = this.schedulerRegistry.getTimeout(
      'disableVotingTimeLimitCheck',
    );

    if (timeout) {
      this.schedulerRegistry.deleteTimeout('disableVotingTimeLimitCheck');
    }

    const callback = () => {
      const job = this.schedulerRegistry.getCronJob('checkVotingTimeLimit');
      job.stop();
    };
    const newTimeout = setTimeout(callback, 1000 * 60 * 60 * 6);

    this.schedulerRegistry.addTimeout(
      'disableVotingTimeLimitCheck',
      newTimeout,
    );

    console.log('Got here 1');

    return next.handle();
  }
}
