import { Prisma, UserIp } from '@prisma/client';

import { prisma } from '@shared/infra/prisma';

import { IUserIpsRepository } from '@modules/users/repositories/IUserIpsRepository';

export class UserIpsRepository implements IUserIpsRepository {
  public async findByUserId(id: string): Promise<UserIp[]> {
    const userIp = await prisma.userIp.findMany({
      where: { user_id: id },
    });
    return userIp;
  }

  public async create(
    data: Prisma.UserIpUncheckedCreateInput,
  ): Promise<UserIp> {
    const userIp = await prisma.userIp.create({
      data,
    });

    return userIp;
  }
}
