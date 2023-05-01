import { User } from '@prisma/client';
import { inject, injectable } from 'tsyringe';

import { IGeocodeProvider } from '@shared/container/providers/GeocodeProvider/models/IGeocodeProvider';
import AppError from '@shared/errors/AppError';

import { IPermissionGroupsRepository } from '@modules/permissions/repositories/IPermissionGroupsRepository';

import { IHashProvider } from '../providers/HashProvider/models/IHashProvider';
import { IUsersRepository } from '../repositories/IUsersRepository';

interface IRequest {
  name: string;
  email: string;
  document: string;
  fantasy_name: string;
  phone: string;
  password: string;
  type: 'producer' | 'trader';

  address: {
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
  };
}
@injectable()
export class CreateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('PermissionGroupsRepository')
    private permissionGroupsRepository: IPermissionGroupsRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,

    @inject('GeocodeProvider')
    private geocodeProvider: IGeocodeProvider,
  ) { } // eslint-disable-line

  public async execute({
    name,
    email,
    document,
    fantasy_name,
    phone,
    password,
    type,
    address: {
      street,
      number,
      complement,
      district,
      city,
      state,
      country,
      zip_code,
    },
  }: IRequest): Promise<User> {
    const checkUserExists = await this.usersRepository.findByEmail(email);

    if (checkUserExists) {
      throw new AppError('Email address already used.');
    }

    const checkUserExistsByPhone = await this.usersRepository.findByPhone(
      phone,
    );

    if (checkUserExistsByPhone) {
      throw new AppError('Phone number already used.');
    }

    const checkUserExistsByDocument = await this.usersRepository.findByDocument(
      document,
    );

    if (checkUserExistsByDocument) {
      throw new AppError('Document already used.');
    }

    const hashedPassword = await this.hashProvider.generateHash(password);

    const geocode = await this.geocodeProvider.get(
      `${street}, ${number} - ${district}, ${city} - ${state}, ${zip_code}`,
    );

    const user = await this.usersRepository.create({
      name,
      email,
      phone,
      type,
      document,
      fantasy_name,
      password_hash: hashedPassword,
      password_update_time: new Date(),
      UserAddress: {
        create: {
          street,
          number,
          complement,
          district,
          city,
          state,
          country,
          zip_code,
          latitude: geocode.lat,
          longitude: geocode.lng,
        },
      },
    });

    await Promise.all(
      ['default', 'trader', 'producer']
        .filter(group => group === 'default' || group === type)
        .map(async group => {
          const permissionGroup =
            await this.permissionGroupsRepository.findByName(group);

          if (permissionGroup) {
            await this.usersRepository.linkUserToPermissionGroup(
              user.id,
              permissionGroup.id,
            );
          }
        }),
    );

    return user;
  }
}
