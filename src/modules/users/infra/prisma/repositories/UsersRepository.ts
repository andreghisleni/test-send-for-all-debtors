import { User, Prisma } from '@prisma/client';

import { prisma } from '@shared/infra/prisma';

import {
  IUser,
  IUsersRepository,
} from '@modules/users/repositories/IUsersRepository';

const include = {
  UserIp: true,
  UserAddress: true,

  permissions: true,
  permission_groups: {
    include: {
      permissions: true,
    },
  },
};
export class UsersRepository implements IUsersRepository {
  public async findById(id: string): Promise<IUser | undefined> {
    const findUser = await prisma.user.findUnique({
      where: { id },
      include,
    });

    return findUser || undefined;
  }

  public async findAll(): Promise<IUser[]> {
    const findUsers = await prisma.user.findMany({
      include: {
        UserAddress: true,

        permissions: true,
        permission_groups: {
          include: {
            permissions: true,
          },
        },
      },
    });

    return findUsers;
  }

  public async findByEmail(email: string): Promise<IUser | undefined> {
    const findUser = await prisma.user.findUnique({
      where: { email },
      include,
    });
    return findUser || undefined;
  }

  public async findByDocument(document: string): Promise<IUser | undefined> {
    const findUser = await prisma.user.findUnique({
      where: { document },
      include,
    });
    return findUser || undefined;
  }

  public async findByPhone(phone: string): Promise<IUser | undefined> {
    const findUser = await prisma.user.findUnique({
      where: { phone },
      include,
    });
    return findUser || undefined;
  }

  public async create(data: Prisma.UserCreateInput): Promise<IUser> {
    const user = await prisma.user.create({
      data,
    });

    return user;
  }

  public async save(user: User): Promise<IUser> {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: user,
    });

    return updatedUser;
  }

  public async linkUserToPermissionGroup(
    user_id: string,
    permission_group_id: string,
  ): Promise<void> {
    await prisma.user.update({
      where: { id: user_id },
      data: {
        permission_groups: {
          connect: {
            id: permission_group_id,
          },
        },
      },
    });
  }

  public async unlinkUserFromPermissionGroup(
    user_id: string,
    permission_group_id: string,
  ): Promise<void> {
    await prisma.user.update({
      where: { id: user_id },
      data: {
        permission_groups: {
          disconnect: {
            id: permission_group_id,
          },
        },
      },
    });
  }
}
