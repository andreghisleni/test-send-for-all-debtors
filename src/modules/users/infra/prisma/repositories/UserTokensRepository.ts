import { User, UserToken } from '@prisma/client';

import { prisma } from '@shared/infra/prisma';

import { IUserTokensRepository } from '@modules/users/repositories/IUserTokensRepository';

export class UserTokensRepository implements IUserTokensRepository {
  public async findByToken(token: string): Promise<UserToken | undefined> {
    const userToken = await prisma.userToken.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
    return userToken || undefined;
  }

  public async findByUserId(id: string): Promise<UserToken | undefined> {
    const userToken = await prisma.userToken.findFirst({
      where: { user_id: id },
      include: {
        user: true,
      },
    });
    return userToken || undefined;
  }

  public async generate(user: User): Promise<UserToken> {
    const userToken = await prisma.userToken.create({
      data: {
        user_id: user.id,
      },
    });

    return userToken;
  }

  public async delete(id: string): Promise<void> {
    await prisma.userToken.delete({
      where: { id },
    });
  }
}
