import { Prisma, UserAddress } from '@prisma/client';

export interface IUserAddressRepository {
  findById(id: string): Promise<UserAddress | undefined>;
  create(data: Prisma.UserAddressUncheckedCreateInput): Promise<UserAddress>;
  save(userAddress: UserAddress): Promise<UserAddress>;
}
