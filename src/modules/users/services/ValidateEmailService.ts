import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import { IUsersRepository } from '../repositories/IUsersRepository';
import { IUserTokensRepository } from '../repositories/IUserTokensRepository';

interface IRequest {
  token: string;
}
@injectable()
export class ValidateEmailService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('UserTokensRepository')
    private userTokensRepository: IUserTokensRepository,
  ) { } // eslint-disable-line

  public async execute({ token }: IRequest): Promise<void> {
    const userToken = await this.userTokensRepository.findByToken(token);

    if (!userToken) {
      throw new AppError('User token does not exisits');
    }
    const user = await this.usersRepository.findById(userToken.user_id);
    if (!user) {
      throw new AppError('User does not exisits');
    }

    if (user.active) {
      throw new AppError('User foi Verified After');
    }

    user.active = new Date();

    const u = {
      ...user,
      UserIp: undefined,
      UserAddress: undefined,
      permissions: undefined,
      permission_groups: undefined,
    };
    await this.usersRepository.save(u);
  }
}
