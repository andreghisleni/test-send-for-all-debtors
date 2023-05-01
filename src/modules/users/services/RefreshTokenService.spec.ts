import { sign } from 'jsonwebtoken';
import ms from 'ms';
import { describe, it, beforeEach, expect } from 'vitest';

import authConfig from '@config/auth';

import { FakeCacheProvider } from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import AppError from '@shared/errors/AppError';

import { FakePermissionGroupsRepository } from '@modules/permissions/repositories/fakes/FakePermissionGroupsRepository';

import { FakeHashProvider } from '../providers/HashProvider/fakes/FakeHashProvider';
import { FakeUserAddressRepository } from '../repositories/fakes/FakeUserAddressRepository';
import { FakeUserIpsRepository } from '../repositories/fakes/FakeUserIpsRepository';
import { FakeUsersRepository } from '../repositories/fakes/FakeUsersRepository';
import { AuthenticateUserService } from './AuthenticateUserService';
import { CreateUserService } from './CreateUserService';
import { RefreshTokenService } from './RefreshTokenService';

let fakeUsersRepository: FakeUsersRepository;
let fakeUserIpsRepository: FakeUserIpsRepository;
let fakeUserAddressRepository: FakeUserAddressRepository;
let fakePermissionGroupsRepository: FakePermissionGroupsRepository;

let fakeHashProvider: FakeHashProvider;
let fakeCacheProvider: FakeCacheProvider;

let createUser: CreateUserService;
let authenticateUser: AuthenticateUserService;
let refreshToken: RefreshTokenService;

describe('RefreshTokenService', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeUserIpsRepository = new FakeUserIpsRepository();
    fakeUserAddressRepository = new FakeUserAddressRepository();
    fakePermissionGroupsRepository = new FakePermissionGroupsRepository();

    fakeHashProvider = new FakeHashProvider();
    fakeCacheProvider = new FakeCacheProvider();

    createUser = new CreateUserService(
      fakeUsersRepository,
      fakePermissionGroupsRepository,
      fakeUserPermissionGroupsRepository,
      fakeHashProvider,
    );
    authenticateUser = new AuthenticateUserService(
      fakeUsersRepository,
      fakeUserIpsRepository,
      fakeUserAddressRepository,
      fakeAddressRepository,
      fakeHashProvider,
      fakeCacheProvider,
    );
    refreshToken = new RefreshTokenService(
      fakeUsersRepository,
      fakeCacheProvider,
    );
  });
  it('should be able to refresh token', async () => {
    jest.spyOn(fakeCacheProvider, 'recover').mockReturnValue(['aaaa'] as any);

    const invalidateCache = jest.spyOn(fakeCacheProvider, 'invalidate');

    await createUser.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      user: 'john',
      phone: '99999999999',
      password: '123456',
    });

    const auth = await authenticateUser.execute({
      user: 'john',
      password: '123456',
      ip: '::ffff:10.10.50.5',
    });

    const response = await refreshToken.execute({
      refreshToken: auth.refreshToken,
    });

    expect(response).toHaveProperty('token');
    expect(response).toHaveProperty('refreshToken');

    expect(invalidateCache).toHaveBeenCalled();
  });
  it('should not be able to refresh token to invalid string', async () => {
    await expect(
      refreshToken.execute({
        refreshToken: 'fehtrhtyuytujtr',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
  it('should not be able to refresh token to invalid token', async () => {
    const { secret, expiresIn } = authConfig.jwt;
    const token = sign(
      {
        refreshToken: false,
      },
      secret,
      {
        expiresIn,
      },
    );
    await expect(
      refreshToken.execute({
        refreshToken: token,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
  it('should not be able to refresh token to expired refreshToken', async () => {
    const { secret, expiresInRefresh } = authConfig.jwt;

    const user = await createUser.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      user: 'john',
      phone: '99999999999',
      password: '123456',
    });
    user.passwordUpdateTime = new Date(Date.now());
    await fakeUsersRepository.save(user);

    const token = sign(
      {
        passwordUpdated: user.passwordUpdateTime,
        refreshToken: true,
        expirete: new Date(Date.now() - ms(`${expiresInRefresh}`)),
      },
      secret,
      {
        subject: user.id,
        expiresIn: '-1h',
      },
    );

    await expect(
      refreshToken.execute({
        refreshToken: token,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to refresh token to updated password', async () => {
    const { secret, expiresInRefresh } = authConfig.jwt;

    const user = await createUser.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      user: 'john',
      phone: '99999999999',
      password: '123456',
    });
    user.passwordUpdateTime = new Date(Date.now());
    await fakeUsersRepository.save(user);

    const token = sign(
      {
        passwordUpdated: new Date(Date.now() - ms('2d')).getTime(),
        refreshToken: true,
        expirete: new Date(Date.now() - ms(`${expiresInRefresh}`)),
      },
      secret,
      {
        subject: user.id,
        expiresIn: expiresInRefresh,
      },
    );

    await expect(
      refreshToken.execute({
        refreshToken: token,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
  it('should be able update refresh token 1 day before expire', async () => {
    const { secret, expiresInRefresh } = authConfig.jwt;

    const user = await createUser.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      user: 'john',
      phone: '99999999999',
      password: '123456',
    });

    user.passwordUpdateTime = new Date(Date.now());
    await fakeUsersRepository.save(user);

    const token = sign(
      {
        passwordUpdated: Date.now(),
        refreshToken: true,
        expirete: new Date(Date.now() - ms(`6d`)).getTime(),
      },
      secret,
      {
        subject: user.id,
        expiresIn: expiresInRefresh,
      },
    );

    const response = await refreshToken.execute({
      refreshToken: token,
    });

    expect(response).toHaveProperty('token');
    expect(response).not.toHaveProperty(token);
  });
});
