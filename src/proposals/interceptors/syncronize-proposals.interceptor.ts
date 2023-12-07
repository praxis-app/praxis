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
  SyncronizeProposals = 'syncronize-proposals',
  DisableSyncronizeProposals = 'disable-syncronize-proposals',
}

@Injectable()
export class SyncProposalsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SyncProposalsInterceptor.name);

  constructor(
    private proposalsService: ProposalsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    const isJobPresent = this.schedulerRegistry.doesExist(
      'cron',
      CronJobName.SyncronizeProposals,
    );
    const isTimeoutPresent = this.schedulerRegistry.doesExist(
      'timeout',
      CronJobName.DisableSyncronizeProposals,
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
      const logTimeMessage = 'Syncronizing proposals';
      logTime(logTimeMessage, this.logger);
      await this.proposalsService.syncronizeProposals();
      logTime(logTimeMessage, this.logger);
    });

    this.schedulerRegistry.addCronJob(CronJobName.SyncronizeProposals, job);
    job.start();
  }

  addTimeout() {
    const callback = () => {
      this.schedulerRegistry.deleteCronJob(CronJobName.SyncronizeProposals);
    };
    const timeout = setTimeout(callback, 1000 * 5);
    this.schedulerRegistry.addTimeout(
      CronJobName.DisableSyncronizeProposals,
      timeout,
    );
  }

  deleteTimeout() {
    this.schedulerRegistry.deleteTimeout(
      CronJobName.DisableSyncronizeProposals,
    );
  }

  resetTimeout() {
    this.deleteTimeout();
    this.addTimeout();
  }
}
