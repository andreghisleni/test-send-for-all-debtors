import { v4 as uuid } from 'uuid';
import { describe, it, beforeEach, expect } from 'vitest';

import { FakeGeocodeProvider } from '@shared/container/providers/GeocodeProvider/fakes/FakeGeocodeProvider';
import AppError from '@shared/errors/AppError';

import { FakeUserAddressRepository } from '../repositories/fakes/FakeUserAddressRepository';
import { FakeUsersRepository } from '../repositories/fakes/FakeUsersRepository';
import { UpdateUserAddressService } from './UpdateUserAddressService';

let fakeUsersRepository: FakeUsersRepository;
let fakeUserAddressRepository: FakeUserAddressRepository;
let fakeGeocodeProvider: FakeGeocodeProvider;

let updateUserAddress: UpdateUserAddressService;

describe('UpdateUserAddress', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeUserAddressRepository = new FakeUserAddressRepository();
    fakeAddressRepository = new FakeAddressRepository();
    fakeGeocodeProvider = new FakeGeocodeProvider();

    createUserAddress = new CreateUserAddressService(
      fakeUsersRepository,
      fakeUserAddressRepository,
      fakeAddressRepository,
      fakeGeocodeProvider,
    );
    updateUserAddress = new UpdateUserAddressService(
      fakeUsersRepository,
      fakeUserAddressRepository,
      fakeAddressRepository,
      fakeGeocodeProvider,
    );
  });
  it('should be able to update the address of user', async () => {
    const user = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      user: 'john',
      phone: '99999999999',
      password: '123456',
    });

    const userAddressOld = await createUserAddress.execute({
      user_id: user.id,

      address: {
        state: {
          initials: 'SC',
        },
        city: 'Chapecó',
        neighborhood: 'SAIC',
        street: {
          name: 'Rua Coronel Manoel dos Passos Maia',
          cep: '89802195',
        },
        number: '405',
        complement: 'E',
      },
      addtional: {
        block: '',
        floor: '',
        apartament: '',
        reference_point: 'Perto da Aurora',
      },
    });
    const userAddressNew = await updateUserAddress.execute({
      user_id: user.id,

      address: {
        state: {
          initials: 'SC',
        },
        city: 'Chapecó',
        neighborhood: 'Centro',
        street: {
          name: 'Rua Barão do Rio Branco - E',
          cep: '89802195',
        },
        number: '400',
        complement: 'E',
      },
      addtional: {
        block: 'A',
        floor: '01',
        apartament: '101',
        reference_point: 'Perto da Aurora',
      },
    });

    expect(userAddressOld.addtional).toHaveProperty('id');
    expect(userAddressNew.addtional).toHaveProperty('id');
    expect(userAddressNew.addtional.id).toEqual(userAddressOld.addtional.id);
  });
  it('should not be able to update a not exist address for a non-existent user', async () => {
    await expect(
      updateUserAddress.execute({
        user_id: uuid(),

        address: {
          state: {
            initials: 'SC',
          },
          city: 'Chapecó',
          neighborhood: 'SAIC',
          street: {
            name: 'Rua Coronel Manoel dos Passos Maia',
            cep: '89802195',
          },
          number: '405',
          complement: 'E',
        },
        addtional: {
          block: '',
          floor: '',
          apartament: '',
          reference_point: 'Perto da Aurora',
        },
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
  it('should not be able to update a address for a user who a not registered address', async () => {
    const user = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'john@doe.com',
      user: 'john',
      phone: '99999999999',
      password: '123456',
    });
    user.address = {} as UserAddress;
    fakeUsersRepository.save(user);

    await expect(
      updateUserAddress.execute({
        user_id: user.id,

        address: {
          state: {
            initials: 'SC',
          },
          city: 'Chapecó',
          neighborhood: 'SAIC',
          street: {
            name: 'Rua Coronel Manoel dos Passos Maia',
            cep: '89802195',
          },
          number: '405',
          complement: 'E',
        },
        addtional: {
          block: '',
          floor: '',
          apartament: '',
          reference_point: 'Perto da Aurora',
        },
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
