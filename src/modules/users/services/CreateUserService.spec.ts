import { describe, it, beforeEach, expect } from 'vitest';

import { FakeGeocodeProvider } from '@shared/container/providers/GeocodeProvider/fakes/FakeGeocodeProvider';
import AppError from '@shared/errors/AppError';

import { FakePermissionGroupsRepository } from '@modules/permissions/repositories/fakes/FakePermissionGroupsRepository';

import { FakeHashProvider } from '../providers/HashProvider/fakes/FakeHashProvider';
import { FakeUsersRepository } from '../repositories/fakes/FakeUsersRepository';
import { CreateUserService } from './CreateUserService';

let fakeUsersRepository: FakeUsersRepository;
let fakePermissionGroupsRepository: FakePermissionGroupsRepository;

let fakeHashProvider: FakeHashProvider;
let fakeGeocodeProvider: FakeGeocodeProvider;

let createUser: CreateUserService;
describe('CreateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakePermissionGroupsRepository = new FakePermissionGroupsRepository();

    fakeHashProvider = new FakeHashProvider();
    fakeGeocodeProvider = new FakeGeocodeProvider();

    createUser = new CreateUserService(
      fakeUsersRepository,
      fakePermissionGroupsRepository,
      fakeHashProvider,
      fakeGeocodeProvider,
    );
  });
  it('should be able create a new user', async () => {
    await fakePermissionGroupsRepository.create({
      name: 'default',
    });

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
    expect(user).toHaveProperty('id');
  });
  it('should not be able to create a new user with same email from another', async () => {
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
      createUser.execute({
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
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
