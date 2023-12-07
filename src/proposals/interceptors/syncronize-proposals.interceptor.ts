// TODO: Update cron time and timeout after testing

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { Observable } from 'rxjs';
import { ProposalsService } from '../proposals.service';
import { logTime } from '../../shared/shared.utils';

@Injectable()
export class SyncronizeProposalsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SyncronizeProposalsInterceptor.name);

  constructor(
    private proposalsService: ProposalsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

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
    const job = new CronJob(CronExpression.EVERY_SECOND, async () => {
      logTime('Syncronizing all proposal stages', this.logger);
      await this.proposalsService.syncronizeAllProposalStages();
      logTime('Syncronizing all proposal stages', this.logger);
    });

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
