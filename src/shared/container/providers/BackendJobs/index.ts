import { container } from 'tsyringe';

import { BullBackendJobsProvider } from './implementations/BullBackendJobsProvider';
import { IBackendJobsProvider } from './models/IBackendJobsProvider';

container.registerInstance<IBackendJobsProvider>(
  'BackendJobsProvider',
  container.resolve(BullBackendJobsProvider),
);
