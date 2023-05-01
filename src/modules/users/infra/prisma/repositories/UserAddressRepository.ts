import { UserAddress, Prisma } from '@prisma/client';

import { prisma } from '@shared/infra/prisma';

import { IUserAddressRepository } from '@modules/users/repositories/IUserAddressRepository';

export class UserAddressRepository implements IUserAddressRepository {
  public async findById(id: string): Promise<UserAddress | undefined> {
    const findUserAddress = await prisma.userAddress.findUnique({
      where: { id },
    });

    return findUserAddress || undefined;
  }

  public async findByUserId(id: string): Promise<UserAddress | undefined> {
    const findUserAddress = await prisma.userAddress.findFirst({
      where: { user_id: id },
    });

    return findUserAddress || undefined;
  }

  public async create(
    data: Prisma.UserAddressUncheckedCreateInput,
  ): Promise<UserAddress> {
    const userAddress = await prisma.userAddress.create({
      data,
    });

    return userAddress;
  }

  public async save(userAddress: UserAddress): Promise<UserAddress> {
    const userAddressSaved = await prisma.userAddress.update({
      where: { id: userAddress.id },
      data: userAddress,
    });

    return userAddressSaved;
  }
}
