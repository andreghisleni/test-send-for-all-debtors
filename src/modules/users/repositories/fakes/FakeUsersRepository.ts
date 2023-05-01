import { Prisma, User } from '@prisma/client';
import { v4 as uuid } from 'uuid';

import { IUser, IUsersRepository } from '../IUsersRepository';

export class FakeUsersRepository implements IUsersRepository {
  private users: any[] = [];

  public async findById(id: string): Promise<IUser | undefined> {
    const findUser = this.users.find(user => user.id === id);
    return findUser as IUser;
  }

  public async findAll(): Promise<IUser[]> {
    const findUsers = this.users;
    return findUsers as IUser[];
  }

  public async findByEmail(data: string): Promise<IUser | undefined> {
    const findUser = this.users.find(user => user.email === data);
    return findUser as IUser;
  }

  public async findByDocument(data: string): Promise<IUser | undefined> {
    const findUser = this.users.find(user => user.document === data);
    return findUser as IUser;
  }

  public async findByPhone(data: string): Promise<IUser | undefined> {
    const findUser = this.users.find(user => user.phone === data);
    return findUser as IUser;
  }

  public async create(userData: Prisma.UserCreateInput): Promise<User> {
    const user = {
      id: uuid(),
      ...userData,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.users.push(user);

    return user as User;
  }

  public async save(user: User): Promise<User> {
    const findIndex = this.users.findIndex(findUser => findUser.id === user.id);

    this.users[findIndex] = user;
    return user;
  }

  public async linkUserToPermissionGroup(
    _user_id: string,
    _permission_group_id: string,
  ): Promise<void> { } // eslint-disable-line

  public async unlinkUserFromPermissionGroup(
    _user_id: string,
    _permission_group_id: string,
  ): Promise<void> { } // eslint-disable-line
}
