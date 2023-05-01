import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import { IHashProvider } from '../providers/HashProvider/models/IHashProvider';
import { IUser, IUsersRepository } from '../repositories/IUsersRepository';

interface IRequest {
  user_id: string;

  name: string;
  fantasy_name: string;
  phone: string;
  old_password?: string;
  password?: string;
}
@injectable()
export class UpdateProfileService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) { }// eslint-disable-line

  public async execute({
    user_id,
    name,
    fantasy_name,
    phone,
    old_password,
    password,
  }: IRequest): Promise<IUser> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('Only authenticated users can change profile');
    }

    user.name = name;
    user.fantasy_name = fantasy_name;
    user.phone = phone;

    if (password && !old_password) {
      throw new AppError(
        'You need to inform the old password to set a new password',
      );
    }

    if (password && old_password) {
      const checkOldPassword = await this.hashProvider.compareHash(
        old_password,
        user.password_hash,
      );
      if (!checkOldPassword) {
        throw new AppError('Old password does not match.');
      }
      user.password_update_time = new Date(Date.now());
      user.password_hash = await this.hashProvider.generateHash(password);
    }

    const u = {
      ...user,
      UserIp: undefined,
      UserAddress: undefined,
      permissions: undefined,
      permission_groups: undefined,
    };
    await this.usersRepository.save(u);

    return user;
  }
}
