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
  SynchronizeProposals = 'synchronize-proposals',
  DisableSynchronizeProposals = 'disable-synchronize-proposals',
}

@Injectable()
export class SynchronizeProposalsInterceptor implements NestInterceptor {
  constructor(
    private proposalsService: ProposalsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    const isJobPresent = this.schedulerRegistry.doesExist(
      'cron',
      CronJobName.SynchronizeProposals,
    );
    const isTimeoutPresent = this.schedulerRegistry.doesExist(
      'timeout',
      CronJobName.DisableSynchronizeProposals,
    );

    if (!isJobPresent) {
      this.addCronJob();
    }

    if (isTimeoutPresent) {
      this.resetTimeout();
    } else {
      this.addTimeout();
    }

    return next.handle();
  }

  addCronJob() {
    const job = new CronJob(CronExpression.EVERY_5_MINUTES, async () => {
      await this.proposalsService.synchronizeProposals();
    });

    this.schedulerRegistry.addCronJob(CronJobName.SynchronizeProposals, job);
    job.start();
  }

  addTimeout() {
    const callback = () =>
      this.schedulerRegistry.deleteCronJob(CronJobName.SynchronizeProposals);

    const timeout = setTimeout(callback, 1000 * 60 * 60);
    this.schedulerRegistry.addTimeout(
      CronJobName.DisableSynchronizeProposals,
      timeout,
    );
  }

  resetTimeout() {
    this.schedulerRegistry.deleteTimeout(
      CronJobName.DisableSynchronizeProposals,
    );
    this.addTimeout();
  }
}
