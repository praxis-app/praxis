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
import { ProposalsService } from '../proposals.service';

enum CronJobName {
  synchronizeProposals = 'synchronize-proposals',
  DisablesynchronizeProposals = 'disable-synchronize-proposals',
}

@Injectable()
export class SyncProposalsInterceptor implements NestInterceptor {
  constructor(
    private proposalsService: ProposalsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    const isJobPresent = this.schedulerRegistry.doesExist(
      'cron',
      CronJobName.synchronizeProposals,
    );
    const isTimeoutPresent = this.schedulerRegistry.doesExist(
      'timeout',
      CronJobName.DisablesynchronizeProposals,
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
    const job = new CronJob(CronExpression.EVERY_5_MINUTES, async () => {
      await this.proposalsService.synchronizeProposals();
    });

    this.schedulerRegistry.addCronJob(CronJobName.synchronizeProposals, job);
    job.start();
  }

  addTimeout() {
    const callback = () =>
      this.schedulerRegistry.deleteCronJob(CronJobName.synchronizeProposals);

    const timeout = setTimeout(callback, 1000 * 60 * 60 * 1);
    this.schedulerRegistry.addTimeout(
      CronJobName.DisablesynchronizeProposals,
      timeout,
    );
  }

  deleteTimeout() {
    this.schedulerRegistry.deleteTimeout(
      CronJobName.DisablesynchronizeProposals,
    );
  }

  resetTimeout() {
    this.deleteTimeout();
    this.addTimeout();
  }
}
