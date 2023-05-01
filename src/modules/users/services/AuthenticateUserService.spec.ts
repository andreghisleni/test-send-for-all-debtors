import { describe, it, beforeEach, expect } from 'vitest';

import { FakeCacheProvider } from '@shared/container/providers/CacheProvider/fakes/FakeCacheProvider';
import { FakeGeocodeProvider } from '@shared/container/providers/GeocodeProvider/fakes/FakeGeocodeProvider';
import AppError from '@shared/errors/AppError';

import { FakePermissionGroupsRepository } from '../../permissions/repositories/fakes/FakePermissionGroupsRepository';
import { FakeHashProvider } from '../providers/HashProvider/fakes/FakeHashProvider';
import { FakeUserIpsRepository } from '../repositories/fakes/FakeUserIpsRepository';
import { FakeUsersRepository } from '../repositories/fakes/FakeUsersRepository';
import { AuthenticateUserService } from './AuthenticateUserService';
import { CreateUserService } from './CreateUserService';

let fakeUsersRepository: FakeUsersRepository;
let fakeUserIpsRepository: FakeUserIpsRepository;
let fakePermissionGroupsRepository: FakePermissionGroupsRepository;

let fakeHashProvider: FakeHashProvider;
let fakeCacheProvider: FakeCacheProvider;
let fakeGeocodeProvider: FakeGeocodeProvider;

let createUser: CreateUserService;
let authenticateUser: AuthenticateUserService;

describe('AuthenticateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeUserIpsRepository = new FakeUserIpsRepository();
    fakePermissionGroupsRepository = new FakePermissionGroupsRepository();

    fakeHashProvider = new FakeHashProvider();
    fakeCacheProvider = new FakeCacheProvider();
    fakeGeocodeProvider = new FakeGeocodeProvider();

    createUser = new CreateUserService(
      fakeUsersRepository,
      fakePermissionGroupsRepository,
      fakeHashProvider,
      fakeGeocodeProvider,
    );

    authenticateUser = new AuthenticateUserService(
      fakeUsersRepository,
      fakeUserIpsRepository,
      fakeHashProvider,
      fakeCacheProvider,
    );
  });
  it('should be able to authenticate', async () => {
    const user = await createUser.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      phone: '99999999999',
      password: '123456',
      document: '12345678910',
      fantasy_name: 'John Doe',
      address: {
        street: 'Rua 1',
        number: '1',
        complement: '1',
        district: '1',
        city: '1',
        state: '1',
        country: '1',
        zip_code: '1',
      },
    });

    const response = await authenticateUser.execute({
      email: 'john@doe.com',
      password: '123456',
      ip: '::ffff:10.10.50.5',
    });

    expect(response).toHaveProperty('token');
    expect(response.user).toEqual(user);
  });
  it('should be able to authenticate in global network', async () => {
    const user = await createUser.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      phone: '99999999999',
      password: '123456',
      document: '12345678910',
      fantasy_name: 'John Doe',
      address: {
        street: 'Rua 1',
        number: '1',
        complement: '1',
        district: '1',
        city: '1',
        state: '1',
        country: '1',
        zip_code: '1',
      },
    });

    const response = await authenticateUser.execute({
      email: 'john@doe.com',
      password: '123456',
      ip: '170.84.58.152',
    });

    expect(response).toHaveProperty('token');
    expect(response.user).toEqual(user);
  });
  it('should not be able to authenticate with none exists user', async () => {
    await expect(
      authenticateUser.execute({
        email: 'john@doe.com',
        password: '123456',
        ip: '::ffff:10.10.50.5',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
  it('should not be able to authenticate with wrong password', async () => {
    await createUser.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      phone: '99999999999',
      password: '123456',
      document: '12345678910',
      fantasy_name: 'John Doe',
      address: {
        street: 'Rua 1',
        number: '1',
        complement: '1',
        district: '1',
        city: '1',
        state: '1',
        country: '1',
        zip_code: '1',
      },
    });

    await expect(
      authenticateUser.execute({
        email: 'john@doe.com',
        password: '1234',
        ip: '::1',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
