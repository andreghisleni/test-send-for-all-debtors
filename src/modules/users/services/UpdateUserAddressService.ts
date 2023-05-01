import { UserAddress } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/binary';
import { inject, injectable } from 'tsyringe';

import { IGeocodeProvider } from '@shared/container/providers/GeocodeProvider/models/IGeocodeProvider';
import AppError from '@shared/errors/AppError';

import { IUserAddressRepository } from '../repositories/IUserAddressRepository';
import { IUser, IUsersRepository } from '../repositories/IUsersRepository';

interface IRequest {
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  user_id: string;
}
interface IResponse {
  user: IUser;
}
@injectable()
export class UpdateUserAddressService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('UserAddressRepository')
    private userAddressRepository: IUserAddressRepository,

    @inject('GeocodeProvider')
    private geocodeProvider: IGeocodeProvider,
  ) { } // eslint-disable-line

  public async execute({
    street,
    number,
    complement,
    district,
    city,
    state,
    country,
    zip_code,
    user_id,
  }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('Only authenticated users can change avatar');
    }

    const geocode = await this.geocodeProvider.get(
      `${street}, ${number} - ${district}, ${city} - ${state}, ${zip_code}`,
    );

    if (user.UserAddress && user.UserAddress.length > 0) {
      const findUserAddress = await this.userAddressRepository.findById(
        user.UserAddress[0].id,
      );

      if (findUserAddress) {
        findUserAddress.street = street;
        findUserAddress.number = number;
        findUserAddress.complement = complement;
        findUserAddress.district = district;
        findUserAddress.city = city;
        findUserAddress.state = state;
        findUserAddress.country = country;
        findUserAddress.zip_code = zip_code;
        findUserAddress.latitude = new Decimal(geocode.lat);
        findUserAddress.longitude = new Decimal(geocode.lng);

        await this.userAddressRepository.save(findUserAddress);
      } else {
        const userAddress = await this.userAddressRepository.create({
          street,
          number,
          complement,
          district,
          city,
          state,
          country,
          zip_code,
          latitude: new Decimal(geocode.lat),
          longitude: new Decimal(geocode.lng),
          user_id,
        });

        user.UserAddress.push(userAddress);
      }
    } else {
      const userAddress = await this.userAddressRepository.create({
        street,
        number,
        complement,
        district,
        city,
        state,
        country,
        zip_code,
        latitude: new Decimal(geocode.lat),
        longitude: new Decimal(geocode.lng),
        user_id,
      });

      (user.UserAddress as UserAddress[]).push(userAddress);
    }

    return { user };
  }
}
