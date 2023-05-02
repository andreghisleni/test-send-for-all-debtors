import { container } from 'tsyringe';

import { HandlebarsMailTemplateProvider } from './implementations/HandlebarsMailTemplateProvider';
import type { IMailTemplateProvider } from './models/IMailTemplateProvider';

const providers = {
  handlebars: HandlebarsMailTemplateProvider,
};

container.registerSingleton<IMailTemplateProvider>(
  'MailTemplateProvider',
  providers.handlebars,
);
