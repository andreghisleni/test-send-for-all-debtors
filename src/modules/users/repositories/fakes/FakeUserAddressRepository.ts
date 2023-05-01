import { Prisma, UserAddress } from '@prisma/client';
import { v4 as uuid } from 'uuid';

import { IUserAddressRepository } from '../IUserAddressRepository';

export class FakeUserAddressRepository implements IUserAddressRepository {
  private userAddress: any[] = [];

  public async findById(id: string): Promise<UserAddress | undefined> {
    const findUserAddress = this.userAddress.find(
      userAddres => userAddres.id === id,
    );
    return findUserAddress as UserAddress;
  }

  public async create(
    data: Prisma.UserAddressUncheckedCreateInput,
  ): Promise<UserAddress> {
    const userAddress = {
      id: uuid(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.userAddress.push(userAddress);

    return userAddress as UserAddress;
  }

  public async save(userAddress: UserAddress): Promise<UserAddress> {
    const findIndex = this.userAddress.findIndex(
      findUserAddress => findUserAddress.id === userAddress.id,
    );

    this.userAddress[findIndex] = userAddress;
    return userAddress;
  }
}
