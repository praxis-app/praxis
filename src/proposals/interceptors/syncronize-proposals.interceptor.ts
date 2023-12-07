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

enum CronJobName {
  CheckVotingTimeLimit = 'checkVotingTimeLimit',
  DisableVotingTimeLimitCheck = 'disableVotingTimeLimitCheck',
}

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
      CronJobName.CheckVotingTimeLimit,
    );
    const isTimeoutPresent = this.schedulerRegistry.doesExist(
      'timeout',
      CronJobName.DisableVotingTimeLimitCheck,
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

    this.schedulerRegistry.addCronJob(CronJobName.CheckVotingTimeLimit, job);
    job.start();
  }

  addTimeout() {
    const callback = () => {
      this.schedulerRegistry.deleteCronJob(CronJobName.CheckVotingTimeLimit);
    };
    const timeout = setTimeout(callback, 1000 * 5);
    this.schedulerRegistry.addTimeout(
      CronJobName.DisableVotingTimeLimitCheck,
      timeout,
    );
  }

  deleteTimeout() {
    this.schedulerRegistry.deleteTimeout(
      CronJobName.DisableVotingTimeLimitCheck,
    );
  }

  resetTimeout() {
    this.deleteTimeout();
    this.addTimeout();
  }
}
