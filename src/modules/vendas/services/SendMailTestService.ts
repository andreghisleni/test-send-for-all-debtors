import { env } from '@env';
import path from 'node:path';
import { inject, injectable } from 'tsyringe';

import { IMailProvider } from '../../../shared/container/providers/MailProvider/models/IMailProvider';

interface IRequest {
  email: string;
}

// interface IResponse {
// }

@injectable()
export class SendMailTestService {
  constructor(
    @inject('MailProvider')
    private mailProvider: IMailProvider,
  ) { } // eslint-disable-line

  public async execute({ email }: IRequest): Promise</* IResponse */ void> {
    const sendLinkDownloadTemplate = path.resolve(
      __dirname,
      '..',
      'views',
      'send_link_download.hbs',
    );

    await this.mailProvider.sendMail({
      to: {
        name: 'Gasparzim',
        email,
      },
      subject: `[${process.env.APP_NAME}] Download de extratos devedores`,
      templateData: {
        file: sendLinkDownloadTemplate,
        variables: {
          link: `${env.APP_API_URL}/downloads/`,
        },
      },
    });
  }
}
