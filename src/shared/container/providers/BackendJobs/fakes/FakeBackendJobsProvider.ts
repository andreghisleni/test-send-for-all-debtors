import { IBackendJobsProvider } from '../models/IBackendJobsProvider';

interface IQueue {
  bull: any; // eslint-disable-line
  name: string;
  handle: any; // eslint-disable-line
}

export class FakeBackendJobsProvider implements IBackendJobsProvider {
  queues: IQueue[] = [];

  // eslint-disable-next-line
  addQueue(name: string, data: unknown): Promise<any> {
    // eslint-disable-line
    this.queues.push({
      bull: '',
      name,
      handle: data,
    });
    return Promise.resolve(data);
  }
  processQueue(): void {
    // eslint-disable-line
  }
}
