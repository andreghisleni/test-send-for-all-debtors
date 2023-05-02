import nodemailer, { Transporter } from 'nodemailer';
import { inject, injectable } from 'tsyringe';

import type { IMailTemplateProvider } from '../../MailTemplateProvider/models/IMailTemplateProvider';
import type { ISendMailDTO } from '../dtos/ISendMailDTO';
import type { IMailProvider } from '../models/IMailProvider';

@injectable()
export class EtherealMailProvider implements IMailProvider {
  private client: Transporter;

  constructor(
    @inject('MailTemplateProvider')
    private mailTemplateProvider: IMailTemplateProvider,
  ) {
    nodemailer.createTestAccount().then(account => {
      const transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });

      this.client = transporter;
    });
  }

  public async sendMail({
    to,
    from,
    subject,
    templateData,
  }: ISendMailDTO): Promise<void> {
    const info = await this.client.sendMail({
      from: {
        name: from?.name || 'Equipe Desbravatec',
        address: from?.email || 'contato@desbravatec.com.br',
      },
      to: {
        name: to.name,
        address: to.email,
      },
      subject,
      html: await this.mailTemplateProvider.parse(templateData),
    });

    console.log('Message sent: %s', info.messageId); // eslint-disable-line no-console
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // eslint-disable-line no-console
  }
}
