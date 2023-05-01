import { addHours, isAfter } from 'date-fns';
import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import { IHashProvider } from '../providers/HashProvider/models/IHashProvider';
import { IUsersRepository } from '../repositories/IUsersRepository';
import { IUserTokensRepository } from '../repositories/IUserTokensRepository';

interface IRequest {
  password: string;
  token: string;
}
@injectable()
export class ResetPasswordService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('UserTokensRepository')
    private userTokensRepository: IUserTokensRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) { } // eslint-disable-line

  public async execute({ token, password }: IRequest): Promise<void> {
    const userToken = await this.userTokensRepository.findByToken(token);

    if (!userToken) {
      throw new AppError('User token does not exisits');
    }
    const user = await this.usersRepository.findById(userToken.user_id);
    if (!user) {
      throw new AppError('User does not exisits');
    }
    const tokenCratedAt = userToken.created_at;
    const compareDate = addHours(tokenCratedAt, 2);

    if (isAfter(Date.now(), compareDate)) {
      throw new AppError('Token expired');
    }
    user.password_hash = await this.hashProvider.generateHash(password);

    user.password_update_time = new Date(Date.now());

    const u = {
      ...user,
      UserIp: undefined,
      UserAddress: undefined,
      permissions: undefined,
      permission_groups: undefined,
    };
    await this.usersRepository.save(u);

    await this.userTokensRepository.delete(userToken.id);
  }
}
