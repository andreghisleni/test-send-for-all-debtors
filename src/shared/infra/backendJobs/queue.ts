import { inject, injectable } from 'tsyringe';

import { IBackendJobsProvider } from '@shared/container/providers/BackendJobs/models/IBackendJobsProvider';

@injectable()
export class Queue {
  constructor(
    @inject('BackendJobsProvider')
    private backendJobsProvider: IBackendJobsProvider,
  ) {}

  run(): void {
    return this.backendJobsProvider.processQueue();
  }
  queues = this.backendJobsProvider.queues;
}
