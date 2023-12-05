// TODO: Update cron time and timeout after testing

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Observable } from 'rxjs';

@Injectable()
export class ResetTimeoutInterceptor implements NestInterceptor {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    const isJobPresent = this.schedulerRegistry.doesExist(
      'cron',
      'checkVotingTimeLimit',
    );
    const isTimeoutPresent = this.schedulerRegistry.doesExist(
      'timeout',
      'disableVotingTimeLimitCheck',
    );

    if (isTimeoutPresent) {
      this.resetTimeout();
    }

    if (!isTimeoutPresent) {
      this.addTimeout();
    }

    if (!isJobPresent) {
      this.addCronJob();
    }

    return next.handle();
  }

  addCronJob() {
    const job = new CronJob(CronExpression.EVERY_SECOND, () =>
      console.log('Checking voting time limit'),
    );

    this.schedulerRegistry.addCronJob('checkVotingTimeLimit', job);
    job.start();
  }

  addTimeout() {
    const callback = () => {
      this.schedulerRegistry.deleteCronJob('checkVotingTimeLimit');
    };
    const timeout = setTimeout(callback, 1000 * 5);
    this.schedulerRegistry.addTimeout('disableVotingTimeLimitCheck', timeout);
  }

  deleteTimeout() {
    this.schedulerRegistry.deleteTimeout('disableVotingTimeLimitCheck');
  }

  resetTimeout() {
    this.deleteTimeout();
    this.addTimeout();
  }
}
