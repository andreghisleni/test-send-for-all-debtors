import { container } from 'tsyringe';

import { WkHtmlToPdfOnDockerProvider } from './implementations/WkHtmlToPdfOnDockerProvider';
import { IHtmlToPdfProvider } from './models/IHtmlToPdfProvider';

const providers = {
  wkhtmltopdf: WkHtmlToPdfOnDockerProvider,
};

container.registerSingleton<IHtmlToPdfProvider>(
  'HtmlToPdfProvider',
  providers.wkhtmltopdf,
);
