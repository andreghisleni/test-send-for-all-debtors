import Queue from 'bull';

interface IQueue {
  bull: Queue.Queue;
  name: string;
  handle: any;// eslint-disable-line
}

export interface IBackendJobsProvider {
  queues: IQueue[];
  addQueue(name: string, data: unknown): Promise<Queue.Job<any>> | undefined;// eslint-disable-line
  processQueue(): void;
}
