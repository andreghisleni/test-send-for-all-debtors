import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { convert } from 'html-to-text';
import { inject, injectable } from 'tsyringe';

import mailConfig from '@config/mail';

import type { IMailTemplateProvider } from '../../MailTemplateProvider/models/IMailTemplateProvider';
import type { ISendMailDTO } from '../dtos/ISendMailDTO';
import type { IMailProvider } from '../models/IMailProvider';

@injectable()
export class SESMailProvider implements IMailProvider {
  private client: SESClient;

  constructor(
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,
  ) {
    this.client = new SESClient({ region: 'us-east-2' });
  }

  public async sendMail({
    to,
    from,
    subject,
    templateData,
  }: ISendMailDTO): Promise<void> {
    const { name, email } = mailConfig.defaults.from;

    const parsedHTML = await this.mailTemplateProvider.parse(templateData);

    await this.client.send(
      new SendEmailCommand({
        Destination: {
          ToAddresses: [`${to.name} <${to.email}>`],
        },
        Message: {
          /* required */
          Body: {
            /* required */
            Html: {
              Charset: 'UTF-8',
              Data: parsedHTML,
            },
            Text: {
              Charset: 'UTF-8',
              Data: convert(parsedHTML, {
                wordwrap: 130,
              }),
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: subject,
          },
        },
        Source: `${from?.name || name} <${from?.email || email}>`,
      }),
    );
  }
}
