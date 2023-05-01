import { env } from '@env';
import path from 'path';
import { inject, injectable } from 'tsyringe';

import { IMailProvider } from '@shared/container/providers/MailProvider/models/IMailProvider';
import AppError from '@shared/errors/AppError';

import { IUsersRepository } from '../repositories/IUsersRepository';
import { IUserTokensRepository } from '../repositories/IUserTokensRepository';

interface IRequest {
  id: string;
}

@injectable()
export class ReSendValidateEmailService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('MailProvider')
    private mailProvider: IMailProvider,

    @inject('UserTokensRepository')
    private userTokensRepository: IUserTokensRepository,
  ) { } // eslint-disable-line

  public async execute({ id: userId }: IRequest): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new AppError('User does not exists.');
    }

    if (user.active) {
      throw new AppError('E-mail já validado.');
    }

    const userToken = await this.userTokensRepository.findByUserId(user.id);

    let token = '';
    if (!userToken) {
      token = (await this.userTokensRepository.generate(user)).token;
    } else {
      token = userToken.token;
    }

    const confirmEmailTemplate = path.resolve(
      __dirname,
      '..',
      'views',
      'confirm_email.hbs',
    );
    await this.mailProvider.sendMail({
      to: {
        name: user.name,
        email: user.email,
      },
      subject: `[${env.APP_NAME}] Validação de e-mail`,
      templateData: {
        file: confirmEmailTemplate,
        variables: {
          name: user.name,
          link: `${env.APP_WEB_URL}/confirm_email?token=${token}`,
        },
      },
    });
  }
}
