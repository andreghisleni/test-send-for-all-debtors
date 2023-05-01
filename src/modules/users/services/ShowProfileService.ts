import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import { IUser, IUsersRepository } from '../repositories/IUsersRepository';

interface IRequest {
  user_id: string;
}

@injectable()
export class ShowProfileService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) { }// eslint-disable-line

  public async execute({ user_id }: IRequest): Promise<IUser> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found');
    }

    return user;
  }
}
