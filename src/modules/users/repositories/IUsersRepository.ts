import { User, Prisma } from '@prisma/client';

export type IUser = User &
  Prisma.UserGetPayload<{
    select: {
      UserIp?: true;
      UserAddress?: true;

      permissions?: true;
      permission_groups?: {
        include: {
          permissions?: true;
        };
      };
    };
  }>;

export interface IUsersRepository {
  findById(id: string): Promise<IUser | undefined>;
  findAll(): Promise<IUser[]>;
  findByEmail(email: string): Promise<IUser | undefined>;
  findByDocument(document: string): Promise<IUser | undefined>;
  findByPhone(phone: string): Promise<IUser | undefined>;
  create(data: Prisma.UserCreateInput): Promise<IUser>;
  save(user: User): Promise<IUser>;

  linkUserToPermissionGroup(
    user_id: string,
    permission_group_id: string,
  ): Promise<void>;

  unlinkUserFromPermissionGroup(
    user_id: string,
    permission_group_id: string,
  ): Promise<void>;
}
