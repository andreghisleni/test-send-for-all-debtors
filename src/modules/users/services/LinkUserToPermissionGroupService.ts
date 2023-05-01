import { inject, injectable } from 'tsyringe';

import { ICacheProvider } from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import AppError from '@shared/errors/AppError';

import { IPermissionGroupsRepository } from '@modules/permissions/repositories/IPermissionGroupsRepository';

import { IUsersRepository } from '../repositories/IUsersRepository';

interface IRequest {
  user_id: string;

  permission_group_id: string;
}

@injectable()
export class LinkUserToPermissionGroupService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('PermissionGroupsRepository')
    private permissionGroupsRepository: IPermissionGroupsRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) { }// eslint-disable-line

  public async execute({
    user_id,
    permission_group_id,
  }: IRequest): Promise<void> {
    const cacheKey = `permissions:${user_id}`;

    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found');
    }

    const permissionGroup = await this.permissionGroupsRepository.findById(
      permission_group_id,
    );

    if (!permissionGroup) {
      throw new AppError('Permission group not found');
    }

    await this.usersRepository.linkUserToPermissionGroup(
      user_id,
      permission_group_id,
    );

    await this.cacheProvider.invalidate(cacheKey);
  }
}
