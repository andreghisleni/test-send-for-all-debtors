import { Prisma, UserIp } from '@prisma/client';
import { v4 as uuid } from 'uuid';

import { IUserIpsRepository } from '../IUserIpsRepository';

export class FakeUserIpsRepository implements IUserIpsRepository {
  private userTokens: any[] = [];

  public async create(
    data: Prisma.UserIpUncheckedCreateInput,
  ): Promise<UserIp> {
    const userToken = {
      id: uuid(),
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.userTokens.push(userToken);

    return userToken as UserIp;
  }

  public async findByUserId(id: string): Promise<UserIp[]> {
    const userToken = this.userTokens.filter(ut => ut.user.id === id);

    return userToken as UserIp[];
  }
}
