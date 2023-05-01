import { User, UserToken } from '@prisma/client';
import { v4 as uuid } from 'uuid';

import { IUserTokensRepository } from '../IUserTokensRepository';

export class FakeUserTokensRepository implements IUserTokensRepository {
  private userTokens: any[] = [];

  public async generate(user: User): Promise<UserToken> {
    const userToken = {
      id: uuid(),
      token: uuid(),
      user,
      user_id: user.id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.userTokens.push(userToken);

    return userToken as UserToken;
  }

  public async findByToken(token: string): Promise<UserToken | undefined> {
    const userToken = this.userTokens.find(ut => ut.token === token);

    return userToken as UserToken;
  }

  public async findByUserId(id: string): Promise<UserToken | undefined> {
    const userToken = this.userTokens.find(ut => ut.user.id === id);

    return userToken as UserToken;
  }

  public async delete(id: string): Promise<void> {
    const userToken = this.userTokens.find(ut => ut.id === id);

    if (!userToken) return;

    this.userTokens.splice(this.userTokens.indexOf(userToken), 1);
  }
}
