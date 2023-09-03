import { container } from 'tsyringe';

import { PuppeteerNavigatorProvider } from './implementations/PuppeteerNavigatorProvider';
import { INavigatorProvider } from './models/INavigatorProvider';

const providers = {
  puppeteer: PuppeteerNavigatorProvider,
};

container.registerSingleton<INavigatorProvider>(
  'NavigatorProvider',
  providers.puppeteer,
);
