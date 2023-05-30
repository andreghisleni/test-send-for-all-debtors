import { container, inject, injectable } from 'tsyringe';

import { IMailProvider } from '../../MailProvider/models/IMailProvider';
import { IJobDTO } from '../dtos/JobDTO';

interface ITemplateVariables {
  [key: string]: string | number;
}
interface IDataProps {
  variables: ITemplateVariables;
  name: string;
  email: string;
  title: string;
  html: string;
  s: boolean;
}

@injectable()
class Handle {
  constructor(
    @inject('MailProvider')
    private mailProvider: IMailProvider,
  ) { } // eslint-disable-line

  public async execute({
    data: { name, email, title, html, variables },
  }: {
    data: IDataProps;
  }): Promise<void> {
    await this.mailProvider.sendMail({
      to: {
        name,
        email,
      },
      subject: `[${process.env.APP_NAME}] ${title}`,
      templateData: {
        html,
        variables,
      },
    });
  }
}

export const r: IJobDTO = {
  key: 'SendEmail',
  limiter: {
    max: 10,
    duration: 5000,
  },
  handle: async ({ data }: { data: IDataProps }): Promise<void> => {
    const handle = container.resolve(Handle);
    await handle.execute({ data });
  },
};

export default r;
