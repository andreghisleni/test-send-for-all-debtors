import { Prisma, UserIp } from '@prisma/client';

export interface IUserIpsRepository {
  create(data: Prisma.UserIpUncheckedCreateInput): Promise<UserIp>;
  findByUserId(id: string): Promise<UserIp[]>;
}
