import { getPermissions } from '@utils/getPermissions';
import { inject, injectable } from 'tsyringe';

import { ICacheProvider } from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import AppError from '@shared/errors/AppError';

import { IUsersRepository } from '../repositories/IUsersRepository';

interface IRequest {
  user_id: string;
}

interface IResponse {
  permissions: string[];
}

@injectable()
export class FindUserPermissionsService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) { }// eslint-disable-line

  public async execute({ user_id }: IRequest): Promise<IResponse> {
    const cacheKey = `permissions:${user_id}`;

    let permissions = await this.cacheProvider.recover<string[]>(cacheKey);

    if (permissions) {
      return { permissions };
    }

    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found');
    }

    permissions = getPermissions(user);

    await this.cacheProvider.save(cacheKey, permissions);

    return { permissions };
  }
}
